import React, { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Package,
  Settings,
  FolderKanban,
  Plus,
  Search,
  Edit3,
  Trash2,
  Power,
  PauseCircle,
  PlayCircle,
  Sparkles,
  ExternalLink,
  LogOut,
  Database,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { Product } from '../types/catalog';
import { formatCurrency, getEffectivePrice } from '../lib/whatsapp';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { StoreSettingsPanel } from '../components/admin/StoreSettingsPanel';
import { CategoryManagerPanel } from '../components/admin/CategoryManagerPanel';
import { OrdersManagerPanel } from '../components/admin/OrdersManagerPanel';

type AdminTab = 'orders' | 'products' | 'categories' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const {
    store,
    categories,
    products,
    orders,
    isSupabaseMode,
    toggleStoreOpen,
    saveProduct,
    deleteProduct,
    toggleProductAvailability,
    toggleProductFeatured,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat =
        filterCategoryId === 'all' || p.category_id === filterCategoryId;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, filterCategoryId, searchQuery]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const totalAvailable = products.filter((p) => p.is_available).length;
  const totalPaused = products.length - totalAvailable;
  const totalFeatured = products.filter((p) => p.is_featured).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar do Painel Lojista */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-orange-500/20">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight">
                  ZapCatálogo Admin
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  <Database className="w-3 h-3 text-orange-400" />
                  {isSupabaseMode ? 'Supabase Realtime' : 'Sincronização Local'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-none">
                {store.name} • {user?.email || 'Modo Lojista Demonstrativo'}
              </p>
            </div>
          </div>

          {/* Ações Rápidas: Status da Loja, Ver Vitrine e Sair */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleStoreOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                store.is_open
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
              }`}
              title="Clique para alternar entre Aberto e Fechado"
            >
              <Power className="w-3.5 h-3.5" />
              <span>{store.is_open ? 'Loja Aberta' : 'Loja Fechada'}</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Ver Vitrine</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              title="Sair do Painel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação de Abas */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-2 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Pedidos Recebidos ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-orange-600">
                {pendingOrdersCount} {pendingOrdersCount === 1 ? 'novo' : 'novos'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Loja & WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">
        {activeTab === 'orders' && <OrdersManagerPanel />}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Cards de Resumo Rápido */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Total no Cardápio
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {products.length}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
                <span className="text-xs font-bold text-emerald-600 uppercase">
                  Ativos / Disponíveis
                </span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {totalAvailable}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-2xs">
                <span className="text-xs font-bold text-rose-600 uppercase">
                  Pausados (Esgotados)
                </span>
                <p className="text-2xl font-extrabold text-rose-700 mt-1">
                  {totalPaused}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
                <span className="text-xs font-bold text-amber-600 uppercase">
                  Em Destaque
                </span>
                <p className="text-2xl font-extrabold text-amber-700 mt-1">
                  {totalFeatured}
                </p>
              </div>
            </div>

            {/* Barra de Ferramentas: Busca, Filtro de Categoria e Botão Novo Produto */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produto pelo nome..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-orange-500 outline-none"
                  />
                </div>

                <select
                  value={filterCategoryId}
                  onChange={(e) => setFilterCategoryId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:border-orange-500 outline-none"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenNewProduct}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Produto</span>
              </button>
            </div>

            {/* Lista de Produtos com Ações Rápidas */}
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const categoryName =
                  categories.find((c) => c.id === product.category_id)?.name ||
                  'Sem Categoria';
                const effectivePrice = getEffectivePrice(product);

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      product.is_available
                        ? 'border-slate-200/80'
                        : 'border-rose-200 bg-rose-50/20 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {categoryName}
                          </span>
                          {product.is_featured && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              <Sparkles className="w-3 h-3" /> Destaque
                            </span>
                          )}
                          {!product.is_available && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                              Pausado / Esgotado
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate mt-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-extrabold text-orange-600">
                            {formatCurrency(effectivePrice)}
                          </span>
                          {product.promo_price && product.promo_price < product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação Rápida do Lojista */}
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Botão Rápido Pausar / Disponibilizar */}
                      <button
                        type="button"
                        onClick={() => toggleProductAvailability(product.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          product.is_available
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                        title="Pausar ou disponibilizar imediatamente na vitrine"
                      >
                        {product.is_available ? (
                          <>
                            <PauseCircle className="w-4 h-4" />
                            <span>Pausar Item</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4" />
                            <span>Disponibilizar</span>
                          </>
                        )}
                      </button>

                      {/* Alternar Destaque */}
                      <button
                        type="button"
                        onClick={() => toggleProductFeatured(product.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          product.is_featured
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title="Alternar Destaque no topo da vitrine"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(product)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'categories' && <CategoryManagerPanel />}
        {activeTab === 'settings' && <StoreSettingsPanel />}
      </main>

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={saveProduct}
        categories={categories}
        editingProduct={editingProduct}
      />
    </div>
  );
};
