import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'functions/.next/**',
      'functions/lib/**',
      'tmp-edge-profile-single/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    settings: {
      next: {
        rootDir: '.',
      },
    },
  }),
];

export default eslintConfig;
