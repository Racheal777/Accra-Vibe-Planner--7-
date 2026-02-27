// generate-icons.js
// Run this with: node generate-icons.js
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');

const svgContent = `
<svg width="512" height="512" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#F97316"/>
  <path d="M 12 12 L 32 52 L 52 12 L 44 12 L 32 36 L 20 12 Z" fill="#FFFFFF"/>
</svg>
`;

const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

async function generateIcons() {
  const svgBuffer = Buffer.from(svgContent);
  
  for (const { name, size } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(name);
      console.log(`✓ Generated ${name}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  console.log('\n✨ All icons generated!');
}

generateIcons();
