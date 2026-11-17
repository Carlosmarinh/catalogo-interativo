import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  XCircle,
  MessageCircle,
  Trash2,
  MapPin,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { Order, OrderStatus } from '../../types/catalog';
import { formatCurrency, sanitizeWhatsAppNumber } from '../../lib/whatsapp';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Novo Pedido',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  preparing: {
    label: 'Em Preparo na Cozinha',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <ChefHat className="w-3.5 h-3.5" />,
  },
  delivering: {
    label: 'Saiu para Entrega / Pronto',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: <Bike className="w-3.5 h-3.5" />,
  },
  completed: {
    label: 'Concluído',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Cancelado',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const PAYMENT_NAMES: Record<Order['payment_method'], string> = {
  pix: 'Pix',
  card: 'Cartão',
  cash: 'Dinheiro',
};

const STATUS_WHATSAPP_TEXT: Record<OrderStatus, string> = {
  pending: 'Recebemos o seu pedido e já vamos iniciar o preparo!',
  preparing: 'Boas notícias! Seu pedido já está sendo preparado na nossa cozinha!',
  delivering: 'Seu pedido acabou de sair para entrega (ou está pronto para retirada no balcão)!',
  completed: 'Seu pedido foi entregue! Muito obrigado pela preferência e bom apetite!',
  cancelled: 'Seu pedido precisou ser cancelado. Entre em contato conosco para mais detalhes.',
};

export const OrdersManagerPanel: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useCatalog();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter((o) =>
    statusFilter === 'all' ? true : o.status === statusFilter
  );

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro e Operacional dos Pedidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
          <span className="text-xs font-bold text-amber-600 uppercase">
            Novos (Aguardando)
          </span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-2xs">
          <span className="text-xs font-bold text-blue-600 uppercase">
            Na Cozinha (Em Preparo)
          </span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">
            {preparingCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Total de Pedidos
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {orders.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 uppercase">
            Volume em Pedidos
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filtro por Status */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            { id: 'all', label: `Todos (${orders.length})` },
            { id: 'pending', label: `Novos (${pendingCount})` },
            { id: 'preparing', label: `Em Preparo (${preparingCount})` },
            { id: 'delivering', label: 'Saiu p/ Entrega' },
            { id: 'completed', label: 'Concluídos' },
            { id: 'cancelled', label: 'Cancelados' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Nenhum pedido neste filtro
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Assim que um cliente clicar em "Enviar Pedido via WhatsApp" na vitrine pública, o pedido aparecerá aqui automaticamente em tempo real e também chegará no seu WhatsApp.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const timeStr = new Date(order.created_at).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Topo do Card: Número do Pedido, Horário e Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">
                          Pedido #{order.order_number}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          • {timeStr}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mt-0.5">
                        Cliente: {order.customer_name}
                      </h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badgeClass}`}
                    >
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </span>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-200/60">
                    {order.items.map((item, idx) => (
                      <div key={`${order.id}-item-${idx}`} className="text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                        </div>
                        {item.notes && (
                          <span className="block text-[11px] text-orange-700 italic mt-0.5">
                            Obs: {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Endereço e Pagamento */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">
                          {order.delivery_method === 'delivery'
                            ? 'Entrega:'
                            : 'Retirada:'}
                        </strong>{' '}
                        {order.address_summary}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-orange-500" />
                        <strong className="text-slate-800">
                          {PAYMENT_NAMES[order.payment_method]}
                        </strong>
                        {order.payment_method === 'cash' && order.cash_change_for && (
                          <span className="text-amber-700 font-semibold">
                            (Troco p/ R$ {order.cash_change_for})
                          </span>
                        )}
                      </span>

                      <span className="text-base font-extrabold text-slate-900">
                        Total: {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controles de Status e Contato com o Cliente */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="pending">Status: Novo Pedido</option>
                      <option value="preparing">Status: Em Preparo</option>
                      <option value="delivering">Status: Saiu p/ Entrega</option>
                      <option value="completed">Status: Concluído</option>
                      <option value="cancelled">Status: Cancelado</option>
                    </select>

                    {order.customer_phone && (
                      <a
                        href={`https://wa.me/${sanitizeWhatsAppNumber(
                          order.customer_phone
                        )}?text=${encodeURIComponent(
                          `Olá ${order.customer_name}! Sobre o seu *Pedido #${order.order_number}*:\n\n${
                            STATUS_WHATSAPP_TEXT[order.status]
                          }\n\nAcompanhe em tempo real aqui:\n${
                            window.location.origin
                          }/pedido/${order.order_number}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Avisar Status no WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteOrder(order.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir registro do pedido"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
