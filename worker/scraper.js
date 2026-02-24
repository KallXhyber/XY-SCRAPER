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
  console.log("🚀 XY-ULTIMATE SCRAPER STARTING...");
  const q = query(collection(db, "scrape_requests"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("✅ No pending requests.");
    return;
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const document of querySnapshot.docs) {
    const data = document.data();
    const page = await browser.newPage();
    
    // Penampung data hasil sadapan
    const networkLogs = {
      api_endpoints: [],
      scripts: [],
      data_responses: []
    };

    try {
      // Aktifkan Request Interception
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        const url = request.url();
        const type = request.resourceType();

        if (type === 'xhr' || type === 'fetch') {
          networkLogs.api_endpoints.push({ url, method: request.method() });
        } else if (type === 'script') {
          networkLogs.scripts.push(url);
        }
        request.continue();
      });

      // Menangkap Response (untuk ambil data JSON murni dari API)
      page.on('response', async response => {
        const url = response.url();
        if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
          try {
            const json = await response.json();
            networkLogs.data_responses.push({ url, data: json });
          } catch (e) {
            // Bukan JSON, skip
          }
        }
      });

      console.log(`🌐 Intercepting: ${data.url}`);
      await page.goto(data.url, { waitUntil: 'networkidle0', timeout: 60000 });

      // Ambil metadata dasar
      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        html: document.documentElement.outerHTML.slice(0, 5000) // Ambil cuplikan HTML
      }));

      // Update Firebase dengan semua log hasil sadapan
      await updateDoc(doc(db, "scrape_requests", document.id), {
        result: JSON.stringify({
          info: pageInfo,
          intercepted: networkLogs
        }, null, 2),
        status: "completed"
      });

      console.log(`✅ Deep Scrape Success: ${document.id}`);
    } catch (err) {
      console.error(`❌ Error:`, err.message);
      await updateDoc(doc(db, "scrape_requests", document.id), { status: "failed" });
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

runScraper();