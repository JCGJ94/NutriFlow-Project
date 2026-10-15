import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const showToast = vi.fn();

vi.mock('next/navigation', () => ({
    useParams: () => ({ id: 'plan-1' }),
    useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' }),
}));
vi.mock('@/context/ToastContext', () => ({
    useToast: () => ({ showToast }),
}));
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: { getSession: async () => ({ data: { session: null } }) },
    }),
}));

// A tiny fake of the PlansContext cache: like the real one, getShoppingList
// returns whatever was last written, including an optimistic copy.
let cache: unknown;
vi.mock('@/context/PlansContext', () => ({
    usePlans: () => ({
        getShoppingList: async () => cache,
        updateShoppingListCache: (_planId: string, list: unknown) => {
            cache = list;
        },
    }),
}));

import ShoppingListPage from '@/app/shopping-list/[id]/page';

function makeList() {
    return {
        planId: 'plan-1',
        weekStart: '2026-01-05',
        generatedAt: '2026-01-01T00:00:00Z',
        items: [
            {
                id: 'item-1',
                ingredientId: 'ing-1',
                ingredientName: 'Chicken',
                category: 'protein',
                totalGrams: 200,
                isChecked: false,
                isCustom: false,
            },
        ],
    };
}

function mockFetch(status: number, body: unknown) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText: 'status text',
        text: async () => JSON.stringify(body),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('ShoppingListPage item toggle', () => {
    beforeEach(() => {
        cache = makeList();
        showToast.mockClear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('sends the item id and the new state to the toggle route', async () => {
        const fetchMock = mockFetch(200, { checked: true });
        render(<ShoppingListPage />);

        fireEvent.click(await screen.findByText('Chicken'));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/api/shopping-list/plan-1/items/toggle');
        expect(JSON.parse(init.body)).toEqual({ itemId: 'item-1', isChecked: true });
        expect(screen.getByText('Chicken')).toHaveClass('line-through');
    });

    it('reverts the item and shows the route error when the server rejects the toggle', async () => {
        mockFetch(404, { error: 'Item not found' });
        render(<ShoppingListPage />);

        fireEvent.click(await screen.findByText('Chicken'));

        await waitFor(() => expect(showToast).toHaveBeenCalledWith('Item not found', 'error'));
        expect(screen.getByText('Chicken')).not.toHaveClass('line-through');
        // The cache must not keep replaying the optimistic state either.
        expect((cache as ReturnType<typeof makeList>).items[0].isChecked).toBe(false);
    });
});

describe('ShoppingListPage custom items', () => {
    beforeEach(() => {
        cache = {
            ...makeList(),
            items: [
                {
                    id: 'custom-1',
                    ingredientId: null,
                    ingredientName: 'Oat milk',
                    category: 'condiment',
                    isChecked: true,
                    isCustom: true,
                },
            ],
        };
        showToast.mockClear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('restores a custom item when the server rejects its deletion', async () => {
        const fetchMock = mockFetch(404, { error: 'Item not found' });
        render(<ShoppingListPage />);
        await screen.findByText('Oat milk');

        // Custom rows render their delete button next to the name.
        fireEvent.click(screen.getByText('Oat milk').parentElement!.querySelector('button')!);

        await waitFor(() => expect(showToast).toHaveBeenCalledWith('Item not found', 'error'));
        expect(fetchMock.mock.calls[0][0]).toBe('/api/shopping-list/plan-1/items/custom-1');
        expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
        expect(screen.getByText('Oat milk')).toBeInTheDocument();
        expect((cache as ReturnType<typeof makeList>).items).toHaveLength(1);
    });

    // Adding an item is not covered here: jsdom never delivers the form submit to the
    // React handler for this page. The POST route and the apiClient error path have
    // their own specs, and the manual run exercises the real form.
});
