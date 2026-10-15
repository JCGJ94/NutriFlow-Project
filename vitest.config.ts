import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    // Automatic JSX runtime so component specs do not need `import React`.
    esbuild: { jsx: 'automatic' },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
        setupFiles: ['./vitest.setup.ts'],
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
