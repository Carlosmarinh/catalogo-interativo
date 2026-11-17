import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ChefHat,
  Bike,
  CheckCircle2,
  XCircle,
  Search,
  ArrowLeft,
  MessageCircle,
  MapPin,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { Order, OrderStatus } from '../types/catalog';
import { formatCurrency, sanitizeWhatsAppNumber } from '../lib/whatsapp';

export const CUSTOMER_ORDERS_STORAGE_KEY = 'zapcatalogo_my_order_numbers';

export function saveCustomerOrderNumber(orderNumber: number) {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    const list: number[] = raw ? JSON.parse(raw) : [];
    const next = [orderNumber, ...list.filter((n) => n !== orderNumber)].slice(0, 10);
    localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

export function getCustomerOrderNumbers(): number[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

const STEPS: {
  status: OrderStatus;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
  {
    status: 'pending',
    title: 'Pedido Recebido',
    subtitle: 'Aguardando confirmação da loja',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    status: 'preparing',
    title: 'Em Preparo na Cozinha',
    subtitle: 'Estamos preparando seu pedido no capricho!',
    icon: <ChefHat className="w-5 h-5" />,
  },
  {
    status: 'delivering',
    title: 'Saiu para Entrega / Pronto',
    subtitle: 'Seu pedido já está a caminho ou pronto no balcão!',
    icon: <Bike className="w-5 h-5" />,
  },
  {
    status: 'completed',
    title: 'Pedido Entregue',
    subtitle: 'Pedido finalizado. Bom apetite!',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'preparing':
      return 1;
    case 'delivering':
      return 2;
    case 'completed':
      return 3;
    case 'cancelled':
      return -1;
  }
}

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const { store, orders } = useCatalog();

  const mySavedNumbers = getCustomerOrderNumbers();
  const [searchInput, setSearchInput] = useState(orderNumber || '');

  useEffect(() => {
    if (orderNumber) {
      setSearchInput(orderNumber);
    } else if (mySavedNumbers.length > 0 && !searchInput) {
      setSearchInput(String(mySavedNumbers[0]));
    }
  }, [orderNumber]);

  const cleanNumber = Number(
    (orderNumber || searchInput).replace(/\D/g, '')
  );

  const currentOrder: Order | undefined = cleanNumber
    ? orders.find((o) => Number(o.order_number) === cleanNumber)
    : undefined;

  const myRecentOrders = orders.filter((o) =>
    mySavedNumbers.includes(Number(o.order_number))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = searchInput.replace(/\D/g, '');
    if (digits) {
      navigate(`/pedido/${digits}`);
    }
  };

  const activeStepIdx = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Cabeçalho */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Voltar ao Cardápio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400">
              Atualização em Tempo Real
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Barra de Busca pelo Número do Pedido */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Acompanhar Status do Pedido
              </h1>
              <p className="text-xs text-slate-500">
                Digite o número de 4 dígitos do seu pedido (Ex: #4821) para acompanhar ao vivo
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Número do pedido (ex: 4821)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Buscar Pedido
            </button>
          </form>

          {/* Atalhos dos Pedidos Recentes do Cliente neste celular */}
          {myRecentOrders.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Seus pedidos recentes:
              </span>
              {myRecentOrders.map((ord) => (
                <Link
                  key={ord.id}
                  to={`/pedido/${ord.order_number}`}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    currentOrder?.id === ord.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  #{ord.order_number} ({ord.customer_name.split(' ')[0]})
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Resultado do Rastreamento em Tempo Real */}
        {currentOrder ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            {/* Topo Colorido com Status Atual */}
            <div
              className={`p-6 text-white ${
                currentOrder.status === 'cancelled'
                  ? 'bg-rose-600'
                  : currentOrder.status === 'completed'
                  ? 'bg-emerald-600'
                  : 'bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Pedido #{currentOrder.order_number}
                </span>
                <span className="text-xs text-slate-300">
                  Previsão média: <strong>{store.estimated_time}</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold mt-3">
                {currentOrder.status === 'cancelled'
                  ? 'Pedido Cancelado'
                  : STEPS[activeStepIdx]?.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentOrder.status === 'cancelled'
                  ? 'Entre em contato com o estabelecimento pelo WhatsApp para mais informações.'
                  : STEPS[activeStepIdx]?.subtitle}
              </p>
            </div>

            {/* Linha do Tempo Visual (4 Etapas) */}
            {currentOrder.status !== 'cancelled' ? (
              <div className="p-6 border-b border-slate-100">
                <div className="space-y-4">
                  {STEPS.map((step, index) => {
                    const isDone = index <= activeStepIdx;
                    const isCurrent = index === activeStepIdx;

                    return (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-md'
                                : isDone
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {step.icon}
                          </div>
                          {index < STEPS.length - 1 && (
                            <div
                              className={`w-0.5 h-6 mt-1 rounded-full ${
                                index < activeStepIdx
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-sm font-extrabold ${
                                isDone ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {step.title}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700">
                                Etapa Atual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-rose-800 text-sm font-semibold">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Este pedido foi marcado como cancelado pelo estabelecimento.</span>
              </div>
            )}

            {/* Resumo dos Itens e Endereço */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <Receipt className="w-4 h-4 text-orange-500" />
                <span>Resumo do Pedido de {currentOrder.customer_name}</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200/70">
                {currentOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs sm:text-sm text-slate-800"
                  >
                    <span>
                      <strong>{item.quantity}x</strong> {item.name}
                      {item.notes ? (
                        <em className="text-slate-500 block text-xs">
                          Obs: {item.notes}
                        </em>
                      ) : null}
                    </span>
                    <span className="font-bold">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total do Pedido</span>
                  <span className="text-base text-orange-600">
                    {formatCurrency(currentOrder.total)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{currentOrder.address_summary}</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${sanitizeWhatsAppNumber(
                    store.whatsapp_number
                  )}?text=${encodeURIComponent(
                    `Olá! Gostaria de saber sobre o meu Pedido #${currentOrder.order_number} (${currentOrder.customer_name}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar com a Loja no WhatsApp</span>
                </a>

                <Link
                  to="/"
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm text-center transition-colors"
                >
                  Voltar ao Cardápio
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">
              Digite o código do seu pedido acima (ex: <span className="text-orange-600">4821</span>) para visualizar o andamento.
            </p>
            <p className="text-xs text-slate-500">
              O status muda automaticamente na sua tela assim que a cozinha atualiza o pedido!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
