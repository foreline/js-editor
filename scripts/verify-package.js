#!/usr/bin/env node

/**
 * Package verification script
 * Verifies that all necessary files are present for npm publishing
 */

import fs from 'fs';
import path from 'path';

const requiredFiles = [
    'dist/js-editor.es.js',
    'dist/js-editor.es.js.map',
    'dist/js-editor.cjs.js', 
    'dist/js-editor.cjs.js.map',
    'dist/index.d.ts',
    'dist/style.css',
    'dist/editor.css',
    'dist/prism-theme.css',
    'package.json',
    'README.md',
    'LIBRARY.md'
];

console.log('🔍 Verifying package files...\n');

let allFilesPresent = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesPresent = false;
    }
});

console.log('\n📊 Package size analysis:');
const stats = fs.statSync('dist/js-editor.es.js');
const sizeKB = (stats.size / 1024).toFixed(2);
console.log(`ES Module: ${sizeKB} KB`);

const cjsStats = fs.statSync('dist/js-editor.cjs.js');
const cjsSizeKB = (cjsStats.size / 1024).toFixed(2);
console.log(`CommonJS: ${cjsSizeKB} KB`);

if (allFilesPresent) {
    console.log('\n🎉 All required files are present! Ready for publishing.');
    process.exit(0);
} else {
    console.log('\n❌ Some files are missing. Please run "npm run build:lib" first.');
    process.exit(1);
}
