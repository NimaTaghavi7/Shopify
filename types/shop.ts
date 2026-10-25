
export interface Category {
  id: number;
  slug: string;
  name: string;
  productCount: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  inStock: boolean;
  image: string;
  category: Category;
  created_at: string;
}

export interface CategoriesResponse {
  data: Category[];
}

export interface ProductsResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: "newest" | "price" | "-price";
}
