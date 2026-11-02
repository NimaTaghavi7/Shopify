"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart,
  clearCart,
  getCart,
  getErrorMessage,
  removeCartItem,
  updateCartItem,
  type Cart,
} from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";

type CartStatus = "idle" | "loading" | "ready" | "error";

interface CartContextValue {
  cart: Cart | null;
  /** تعداد کل محصولات سبد برای نمایش در هدر. */
  count: number;
  status: CartStatus;
  error: string;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<CartStatus>("idle");
  const [error, setError] = useState("");

  // فقط پاسخ آخرین درخواست در state ثبت می‌شود تا پاسخ قدیمی، سبد جدید را بازنویسی نکند.
  const latestRequest = useRef(0);

  const applyOperation = useCallback(async (operation: () => Promise<Cart>) => {
    const requestId = ++latestRequest.current;
    const result = await operation();

    if (requestId === latestRequest.current) {
      setCart(result);
      setStatus("ready");
      setError("");
    }
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++latestRequest.current;

    setStatus((current) => (current === "ready" ? current : "loading"));

    try {
      const result = await getCart();

      if (requestId === latestRequest.current) {
        setCart(result);
        setStatus("ready");
        setError("");
      }
    } catch (err) {
      if (requestId === latestRequest.current) {
        setStatus("error");
        setError(getErrorMessage(err, "دریافت سبد خرید ناموفق بود."));
      }
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      void refresh();
    } else if (authStatus === "guest") {
      latestRequest.current += 1;
      setCart(null);
      setStatus("idle");
      setError("");
    }
  }, [authStatus, refresh]);

  const addItem = useCallback(
    (productId: number, quantity: number) =>
      applyOperation(() => addToCart(productId, quantity)),
    [applyOperation],
  );

  const updateItem = useCallback(
    (productId: number, quantity: number) =>
      applyOperation(() => updateCartItem(productId, quantity)),
    [applyOperation],
  );

  const removeItem = useCallback(
    (productId: number) => applyOperation(() => removeCartItem(productId)),
    [applyOperation],
  );

  const clear = useCallback(
    () =>
      applyOperation(async () => {
        await clearCart();
        return getCart();
      }),
    [applyOperation],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.totalItems ?? 0,
      status,
      error,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, status, error, refresh, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart باید داخل CartProvider استفاده شود.");
  }

  return context;
}
