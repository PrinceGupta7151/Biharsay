const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [k, ...rest] = trimmed.split('=');
    process.env[k.trim()] = rest.join('=').replace(/(^["']|["']$)/g, '').trim();
  }
});

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'stories'));
  console.log(`Total stories in Firestore: ${snap.size}`);
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const title = (data.title || '').toLowerCase();
    const img = (data.imageUrl || '');
    if (title.includes('litchi') || title.includes('shahi') || img.includes('litchi') || d.id.includes('4jP') || d.id.includes('FuT')) {
      console.log(`[${d.id}] Title: ${data.title} | Img: ${data.imageUrl}`);
      // Update directly to shahi-litchi-muzaffarpur.jpg if needed
      if (data.imageUrl !== '/legacy-images/shahi-litchi-muzaffarpur.jpg') {
        await updateDoc(doc(db, 'stories', d.id), {
          imageUrl: '/legacy-images/shahi-litchi-muzaffarpur.jpg'
        });
        console.log(`  -> Updated to /legacy-images/shahi-litchi-muzaffarpur.jpg`);
      }
      count++;
    }
  }
  console.log(`Found and processed ${count} stories.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
