import React from 'react';
import { Plus, Minus, Sparkles, Ban } from 'lucide-react';
import { Product } from '../../types/catalog';
import { formatCurrency, getEffectivePrice } from '../../lib/whatsapp';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  storeOpen: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeOpen }) => {
  const { openProductModal, decrementItem, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id);
  const effectivePrice = getEffectivePrice(product);
  const hasPromo =
    typeof product.promo_price === 'number' &&
    product.promo_price > 0 &&
    product.promo_price < product.price;

  const isDisabled = !product.is_available || !storeOpen;

  const handleCardClick = () => {
    if (!product.is_available) return;
    openProductModal(product);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-row sm:flex-col justify-between p-3 sm:p-0 ${
        !product.is_available
          ? 'border-slate-200/70 opacity-65 grayscale-[35%]'
          : quantityInCart > 0
          ? 'border-orange-500 ring-1 ring-orange-500/30 shadow-md shadow-orange-500/5 cursor-pointer'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Imagem no Desktop (Topo) e no Mobile (Lateral Direita) */}
      <div className="relative order-2 sm:order-1 w-28 h-28 sm:w-full sm:h-44 rounded-xl sm:rounded-none overflow-hidden bg-slate-100 shrink-0 ml-3 sm:ml-0">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges de Promoção ou Destaque */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {hasPromo && product.is_available && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-xs">
              Oferta
            </span>
          )}
          {product.is_featured && product.is_available && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-2.5 h-2.5" /> Destaque
            </span>
          )}
        </div>

        {!product.is_available && (
          <div className="absolute inset-0 bg-slate-900/65 flex items-center justify-center p-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[11px] font-bold uppercase tracking-wide">
              <Ban className="w-3 h-3 text-rose-600" /> Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="order-1 sm:order-2 flex-1 flex flex-col justify-between sm:p-4 min-w-0">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rodapé de Preço e Botão Adicionar */}
        <div
          className="mt-3 pt-2.5 sm:border-t sm:border-slate-100 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            {hasPromo && (
              <span className="block text-[11px] text-slate-400 line-through font-medium">
                {formatCurrency(product.price)}
              </span>
            )}
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              {formatCurrency(effectivePrice)}
            </span>
          </div>

          {!product.is_available ? (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
              Indisponível
            </span>
          ) : quantityInCart > 0 ? (
            <div className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => decrementItem(product.id)}
                aria-label="Diminuir quantidade"
                className="w-7 h-7 rounded-lg bg-white text-orange-600 hover:bg-orange-100 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-extrabold text-orange-700">
                {quantityInCart}
              </span>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => openProductModal(product)}
                aria-label="Personalizar e adicionar mais"
                className="w-7 h-7 rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => openProductModal(product)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                storeOpen
                  ? 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-xs shadow-orange-500/25'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
