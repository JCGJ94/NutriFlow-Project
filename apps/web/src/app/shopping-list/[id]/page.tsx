'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Loader2,
  Printer,
  Plus,
  Trash2,
  Share2,
  Beef,
  Wheat,
  Carrot,
  Apple,
  Milk,
  Droplet,
  Bean,
  Leaf,
  Info
} from 'lucide-react';
import { IngredientCategory } from '@nutriflow/shared';
import { formatGrams } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

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

const CATEGORY_ICONS: Record<IngredientCategory, any> = {
  [IngredientCategory.PROTEIN]: Beef,
  [IngredientCategory.CARBOHYDRATE]: Wheat,
  [IngredientCategory.VEGETABLE]: Carrot,
  [IngredientCategory.FRUIT]: Apple,
  [IngredientCategory.DAIRY]: Milk,
  [IngredientCategory.FAT]: Droplet,
  [IngredientCategory.LEGUME]: Bean,
  [IngredientCategory.GRAIN]: Wheat,
  [IngredientCategory.NUT_SEED]: Leaf,
  [IngredientCategory.CONDIMENT]: Info,
};

const CATEGORY_COLORS: Record<IngredientCategory, string> = {
  [IngredientCategory.PROTEIN]: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-900',
  [IngredientCategory.CARBOHYDRATE]: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900',
  [IngredientCategory.VEGETABLE]: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-900',
  [IngredientCategory.FRUIT]: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-900',
  [IngredientCategory.DAIRY]: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900',
  [IngredientCategory.FAT]: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900',
  [IngredientCategory.LEGUME]: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  [IngredientCategory.GRAIN]: 'bg-stone-50 text-stone-600 dark:bg-stone-900/20 dark:text-stone-400 border-stone-100 dark:border-stone-900',
  [IngredientCategory.NUT_SEED]: 'bg-lime-50 text-lime-600 dark:bg-lime-900/20 dark:text-lime-400 border-lime-100 dark:border-lime-900',
  [IngredientCategory.CONDIMENT]: 'bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 border-slate-100 dark:border-slate-900',
};

export default function ShoppingListPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
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

    let body = `NutriFlow - ${t('shop.weekly_title')}\n${new Date(shoppingList.weekStart).toLocaleDateString()}\n\n`;
    
    // Standard Items
    Object.entries(groupedItems).forEach(([category, items]) => {
      body += `\n${t(`cat.${category}`)}:\n`;
      items.forEach(item => {
        body += `${item.isChecked ? '[x]' : '[ ]'} ${item.ingredientName} ${item.totalGrams ? `(${formatGrams(item.totalGrams)})` : ''}\n`;
      });
    });
    
    // Custom Items
    const custom = shoppingList.items.filter(i => i.isCustom);
    if(custom.length > 0) {
        body += `\n${t('shop.custom_section')}:\n`;
        custom.forEach(item => {
             body += `${item.isChecked ? '[x]' : '[ ]'} ${item.ingredientName}\n`;
        });
    }

    const recipient = '';
    window.open(`mailto:${recipient}?subject=${encodeURIComponent(t('shop.title'))}&body=${encodeURIComponent(body)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white dark:bg-surface-800 p-8 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700">
          <ShoppingCart className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-surface-900 dark:text-white mb-2">
            {t('common.error')}
          </h2>
          <p className="text-surface-500 mb-6">{t('shop.load_error')}</p>
          <Link href="/dashboard" className="btn-primary w-full justify-center">
            {t('shop.back')}
          </Link>
        </div>
      </div>
    );
  }

  // Group items by category
  const groupedItems = (shoppingList.items || []).reduce((acc, item) => {
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
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20 print:bg-white pt-16">
      {/* Header */}
      <header className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 sticky top-16 z-20 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-600 dark:text-surface-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-heading font-bold text-lg md:text-xl text-surface-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
                {t('shop.title')}
              </h1>
            </div>
            
            <div className="flex gap-2">
               <button
                onClick={handleShareEmail}
                className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title={t('shop.share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title={t('shop.print')}
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Card */}
        <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-sm border border-surface-100 dark:border-surface-700 mb-8 print:shadow-none print:border-none print:mb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-surface-900 dark:text-white mb-2">
               {t('shop.weekly_title')}
              </h2>
              <p className="text-surface-500 dark:text-surface-400">
                {t('shop.progress').replace('{{checked}}', checkedCount.toString()).replace('{{total}}', totalItems.toString())}
              </p>
            </div>
            <div className="hidden md:block text-right">
                <span className="text-4xl font-bold text-primary-500">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="relative h-4 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden print:hidden">
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => {
              const Icon = CATEGORY_ICONS[category as IngredientCategory] || Info;
              const colorClass = CATEGORY_COLORS[category as IngredientCategory] || 'bg-surface-50 border-surface-100';
              
              return (
                <div key={category} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border-none print:break-inside-avoid">
                  <div className={`px-5 py-4 border-b border-surface-100 dark:border-surface-700 flex items-center gap-3 ${colorClass} bg-opacity-50 dark:bg-opacity-10`}>
                    <div className="p-2 bg-white dark:bg-surface-800 rounded-lg shadow-sm">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-lg">
                        {t(`cat.${category}`)}
                    </h3>
                    <span className="ml-auto text-xs font-medium px-2 py-1 bg-white/50 dark:bg-black/20 rounded-full">
                        {items.filter(i => i.isChecked).length} / {items.length}
                    </span>
                  </div>
                  
                  <div className="p-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id, item.isChecked)}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
                            item.isChecked 
                            ? 'bg-surface-50 dark:bg-surface-900/50 opacity-60' 
                            : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'
                        }`}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                             item.isChecked
                             ? 'bg-primary-500 border-primary-500'
                             : 'border-surface-300 dark:border-surface-600 group-hover:border-primary-400'
                        }`}>
                           {item.isChecked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate transition-colors ${
                                item.isChecked ? 'text-surface-500 line-through' : 'text-surface-900 dark:text-white'
                            }`}>
                                {item.ingredientName}
                            </p>
                            {item.totalGrams && (
                                <p className="text-xs text-surface-500 mt-0.5">
                                    {formatGrams(item.totalGrams)}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                            }}
                            className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all print:hidden"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
          })}
        </div>

        {/* Custom Items */}
        <div className="mt-8 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 print:shadow-none print:border-none">
           <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-accent-600 dark:text-accent-400">
                    <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-surface-900 dark:text-white">
                    {t('shop.custom_section')}
                </h3>
           </div>

           <form onSubmit={handleAddCustomItem} className="flex gap-3 mb-6 print:hidden">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={t('shop.add_custom')}
              className="flex-1 input bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 focus:ring-accent-500 focus:border-accent-500"
            />
            <button 
                type="submit" 
                className="btn-primary bg-accent-500 hover:bg-accent-600 text-white disabled:opacity-50 px-4 rounded-xl"
                disabled={!newItemName.trim()}
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {customItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-surface-100 dark:border-surface-700 rounded-xl print:hidden">
                 <p className="text-surface-400 dark:text-surface-500 italic">
                     {t('shop.no_custom')}
                 </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {customItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id, item.isChecked)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group border border-surface-100 dark:border-surface-700 ${
                            item.isChecked 
                            ? 'bg-surface-50 dark:bg-surface-900/50 opacity-60' 
                            : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                             item.isChecked
                             ? 'bg-accent-500 border-accent-500'
                             : 'border-surface-300 dark:border-surface-600 group-hover:border-accent-400'
                        }`}>
                           {item.isChecked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        
                        <p className={`flex-1 font-medium truncate transition-colors ${
                            item.isChecked ? 'text-surface-500 line-through' : 'text-surface-900 dark:text-white'
                        }`}>
                            {item.ingredientName}
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                            }}
                            className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all print:hidden"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                 ))}
             </div>
          )}
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 text-center text-sm text-surface-500 dark:text-surface-400 border-t border-surface-200 pt-4">
          <p>{t('shop.generated_by')} · {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  );
}
