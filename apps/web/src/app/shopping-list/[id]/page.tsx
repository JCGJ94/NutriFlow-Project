'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Info,
  Download,
  Copy,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { IngredientCategory } from '@nutriflow/shared';
import { formatGrams } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { usePlans } from '@/context/PlansContext';
import { useToast } from '@/context/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ShoppingListItem {
  id: string;
  ingredientId: string | null;
  ingredientName: string;
  category: IngredientCategory | string;
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

// Elegant Color Palette & Icons
const CATEGORY_STYLES: Record<string, { icon: any, color: string, bg: string, border: string }> = {
  [IngredientCategory.VEGETABLE]: { icon: Carrot, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-800/30' },
  [IngredientCategory.FRUIT]: { icon: Apple, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-100 dark:border-orange-800/30' },
  [IngredientCategory.PROTEIN]: { icon: Beef, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-100 dark:border-rose-800/30' },
  [IngredientCategory.DAIRY]: { icon: Milk, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/10', border: 'border-sky-100 dark:border-sky-800/30' },
  [IngredientCategory.GRAIN]: { icon: Wheat, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800/30' },
  [IngredientCategory.LEGUME]: { icon: Bean, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/10', border: 'border-teal-100 dark:border-teal-800/30' },
  [IngredientCategory.FAT]: { icon: Droplet, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-100 dark:border-yellow-800/30' },
  [IngredientCategory.NUT_SEED]: { icon: Leaf, color: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-900/10', border: 'border-lime-100 dark:border-lime-800/30' },
  [IngredientCategory.CONDIMENT]: { icon: Info, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/10', border: 'border-slate-100 dark:border-slate-800/30' },
  [IngredientCategory.CARBOHYDRATE]: { icon: Wheat, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800/30' },
  ['default']: { icon: Info, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/10', border: 'border-primary-100 dark:border-primary-800/30' },
};

// Logical Display Order
const CATEGORY_ORDER = [
  IngredientCategory.VEGETABLE,
  IngredientCategory.FRUIT,
  IngredientCategory.PROTEIN,
  IngredientCategory.DAIRY,
  IngredientCategory.GRAIN,
  IngredientCategory.CARBOHYDRATE,
  IngredientCategory.LEGUME,
  IngredientCategory.NUT_SEED,
  IngredientCategory.FAT,
  IngredientCategory.CONDIMENT,
];

// Helper to Clean Ingredient Names
const cleanIngredientName = (name: string): string => {
    return name
        .replace(/\s+(cocido|a la plancha|frito|hervido|asado|al horno|vapor|crudo|tostado|en conserva|natural|fresco|semidesnatada|entera|desnatada)\b/gi, '')
        .trim();
};

export default function ShoppingListPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { getShoppingList, updateShoppingListCache } = usePlans();
  const { showToast } = useToast();
  const planId = params.id as string;

  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  
  // PDF Preview State
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init = async () => {
        setIsLoading(true);
        const data = await getShoppingList(planId);
        if (data) setShoppingList(data);
        setIsLoading(false);
    };
    init();
  }, [planId, getShoppingList]);

  // Toggle Category Collapse
  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const toggleItem = async (itemId: string, currentChecked: boolean) => {
    if (!shoppingList) return;

    const updatedList = {
        ...shoppingList,
        items: shoppingList.items.map(item => 
            item.id === itemId ? { ...item, isChecked: !currentChecked } : item
        )
    };
    setShoppingList(updatedList);
    updateShoppingListCache(planId, updatedList);

    try {
      await fetch('/api/shopping-list/items/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isChecked: !currentChecked })
      });
    } catch (error) {
      console.error('Error toggling item:', error);
      // Revert on error
      const data = await getShoppingList(planId);
      if (data) setShoppingList(data);
    }
  };

  const handleDeleteClick = async (item: ShoppingListItem) => {
      if (item.isCustom) {
          // Custom items: Delete from DB
          await deleteCustomItem(item.id);
      } else {
          // Standard/Plan items: Just uncheck (Undo Check)
          // Only if checked (though UI only shows icon if checked)
          if (item.isChecked) {
              await toggleItem(item.id, true); // true -> false (uncheck)
          }
      }
  };

  const deleteCustomItem = async (itemId: string) => {
    if (!shoppingList) return;
    
    // Optimistic Delete
    const updatedList = {
        ...shoppingList,
        items: shoppingList.items.filter(item => item.id !== itemId)
    };
    setShoppingList(updatedList);
    updateShoppingListCache(planId, updatedList);

    try {
      await fetch(`/api/shopping-list/items/${itemId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast(t('common.error'), 'error');
      // Revert
      const data = await getShoppingList(planId);
      if (data) setShoppingList(data);
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !shoppingList) return;
    
    const name = newItemName.trim();
    setNewItemName('');

    try {
      const response = await fetch(`/api/shopping-list/${planId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customName: name })
      });

      if (response.ok) {
        // Correctly typed response now
        const newItem = await response.json(); 
        
        if (shoppingList) {
             const updatedList = {
                 ...shoppingList,
                 items: [...shoppingList.items, newItem]
             };
             setShoppingList(updatedList);
             updateShoppingListCache(planId, updatedList);
             showToast(t('shop.item_added'), 'success');
        }
      }
    } catch (error) {
      console.error('Error adding custom item:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const generatePDF = () => {
    if (!shoppingList) return null;
    const doc = new jsPDF();
    
    // Header with Logo Placeholder & Title
    doc.setFillColor(15, 23, 42); // slate-900 like
    doc.rect(0, 0, 210, 40, 'F');
    // Draw Fork Icon (Minimalist) - White on Dark Header
    // Handle: Rect
    doc.setDrawColor(255, 255, 255); 
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(25, 15, 4, 20, 1, 1, 'F');
    // Tines base
    doc.roundedRect(22, 10, 10, 6, 2, 2, 'F');
    // Tines
    doc.roundedRect(22, 6, 2, 6, 1, 1, 'F'); // Left
    doc.roundedRect(26, 6, 2, 6, 1, 1, 'F'); // Middle
    doc.roundedRect(30, 6, 2, 6, 1, 1, 'F'); // Right

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("NUTRIFLOW", 27, 42, { align: 'center' }); // Centered under logo

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(t('shop.title'), 160, 22, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Week: ${new Date(shoppingList.weekStart).toLocaleDateString()}`, 160, 30, { align: 'right' });
    
    let yPos = 50;

    // Ordered Data for PDF
    const grouped = (shoppingList.items || []).reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    const sortedForPDF = Object.entries(grouped).sort(([a], [b]) => {
        const idxA = CATEGORY_ORDER.indexOf(a as IngredientCategory);
        const idxB = CATEGORY_ORDER.indexOf(b as IngredientCategory);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });

    sortedForPDF.forEach(([cat, items]) => {
         // Category Header
         doc.setFontSize(12);
         doc.setTextColor(15, 23, 42);
         doc.setFont('helvetica', 'bold');
         doc.text(t(`cat.${cat.toUpperCase()}`) || cat, 14, yPos);
         yPos += 2;

         autoTable(doc, {
            startY: yPos,
            // head: [[t(`cat.${cat.toUpperCase()}`) || cat, 'Qty']],
            body: items.map(i => [cleanIngredientName(i.ingredientName), i.isChecked ? '(✔)' : '', i.totalGrams ? formatGrams(i.totalGrams) : '-']),
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1, textColor: 50 },
            columnStyles: { 
                0: { cellWidth: 100 },
                1: { cellWidth: 10 },
                2: { halign: 'right', cellWidth: 20 } 
            },
            margin: { left: 14, right: 14 }
         });
         // @ts-ignore
         yPos = doc.lastAutoTable.finalY + 10;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generated by NutriFlow', 105, 290, { align: 'center' });
    }

    return doc;
  };

  const handleDownloadPDF = () => {
    const doc = generatePDF();
    if (doc) {
        doc.save('NutriFlow-ShoppingList.pdf');
        showToast(t('shop.pdf_downloaded'), 'success');
    }
  };

  const handlePreviewPDF = () => {
    const doc = generatePDF();
    if (doc) {
        // @ts-ignore
        const blobUrl = doc.output('bloburl');
        setPdfPreviewUrl(blobUrl.toString());
        setIsPreviewOpen(true);
    }
  };

  const closePreview = () => {
      setIsPreviewOpen(false);
      if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
      }
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            const doc = generatePDF();
            if(doc) {
                 const blob = doc.output('blob');
                 const file = new File([blob], 'shopping-list.pdf', { type: 'application/pdf' });
                 if(navigator.canShare && navigator.canShare({ files: [file] })) {
                     await navigator.share({
                         title: t('shop.title'),
                         files: [file]
                     });
                 } else {
                     await navigator.share({
                         title: t('shop.title'),
                         url: window.location.href
                     });
                 }
                 showToast(t('shop.shared_success'), 'success');
            }
        } catch (e) { 
            console.error(e);
            // Fallback Copy if share fails/cancelled
            copyToClipboard();
        }
    } else {
        copyToClipboard();
    }
  };

  const copyToClipboard = () => {
      let text = `${t('shop.title')}\n`;
      shoppingList?.items.forEach(i => text += `- ${cleanIngredientName(i.ingredientName)}\n`);
      navigator.clipboard.writeText(text);
      showToast(t('shop.copied_clipboard'), 'info');
  };

  // Grouping Logic
  const groupedItems = useMemo(() => {
    if (!shoppingList) return {};
    return shoppingList.items.reduce((acc, item) => {
        if (item.isCustom) return acc;
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItem[]>);
  }, [shoppingList]);

  // Sort Categories for Display
  const sortedCategories = useMemo(() => {
      return Object.keys(groupedItems).sort((a, b) => {
          const idxA = CATEGORY_ORDER.indexOf(a as IngredientCategory);
          const idxB = CATEGORY_ORDER.indexOf(b as IngredientCategory);
          // Put unknowns at the end
          return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
  }, [groupedItems]);

  const customItems = shoppingList?.items.filter(i => i.isCustom) || [];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950"><Loader2 className="w-8 h-8 animate-spin text-primary-500"/></div>;
  if (!shoppingList) return null;

  const totalItems = shoppingList.items.length;
  const checkedItems = shoppingList.items.filter(i => i.isChecked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-20 pt-24 transition-colors duration-300">
      
      {/* Dynamic Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                  <div className="flex items-center gap-3 mb-2">
                       <button onClick={() => router.back()} className="p-2 -ml-2 text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">
                           <ArrowLeft className="w-6 h-6" />
                       </button>
                       <h1 className="text-3xl font-heading font-bold text-surface-900 dark:text-white">
                           {t('shop.title')}
                       </h1>
                  </div>
                  <p className="text-surface-500 dark:text-surface-400 font-medium">
                      {t('shop.progress').replace('{{checked}}', checkedItems.toString()).replace('{{total}}', totalItems.toString())}
                  </p>
              </div>

              <div className="flex gap-2">
                   <button 
                      onClick={handleShare}
                      className="btn-secondary flex items-center gap-2 bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-all"
                   >
                       <Share2 className="w-4 h-4" />
                       <span>{t('shop.share')}</span>
                   </button>
                   <button 
                      onClick={handlePreviewPDF}
                      className="btn-primary flex items-center gap-2 bg-surface-900 text-white dark:bg-white dark:text-surface-900 hover:scale-[1.02] shadow-lg shadow-surface-900/10 transition-transform"
                   >
                       <Printer className="w-4 h-4" />
                       <span>PDF</span>
                   </button>
              </div>
          </div>

          {/* Elegant Progress Bar */}
          <div className="h-2 w-full bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
              <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  style={{ width: `${progress}%` }}
              />
          </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Custom Item Input (Capsule Style) */}
          <form onSubmit={handleAddCustomItem} className="relative z-10 group max-w-xl mx-auto">
              <div className="relative flex items-center bg-white dark:bg-surface-800 rounded-full shadow-lg shadow-surface-900/5 dark:shadow-black/20 hover:shadow-xl transition-all duration-300 border border-surface-100 dark:border-surface-700/50">
                  <input 
                      type="text" 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={t('shop.add_custom')}
                      className="w-full bg-transparent border-none text-lg py-3.5 pl-6 pr-14 placeholder:text-surface-400 text-surface-900 dark:text-white focus:ring-0 rounded-full bg-transparent"
                  />
                  <div className="absolute right-1.5 top-1.5 bottom-1.5">
                      <button 
                          type="submit"
                          disabled={!newItemName.trim()}
                          className={`h-full aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${newItemName.trim() 
                              ? 'bg-primary-500 text-white shadow-md hover:bg-primary-600 hover:scale-105 rotate-0 opacity-100' 
                              : 'bg-surface-100 dark:bg-surface-700 text-surface-300 dark:text-surface-500 -rotate-90 opacity-0 pointer-events-none scale-75'
                          }`}
                      >
                          <Plus className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </form>

          {/* Masonry Grid Layout */}
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
              
              {/* Render Categories */}
              {sortedCategories.map(cat => {
                  const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['default'];
                  const Icon = style.icon;
                  const items = groupedItems[cat];
                  const isCollapsed = collapsedCategories[cat];
                  const completed = items.every(i => i.isChecked);

                  return (
                      <div key={cat} className={`break-inside-avoid bg-white dark:bg-surface-900 rounded-3xl border ${style.border} shadow-sm transition-all duration-300 ${completed ? 'opacity-80 grayscale-[0.3]' : 'hover:shadow-md'}`}>
                          
                          {/* Header */}
                          <div 
                              onClick={() => toggleCategory(cat)}
                              className={`cursor-pointer px-5 py-4 flex items-center justify-between border-b ${isCollapsed ? 'border-transparent' : style.border} transition-colors bg-gradient-to-br from-transparent to-surface-50/50 dark:to-white/5 rounded-t-3xl`}
                          >
                              <div className="flex items-center gap-3">
                                  <div className={`p-2.5 rounded-xl ${style.bg} ${style.color}`}>
                                      <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <h3 className={`font-bold text-lg leading-none mb-1 ${style.color.split(' ')[0]}`}>
                                          {t(`cat.${cat.toUpperCase()}`) || cat}
                                      </h3>
                                      <p className="text-xs text-surface-400 font-medium">
                                          {items.length} {t('common.items')}
                                      </p>
                                  </div>
                              </div>
                              <ChevronDown className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                          </div>

                          {/* Items */}
                          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'max-h-[1000px]'}`}>
                              <div className="p-2 space-y-1">
                                  {items.map(item => (
                                      <div 
                                          key={item.id}
                                          onClick={() => toggleItem(item.id, item.isChecked)}
                                          className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${item.isChecked ? 'bg-surface-50 dark:bg-surface-800/50' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50 check-mode'}`}
                                      >
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${item.isChecked ? 'bg-surface-400 border-surface-400 dark:bg-surface-600 dark:border-surface-600' : 'border-surface-300 dark:border-surface-600 group-hover:border-primary-400'}`}>
                                              <Check className={`w-3 h-3 text-white transition-opacity ${item.isChecked ? 'opacity-100' : 'opacity-0'}`} />
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                              <p className={`font-medium truncate transition-all ${item.isChecked ? 'text-surface-400 line-through' : 'text-surface-700 dark:text-surface-200'}`}>
                                                  {cleanIngredientName(item.ingredientName)}
                                              </p>
                                              {item.totalGrams && !item.isChecked && (
                                                  <p className="text-xs text-surface-400 font-medium">
                                                      {formatGrams(item.totalGrams)}
                                                  </p>
                                              )}
                                          </div>

                                          {/* Trash Icon Logic: Standard Items -> ONLY if Checked -> Uncheck Action */}
                                          {item.isChecked && (
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                                                  className="p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-100"
                                                  title={t('common.delete')} // Actually "Uncheck" effectively
                                              >
                                                  <Trash2 className="w-4 h-4" />
                                              </button>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  );
              })}

              {/* Custom Items Section */}
              {customItems.length > 0 && (
                  <div className="break-inside-avoid bg-white dark:bg-surface-900 rounded-3xl border border-dashed border-surface-300 dark:border-surface-700 shadow-sm">
                      <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center gap-3">
                          <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-xl text-surface-500">
                             <Plus className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-lg text-surface-900 dark:text-white">
                              {t('shop.custom_section')}
                          </h3>
                      </div>
                      <div className="p-2 space-y-1">
                          {customItems.map(item => (
                              <div 
                                  key={item.id}
                                  onClick={() => toggleItem(item.id, item.isChecked)}
                                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${item.isChecked ? 'bg-surface-50 dark:bg-surface-800/50' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}
                              >
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${item.isChecked ? 'bg-surface-400 border-surface-400' : 'border-surface-300 group-hover:border-primary-400'}`}>
                                      <Check className={`w-3 h-3 text-white transition-opacity ${item.isChecked ? 'opacity-100' : 'opacity-0'}`} />
                                  </div>
                                  <p className={`flex-1 font-medium truncate transition-all ${item.isChecked ? 'text-surface-400 line-through' : 'text-surface-900 dark:text-white'}`}>
                                      {item.ingredientName}
                                  </p>
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                                      className="p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* Empty State */}
          {totalItems === 0 && (
              <div className="text-center py-20 animate-fade-in">
                  <div className="w-24 h-24 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <LayoutGrid className="w-10 h-10 text-surface-400" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{t('shop.empty')}</h2>
                  <p className="text-surface-500 max-w-sm mx-auto">{t('shop.no_custom')}</p>
              </div>
          )}

      </main>

      {/* PDF Preview Modal */}
      {isPreviewOpen && pdfPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                          <Printer className="w-5 h-5 text-primary-500" />
                          {t('shop.pdf_preview')}
                      </h3>
                      <button 
                          onClick={closePreview}
                          className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      >
                          <span className="sr-only">Close</span>
                          <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>

                  {/* PDF Viewer (Iframe) */}
                  <div className="flex-1 bg-surface-100 dark:bg-surface-950 p-0 overflow-hidden relative group">
                      <iframe 
                          src={pdfPreviewUrl} 
                          className="w-full h-full border-0" 
                          title="PDF Preview"
                      />
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 flex justify-end gap-3">
                      <button 
                          onClick={closePreview}
                          className="px-5 py-2.5 rounded-full text-surface-600 font-medium hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors"
                      >
                          {t('common.close') || 'Cerrar'}
                      </button>
                      <button 
                          onClick={() => { handleDownloadPDF(); closePreview(); }}
                          className="px-6 py-2.5 rounded-full bg-surface-900 text-white dark:bg-white dark:text-surface-900 font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
                      >
                          <Download className="w-4 h-4" />
                          {t('common.download') || 'Descargar'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
