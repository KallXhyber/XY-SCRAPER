const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');
const puppeteer = require('puppeteer');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runScraper() {
  const q = query(collection(db, "scrape_requests"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  for (const document of querySnapshot.docs) {
    const data = document.data();
    const page = await browser.newPage();
    
    // Stealth Mode: Set User Agent asli PC lo
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const networkLogs = { api_endpoints: [], data_responses: [] };

    try {
      await page.setRequestInterception(true);
      page.on('request', r => r.continue());
      page.on('response', async res => {
        const url = res.url();
        if (['fetch', 'xhr'].includes(res.request().resourceType())) {
          networkLogs.api_endpoints.push({ url, status: res.status() });
          try {
            const json = await res.json();
            networkLogs.data_responses.push({ url, data: json });
          } catch {}
        }
      });

      await page.goto(data.url, { waitUntil: 'networkidle0', timeout: 60000 });

      await updateDoc(doc(db, "scrape_requests", document.id), {
        result: JSON.stringify({ intercepted: networkLogs }, null, 2),
        status: "completed"
      });
      console.log(`✅ ${data.fileName} Scraped!`);
    } catch (err) {
      await updateDoc(doc(db, "scrape_requests", document.id), { status: "failed" });
    } finally {
      await page.close();
    }
  }
  await browser.close();
}
runScraper();