import React from 'react';
import {
  Search,
  X,
  Flame,
  Utensils,
  Beef,
  Pizza,
  CupSoda,
  IceCream,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { Category } from '../../types/catalog';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  featuredCount: number;
}

export function renderCategoryIcon(iconName: string, className = 'w-4 h-4') {
  switch (iconName) {
    case 'beef':
      return <Beef className={className} />;
    case 'pizza':
      return <Pizza className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'cup-soda':
      return <CupSoda className={className} />;
    case 'ice-cream':
      return <IceCream className={className} />;
    default:
      return <Utensils className={className} />;
  }
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  featuredCount,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
        {/* Barra de Busca Instantânea */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar lanches, pizzas, bebidas ou ingredientes..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Carrossel / Abas de Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Cardápio Completo</span>
          </button>

          {featuredCount > 0 && (
            <button
              type="button"
              onClick={() => onSelectCategory('featured')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'featured'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/70 hover:bg-amber-100/70'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Destaques & Promoções</span>
            </button>
          )}

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
