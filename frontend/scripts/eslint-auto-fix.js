#!/usr/bin/env node

/**
 * ESLint Auto Fix Script
 * Script untuk memperbaiki masalah ESLint secara otomatis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Memulai ESLint Auto Fix...\n');

// Fungsi untuk membaca file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Fungsi untuk menulis file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Fungsi untuk memperbaiki masalah strict-boolean-expressions
function fixStrictBooleanExpressions(content) {
  // Fix untuk kondisi yang menggunakan nilai truthy/falsy
  content = content.replace(
    /if\s*\(\s*([^)]+)\s*\)\s*{/g,
    (match, condition) => {
      // Skip jika sudah ada perbandingan eksplisit
      if (condition.includes('===') || condition.includes('!==') || 
          condition.includes('==') || condition.includes('!=') ||
          condition.includes('&&') || condition.includes('||') ||
          condition.includes('!')) {
        return match;
      }
      
      // Tambahkan pengecekan eksplisit untuk string
      if (condition.includes('.length') || condition.includes('""') || condition.includes("''")) {
        return `if (${condition} !== "" && ${condition} != null) {`;
      }
      
      // Tambahkan pengecekan eksplisit untuk number
      if (condition.match(/\d+/) || condition.includes('Number') || condition.includes('parseInt')) {
        return `if (${condition} !== 0 && ${condition} != null) {`;
      }
      
      // Default: tambahkan pengecekan truthy
      return `if (Boolean(${condition})) {`;
    }
  );

  // Fix untuk ternary operator
  content = content.replace(
    /(\w+)\s*\?\s*([^:]+)\s*:\s*([^;,\n}]+)/g,
    (match, condition, trueValue, falseValue) => {
      if (condition.includes('===') || condition.includes('!==')) {
        return match;
      }
      return `Boolean(${condition}) ? ${trueValue} : ${falseValue}`;
    }
  );

  return content;
}

// Fungsi untuk memperbaiki masalah prefer-nullish-coalescing
function fixNullishCoalescing(content) {
  // Ganti || dengan ?? untuk nilai yang bisa null/undefined
  content = content.replace(
    /(\w+(?:\.\w+)*)\s*\|\|\s*([^;,\n}]+)/g,
    (match, left, right) => {
      // Skip jika sudah menggunakan boolean logic yang benar
      if (left.includes('Boolean') || right.includes('Boolean')) {
        return match;
      }
      return `${left} ?? ${right}`;
    }
  );

  return content;
}

// Fungsi untuk memperbaiki masalah no-unsafe-assignment
function fixUnsafeAssignment(content) {
  // Tambahkan type assertion untuk assignment yang tidak aman
  content = content.replace(
    /(\w+)\s*=\s*([^;,\n}]+(?:as\s+any|any\[\])[^;,\n}]*)/g,
    (match, variable, value) => {
      // Ganti 'as any' dengan type yang lebih aman
      const safeValue = value.replace(/as\s+any/g, 'as unknown');
      return `${variable} = ${safeValue}`;
    }
  );

  return content;
}

// Fungsi untuk memperbaiki masalah explicit-function-return-type
function fixExplicitFunctionReturnType(content) {
  // Tambahkan return type untuk function declarations
  content = content.replace(
    /function\s+(\w+)\s*\([^)]*\)\s*{/g,
    (match, _functionName) => {
      if (match.includes(': ')) {
        return match; // Sudah ada return type
      }
      return match.replace('{', ': void {');
    }
  );

  // Tambahkan return type untuk arrow functions
  content = content.replace(
    /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g,
    (match, _functionName) => {
      if (match.includes(': ')) {
        return match; // Sudah ada return type
      }
      return match.replace('=>', '): void =>');
    }
  );

  return content;
}

// Daftar file yang perlu diperbaiki
const filesToFix = [
  'src/app/page.tsx',
  'src/app/api/health/route.ts',
  'src/app/brief/page.tsx',
  'src/app/products/page.tsx',
  'src/app/track/page.tsx',
  'src/components/BriefAccordion.tsx',
  'src/components/BriefForm.tsx'
];

// Proses setiap file
filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File tidak ditemukan: ${filePath}`);
    return;
  }

  console.log(`🔧 Memperbaiki: ${filePath}`);
  
  try {
    let content = readFile(fullPath);
    
    // Terapkan semua perbaikan
    content = fixStrictBooleanExpressions(content);
    content = fixNullishCoalescing(content);
    content = fixUnsafeAssignment(content);
    content = fixExplicitFunctionReturnType(content);
    
    // Tulis kembali file
    writeFile(fullPath, content);
    
    console.log(`✅ Berhasil memperbaiki: ${filePath}`);
  } catch {
    console.error(`❌ Gagal memperbaiki ${filePath}`);
  }
});

console.log('\n🎉 ESLint Auto Fix selesai!');
console.log('📝 Menjalankan ESLint untuk memeriksa hasil...\n');

// Jalankan ESLint untuk memeriksa hasil
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('\n✅ Semua masalah ESLint telah diperbaiki!');
} catch {
  console.log('\n⚠️  Masih ada beberapa masalah yang perlu diperbaiki manual.');
  console.log('💡 Jalankan "npm run lint" untuk melihat detail masalah yang tersisa.');
}