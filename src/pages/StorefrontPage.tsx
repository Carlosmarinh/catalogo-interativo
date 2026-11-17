import React, { useMemo, useState } from 'react';
import { Sparkles, AlertTriangle, SearchX } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { StoreHeader } from '../components/storefront/StoreHeader';
import {
  CategoryTabs,
  renderCategoryIcon,
} from '../components/storefront/CategoryTabs';
import { ProductCard } from '../components/storefront/ProductCard';
import { FloatingCartBar } from '../components/storefront/FloatingCartBar';
import { CheckoutModal } from '../components/storefront/CheckoutModal';

export const StorefrontPage: React.FC = () => {
  const { store, categories, products, loading } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !normalizedQuery ||
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery);

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'featured') {
        return (
          p.is_featured ||
          (typeof p.promo_price === 'number' &&
            p.promo_price > 0 &&
            p.promo_price < p.price)
        );
      }
      return p.category_id === selectedCategory;
    });
  }, [products, normalizedQuery, selectedCategory]);

  const featuredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.is_available &&
          (p.is_featured ||
            (typeof p.promo_price === 'number' &&
              p.promo_price > 0 &&
              p.promo_price < p.price))
      ),
    [products]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Carregando cardápio digital...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <StoreHeader store={store} />

      {/* Aviso de Loja Fechada */}
      {!store.is_open && (
        <div className="bg-rose-600 text-white px-4 py-3 shadow-inner">
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Estamos fechados no momento! Você pode navegar pelo cardápio, mas os pedidos via WhatsApp estão temporariamente pausados.
            </span>
          </div>
        </div>
      )}

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        featuredCount={featuredProducts.length}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10">
        {/* Seção de Destaques quando nenhuma busca ou filtro específico está ativo */}
        {selectedCategory === 'all' && !normalizedQuery && featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Destaques & Promoções do Dia
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={`featured-${product.id}`}
                  product={product}
                  storeOpen={store.is_open}
                />
              ))}
            </div>
          </section>
        )}

        {/* Listagem Agrupada por Categoria ou Resultado de Filtro */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Não encontramos itens correspondentes a "{searchQuery}". Tente buscar outro termo ou limpar os filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Mostrar Cardápio Completo
            </button>
          </div>
        ) : selectedCategory === 'all' && !normalizedQuery ? (
          categories.map((category) => {
            const catProducts = products.filter((p) => p.category_id === category.id);
            if (catProducts.length === 0) return null;

            return (
              <section key={category.id} id={`cat-${category.slug}`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      {renderCategoryIcon(category.icon, 'w-4 h-4')}
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      {category.name}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {catProducts.length} {catProducts.length === 1 ? 'opção' : 'opções'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeOpen={store.is_open}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                {normalizedQuery
                  ? `Resultados para "${searchQuery}"`
                  : selectedCategory === 'featured'
                  ? 'Destaques & Promoções'
                  : categories.find((c) => c.id === selectedCategory)?.name || 'Produtos'}
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'item encontrado' : 'itens encontrados'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeOpen={store.is_open}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <FloatingCartBar />
      <CheckoutModal />
    </div>
  );
};
