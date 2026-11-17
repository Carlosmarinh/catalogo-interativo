import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Bike,
  Store as StoreIcon,
  QrCode,
  CreditCard,
  Banknote,
  MessageSquare,
  Send,
  AlertCircle,
  Eye,
  CheckCircle2,
  Radar,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCatalog } from '../../context/CatalogContext';
import { CheckoutForm, DeliveryMethod, PaymentMethod } from '../../types/catalog';
import {
  buildWhatsAppOrderUrl,
  formatCurrency,
  getEffectivePrice,
} from '../../lib/whatsapp';
import { saveCustomerOrderNumber } from '../../pages/OrderTrackingPage';

export const CheckoutModal: React.FC = () => {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addItem,
    decrementItem,
    removeItem,
    updateItemNotes,
    clearCart,
  } = useCart();
  const { store, createOrder } = useCatalog();
  const navigate = useNavigate();
  const draftOrderCode = useMemo(
    () => Math.floor(1000 + Math.random() * 9000),
    [isCheckoutOpen]
  );
  const [lastCreatedOrderNum, setLastCreatedOrderNum] = useState<number | null>(null);

  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    customerPhone: '',
    deliveryMethod: 'delivery',
    streetAndNumber: '',
    neighborhood: '',
    complement: '',
    paymentMethod: 'pix',
    cashChangeFor: '',
    generalNotes: '',
  });

  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);

  if (!isCheckoutOpen) return null;

  const deliveryFee = form.deliveryMethod === 'delivery' ? store.delivery_fee : 0;
  const total = subtotal + deliveryFee;
  const belowMinOrder =
    form.deliveryMethod === 'delivery' && subtotal < store.min_order_value;

  const { url: whatsappUrl, message: whatsappMessage } = buildWhatsAppOrderUrl({
    store,
    items,
    checkout: form,
    subtotal,
    deliveryFee,
    total,
    orderCode: draftOrderCode,
  });

  const handleDeliveryChange = (method: DeliveryMethod) => {
    setForm((prev) => ({ ...prev, deliveryMethod: method }));
    setValidationError(null);
  };

  const handlePaymentChange = (method: PaymentMethod) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
    setValidationError(null);
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!store.is_open) {
      setValidationError('A loja está fechada no momento e não está recebendo pedidos.');
      return;
    }

    if (items.length === 0) {
      setValidationError('Sua sacola está vazia.');
      return;
    }

    if (!form.customerName.trim()) {
      setValidationError('Por favor, informe seu nome para identificarmos o pedido.');
      return;
    }

    if (form.deliveryMethod === 'delivery') {
      if (belowMinOrder) {
        setValidationError(
          `O pedido mínimo para entrega é de ${formatCurrency(store.min_order_value)}.`
        );
        return;
      }
      if (!form.streetAndNumber.trim() || !form.neighborhood.trim()) {
        setValidationError(
          'Preencha sua Rua, Número e Bairro para realizarmos a entrega.'
        );
        return;
      }
    }

    const addressSummary =
      form.deliveryMethod === 'delivery'
        ? `${form.streetAndNumber.trim()} - ${form.neighborhood.trim()}${
            form.complement.trim() ? ` (${form.complement.trim()})` : ''
          }`
        : `Retirada no Balcão (${store.address})`;

    const created = await createOrder({
      order_number: draftOrderCode,
      customer_name: form.customerName.trim(),
      customer_phone: form.customerPhone.trim(),
      delivery_method: form.deliveryMethod,
      address_summary: addressSummary,
      payment_method: form.paymentMethod,
      cash_change_for: form.cashChangeFor.trim(),
      items: items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        unit_price: getEffectivePrice(i.product),
        notes: i.notes.trim(),
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total,
      whatsapp_message: whatsappMessage,
    });

    saveCustomerOrderNumber(created.order_number);
    setLastCreatedOrderNum(created.order_number);

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setOrderSentSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              Finalizar Pedido
            </h2>
            <p className="text-xs text-slate-400">
              Revise seus itens e envie direto para o WhatsApp de {store.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCheckoutOpen(false);
              setOrderSentSuccess(false);
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável */}
        <form onSubmit={handleSendWhatsApp} className="flex-1 overflow-y-auto p-5 space-y-6">
          {orderSentSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-emerald-900 space-y-2">
                <strong className="font-bold block">
                  Pedido #{lastCreatedOrderNum || draftOrderCode} registrado com sucesso!
                </strong>
                <p className="text-xs text-emerald-700">
                  Você pode acompanhar cada etapa do preparo e entrega em tempo real clicando no botão abaixo:
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setOrderSentSuccess(false);
                      setIsCheckoutOpen(false);
                      navigate(`/pedido/${lastCreatedOrderNum || draftOrderCode}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                  >
                    <Radar className="w-4 h-4" />
                    <span>
                      Acompanhar Pedido #{lastCreatedOrderNum || draftOrderCode} ao Vivo
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1. Resumo dos Itens na Sacola */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                1. Itens Escolhidos ({items.length})
              </h3>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar sacola
                </button>
              )}
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const price = getEffectivePrice(item.product);
                return (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-semibold text-orange-600">
                            {formatCurrency(price)} un. • Total:{' '}
                            {formatCurrency(price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity === 1
                              ? removeItem(item.product.id)
                              : decrementItem(item.product.id)
                          }
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-extrabold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItem(item.product)}
                          className="w-7 h-7 rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Campo de observação individual por item */}
                    <div className="relative">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                        placeholder="Alguma observação neste item? (Ex: Sem cebola, bem passado)"
                        className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Como deseja receber? (Entrega vs Retirada) */}
          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              2. Forma de Entrega
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDeliveryChange('delivery')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  form.deliveryMethod === 'delivery'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    form.deliveryMethod === 'delivery'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-sm text-slate-900">
                    Entrega (Delivery)
                  </span>
                  <span className="text-xs text-slate-500">
                    Taxa:{' '}
                    {store.delivery_fee === 0
                      ? 'Grátis'
                      : formatCurrency(store.delivery_fee)}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDeliveryChange('pickup')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  form.deliveryMethod === 'pickup'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    form.deliveryMethod === 'pickup'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <StoreIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-sm text-slate-900">
                    Retirar no Local
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">
                    Sem taxa (Grátis)
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* 3. Dados do Cliente e Endereço */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              3. Seus Dados {form.deliveryMethod === 'delivery' && 'e Endereço'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Ex: Mariana Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Telefone / WhatsApp (Opcional)
                </label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="Ex: (11) 98888-7777"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none"
                />
              </div>
            </div>

            {form.deliveryMethod === 'delivery' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rua / Avenida e Número *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.streetAndNumber}
                      onChange={(e) =>
                        setForm({ ...form, streetAndNumber: e.target.value })
                      }
                      placeholder="Ex: Rua Augusta, 420"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.neighborhood}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                      placeholder="Ex: Consolação"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Complemento / Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={form.complement}
                    onChange={(e) => setForm({ ...form, complement: e.target.value })}
                    placeholder="Ex: Apto 52, Bloco B (Portão preto ao lado da padaria)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-900 block mb-0.5">
                  Endereço para Retirada no Balcão:
                </strong>
                {store.address} • Tempo médio de preparo: {store.estimated_time}
              </div>
            )}
          </section>

          {/* 4. Forma de Pagamento */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              4. Forma de Pagamento
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handlePaymentChange('pix')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  form.paymentMethod === 'pix'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-2 ring-orange-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">Pix</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentChange('card')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  form.paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-2 ring-orange-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold">Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentChange('cash')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  form.paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-2 ring-orange-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold">Dinheiro</span>
              </button>
            </div>

            {form.paymentMethod === 'cash' && (
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Precisa de troco para quanto? (Deixe em branco se não precisar)
                </label>
                <input
                  type="text"
                  value={form.cashChangeFor}
                  onChange={(e) => setForm({ ...form, cashChangeFor: e.target.value })}
                  placeholder="Ex: 100,00"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                />
              </div>
            )}
          </section>

          {/* Resumo de Valores e Prévia da Mensagem */}
          <section className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal dos itens</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>
                Taxa de entrega ({form.deliveryMethod === 'pickup' ? 'Retirada' : 'Delivery'})
              </span>
              <span>
                {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold">Total do Pedido</span>
              <span className="text-xl font-extrabold text-orange-400">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMessagePreview(!showMessagePreview)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {showMessagePreview
                    ? 'Ocultar prévia da mensagem do WhatsApp'
                    : 'Ver prévia da mensagem formatada para o WhatsApp'}
                </span>
              </button>

              {showMessagePreview && (
                <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-emerald-300 text-[11px] font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-44 overflow-y-auto">
                  {whatsappMessage}
                </pre>
              )}
            </div>
          </section>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Botão Principal de Disparo via WhatsApp */}
          <div className="pt-1 pb-2">
            <button
              type="submit"
              disabled={!store.is_open || belowMinOrder}
              className={`w-full py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                !store.is_open || belowMinOrder
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white shadow-emerald-600/25'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>
                {!store.is_open
                  ? 'Estabelecimento Fechado no Momento'
                  : belowMinOrder
                  ? `Faltam ${formatCurrency(store.min_order_value - subtotal)} para o pedido mínimo`
                  : `Enviar Pedido via WhatsApp (${formatCurrency(total)})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
