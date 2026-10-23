export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt?: string;
  _count?: { stockMovements: number };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minimumStock: number;
  unit: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  userId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdAt: string;
  product?: { id: string; name: string; sku: string; unit?: string };
  user?: { id: string; name: string };
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventoryValue: number;
  totalRetailValue: number;
}

export interface ChartData {
  date: string;
  in: number;
  out: number;
  adjustment: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ProductForm {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minimumStock: number;
  unit: string;
  image?: string;
}

export interface StockForm {
  productId: string;
  quantity: number;
  note?: string;
}

export interface CategoryForm {
  name: string;
  description?: string;
}

export interface UserForm {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
}
