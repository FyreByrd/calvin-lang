import js from '@eslint/js';

import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettierConfig,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none'
        }
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external', 'internal'], 'parent', 'sibling'],
          alphabetize: { order: 'asc' },
          named: true
        }
      ],
      'import/no-unresolved': 'off',
    }
  },
  globalIgnores([
    '**/.DS_Store',
    '**/node_modules',
    'package',
    '**/.env',
    '**/.env.*',
    '!**/.env.example',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
    '**/yarn.lock',
    'out',
    '**/*.js'
  ])
);
