import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
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
