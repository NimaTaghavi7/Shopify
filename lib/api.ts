
import type {
  CategoriesResponse,
  ProductsResponse,
} from "@/types/shop";

const API_BASE_URL = "https://practice.amirm.me";

interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  inStock?: boolean;
  sort?: "newest" | "price" | "-price";
  page?: number;
  limit?: number;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCategories(): Promise<CategoriesResponse> {
  return request<CategoriesResponse>(
    `${API_BASE_URL}/categories`
  );
}

export async function getProducts(
  params: GetProductsParams = {}
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.minPrice !== undefined && params.minPrice !== "") {
    searchParams.set("minPrice", String(params.minPrice));
  }

  if (params.maxPrice !== undefined && params.maxPrice !== "") {
    searchParams.set("maxPrice", String(params.maxPrice));
  }

  if (params.inStock !== undefined) {
    searchParams.set("inStock", String(params.inStock));
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  const url = `${API_BASE_URL}/products${query ? `?${query}` : ""}`;

  return request<ProductsResponse>(url);
}

export function getImageUrl(image: string): string {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}
