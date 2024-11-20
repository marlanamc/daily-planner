const sharp = require('sharp');
const fs = require('fs').promises;

async function generateIcons() {
  const svg = await fs.readFile('app-icon.svg');

  await Promise.all([
    sharp(svg)
      .resize(180, 180)
      .png()
      .toFile('public/apple-touch-icon.png'),
    
    sharp(svg)
      .resize(192, 192)
      .png()
      .toFile('public/icon-192x192.png'),
    
    sharp(svg)
      .resize(512, 512)
      .png()
      .toFile('public/icon-512x512.png')
  ]);
}

generateIcons().catch(console.error);