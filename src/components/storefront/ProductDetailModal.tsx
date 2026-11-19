import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Check,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCatalog } from '../../context/CatalogContext';
import { ProductAddon } from '../../types/catalog';
import {
  formatCurrency,
  getAddonsTotal,
  getEffectivePrice,
} from '../../lib/whatsapp';
import { getProductAvailableAddons } from '../../data/mockCatalog';

const QUICK_NOTE_CHIPS = [
  'Sem cebola',
  'Carne bem passada',
  'Carne ao ponto',
  'Molho à parte',
  'Sem picles',
];

export const ProductDetailModal: React.FC = () => {
  const { customizingProduct, closeProductModal, addCustomizedItem } = useCart();
  const { store } = useCatalog();

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customizingProduct) {
      setQuantity(1);
      setSelectedAddons([]);
      setNotes('');
    }
  }, [customizingProduct]);

  if (!customizingProduct) return null;

  const availableAddons = getProductAvailableAddons(customizingProduct);
  const basePrice = getEffectivePrice(customizingProduct);
  const addonsTotal = getAddonsTotal(selectedAddons);
  const finalUnitPrice = basePrice + addonsTotal;
  const finalTotalPrice = finalUnitPrice * quantity;

  const hasPromo =
    typeof customizingProduct.promo_price === 'number' &&
    customizingProduct.promo_price > 0 &&
    customizingProduct.promo_price < customizingProduct.price;

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAppendQuickNote = (chip: string) => {
    if (notes.toLowerCase().includes(chip.toLowerCase())) return;
    setNotes((prev) => (prev.trim() ? `${prev.trim()}, ${chip}` : chip));
  };

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.is_open || !customizingProduct.is_available) return;
    addCustomizedItem(customizingProduct, quantity, selectedAddons, notes);
    closeProductModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4"
      onClick={closeProductModal}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Foto de Capa do Produto */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100 shrink-0">
          <img
            src={customizingProduct.image_url}
            alt={customizingProduct.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30" />

          <button
            type="button"
            onClick={closeProductModal}
            aria-label="Fechar detalhes"
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {hasPromo && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-500 text-white">
                    Oferta Especial
                  </span>
                )}
                {customizingProduct.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber-500 text-white">
                    <Sparkles className="w-3 h-3" /> Mais Pedido
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-xs">
                {customizingProduct.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Conteúdo Rolável: Descrição, Adicionais Pagos e Observações */}
        <form onSubmit={handleConfirmAdd} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Descrição & Preço Base */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {customizingProduct.description}
            </p>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-extrabold text-orange-600">
                {formatCurrency(basePrice)}
              </span>
              {hasPromo && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatCurrency(customizingProduct.price)}
                </span>
              )}
              <span className="text-xs text-slate-400">• valor unitário base</span>
            </div>
          </div>

          {/* Adicionais Pagos (Aumento de Ticket Médio) */}
          {availableAddons.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Turbine seu Pedido (Adicionais)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Opcional • Escolha quantos adicionais desejar
                  </p>
                </div>
                {selectedAddons.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-700">
                    +{formatCurrency(addonsTotal)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {availableAddons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 ring-1 ring-orange-500/30'
                          : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {addon.name}
                        </span>
                      </div>

                      <span className="text-xs sm:text-sm font-extrabold text-orange-600 shrink-0">
                        + {formatCurrency(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Campo de Observações do Item */}
          <section className="space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
              <span>Observações do Item</span>
            </label>

            {/* Sugestões Rápidas em 1 Clique */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAppendQuickNote(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sem cebola, ponto da carne bem passado, borda recheada..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none resize-none"
            />
          </section>

          {/* Rodapé Fixo com Seletor de Quantidade e Botão de Confirmar */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-7 text-center text-sm font-extrabold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!store.is_open || !customizingProduct.is_available}
              className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-lg transition-all cursor-pointer ${
                store.is_open && customizingProduct.is_available
                  ? 'bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white shadow-orange-500/25'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar</span>
              </span>
              <span>{formatCurrency(finalTotalPrice)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
