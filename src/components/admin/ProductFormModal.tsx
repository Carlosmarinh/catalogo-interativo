import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';
import { Category, Product, ProductAddon } from '../../types/catalog';
import { useCatalog } from '../../context/CatalogContext';
import { getProductAvailableAddons } from '../../data/mockCatalog';
import { formatCurrency } from '../../lib/whatsapp';

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
  const { uploadProductImage } = useCatalog();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
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
      setAddons(getProductAvailableAddons(editingProduct));
    } else {
      const defaultCatId = categories[0]?.id || '';
      setName('');
      setCategoryId(defaultCatId);
      setDescription('');
      setPrice('');
      setPromoPrice('');
      setImageUrl(PRESET_IMAGES[0].url);
      setIsAvailable(true);
      setIsFeatured(false);
      setAddons(
        getProductAvailableAddons({
          id: 'temp',
          store_id: 'temp',
          category_id: defaultCatId,
          name: '',
          description: '',
          price: 0,
          promo_price: null,
          image_url: '',
          is_available: true,
          is_featured: false,
        })
      );
    }
    setNewAddonName('');
    setNewAddonPrice('');
    setError(null);
  }, [editingProduct, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    const res = await uploadProductImage(file);
    setUploadingImage(false);

    if (res.error) {
      setError(res.error);
    } else if (res.url) {
      setImageUrl(res.url);
    }
  };

  const handleAddAddon = () => {
    if (!newAddonName.trim()) return;
    const parsedAddonPrice = Number(newAddonPrice.replace(',', '.'));
    if (isNaN(parsedAddonPrice) || parsedAddonPrice < 0) return;

    setAddons((prev) => [
      ...prev,
      {
        id: `addon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: newAddonName.trim(),
        price: parsedAddonPrice,
      },
    ]);
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const handleRemoveAddon = (addonId: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
  };

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
      addons,
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
      <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
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
              rows={2}
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

          {/* Upload Direto de Imagem para o Supabase Storage + URL */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800">
                Foto do Produto (Upload Supabase Storage ou Link)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingImage ? 'Enviando foto...' : 'Enviar Foto do Dispositivo'}
                </span>
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
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
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... ou envie um arquivo acima"
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gerenciador de Adicionais Pagos do Produto */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">
                Adicionais Pagos deste Produto ({addons.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                O cliente pode marcar estes adicionais no modal antes de adicionar ao carrinho
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAddonName}
                onChange={(e) => setNewAddonName(e.target.value)}
                placeholder="Ex: Bacon crocante extra"
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
              />
              <input
                type="number"
                step="0.50"
                min="0"
                value={newAddonPrice}
                onChange={(e) => setNewAddonPrice(e.target.value)}
                placeholder="R$ 4.00"
                className="w-24 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddAddon}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Incluir</span>
              </button>
            </div>

            {addons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {addons.map((addon) => (
                  <span
                    key={addon.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <span>
                      {addon.name} (+{formatCurrency(addon.price)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(addon.id)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Toggles de Disponibilidade e Destaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              disabled={saving || uploadingImage}
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
