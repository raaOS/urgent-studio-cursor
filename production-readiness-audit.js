#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 AUDIT KESIAPAN PRODUKSI - URGENT STUDIO WEBSITE');
console.log('=' .repeat(60));

let score = 0;
let maxScore = 0;
const issues = [];
const recommendations = [];

function checkItem(name, condition, weight = 1, recommendation = '') {
  maxScore += weight;
  console.log(`\n📋 ${name}:`);
  
  if (condition) {
    console.log(`   ✅ PASS`);
    score += weight;
  } else {
    console.log(`   ❌ FAIL`);
    issues.push(name);
    if (recommendation) {
      recommendations.push(`${name}: ${recommendation}`);
    }
  }
}

// 1. Environment Configuration
console.log('\n🔧 KONFIGURASI ENVIRONMENT');
console.log('-'.repeat(40));

const envExampleExists = fs.existsSync('.env.example');
const envProdExampleExists = fs.existsSync('.env.prod.example');
const envExists = fs.existsSync('.env');

checkItem(
  'File .env.example tersedia', 
  envExampleExists, 
  1,
  'Buat file .env.example dengan template environment variables'
);

checkItem(
  'File .env.prod.example tersedia', 
  envProdExampleExists, 
  1,
  'Buat file .env.prod.example dengan konfigurasi produksi'
);

checkItem(
  'File .env tersedia untuk development', 
  envExists, 
  1,
  'Copy .env.example ke .env dan isi dengan nilai yang sesuai'
);

// 2. Build Process
console.log('\n🏗️ PROSES BUILD');
console.log('-'.repeat(40));

let buildSuccess = false;
try {
  console.log('   🔄 Menjalankan build...');
  execSync('cd frontend && npm run build', { stdio: 'pipe' });
  buildSuccess = true;
} catch (buildError) {
  console.log(`   ❌ Build gagal: ${buildError.message}`);
}

checkItem(
  'Frontend build berhasil', 
  buildSuccess, 
  3,
  'Perbaiki error TypeScript dan build issues'
);

// 3. TypeScript Configuration
console.log('\n📝 KONFIGURASI TYPESCRIPT');
console.log('-'.repeat(40));

const tsconfigExists = fs.existsSync('frontend/tsconfig.json');
let strictMode = false;

if (tsconfigExists) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync('frontend/tsconfig.json', 'utf8'));
    strictMode = tsconfig.compilerOptions?.strict === true;
  } catch {
    console.log('   ⚠️ Error reading tsconfig.json');
  }
}

checkItem(
  'TypeScript strict mode enabled', 
  strictMode, 
  2,
  'Enable strict mode di tsconfig.json untuk type safety'
);

// 4. Linting
console.log('\n🔍 LINTING & CODE QUALITY');
console.log('-'.repeat(40));

let lintSuccess = false;
try {
  execSync('cd frontend && npm run lint', { stdio: 'pipe' });
  lintSuccess = true;
} catch {
  console.log(`   ⚠️ Lint warnings/errors ditemukan`);
}

checkItem(
  'ESLint berjalan tanpa error', 
  lintSuccess, 
  2,
  'Perbaiki semua ESLint errors sebelum deploy'
);

// 5. Package.json Scripts
console.log('\n📦 PACKAGE.JSON SCRIPTS');
console.log('-'.repeat(40));

let packageJson = {};
try {
  packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
} catch {
  console.log('   ❌ Error reading package.json');
}

const hasDevScript = packageJson.scripts?.dev;
const hasBuildScript = packageJson.scripts?.build;
const hasStartScript = packageJson.scripts?.start;

checkItem('Script "dev" tersedia', !!hasDevScript, 1);
checkItem('Script "build" tersedia', !!hasBuildScript, 1);
checkItem('Script "start" tersedia', !!hasStartScript, 1);

// 6. Dependencies
console.log('\n📚 DEPENDENCIES');
console.log('-'.repeat(40));

const hasNextJs = packageJson.dependencies?.next;
const hasReact = packageJson.dependencies?.react;
const hasTypeScript = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;

checkItem('Next.js tersedia', !!hasNextJs, 1);
checkItem('React tersedia', !!hasReact, 1);
checkItem('TypeScript tersedia', !!hasTypeScript, 1);

// 7. Backend Configuration
console.log('\n🖥️ BACKEND CONFIGURATION');
console.log('-'.repeat(40));

const backendExists = fs.existsSync('backend');
const goModExists = fs.existsSync('backend/go.mod');
const mainGoExists = fs.existsSync('main.go') || fs.existsSync('backend/main.go');

checkItem('Backend directory exists', backendExists, 1);
checkItem('Go module configuration (go.mod)', goModExists, 1);
checkItem('Main Go file exists', mainGoExists, 1);

// 8. Database Configuration
console.log('\n🗄️ DATABASE CONFIGURATION');
console.log('-'.repeat(40));

const dbMigrationsExist = fs.existsSync('database/migrations');
const dbSeedExists = fs.existsSync('database/seed');

checkItem('Database migrations exist', dbMigrationsExist, 1);
checkItem('Database seed data exists', dbSeedExists, 1);

// 9. Deployment Configuration
console.log('\n🚀 DEPLOYMENT CONFIGURATION');
console.log('-'.repeat(40));

const apphostingYamlExists = fs.existsSync('apphosting.yaml');
const dockerfileExists = fs.existsSync('Dockerfile') || fs.existsSync('frontend/Dockerfile');

checkItem('Firebase App Hosting config (apphosting.yaml)', apphostingYamlExists, 1);
checkItem('Docker configuration available', dockerfileExists, 1);

// 10. Security Checks
console.log('\n🔒 SECURITY CHECKS');
console.log('-'.repeat(40));

const gitignoreExists = fs.existsSync('.gitignore');
let gitignoreHasEnv = false;

if (gitignoreExists) {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  gitignoreHasEnv = gitignoreContent.includes('.env');
}

checkItem('.gitignore exists', gitignoreExists, 1);
checkItem('.env files ignored in git', gitignoreHasEnv, 2, 'Tambahkan .env ke .gitignore');

// Final Score
console.log('\n' + '='.repeat(60));
console.log('📊 HASIL AUDIT KESIAPAN PRODUKSI');
console.log('='.repeat(60));

const percentage = Math.round((score / maxScore) * 100);
console.log(`\n🎯 SKOR: ${score}/${maxScore} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🟢 STATUS: SIAP PRODUKSI');
} else if (percentage >= 70) {
  console.log('🟡 STATUS: HAMPIR SIAP (perlu perbaikan minor)');
} else if (percentage >= 50) {
  console.log('🟠 STATUS: PERLU PERBAIKAN SIGNIFIKAN');
} else {
  console.log('🔴 STATUS: BELUM SIAP PRODUKSI');
}

// Issues & Recommendations
if (issues.length > 0) {
  console.log('\n❌ ISSUES YANG PERLU DIPERBAIKI:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

if (recommendations.length > 0) {
  console.log('\n💡 REKOMENDASI:');
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
}

// Deployment Recommendations
console.log('\n🚀 REKOMENDASI PLATFORM DEPLOYMENT:');
console.log('   1. Railway.app - Cocok untuk fullstack Go + Next.js + PostgreSQL');
console.log('   2. Render.com - Support Go backend dan PostgreSQL');
console.log('   3. DigitalOcean App Platform - Scalable dan mudah setup');
console.log('   4. Google Cloud Run - Untuk containerized deployment');
console.log('   5. Firebase App Hosting - Untuk frontend, backend terpisah');

console.log('\n⚠️  HINDARI:');
console.log('   - Vercel/Netlify (tidak cocok untuk Go backend + PostgreSQL)');
console.log('   - GitHub Pages (hanya static sites)');

console.log('\n✅ LANGKAH SELANJUTNYA:');
console.log('   1. Perbaiki semua issues yang ditemukan');
console.log('   2. Setup environment variables untuk produksi');
console.log('   3. Test deployment di staging environment');
console.log('   4. Setup monitoring dan logging');
console.log('   5. Configure domain dan SSL certificate');

console.log('\n' + '='.repeat(60));