import { Store, Category, Product, Order, ProductAddon } from '../types/catalog';

export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001';

export const DEFAULT_BURGER_ADDONS: ProductAddon[] = [
  { id: 'addon-bacon', name: 'Bacon crocante extra', price: 4.0 },
  { id: 'addon-cheddar', name: 'Cheddar inglês cremoso', price: 3.5 },
  { id: 'addon-smash', name: 'Blend extra 90g na brasa', price: 9.0 },
  { id: 'addon-cebola', name: 'Cebola caramelizada no melaço', price: 3.0 },
  { id: 'addon-maionese', name: 'Potinho de maionese trufada', price: 3.5 },
];

export const DEFAULT_PIZZA_ADDONS: ProductAddon[] = [
  { id: 'addon-borda-catupiry', name: 'Borda recheada com Catupiry Original', price: 9.0 },
  { id: 'addon-borda-cheddar', name: 'Borda recheada com Cheddar', price: 9.0 },
  { id: 'addon-bufala', name: 'Extra de muçarela de búfala', price: 8.5 },
  { id: 'addon-pepperoni', name: 'Extra de pepperoni crocante', price: 7.5 },
  { id: 'addon-hothoney', name: 'Fio de mel picante (Hot Honey)', price: 4.0 },
];

export const DEFAULT_PORCAO_ADDONS: ProductAddon[] = [
  { id: 'addon-porcao-bacon', name: 'Farofa de bacon extra', price: 4.5 },
  { id: 'addon-porcao-cheddar', name: 'Cobertura extra de cheddar', price: 4.0 },
  { id: 'addon-porcao-maionese', name: 'Maionese verde da casa', price: 3.0 },
];

export const DEFAULT_SOBREMESA_ADDONS: ProductAddon[] = [
  { id: 'addon-sorvete', name: 'Bola extra de sorvete de baunilha', price: 6.0 },
  { id: 'addon-pistache', name: 'Calda extra de pistache', price: 5.5 },
];

export function getProductAvailableAddons(product: Product): ProductAddon[] {
  if (product.addons && product.addons.length > 0) {
    return product.addons;
  }
  switch (product.category_id) {
    case '10000000-0000-0000-0000-000000000001': // Lanches
      return DEFAULT_BURGER_ADDONS;
    case '10000000-0000-0000-0000-000000000002': // Pizzas
      return DEFAULT_PIZZA_ADDONS;
    case '10000000-0000-0000-0000-000000000003': // Porções
      return DEFAULT_PORCAO_ADDONS;
    case '10000000-0000-0000-0000-000000000005': // Sobremesas
      return DEFAULT_SOBREMESA_ADDONS;
    default:
      return [];
  }
}

export const INITIAL_STORE: Store = {
  id: DEFAULT_STORE_ID,
  name: 'Brasa & Co. Burgers e Pizzas',
  subtitle: 'Hambúrgueres artesanais na brasa, pizzas de fermentação lenta e doces autorais',
  logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
  banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
  whatsapp_number: '5511999999999',
  delivery_fee: 7.90,
  estimated_time: '35-50 min',
  min_order_value: 20.00,
  address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  is_open: true,
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    store_id: DEFAULT_STORE_ID,
    name: 'Lanches',
    slug: 'lanches',
    icon: 'beef',
    sort_order: 1,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    store_id: DEFAULT_STORE_ID,
    name: 'Pizzas',
    slug: 'pizzas',
    icon: 'pizza',
    sort_order: 2,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    store_id: DEFAULT_STORE_ID,
    name: 'Porções',
    slug: 'porcoes',
    icon: 'flame',
    sort_order: 3,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    store_id: DEFAULT_STORE_ID,
    name: 'Bebidas',
    slug: 'bebidas',
    icon: 'cup-soda',
    sort_order: 4,
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    store_id: DEFAULT_STORE_ID,
    name: 'Sobremesas',
    slug: 'sobremesas',
    icon: 'ice-cream',
    sort_order: 5,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000001',
    name: 'Smash Duplo Trufado',
    description:
      'Dois blends de costela 90g prensados na chapa, queijo cheddar inglês derretido, cebola caramelizada no melaço e maionese trufada no pão brioche selado na manteiga.',
    price: 38.90,
    promo_price: 34.90,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000001',
    name: 'Brasa Bacon Melt',
    description:
      'Hambúrguer angus 180g grelhado no fogo, duplo queijo prato, fatias crocantes de bacon defumado em lenha de macieira, picles artesanal e molho especial defumado.',
    price: 36.50,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000001',
    name: 'Crispy Chicken Honey Mustard',
    description:
      'Sobrecoxa de frango empanada super crocante, salada coleslaw fresca, picles de pepino e molho mostarda e mel da casa no pão de batata.',
    price: 32.90,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000002',
    name: 'Pizza Margherita Verace (8 Fatias)',
    description:
      'Massa de fermentação natural de 48h, molho de tomates San Marzano, muçarela de búfala fresca, folhas de manjericão gigante e fio de azeite extravirgem.',
    price: 64.90,
    promo_price: 58.90,
    image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000002',
    name: 'Pizza Pepperoni & Hot Honey (8 Fatias)',
    description:
      'Molho artesanal, muçarela especial, generosas fatias de pepperoni crocante, lascas de parmesão maturadas e finalização com mel picante artesanal.',
    price: 72.90,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000003',
    name: 'Batata Crinkle com Cheddar e Bacon',
    description:
      'Porção de 400g de batatas crinkle super crocantes cobertas com creme de cheddar inglês quente e farofa de bacon defumado.',
    price: 28.90,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000009',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000003',
    name: 'Dadinhos de Tapioca com Geleia de Pimenta (12 un)',
    description:
      'Cubos dourados de tapioca granulada com queijo coalho nordestino legítimo, acompanhados de geleia artesanal de pimenta dedo-de-moça.',
    price: 26.00,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000004',
    name: 'Pink Lemonade Artesanal 500ml',
    description:
      'Limonada siciliana espremida na hora com infusão de frutas vermelhas, hortelã fresca e gelo cristalino.',
    price: 14.90,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000010',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000004',
    name: 'Coca-Cola Lata 350ml (Normal ou Zero)',
    description: 'Lata 350ml estupidamente gelada. Informe na observação se prefere Original ou Sem Açúcar.',
    price: 7.50,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000005',
    name: 'Brownie Belga com Calda de Pistache',
    description:
      'Brownie quentinho de chocolate meio amargo 70% com nozes pecã, coberto com ganache cremosa de pistache iraniano e sorvete de baunilha.',
    price: 26.90,
    promo_price: 23.90,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
  },
  {
    id: '20000000-0000-0000-0000-000000000011',
    store_id: DEFAULT_STORE_ID,
    category_id: '10000000-0000-0000-0000-000000000005',
    name: 'Cheesecake Basca de Frutas Vermelhas',
    description:
      'Fatia generosa de torta basca caramelizada por fora e ultra cremosa por dentro, acompanhada de calda rústica de morango, amora e framboesa.',
    price: 24.90,
    promo_price: null,
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    is_available: false,
    is_featured: false,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    order_number: 4821,
    store_id: DEFAULT_STORE_ID,
    customer_name: 'Lucas Mendonça (Pedido Exemplo)',
    customer_phone: '(11) 98765-4321',
    delivery_method: 'delivery',
    address_summary: 'Rua Oscar Freire, 850 - Jardins (Apto 82)',
    payment_method: 'pix',
    cash_change_for: '',
    items: [
      {
        product_id: '20000000-0000-0000-0000-000000000001',
        name: 'Smash Duplo Trufado',
        quantity: 2,
        unit_price: 34.90,
        notes: 'Um sem cebola caramelizada',
      },
      {
        product_id: '20000000-0000-0000-0000-000000000006',
        name: 'Pink Lemonade Artesanal 500ml',
        quantity: 2,
        unit_price: 14.90,
        notes: '',
      },
    ],
    subtotal: 99.60,
    delivery_fee: 7.90,
    total: 107.50,
    status: 'pending',
    whatsapp_message:
      '*NOVO PEDIDO #4821 — BRASA & CO. BURGERS E PIZZAS*\n*CLIENTE:* Lucas Mendonça\n• *2x Smash Duplo Trufado* — R$ 69,80\n• *2x Pink Lemonade Artesanal 500ml* — R$ 29,80\n*TOTAL A PAGAR: R$ 107,50*',
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];
