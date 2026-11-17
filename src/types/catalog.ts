export interface Store {
  id: string;
  owner_id?: string | null;
  name: string;
  subtitle: string;
  logo_url: string;
  banner_url: string;
  whatsapp_number: string;
  delivery_fee: number;
  estimated_time: string;
  min_order_value: number;
  address: string;
  is_open: boolean;
  updated_at?: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  promo_price: number | null;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'pix' | 'card' | 'cash';
export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';

export interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  streetAndNumber: string;
  neighborhood: string;
  complement: string;
  paymentMethod: PaymentMethod;
  cashChangeFor: string;
  generalNotes: string;
}

export interface OrderItemSnapshot {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  notes: string;
}

export interface Order {
  id: string;
  order_number: number;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: DeliveryMethod;
  address_summary: string;
  payment_method: PaymentMethod;
  cash_change_for: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  whatsapp_message: string;
  created_at: string;
}
