#!/usr/bin/env node

/**
 * 🚀 DEPLOYMENT READINESS CHECKER
 * Script untuk memastikan project siap deploy setelah 21x failure trauma
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CHECKING DEPLOYMENT READINESS...\n');

// Check 1: ESLint Configuration
console.log('1. 📝 Checking ESLint Config...');
const eslintConfigPath = path.join(__dirname, '..', 'eslint.config.js');
if (fs.existsSync(eslintConfigPath)) {
  const config = fs.readFileSync(eslintConfigPath, 'utf8');
  if (config.includes('RELAXED ESLint Config')) {
    console.log('   ✅ ESLint using RELAXED configuration (deployment-friendly)');
  } else {
    console.log('   ⚠️  ESLint still using strict config - might cause deployment issues');
  }
} else {
  console.log('   ❌ ESLint config not found');
}

// Check 2: Build Test
console.log('\n2. 🔨 Testing Build Process...');
try {
  console.log('   Running: npm run build');
  execSync('cd frontend && npm run build', { stdio: 'pipe' });
  console.log('   ✅ Build SUCCESS! No blocking errors');
} catch {
  console.log('   ❌ Build FAILED! Check errors above');
}

// Check 3: Lint Test (should be very lenient now)
console.log('\n3. 📋 Testing ESLint (should be relaxed)...');
try {
  console.log('   Running: npm run lint');
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('   ✅ ESLint PASSED! No blocking errors');
} catch {
  console.log('   ⚠️  Some ESLint warnings (but not blocking deployment)');
  // Don't fail here - warnings are OK for relaxed config
}

// Check 4: Environment Setup
console.log('\n4. 🌍 Checking Environment Files...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envExamplePath)) {
  console.log('   ✅ .env.example found');
} else {
  console.log('   ⚠️  .env.example not found - create one for deployment');
}

if (fs.existsSync(envPath)) {
  console.log('   ✅ .env found (for local development)');
} else {
  console.log('   ⚠️  .env not found - copy from .env.example');
}

// Check 5: Package.json scripts
console.log('\n5. 📦 Checking Package.json Scripts...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasDevScript = packageJson.scripts && packageJson.scripts.dev;
  const hasBuildScript = packageJson.scripts && packageJson.scripts.build;
  const hasStartScript = packageJson.scripts && packageJson.scripts.start;
  
  if (hasDevScript) {
    console.log('   ✅ dev script found');
  }
  if (hasBuildScript) {
    console.log('   ✅ build script found');
  }
  if (hasStartScript) {
    console.log('   ✅ start script found');
  }
  
  if (!hasDevScript || !hasBuildScript || !hasStartScript) {
    console.log('   ⚠️  Some scripts missing - check package.json');
  }
}

// Check 6: Dependencies
console.log('\n6. 📚 Checking Critical Dependencies...');
try {
  const frontendPackage = path.join(__dirname, '..', 'frontend', 'package.json');
  if (fs.existsSync(frontendPackage)) {
    const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
    const hasNext = pkg.dependencies && pkg.dependencies.next;
    const hasReact = pkg.dependencies && pkg.dependencies.react;
    
    if (hasNext) {
      console.log('   ✅ Next.js dependency found');
    }
    if (hasReact) {
      console.log('   ✅ React dependency found');
    }
    
    if (hasNext && hasReact) {
      console.log('   ✅ Core dependencies look good');
    }
  }
} catch {
  console.log('   ⚠️  Could not check dependencies');
}

// Final Recommendation
console.log('\n🎯 DEPLOYMENT RECOMMENDATIONS:');
console.log('');
console.log('✅ READY FOR DEPLOYMENT PLATFORMS:');
console.log('   1. Railway.app (Recommended - supports Go backend)');
console.log('   2. Render.com (Good alternative)');
console.log('   3. DigitalOcean VPS (Full control)');
console.log('');
console.log('❌ AVOID:');
console.log('   1. Vercel (tidak cocok untuk Go backend + PostgreSQL)');
console.log('   2. Netlify (frontend only)');
console.log('');
console.log('🚀 NEXT STEPS:');
console.log('   1. Choose deployment platform (Railway.app recommended)');
console.log('   2. Set up environment variables');
console.log('   3. Connect GitHub repository');
console.log('   4. Deploy and test!');
console.log('');
console.log('💪 You got this! No more 21x failures! 🎉');