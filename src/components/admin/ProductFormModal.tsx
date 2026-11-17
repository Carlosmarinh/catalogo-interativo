import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Category, Product } from '../../types/catalog';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<Product, 'id' | 'store_id'> & { id?: string }
  ) => Promise<{ error?: string }>;
  categories: Category[];
  editingProduct: Product | null;
}

const PRESET_IMAGES = [
  {
    label: 'Burger Artesanal',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Pizza Napolitana',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Porção Batata',
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Bebida Gelada',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Sobremesa Doces',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingProduct,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategoryId(editingProduct.category_id);
      setDescription(editingProduct.description);
      setPrice(String(editingProduct.price));
      setPromoPrice(editingProduct.promo_price ? String(editingProduct.promo_price) : '');
      setImageUrl(editingProduct.image_url);
      setIsAvailable(editingProduct.is_available);
      setIsFeatured(editingProduct.is_featured);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setPrice('');
      setPromoPrice('');
      setImageUrl(PRESET_IMAGES[0].url);
      setIsAvailable(true);
      setIsFeatured(false);
    }
    setError(null);
  }, [editingProduct, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(price.replace(',', '.'));
    const parsedPromo = promoPrice.trim()
      ? Number(promoPrice.replace(',', '.'))
      : null;

    if (!name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }
    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Informe um preço válido maior que zero.');
      return;
    }

    setSaving(true);
    const res = await onSave({
      id: editingProduct?.id,
      name,
      category_id: categoryId,
      description,
      price: parsedPrice,
      promo_price: parsedPromo,
      image_url: imageUrl || PRESET_IMAGES[0].url,
      is_available: isAvailable,
      is_featured: isFeatured,
    });
    setSaving(false);

    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold">
            {editingProduct ? 'Editar Produto' : 'Novo Produto no Cardápio'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: X-Burguer Duplo Costela"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:border-orange-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição Curta (Ingredientes / Detalhes)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os ingredientes de forma apetitosa..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preço Normal (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="38.90"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preço Promocional (Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value)}
                placeholder="34.90"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Imagem com sugestões rápidas */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              URL da Foto do Produto
            </label>
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Toggles de Disponibilidade e Destaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  Disponível para Venda
                </span>
                <span className="text-[11px] text-slate-500">
                  Desative caso falte ingrediente
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl border border-amber-200/80 bg-amber-50/40 cursor-pointer">
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Produto em Destaque
                </span>
                <span className="text-[11px] text-amber-700">
                  Aparece no topo da vitrine
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
