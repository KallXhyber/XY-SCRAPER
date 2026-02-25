const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');
const puppeteer = require('puppeteer');

const firebaseConfig = { apiKey: process.env.FIREBASE_API_KEY, projectId: process.env.FIREBASE_PROJECT_ID };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runScraper() {
  const q = query(collection(db, "scrape_requests"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  for (const document of querySnapshot.docs) {
    const data = document.data();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
      console.log(`📡 MISSION_START: ${data.url}`);
      await page.goto(data.url, { waitUntil: 'networkidle2', timeout: 60000 });

      // LOGIKA DEWA: Auto-Extract Content (Mirip Cheerio tapi di dalam Browser)
      const extractedData = await page.evaluate(() => {
        const results = [];
        // Mencari elemen artikel secara cerdas
        const items = document.querySelectorAll('article, .box, .item, .list-item');
        
        items.forEach(el => {
          results.push({
            title: el.querySelector('h1, h2, h3, a[title]')?.innerText?.trim() || "No Title",
            link: el.querySelector('a')?.href || "#",
            img: el.querySelector('img')?.src || "",
            meta: el.innerText.slice(0, 100).replace(/\n/g, ' ') // Ambil cuplikan teks
          });
        });

        return {
          pageTitle: document.title,
          items: results.slice(0, 20), // Ambil 20 teratas
          allLinks: Array.from(document.querySelectorAll('a')).map(a => a.href).slice(0, 50)
        };
      });

      // Penamaan Otomatis Script berdasarkan Title
      const cleanTitle = extractedData.pageTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

      await updateDoc(doc(db, "scrape_requests", document.id), {
        result: JSON.stringify(extractedData, null, 2),
        fileName: `${cleanTitle}_engine.js`,
        status: "completed"
      });
      console.log(`✅ MISSION_SUCCESS: ${cleanTitle}`);

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