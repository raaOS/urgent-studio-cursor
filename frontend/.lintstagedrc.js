module.exports = {
  // Jalankan ESLint pada file TypeScript dan JavaScript
  '**/*.{ts,tsx,js,jsx}': ['eslint --fix'],
  // Jalankan TypeScript type checking
  '**/*.{ts,tsx}': () => 'npm run typecheck',
};