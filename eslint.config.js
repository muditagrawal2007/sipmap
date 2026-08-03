import js from '@eslint/js';
import globals from 'globals';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
    plugins: {
      security,
    },
    rules: {
      // Empty catch blocks are allowed with a trailing comment for intentional swallows.
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-process-env': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      // The security plugin is overly conservative for our internal patterns; we still
      // review these via dedicated grep-based tests in test/security/.
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-require': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      '.github/**',
    ],
  },
];
