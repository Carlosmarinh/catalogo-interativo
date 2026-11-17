-- ============================================================================
-- ZapCatálogo — Schema Completo para Supabase (PostgreSQL + RLS + Realtime)
-- Execute este script no SQL Editor do seu painel Supabase
-- ============================================================================

-- Habilitar extensão para UUIDs caso ainda não esteja ativa
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABELA: stores (Dados e Configurações do Estabelecimento)
-- ----------------------------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null default 'Brasa & Co. Burgers e Pizzas',
  subtitle text not null default 'Hambúrgueres artesanais na brasa, pizzas napolitanas e sobremesas',
  logo_url text not null default 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
  banner_url text not null default 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
  whatsapp_number text not null default '5511999999999',
  delivery_fee numeric(10, 2) not null default 7.90,
  estimated_time text not null default '35-50 min',
  min_order_value numeric(10, 2) not null default 20.00,
  address text not null default 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  is_open boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. TABELA: categories (Categorias do Cardápio)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text not null default 'utensils',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. TABELA: products (Itens do Cardápio)
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  image_url text not null,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance de filtros e buscas
create index if not exists idx_categories_store_sort on public.categories(store_id, sort_order);
create index if not exists idx_products_store_category on public.products(store_id, category_id);
create index if not exists idx_products_featured on public.products(store_id, is_featured);

-- ----------------------------------------------------------------------------
-- 3.1 TABELA: orders (Pedidos Recebidos dos Clientes)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null default 1000,
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null default '',
  delivery_method text not null default 'delivery',
  address_summary text not null default '',
  payment_method text not null default 'pix',
  cash_change_for text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status text not null default 'pending',
  whatsapp_message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_store_created on public.orders(store_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Clientes na vitrine pública podem registrar novos pedidos
drop policy if exists "Clientes criam pedidos" on public.orders;
create policy "Clientes criam pedidos"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Lojistas visualizam e atualizam o status dos pedidos no painel
drop policy if exists "Lojistas gerenciam pedidos" on public.orders;
create policy "Lojistas gerenciam pedidos"
  on public.orders for all
  to anon, authenticated
  using (true)
  with check (true);

-- Políticas de Leitura Pública (Qualquer cliente acessando a vitrine pode ler)
drop policy if exists "Leitura publica de lojas" on public.stores;
create policy "Leitura publica de lojas"
  on public.stores for select
  to anon, authenticated
  using (true);

drop policy if exists "Leitura publica de categorias" on public.categories;
create policy "Leitura publica de categorias"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Leitura publica de produtos" on public.products;
create policy "Leitura publica de produtos"
  on public.products for select
  to anon, authenticated
  using (true);

-- Políticas de Escrita para Lojistas Autenticados (Supabase Auth)
-- Caso owner_id esteja preenchido, restringe ao dono; caso nulo (loja padrão), permite ao lojista autenticado gerenciar e vincular.
drop policy if exists "Lojistas gerenciam sua loja" on public.stores;
create policy "Lojistas gerenciam sua loja"
  on public.stores for all
  to authenticated
  using (owner_id is null or owner_id = auth.uid())
  with check (owner_id is null or owner_id = auth.uid());

drop policy if exists "Lojistas gerenciam categorias" on public.categories;
create policy "Lojistas gerenciam categorias"
  on public.categories for all
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id
        and (s.owner_id is null or s.owner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = categories.store_id
        and (s.owner_id is null or s.owner_id = auth.uid())
    )
  );

drop policy if exists "Lojistas gerenciam produtos" on public.products;
create policy "Lojistas gerenciam produtos"
  on public.products for all
  to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id
        and (s.owner_id is null or s.owner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id
        and (s.owner_id is null or s.owner_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- 5. REALTIME (Atualização instantânea na vitrine do cliente)
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.stores;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;

-- ----------------------------------------------------------------------------
-- 6. SEED INICIAL (Loja + Categorias + Produtos de Demonstração)
-- ----------------------------------------------------------------------------
insert into public.stores (
  id, name, subtitle, logo_url, banner_url, whatsapp_number, delivery_fee, estimated_time, min_order_value, address, is_open
) values (
  '00000000-0000-0000-0000-000000000001',
  'Brasa & Co. Burgers e Pizzas',
  'Hambúrgueres artesanais na brasa, pizzas de fermentação lenta e doces autorais',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
  '5511999999999',
  7.90,
  '35-50 min',
  20.00,
  'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  true
) on conflict (id) do nothing;

insert into public.categories (id, store_id, name, slug, icon, sort_order) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Lanches', 'lanches', 'beef', 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Pizzas', 'pizzas', 'pizza', 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Porções', 'porcoes', 'flame', 3),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Bebidas', 'bebidas', 'cup-soda', 4),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Sobremesas', 'sobremesas', 'ice-cream', 5)
on conflict (id) do nothing;

insert into public.products (id, store_id, category_id, name, description, price, promo_price, image_url, is_available, is_featured) values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Smash Duplo Trufado',
    'Dois blends de costela 90g prensados na chapa, queijo cheddar inglês derretido, cebola caramelizada no melaço e maionese trufada no pão brioche selado na manteiga.',
    38.90,
    34.90,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    true,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Brasa Bacon Melt',
    'Hambúrguer angus 180g grelhado no fogo, duplo queijo prato, fatias crocantes de bacon defumado em lenha de macieira, picles artesanal e molho especial defumado.',
    36.50,
    null,
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    true,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Pizza Margherita Verace (8 Fatias)',
    'Massa de fermentação natural de 48h, molho de tomates San Marzano, muçarela de búfala fresca, folhas de manjericão gigante e fio de azeite extravirgem.',
    64.90,
    58.90,
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    true,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Pizza Pepperoni & Hot Honey (8 Fatias)',
    'Molho artesanal, muçarela especial, generosas fatias de pepperoni crocante, lascas de parmesão maturadas e finalização com mel picante artesanal.',
    72.90,
    null,
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    true,
    false
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'Batata Crinkle com Cheddar e Bacon',
    'Porção de 400g de batatas crinkle super crocantes cobertas com creme de cheddar inglês quente e farofa de bacon defumado.',
    28.90,
    null,
    'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    true,
    false
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000004',
    'Pink Lemonade Artesanal 500ml',
    'Limonada siciliana espremida na hora com infusão de frutas vermelhas, hortelã fresca e gelo cristalino.',
    14.90,
    null,
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    true,
    false
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000005',
    'Brownie Belga com Calda de Pistache',
    'Brownie quentinho de chocolate meio amargo 70% com nozes pecã, coberto com ganache cremosa de pistache iraniano e sorvete de baunilha.',
    26.90,
    23.90,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    true,
    true
  )
on conflict (id) do nothing;
