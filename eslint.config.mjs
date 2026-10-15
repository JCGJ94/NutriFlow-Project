import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'dist/**', 'node_modules/**', 'playwright-report/**', 'next-env.d.ts']),
    {
        // Same rule levels as the former .eslintrc.json.
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/ban-ts-comment': 'warn',
            'no-empty': 'warn',
            // React 19 rules that flag existing patterns (setState in effects, helpers used
            // before their declaration). They stay visible as warnings until the data-layer
            // refactor (M7) rewrites those components; do not raise them back before that.
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/purity': 'warn',
        },
    },
]);
