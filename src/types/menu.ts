export interface Category {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  brand?: string | null;
  model?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  product_flavors?: ProductFlavor[];
}

export interface ProductFlavor {
  id: string;
  product_id: string;
  flavor: string;
  quantity: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  flavor?: string;
  flavorId?: string;
  addons?: Addon[];
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  total: number;
  payment_method: string;
  notes: string | null;
  status: 'novo' | 'em_preparo' | 'finalizado' | 'cancelado';
  delivery_type: 'delivery' | 'retirada' | null;
  delivery_address: any | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp_number: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  default_message: string | null;
  delivery_fee: number | null;
  accepted_payment_methods: string[] | null;
  created_at: string;
  updated_at: string;
}
