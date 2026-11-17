import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../lib/whatsapp';

export const FloatingCartBar: React.FC = () => {
  const { totalItems, subtotal, setIsCheckoutOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl p-3.5 sm:px-5 sm:py-4 shadow-2xl shadow-slate-950/40 border border-slate-700/80 flex items-center justify-between transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500 text-white font-extrabold text-sm shadow-inner">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-white text-slate-900 text-xs font-extrabold flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Sua Sacola ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </span>
              <strong className="text-base sm:text-lg font-extrabold text-white">
                {formatCurrency(subtotal)}
              </strong>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors">
            <span>Fechar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
