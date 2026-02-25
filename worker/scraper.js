const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const { PlaywrightBlocker } = require('@cliqz/adblocker-playwright');
const fetch = require('cross-fetch');
const admin = require('firebase-admin');

// 1. Inisialisasi Firebase Admin dengan Pengamanan Extra
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Penting: Handle newline buat Private Key dari GitHub Secrets/Env
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}
const db = admin.firestore();
chromium.use(stealth);

async function runScraper() {
  console.log("🚀 [XY-SYSTEM] ANNIHILATOR ENGINE AKTIF...");
  
  const snapshot = await db.collection("scrape_requests").where("status", "==", "pending").get();
  if (snapshot.empty) return console.log("📭 Gak ada target, Raja Kal.");

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
  });

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Blokir tracker biar gak kedetect
    const blocker = await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
    await blocker.enableBlockingInPage(page);

    try {
      console.log(`📡 RAIDING: ${data.url}`);
      await page.goto(data.url, { waitUntil: 'networkidle', timeout: 60000 });

      const result = await page.evaluate(() => {
        return {
          title: document.title,
          items: Array.from(document.querySelectorAll('h1, h2, a')).map(el => el.innerText).slice(0, 10)
        };
      });

      await doc.ref.update({
        result: result,
        status: "completed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("✅ RAID SUCCESS!");

    } catch (e) {
      console.log(`❌ RAID FAILED: ${e.message}`);
      await doc.ref.update({ status: "failed", error: e.message });
    } finally {
      await page.close();
    }
  }
  await browser.close();
}

runScraper();