const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');
const puppeteer = require('puppeteer');

const firebaseConfig = { 
  apiKey: process.env.FIREBASE_API_KEY, 
  projectId: process.env.FIREBASE_PROJECT_ID 
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runScraper() {
  const q = query(collection(db, "scrape_requests"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return;

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-blink-features=AutomationControlled' // Bypass Bot Detection
    ] 
  });

  for (const document of querySnapshot.docs) {
    const data = document.data();
    const page = await browser.newPage();
    
    // Stealth behaviors
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const logs = { endpoints: [], raw_html: "" };

    try {
      await page.setRequestInterception(true);
      page.on('request', r => r.continue());
      page.on('response', async res => {
        const type = res.request().resourceType();
        if (['fetch', 'xhr'].includes(type)) {
          try {
            const json = await res.json();
            logs.endpoints.push({ url: res.url(), data: json });
          } catch {}
        }
      });

      console.log(`📡 INFILTRATING: ${data.url}`);
      await page.goto(data.url, { waitUntil: 'networkidle0', timeout: 90000 });
      
      // Auto-naming Logic
      let context = "general_scrap";
      if (data.url.includes('upscale')) context = "Upscale_HD";
      if (data.url.includes('api')) context = "API_Discovery";
      if (data.url.includes('movie')) context = "Media_Stream";

      await updateDoc(doc(db, "scrape_requests", document.id), {
        result: JSON.stringify(logs, null, 2),
        fileName: `${context}_${Date.now().toString().slice(-4)}`,
        status: "completed"
      });
      console.log(`✅ ${context} COMPLETED`);
    } catch (err) {
      console.error("FAILED:", err.message);
      await updateDoc(doc(db, "scrape_requests", document.id), { status: "failed" });
    } finally {
      await page.close();
    }
  }
  await browser.close();
}
runScraper();