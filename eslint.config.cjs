module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'scripts/**', 'src/__tests__/**', 'playwright/test-results/**', 'test-results/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: { ecmaVersion: 2021, sourceType: 'module', ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      // Turn off unused-vars warnings to avoid false positives across legacy event handlers
      'no-unused-vars': 'off',
      'no-console': 'off'
    }
  }
]

// TypeScript override
module.exports.push({
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: { ecmaVersion: 2021, sourceType: 'module', ecmaFeatures: { jsx: true } }
  },
  plugins: { '@typescript-eslint': require('@typescript-eslint/eslint-plugin') },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off'
  }
})

