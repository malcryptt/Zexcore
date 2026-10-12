import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/*.d.ts',
      '**/*.json',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Module boundary rules for domain modules (module-cms, module-crm, etc.)
  {
    files: ['packages/module-*/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@zexcore/module-*', '../module-*/**', '../../module-*/**'],
              message:
                'Forbidden: Direct cross-module imports are prohibited. Use the Core Event Bus for inter-module communication.',
            },
            {
              group: ['@zexcore/core/src/**', '../core/src/**', '../../core/src/**'],
              message:
                'Forbidden: Deep imports from core internals are prohibited. Import from "@zexcore/core" public barrel instead.',
            },
            {
              group: ['@zexcore/api/**', '../../apps/**'],
              message: 'Forbidden: Modules cannot depend on applications.',
            },
          ],
        },
      ],
    },
  },
  // Module boundary rules for Core (core must never depend on modules or apps)
  {
    files: ['packages/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@zexcore/module-*', '../module-*/**', '../../module-*/**'],
              message: 'Forbidden: Core must not depend on domain modules.',
            },
            {
              group: ['@zexcore/api/**', '../../apps/**'],
              message: 'Forbidden: Core must not depend on applications.',
            },
            {
              group: ['packs/**', '../packs/**'],
              message: 'Forbidden: Core must not depend on industry packs.',
            },
          ],
        },
      ],
    },
  },
  // Rule for industry packs: config only, no executable code imports
  {
    files: ['packs/**/*.ts', 'packs/**/*.json'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@zexcore/api/**', '@zexcore/module-*'],
              message: 'Forbidden: Packs are configuration-only manifests.',
            },
          ],
        },
      ],
    },
  },
);
