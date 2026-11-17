import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { renderCategoryIcon } from '../storefront/CategoryTabs';

const ICON_OPTIONS = [
  { value: 'beef', label: 'Hambúrguer / Lanche' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'flame', label: 'Porções / Grill' },
  { value: 'cup-soda', label: 'Bebidas' },
  { value: 'ice-cream', label: 'Sobremesas / Doces' },
  { value: 'utensils', label: 'Geral / Pratos' },
];

export const CategoryManagerPanel: React.FC = () => {
  const { categories, products, saveCategory, deleteCategory } = useCatalog();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('beef');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;

    const res = await saveCategory({
      name: name.trim(),
      slug: name.trim().toLowerCase(),
      icon,
      sort_order: categories.length + 1,
    });

    if (res.error) {
      setError(res.error);
    } else {
      setName('');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const res = await deleteCategory(id);
    if (res.error) setError(res.error);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs"
      >
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          Adicionar Nova Categoria de Cardápio
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome da Categoria *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Combos Família"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ícone da Aba
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-orange-500 outline-none"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Categoria</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Categorias Ativas ({categories.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <div
                key={cat.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                    <span className="text-xs text-slate-400">
                      {count} {count === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
