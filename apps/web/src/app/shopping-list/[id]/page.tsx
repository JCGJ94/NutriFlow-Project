'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Loader2,
  Printer,
  Plus,
  Trash2,
  Mail,
  Share2,
} from 'lucide-react';
import { IngredientCategory } from '@nutriflow/shared';
import { formatGrams } from '@/lib/utils';

interface ShoppingListItem {
  id: string;
  ingredientId: string | null;
  ingredientName: string;
  category: IngredientCategory;
  totalGrams?: number;
  isChecked: boolean;
  isCustom: boolean;
}

interface ShoppingList {
  planId: string;
  weekStart: string;
  items: ShoppingListItem[];
  generatedAt: string;
}

const CATEGORY_NAMES: Record<IngredientCategory, string> = {
  [IngredientCategory.PROTEIN]: 'Proteínas',
  [IngredientCategory.CARBOHYDRATE]: 'Carbohidratos',
  [IngredientCategory.VEGETABLE]: 'Verduras',
  [IngredientCategory.FRUIT]: 'Frutas',
  [IngredientCategory.DAIRY]: 'Lácteos',
  [IngredientCategory.FAT]: 'Grasas',
  [IngredientCategory.LEGUME]: 'Legumbres',
  [IngredientCategory.GRAIN]: 'Cereales',
  [IngredientCategory.NUT_SEED]: 'Frutos secos',
  [IngredientCategory.CONDIMENT]: 'Condimentos',
};

export default function ShoppingListPage() {
  const params = useParams();
  const planId = params.id as string;

  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    loadShoppingList();
  }, [planId]);

  const loadShoppingList = async () => {
    try {
      const response = await fetch(`/api/shopping-list/${planId}`);
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = async (itemId: string, currentChecked: boolean) => {
    try {
      // Optimistic update
      setShoppingList(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === itemId ? { ...item, isChecked: !currentChecked } : item
          )
        };
      });

      const response = await fetch('/api/shopping-list/items/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isChecked: !currentChecked })
      });

      if (!response.ok) {
        // Rollback on error
        loadShoppingList();
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      loadShoppingList();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    const name = newItemName.trim();
    setNewItemName('');

    try {
      const response = await fetch(`/api/shopping-list/${planId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customName: name })
      });

      if (response.ok) {
        loadShoppingList();
      }
    } catch (error) {
      console.error('Error adding custom item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-list/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShoppingList(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
          };
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleShareEmail = () => {
    if (!shoppingList) return;

    let body = `Lista de Compra NutriFlow - Semana del ${new Date(shoppingList.weekStart).toLocaleDateString()}\n\n`;
    
    // Standard Items
    Object.entries(groupedItems).forEach(([category, items]) => {
      body += `\n${CATEGORY_NAMES[category as IngredientCategory] || category}:\n`;
      items.forEach(item => {
        body += `${item.isChecked ? '[x]' : '[ ]'} ${item.ingredientName} ${item.totalGrams ? `(${formatGrams(item.totalGrams)})` : ''}\n`;
      });
    });

    window.open(`mailto:?subject=Lista de Compra NutriFlow&body=${encodeURIComponent(body)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold text-surface-900 dark:text-white mb-2">
            Lista no encontrada
          </h2>
          <Link href="/dashboard" className="btn-primary">
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  // Group items by category
  const groupedItems = (shoppingList.items || []).reduce((acc, item) => {
    // Only group standard items here, or all if you prefer
    if (item.isCustom) return acc;
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<IngredientCategory, ShoppingListItem[]>);

  const customItems = (shoppingList.items || []).filter(item => item.isCustom);

  const totalItems = shoppingList.items.length;
  const checkedCount = shoppingList.items.filter(i => i.isChecked).length;

  return (
    <div className="min-h-screen bg-page-gradient print:bg-white pt-16">
      {/* Header */}
      <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-16 z-10 print:hidden transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/plan/${planId}`}
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-600 dark:text-surface-300" />
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
                <span className="font-heading font-bold text-surface-900 dark:text-white">
                  Lista de compra
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="btn-secondary flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={handleShareEmail}
                className="btn-secondary flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="card mb-6 print:shadow-none print:border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-heading font-bold text-surface-900 dark:text-white">
              Tu lista de compra semanal
            </h1>
            <span className="text-sm text-surface-500 dark:text-surface-400">
              {checkedCount} de {totalItems} productos
            </span>
          </div>
          <div className="w-full bg-surface-200 rounded-full h-2 print:hidden">
            <div
              className="bg-accent-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Categories (Standard Items) */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="card print:shadow-none print:border">
              <h2 className="text-lg font-heading font-semibold text-surface-900 dark:text-white mb-4">
                {CATEGORY_NAMES[category as IngredientCategory] || category}
              </h2>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 group"
                  >
                    <button
                      onClick={() => toggleItem(item.id, item.isChecked)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 print:hidden ${
                        item.isChecked
                          ? 'bg-accent-500 border-accent-500'
                          : 'border-surface-300 hover:border-accent-400 dark:border-surface-600 dark:hover:border-accent-500'
                      }`}
                    >
                      {item.isChecked && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        item.isChecked ? 'line-through text-surface-400 dark:text-surface-500' : 'text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      {item.ingredientName}
                    </span>
                    <span className="text-sm text-surface-500 dark:text-surface-400 font-medium mr-2">
                      {item.totalGrams ? formatGrams(item.totalGrams) : ''}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-surface-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 print:hidden"
                      title="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Custom Items Section */}
        <div className="mt-8 card print:shadow-none print:border">
          <h2 className="text-lg font-heading font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-accent-500" />
            Productos adicionales
          </h2>
          
          <form onSubmit={handleAddCustomItem} className="flex gap-2 mb-4 print:hidden">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Añadir otro producto (ej: servilletas)..."
              className="input flex-1"
            />
            <button type="submit" className="btn-primary p-2">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {customItems.length === 0 ? (
            <p className="text-surface-500 dark:text-surface-400 text-sm italic print:hidden">
              No has añadido productos extra.
            </p>
          ) : (
            <ul className="space-y-3">
              {customItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleItem(item.id, item.isChecked)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 print:hidden ${
                      item.isChecked
                        ? 'bg-accent-500 border-accent-500'
                        : 'border-surface-300 hover:border-accent-400'
                    }`}
                  >
                    {item.isChecked && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      item.isChecked ? 'line-through text-surface-400' : 'text-surface-700'
                    }`}
                  >
                    {item.ingredientName}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 text-surface-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 print:hidden"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
          Generado por NutriFlow · {new Date().toLocaleDateString('es-ES')}
        </div>
      </main>
    </div>
  );
}
