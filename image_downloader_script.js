const fs = require('fs');
const https = require('https');
const path = require('path');

// Ensure the target directory exists
const dir = path.join(__dirname, 'public', 'sports_images');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// List of images mapped in our JSON file
const images = [
    { name: 'patna-indoor-stadium.webp', url: 'https://biharsay.com/wp-content/uploads/2026/09/patna-indoor-stadium.webp' },
    { name: 'sportstar-aces-awards-bihar.webp', url: 'https://biharsay.com/wp-content/uploads/2026/03/sportstar-aces-awards-bihar.webp' },
    { name: 'jbc-kabaddi-league.webp', url: 'https://biharsay.com/wp-content/uploads/2026/02/jbc-kabaddi-league.webp' },
    { name: 'bihar-sports-awards.webp', url: 'https://biharsay.com/wp-content/uploads/2025/10/bihar-sports-awards.webp' },
    { name: 'hockey-asia-cup-patna-honour.webp', url: 'https://biharsay.com/wp-content/uploads/2025/09/hockey-asia-cup-patna-honour.webp' },
    { name: 'hero-asia-hockey-cup-rajgir.webp', url: 'https://biharsay.com/wp-content/uploads/2025/08/hero-asia-hockey-cup-rajgir.webp' },
    { name: 'asia-rugby-rajgir.webp', url: 'https://biharsay.com/wp-content/uploads/2025/08/asia-rugby-rajgir.webp' },
    { name: 'para-sports-school.webp', url: 'https://biharsay.com/wp-content/uploads/2025/06/para-sports-school.webp' },
    { name: 'bihar-568cr-sports-budget.webp', url: 'https://biharsay.com/wp-content/uploads/2025/05/bihar-568cr-sports-budget.webp' },
    { name: 'bihar-women-rugby.webp', url: 'https://biharsay.com/wp-content/uploads/2025/04/bihar-women-rugby.webp' }
];

// Helper function to download a file using native Node https module
const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function fetchAll() {
    console.log(`Downloading ${images.length} images to ${dir}...`);
    for (const img of images) {
        const dest = path.join(dir, img.name);
        try {
            await download(img.url, dest);
            console.log(`✅ Downloaded: ${img.name}`);
        } catch (err) {
            console.log(`❌ Failed: ${img.name} (${err.message})`);
        }
    }
    console.log("\nAll done! You can now ask Antigravity to build the homepage.");
}

fetchAll();