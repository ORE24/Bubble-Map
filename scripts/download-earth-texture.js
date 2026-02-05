/**
 * Downloads an equirectangular Earth texture to public/img/earth.jpg
 * so the 3D globe displays the earth map without relying on CDN.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'public', 'img');
const OUT_FILE = path.join(IMG_DIR, 'earth.jpg');
const URL = 'https://unpkg.com/three-globe@2.27.4/example/img/earth-day.jpg';

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

const file = fs.createWriteStream(OUT_FILE);
https
  .get(URL, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      https.get(res.headers.location, (res2) => res2.pipe(file));
      return;
    }
    res.pipe(file);
  })
  .on('error', (err) => {
    fs.unlink(OUT_FILE, () => {});
    console.error('Download failed:', err.message);
    process.exit(1);
  });

file.on('finish', () => {
  file.close();
  console.log('Saved earth texture to public/img/earth.jpg');
});
