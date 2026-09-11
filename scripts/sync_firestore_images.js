const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').replace(/(^["']|["']$)/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val.trim();
      }
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load articles.json
const articles = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'articles.json'), 'utf8'));

const idToImage = new Map();
const titleToImage = new Map();

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

articles.forEach(a => {
  idToImage.set(a.id, a.imageUrl);
  if (a.legacyId) idToImage.set(String(a.legacyId), a.imageUrl);
  if (a.title) titleToImage.set(normalize(a.title), a.imageUrl);
});

console.log(`Loaded ${articles.length} canonical articles.`);

async function main() {
  const storiesCol = collection(db, 'stories');
  const snapshot = await getDocs(storiesCol);
  console.log(`Found ${snapshot.size} documents in Firestore.`);
  
  let updatedCount = 0;
  let batch = writeBatch(db);
  let batchCount = 0;
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const id = docSnap.id;
    
    // 1. Direct ID match
    let targetImage = idToImage.get(id);
    
    // 2. Normalized title match
    if (!targetImage && data.title) {
      targetImage = titleToImage.get(normalize(data.title));
    }
    
    // 3. Partial title match
    if (!targetImage && data.title) {
      const normDataTitle = normalize(data.title);
      for (const [normTitle, img] of titleToImage.entries()) {
        if (normDataTitle.includes(normTitle.slice(0, 15)) || normTitle.includes(normDataTitle.slice(0, 15))) {
          targetImage = img;
          break;
        }
      }
    }

    // 4. Topic guards
    if (!targetImage) {
      const t = (data.title || '').toLowerCase();
      if (t.includes('makhana')) targetImage = '/legacy-images/WhatsApp-Image-2026-09-01-at-5.23.42-PM.jpeg';
      else if (t.includes('deled') || t.includes('admission')) targetImage = '/legacy-images/WhatsApp-Image-2026-08-10-at-11.38.54-PM.jpeg';
      else if (t.includes('wheat')) targetImage = '/legacy-images/Bihar-Say-Website-8.png';
      else if (t.includes('solar')) targetImage = '/legacy-images/Bihar-Say-Website-7.png';
      else if (t.includes('cleanest air') || t.includes('munger')) targetImage = '/legacy-images/Bihar-Say-Website-6.png';
      else if (t.includes('women') && t.includes('college')) targetImage = '/legacy-images/patna-womens-college-golden-jubilee.jpg';
      else if (t.includes('sonpur') || t.includes('train')) targetImage = '/legacy-images/sonpur-mela-special-trains-travel.jpg';
      else if (t.includes('singhada')) targetImage = '/legacy-images/singhada-water-chestnut-superfood.jpg';
      else if (t.includes('border pillar') || t.includes('nepal frontier')) targetImage = '/legacy-images/Bihar-Say-Website.png';
      else targetImage = '/legacy-images/bihar-industrial-investment-growth.jpg';
    }
    
    if (targetImage && data.imageUrl !== targetImage) {
      const docRef = doc(db, 'stories', id);
      batch.update(docRef, { imageUrl: targetImage });
      batchCount++;
      updatedCount++;
      console.log(`[Firestore] Updating ${id} -> ${targetImage}`);
      
      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }
  
  console.log(`\nFinished! Updated ${updatedCount} documents in Firestore.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Error updating Firestore:', err);
  process.exit(1);
});
