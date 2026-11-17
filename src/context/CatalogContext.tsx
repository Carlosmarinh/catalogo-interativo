import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Category, Order, OrderStatus, Product, Store } from '../types/catalog';
import {
  DEFAULT_STORE_ID,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STORE,
} from '../data/mockCatalog';
import { useAuth } from './AuthContext';

const KEYS = {
  STORE: 'zapcatalogo_store_data',
  CATEGORIES: 'zapcatalogo_categories_data',
  PRODUCTS: 'zapcatalogo_products_data',
  ORDERS: 'zapcatalogo_orders_data',
};

interface CatalogContextData {
  store: Store;
  categories: Category[];
  products: Product[];
  orders: Order[];
  loading: boolean;
  isSupabaseMode: boolean;
  isRealtimeConnected: boolean;
  updateStoreSettings: (patch: Partial<Store>) => Promise<{ error?: string }>;
  toggleStoreOpen: () => Promise<{ error?: string }>;
  saveProduct: (data: Omit<Product, 'id' | 'store_id'> & { id?: string }) => Promise<{ error?: string }>;
  deleteProduct: (id: string) => Promise<{ error?: string }>;
  toggleProductAvailability: (id: string) => Promise<{ error?: string }>;
  toggleProductFeatured: (id: string) => Promise<{ error?: string }>;
  saveCategory: (data: Omit<Category, 'id' | 'store_id'> & { id?: string }) => Promise<{ error?: string }>;
  deleteCategory: (id: string) => Promise<{ error?: string }>;
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'store_id' | 'status' | 'created_at'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  resetDemoData: () => void;
}

const CatalogContext = createContext<CatalogContextData | null>(null);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [store, setStore] = useState<Store>(() => loadStorage(KEYS.STORE, INITIAL_STORE));
  const [categories, setCategories] = useState<Category[]>(() =>
    loadStorage(KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadStorage(KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadStorage(KEYS.ORDERS, INITIAL_ORDERS)
  );
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [usingRemoteDb, setUsingRemoteDb] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(!isSupabaseConfigured);

  const loadRemoteData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const [sRes, cRes, pRes, oRes] = await Promise.all([
        supabase.from('stores').select('*').limit(1),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      if (!sRes.error && sRes.data && sRes.data.length > 0) {
        const remoteStore = sRes.data[0] as Store;
        setStore({
          ...remoteStore,
          delivery_fee: Number(remoteStore.delivery_fee ?? 0),
          min_order_value: Number(remoteStore.min_order_value ?? 0),
        });
        setUsingRemoteDb(true);
      }

      if (!cRes.error && cRes.data && cRes.data.length > 0) {
        setCategories(cRes.data as Category[]);
      }

      if (!pRes.error && pRes.data) {
        setProducts(
          (pRes.data as Product[]).map((item) => ({
            ...item,
            price: Number(item.price),
            promo_price: item.promo_price !== null ? Number(item.promo_price) : null,
          }))
        );
      }

      if (!oRes.error && oRes.data) {
        setOrders(
          (oRes.data as Order[]).map((ord) => ({
            ...ord,
            subtotal: Number(ord.subtotal),
            delivery_fee: Number(ord.delivery_fee),
            total: Number(ord.total),
          }))
        );
      }
    } catch {
      // Fallback para dados locais
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    loadRemoteData();

    const realtimeChannel = supabase
      .channel('catalog-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () =>
        loadRemoteData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () =>
        loadRemoteData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () =>
        loadRemoteData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () =>
        loadRemoteData()
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase?.removeChannel(realtimeChannel);
    };
  }, [loadRemoteData]);

  // Sincroniza abas abertas quando em modo local
  useEffect(() => {
    const onStorageChange = () => {
      setStore(loadStorage(KEYS.STORE, INITIAL_STORE));
      setCategories(loadStorage(KEYS.CATEGORIES, INITIAL_CATEGORIES));
      setProducts(loadStorage(KEYS.PRODUCTS, INITIAL_PRODUCTS));
      setOrders(loadStorage(KEYS.ORDERS, INITIAL_ORDERS));
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const updateStoreSettings = async (patch: Partial<Store>) => {
    const nextStore: Store = { ...store, ...patch, updated_at: new Date().toISOString() };
    setStore(nextStore);
    localStorage.setItem(KEYS.STORE, JSON.stringify(nextStore));

    if (supabase && usingRemoteDb) {
      const { error } = await supabase
        .from('stores')
        .update({
          name: nextStore.name,
          subtitle: nextStore.subtitle,
          logo_url: nextStore.logo_url,
          banner_url: nextStore.banner_url,
          whatsapp_number: nextStore.whatsapp_number,
          delivery_fee: nextStore.delivery_fee,
          estimated_time: nextStore.estimated_time,
          min_order_value: nextStore.min_order_value,
          address: nextStore.address,
          is_open: nextStore.is_open,
          updated_at: nextStore.updated_at,
        })
        .eq('id', store.id);
      if (error && user) return { error: error.message };
    }
    return {};
  };

  const toggleStoreOpen = async () => updateStoreSettings({ is_open: !store.is_open });

  const saveProduct = async (
    data: Omit<Product, 'id' | 'store_id'> & { id?: string }
  ) => {
    const isEditing = Boolean(data.id);
    const id = data.id || crypto.randomUUID();
    const record: Product = {
      id,
      store_id: store.id || DEFAULT_STORE_ID,
      category_id: data.category_id,
      name: data.name.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      promo_price:
        data.promo_price && Number(data.promo_price) > 0 ? Number(data.promo_price) : null,
      image_url: data.image_url.trim(),
      is_available: data.is_available,
      is_featured: data.is_featured,
      updated_at: new Date().toISOString(),
    };

    const nextList = isEditing
      ? products.map((p) => (p.id === id ? record : p))
      : [record, ...products];

    setProducts(nextList);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(nextList));

    if (supabase && usingRemoteDb) {
      const query = isEditing
        ? supabase.from('products').update(record).eq('id', id)
        : supabase.from('products').insert([record]);
      const { error } = await query;
      if (error && user) return { error: error.message };
    }
    return {};
  };

  const deleteProduct = async (id: string) => {
    const nextList = products.filter((p) => p.id !== id);
    setProducts(nextList);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(nextList));

    if (supabase && usingRemoteDb) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error && user) return { error: error.message };
    }
    return {};
  };

  const toggleProductAvailability = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return {};
    return saveProduct({ ...prod, is_available: !prod.is_available });
  };

  const toggleProductFeatured = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return {};
    return saveProduct({ ...prod, is_featured: !prod.is_featured });
  };

  const saveCategory = async (
    data: Omit<Category, 'id' | 'store_id'> & { id?: string }
  ) => {
    const isEditing = Boolean(data.id);
    const id = data.id || crypto.randomUUID();
    const record: Category = {
      id,
      store_id: store.id || DEFAULT_STORE_ID,
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: data.icon || 'utensils',
      sort_order: Number(data.sort_order) || categories.length + 1,
    };

    const nextList = isEditing
      ? categories.map((c) => (c.id === id ? record : c))
      : [...categories, record].sort((a, b) => a.sort_order - b.sort_order);

    setCategories(nextList);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(nextList));

    if (supabase && usingRemoteDb) {
      const query = isEditing
        ? supabase.from('categories').update(record).eq('id', id)
        : supabase.from('categories').insert([record]);
      const { error } = await query;
      if (error && user) return { error: error.message };
    }
    return {};
  };

  const deleteCategory = async (id: string) => {
    if (products.some((p) => p.category_id === id)) {
      return {
        error: 'Remova ou altere a categoria dos produtos vinculados antes de excluí-la.',
      };
    }
    const nextList = categories.filter((c) => c.id !== id);
    setCategories(nextList);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(nextList));

    if (supabase && usingRemoteDb) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error && user) return { error: error.message };
    }
    return {};
  };

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'order_number' | 'store_id' | 'status' | 'created_at'>
  ): Promise<Order> => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      order_number: orderNumber,
      store_id: store.id || DEFAULT_STORE_ID,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(nextOrders));

    if (supabase && usingRemoteDb) {
      await supabase.from('orders').insert([newOrder]);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const nextOrders = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(nextOrders);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(nextOrders));

    if (supabase && usingRemoteDb) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
  };

  const deleteOrder = async (orderId: string) => {
    const nextOrders = orders.filter((o) => o.id !== orderId);
    setOrders(nextOrders);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(nextOrders));

    if (supabase && usingRemoteDb) {
      await supabase.from('orders').delete().eq('id', orderId);
    }
  };

  const resetDemoData = () => {
    setStore(INITIAL_STORE);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    localStorage.setItem(KEYS.STORE, JSON.stringify(INITIAL_STORE));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  };

  return (
    <CatalogContext.Provider
      value={{
        store,
        categories,
        products,
        orders,
        loading,
        isSupabaseMode: usingRemoteDb,
        isRealtimeConnected,
        updateStoreSettings,
        toggleStoreOpen,
        saveProduct,
        deleteProduct,
        toggleProductAvailability,
        toggleProductFeatured,
        saveCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        resetDemoData,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export function useCatalog(): CatalogContextData {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog precisa estar dentro de CatalogProvider');
  return ctx;
}
