import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Bike,
  MapPin,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Store } from '../../types/catalog';
import { formatCurrency } from '../../lib/whatsapp';

interface StoreHeaderProps {
  store: Store;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
  return (
    <header className="relative bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Bar discreta com marca ZapCatálogo e atalho para o Painel do Lojista */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-orange-500 text-white font-bold text-[11px]">
              Z
            </span>
            <span>
              <strong className="text-white">ZapCatálogo</strong> • Cardápio Digital Interativo
            </span>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Painel do Lojista</span>
          </Link>
        </div>
      </div>

      {/* Banner de Capa */}
      <div className="relative h-40 sm:h-52 md:h-60 w-full overflow-hidden bg-slate-800">
        <img
          src={store.banner_url}
          alt={`Capa de ${store.name}`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent" />

        {/* Status Dinâmico Flutuante */}
        <div className="absolute top-3.5 right-4 z-10">
          {store.is_open ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Aberto Agora
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-600 text-white shadow-lg shadow-rose-950/30">
              <span className="w-2 h-2 rounded-full bg-white/80" />
              Fechado no Momento
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo Principal do Cabeçalho */}
      <div className="max-w-5xl mx-auto px-4 pb-5">
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 mb-3">
          {/* Logotipo da Loja */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white shrink-0">
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Nome e Descrição */}
          <div className="flex-1 pt-1 sm:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {store.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60">
                <Sparkles className="w-3 h-3" /> Pedido Direto no WhatsApp
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {store.subtitle}
            </p>
          </div>
        </div>

        {/* Pílulas de Informações Rápidas (Tempo, Taxa, Pedido Mínimo, Endereço) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Tempo médio
              </span>
              <strong className="font-semibold text-slate-800">{store.estimated_time}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
            <Bike className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Taxa de Entrega
              </span>
              <strong className="font-semibold text-slate-800">
                {store.delivery_fee === 0 ? 'Grátis' : formatCurrency(store.delivery_fee)}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
            <ShoppingBag className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Pedido Mínimo
              </span>
              <strong className="font-semibold text-slate-800">
                {formatCurrency(store.min_order_value)}
              </strong>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 sm:ml-auto">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate text-xs text-slate-600" title={store.address}>
              {store.address}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
