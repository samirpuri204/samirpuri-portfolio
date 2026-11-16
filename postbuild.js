import fs from 'fs';
import path from 'path';

const dist = path.resolve('dist');
const portfolio = path.join(dist, 'portfolio');

// Start clean so a renamed/removed asset never lingers in the /portfolio copy.
fs.rmSync(portfolio, { recursive: true, force: true });
fs.mkdirSync(portfolio, { recursive: true });

// Copy index.html to portfolio/index.html
fs.copyFileSync(path.join(dist, 'index.html'), path.join(portfolio, 'index.html'));

// Sync assets
const distAssets = path.join(dist, 'assets');
const portfolioAssets = path.join(portfolio, 'assets');
fs.mkdirSync(portfolioAssets, { recursive: true });
if (fs.existsSync(distAssets)) {
  fs.cpSync(distAssets, portfolioAssets, { recursive: true });
}

// Sync photos
const distPhotos = path.join(dist, 'photos');
const portfolioPhotos = path.join(portfolio, 'photos');
fs.mkdirSync(portfolioPhotos, { recursive: true });
if (fs.existsSync(distPhotos)) {
  fs.cpSync(distPhotos, portfolioPhotos, { recursive: true });
}

console.log('Postbuild: synced all files to dist/portfolio/ successfully.');
