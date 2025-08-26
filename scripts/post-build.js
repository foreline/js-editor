/**
 * Post-build script to copy individual CSS files to dist
 */

import fs from 'fs';
import path from 'path';

const srcCssDir = 'src/css';
const distDir = 'dist';

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy individual CSS files
const cssFiles = ['editor.css', 'prism-theme.css'];
let combinedCss = '';

cssFiles.forEach(file => {
    const srcPath = path.join(srcCssDir, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        const content = fs.readFileSync(srcPath, 'utf8');
        fs.copyFileSync(srcPath, destPath);
        combinedCss += `/* ${file} */\n${content}\n\n`;
        console.log(`Copied ${file} to dist/`);
    }
});

// Create combined CSS file
const styleCssPath = path.join(distDir, 'style.css');
fs.writeFileSync(styleCssPath, combinedCss);
console.log('Created combined style.css');

// Copy TypeScript definitions
const tsDefsPath = path.join('src', 'index.d.ts');
const distTsDefsPath = path.join(distDir, 'index.d.ts');
if (fs.existsSync(tsDefsPath)) {
    fs.copyFileSync(tsDefsPath, distTsDefsPath);
    console.log('Copied TypeScript definitions');
}

console.log('CSS files copied successfully!');
