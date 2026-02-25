const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { PlaywrightBlocker } = require('@cliqz/adblocker-playwright');
const fetch = require('cross-fetch');
const admin = require('firebase-admin');

// 1. Inisialisasi Firebase Admin (Akses Full ke Firestore)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}
const db = admin.firestore();
chromium.use(stealth);

async function runScraper() {
  console.log("🚀 [XY-SYSTEM] DARK AI ENGINE STARTING...");
  
  // Ambil request yang pending
  const snapshot = await db.collection("scrape_requests").where("status", "==", "pending").get();
  
  if (snapshot.empty) {
    console.log("📭 Gak ada misi hari ini, Raja.");
    return;
  }

  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ] 
  });

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();
    const blocker = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
    await blocker.enableBlockingInPage(page);

    try {
      console.log(`📡 ATTACKING TARGET: ${data.url}`);

      // Bypass Hardcore: Inject script buat hapus jejak bot
      await page.addInitScript(() => {
        delete navigator.__proto__.webdriver;
        window.chrome = { runtime: {} };
      });

      await page.goto(data.url, { waitUntil: 'networkidle', timeout: 90000 });

      // Simulasi manusia: Scroll pelan biar konten Next.js/React muncul
      await page.evaluate(async () => {
        await new Promise(r => setTimeout(r, 2000));
        window.scrollBy(0, 500);
      });

      // EKSTRAKSI DATA DEWA
      const scrapeResult = await page.evaluate(() => {
        const items = [];
        // Mencari selector secara cerdas (Next.js & React support)
        const elements = document.querySelectorAll('article, [class*="card"], [class*="item"]');
        
        elements.forEach(el => {
          items.push({
            title: el.querySelector('h1, h2, h3, a')?.innerText?.trim() || "No Title",
            link: el.querySelector('a')?.href || window.location.href,
            img: el.querySelector('img')?.src || el.querySelector('img')?.dataset?.src || "",
            snippet: el.innerText.substring(0, 150).replace(/\n/g, ' ')
          });
        });

        return {
          title: document.title,
          total: items.length,
          data: items.slice(0, 25), // Ambil 25 teratas
          scrapedAt: new Date().toISOString()
        };
      });

      // Simpan hasil ke Firestore
      await doc.ref.update({
        result: scrapeResult,
        status: "completed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ MISSION SUCCESS: ${scrapeResult.title}`);

    } catch (err) {
      console.error(`❌ MISSION FAILED: ${err.message}`);
      await doc.ref.update({ status: "failed", error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("🏁 [XY-SYSTEM] SEMUA TARGET BERHASIL DI-RAID.");
}

runScraper();