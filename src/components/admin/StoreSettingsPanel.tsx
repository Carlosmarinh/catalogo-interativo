import React, { useState } from 'react';
import {
  Save,
  Phone,
  Bike,
  Clock,
  MapPin,
  Store as StoreIcon,
  Power,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { formatPhoneDisplay, sanitizeWhatsAppNumber } from '../../lib/whatsapp';

export const StoreSettingsPanel: React.FC = () => {
  const { store, updateStoreSettings, resetDemoData } = useCatalog();

  const [name, setName] = useState(store.name);
  const [subtitle, setSubtitle] = useState(store.subtitle);
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsapp_number);
  const [deliveryFee, setDeliveryFee] = useState(String(store.delivery_fee));
  const [minOrderValue, setMinOrderValue] = useState(String(store.min_order_value));
  const [estimatedTime, setEstimatedTime] = useState(store.estimated_time);
  const [address, setAddress] = useState(store.address);
  const [logoUrl, setLogoUrl] = useState(store.logo_url);
  const [bannerUrl, setBannerUrl] = useState(store.banner_url);
  const [isOpen, setIsOpen] = useState(store.is_open);

  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedToast(false);

    await updateStoreSettings({
      name: name.trim() || store.name,
      subtitle: subtitle.trim(),
      whatsapp_number: sanitizeWhatsAppNumber(whatsappNumber),
      delivery_fee: Math.max(0, Number(deliveryFee.replace(',', '.')) || 0),
      min_order_value: Math.max(0, Number(minOrderValue.replace(',', '.')) || 0),
      estimated_time: estimatedTime.trim() || '35-50 min',
      address: address.trim(),
      logo_url: logoUrl.trim() || store.logo_url,
      banner_url: bannerUrl.trim() || store.banner_url,
      is_open: isOpen,
    });

    setSaving(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Card de Status Rápido (Aberto / Fechado) */}
      <div
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isOpen
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-rose-50/70 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isOpen ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Status de Funcionamento em Tempo Real
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              {isOpen
                ? 'Estabelecimento ABERTO (Recebendo pedidos)'
                : 'Estabelecimento FECHADO (Pedidos pausados)'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
            isOpen
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isOpen ? 'Fechar Loja Agora' : 'Abrir Loja Agora'}
        </button>
      </div>

      {/* WhatsApp & Taxas de Entrega */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          WhatsApp de Recebimento & Entrega
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp de Destino *
            </label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="5511999999999"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
            <span className="block text-[11px] text-slate-400 mt-1">
              Formatado: {formatPhoneDisplay(whatsappNumber)}
            </span>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <Bike className="w-3.5 h-3.5 text-orange-500" />
              Taxa de Entrega (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
            <span className="block text-[11px] text-slate-400 mt-1">
              Use 0 para Entrega Grátis
            </span>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              Tempo Médio Estimado
            </label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="Ex: 35-50 min"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pedido Mínimo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              Endereço Físico (Para Retirada no Balcão)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Identidade Visual do Estabelecimento */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          Identidade Visual da Vitrine
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <StoreIcon className="w-3.5 h-3.5 text-orange-500" />
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Slogan / Descrição Curta
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL da Logo
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL do Banner de Capa
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
            />
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Configurações da loja salvas e sincronizadas em tempo real com a vitrine!
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            window.location.reload();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Cardápio Padrão de Demonstração</span>
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Configurações da Loja'}</span>
        </button>
      </div>
    </form>
  );
};
