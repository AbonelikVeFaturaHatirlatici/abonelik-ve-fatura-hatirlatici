import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // src/api/schema.d.ts: api/openapi.yaml'dan `npm run generate:api` ile üretilir; elle düzenlenmez.
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**', 'src/api/schema.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
);
