import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

// Spec "Endpoint path coherence": every client-side fetch path resolves to an
// existing Route Handler. Routes are derived from the app/api file tree, so
// adding or removing a handler is picked up without touching this test.

const SRC = resolve(__dirname, '../..');
const API_DIR = join(SRC, 'app', 'api');

// Paths that are knowingly unresolved while a product decision is open.
// Remove an entry as soon as its caller is rewired or deleted.
const KNOWN_UNRESOLVED = new Set<string>([
    // AI diet preview (NotebookLM-era). Awaiting the keep/remove decision.
    '/api/diet-engine/generate-ai',
]);

function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            if (name === 'node_modules' || name === '__tests__') continue;
            walk(full, out);
        } else {
            out.push(full);
        }
    }
    return out;
}

function routePatterns(): RegExp[] {
    return walk(API_DIR)
        .filter((f) => /route\.ts$/.test(f))
        .map((f) => {
            const dir = relative(API_DIR, join(f, '..')).split(sep).filter(Boolean);
            const source = dir.map((seg) => (/^\[.+\]$/.test(seg) ? '[^/]+' : seg)).join('/');
            return new RegExp(`^/api${source ? `/${source}` : ''}$`);
        });
}

// Infrastructure that builds URLs or talks to an external API, not app callers.
const NOT_CALLERS = new Set<string>([
    join('lib', 'apiClient.ts'),
    join('lib', 'llm', 'providers', 'ollama-provider.ts'),
    join('app', 'robots.ts'), // `disallow: ['/api/']` is a crawler rule, not a call
]);

function clientFiles(): string[] {
    return walk(SRC).filter(
        (f) =>
            /\.(ts|tsx)$/.test(f) &&
            !f.startsWith(API_DIR + sep) &&
            !NOT_CALLERS.has(relative(SRC, f)),
    );
}

function normalize(raw: string): string {
    return raw
        .replace(/\$\{[^}]*\}/g, 'x')
        .replace(/[?#].*$/, '')
        .replace(/\/+$/, '');
}

type Found = { file: string; path: string };

function literalApiPaths(): Found[] {
    const found: Found[] = [];
    // '/api/...' string or template literal, optionally right after a `${...}` expression.
    const direct = /(?:['"`]|\})(\/api\/[^'"`\s)]*)/g;
    // apiClient.get('/plans/...') style calls, which prefix '/api' internally.
    const viaClient =
        /apiClient\s*\.\s*(?:get|post|put|patch|delete)\s*(?:<[^()]*>)?\s*\(\s*['"`]\/?([^'"`]+)['"`]/g;

    for (const file of clientFiles()) {
        const text = readFileSync(file, 'utf8');
        for (const m of text.matchAll(direct)) {
            found.push({ file: relative(SRC, file), path: normalize(m[1]) });
        }
        for (const m of text.matchAll(viaClient)) {
            found.push({ file: relative(SRC, file), path: normalize(`/api/${m[1]}`) });
        }
    }
    return found;
}

describe('client API path coherence', () => {
    it('finds the route tree and client call sites (guards against a vacuous pass)', () => {
        expect(routePatterns().length).toBeGreaterThan(20);
        expect(literalApiPaths().length).toBeGreaterThan(10);
    });

    it('every client fetch path resolves to an existing Route Handler', () => {
        const patterns = routePatterns();
        const unresolved = literalApiPaths().filter(
            ({ path }) => !patterns.some((p) => p.test(path)) && !KNOWN_UNRESOLVED.has(path),
        );

        expect(unresolved.map((u) => `${u.path}  (${u.file})`)).toEqual([]);
    });

    it('no client code depends on the removed external API base URL', () => {
        const offenders = clientFiles()
            .filter((f) => readFileSync(f, 'utf8').includes('NEXT_PUBLIC_API_URL'))
            .map((f) => relative(SRC, f));

        expect(offenders).toEqual([]);
    });
});
