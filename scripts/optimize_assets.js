const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  console.log('--- Starting Asset Optimization & Generation ---');

  const publicDir = path.join(__dirname, '..', 'public');
  const logosDir = path.join(publicDir, 'logos');

  // 1. Optimize founder.png
  const founderPath = path.join(publicDir, 'founder.png');
  if (fs.existsSync(founderPath)) {
    const founderInput = fs.readFileSync(founderPath);
    console.log(`Input founder.png size: ${(founderInput.length / 1024).toFixed(1)} KB`);

    const optimizedBuffer = await sharp(founderInput)
      .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 75, palette: true })
      .toBuffer();

    fs.writeFileSync(founderPath, optimizedBuffer);
    console.log(`Optimized founder.png: ${(optimizedBuffer.length / 1024).toFixed(1)} KB`);
  }

  // 2. Optimize bihariceo.png
  const bihariceoPath = path.join(logosDir, 'bihariceo.png');
  if (fs.existsSync(bihariceoPath)) {
    const ceoInput = fs.readFileSync(bihariceoPath);
    console.log(`Original bihariceo.png: ${(ceoInput.length / 1024).toFixed(1)} KB`);

    const optimizedCeo = await sharp(ceoInput)
      .resize({ width: 240, height: 100, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 75, palette: true })
      .toBuffer();

    fs.writeFileSync(bihariceoPath, optimizedCeo);
    console.log(`Optimized bihariceo.png: ${(optimizedCeo.length / 1024).toFixed(1)} KB`);
  }

  // 3. Generate favicon.ico and favicon.png
  const logoSource = path.join(logosDir, 'biharsay.webp');
  if (fs.existsSync(logoSource)) {
    const logoInput = fs.readFileSync(logoSource);

    // 32x32 for favicon.png and favicon.ico
    const favicon32 = await sharp(logoInput)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon32);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);

    // 192x192 for apple-touch-icon
    const appleIcon = await sharp(logoInput)
      .resize(192, 192, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

    console.log('Generated favicon.ico, favicon.png, and apple-touch-icon.png');
  }

  // 4. Generate 1200x630 Open Graph Banner (og-banner.png)
  console.log('Generating 1200x630 Open Graph Social Banner...');
  
  let logoBase64 = '';
  if (fs.existsSync(logoSource)) {
    logoBase64 = fs.readFileSync(logoSource).toString('base64');
  }

  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090E1A" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#FBBF24" />
      </linearGradient>
      <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#1E3A8A" stop-opacity="0.0" />
      </linearGradient>
      <radialGradient id="radial" cx="80%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#0F172A" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)" />
    <rect width="1200" height="630" fill="url(#radial)" />
    <circle cx="1050" cy="150" r="300" fill="url(#blueGlow)" />

    <!-- Top Border Strip -->
    <rect x="0" y="0" width="1200" height="6" fill="url(#gold)" />

    <!-- Grid lines decorative -->
    <path d="M 0 140 L 1200 140 M 0 490 L 1200 490" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

    <!-- Left Content Group -->
    <g transform="translate(100, 110)">
      <!-- Badge Pill -->
      <rect x="0" y="0" width="230" height="36" rx="18" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1" />
      <circle cx="18" cy="18" r="5" fill="#F59E0B" />
      <text x="32" y="23" font-family="'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#FBBF24" letter-spacing="1">BIHAR'S VOICES</text>

      <!-- Main Headline -->
      <text x="0" y="95" font-family="'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" font-size="64" font-weight="700" fill="#FFFFFF" letter-spacing="-1">
        Bihar Say
      </text>

      <!-- Tagline -->
      <text x="0" y="145" font-family="'Calibri', 'Candara', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="600" fill="url(#gold)">
        Stories Setting the Pace for Bihar
      </text>

      <!-- Subtitle Description -->
      <text x="0" y="200" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" fill="#94A3B8">
        Grassroots Innovation · Cultural Pride · Agritech · Resurgence
      </text>
      <text x="0" y="230" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" fill="#94A3B8">
        Connecting 8.5 Lakh+ Readers &amp; 15,000+ Community Members Worldwide
      </text>

      <!-- Metrics Badges -->
      <g transform="translate(0, 280)">
        <!-- Metric 1 -->
        <rect x="0" y="0" width="160" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
        <text x="18" y="26" font-family="'Calibri', 'Candara', sans-serif" font-size="18" font-weight="700" fill="#38BDF8">15,000+</text>
        <text x="18" y="46" font-family="'Segoe UI', sans-serif" font-size="11" fill="#94A3B8">COMMUNITY</text>

        <!-- Metric 2 -->
        <rect x="175" y="0" width="160" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
        <text x="193" y="26" font-family="'Calibri', 'Candara', sans-serif" font-size="18" font-weight="700" fill="#FBBF24">8.5 Lakh+</text>
        <text x="193" y="46" font-family="'Segoe UI', sans-serif" font-size="11" fill="#94A3B8">MONTHLY READERS</text>

        <!-- Metric 3 -->
        <rect x="350" y="0" width="160" height="60" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
        <text x="368" y="26" font-family="'Calibri', 'Candara', sans-serif" font-size="18" font-weight="700" fill="#34D399">38 Districts</text>
        <text x="368" y="46" font-family="'Segoe UI', sans-serif" font-size="11" fill="#94A3B8">FULL BIHAR REACH</text>
      </g>
    </g>

    <!-- Right Side Logo Emblem -->
    <g transform="translate(860, 200)">
      <circle cx="110" cy="110" r="120" fill="rgba(245, 158, 11, 0.08)" />
      <circle cx="110" cy="110" r="95" fill="#0F172A" stroke="rgba(245, 158, 11, 0.3)" stroke-width="2" filter="url(#shadow)" />
      ${logoBase64 ? `<image href="data:image/webp;base64,${logoBase64}" x="30" y="30" width="160" height="160" />` : ''}
    </g>

    <!-- Footer URL -->
    <text x="100" y="565" font-family="'Calibri', 'Candara', sans-serif" font-size="18" font-weight="700" fill="#64748B" letter-spacing="1">
      biharsay.com
    </text>
  </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'og-banner.png'));

  console.log('Saved public/og-banner.png (1200x630)');
  console.log('--- Asset Optimization Completed Successfully ---');
}

run().catch((err) => {
  console.error('Error optimizing assets:', err);
  process.exit(1);
});
