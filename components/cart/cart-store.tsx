"use client";

import * as React from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
}

export interface CartState {
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  deliveryFee: number;
  items: CartItem[];
}

const EMPTY: CartState = {
  storeId: null,
  storeName: null,
  storeSlug: null,
  deliveryFee: 0,
  items: [],
};

const KEY = "cibo:cart";

type Action =
  | {
      type: "add";
      payload: {
        storeId: string;
        storeName: string;
        storeSlug: string;
        deliveryFee: number;
        item: Omit<CartItem, "qty">;
      };
    }
  | { type: "changeQty"; productId: string; delta: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "hydrate"; payload: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "clear":
      return EMPTY;
    case "add": {
      const { storeId, storeName, storeSlug, deliveryFee, item } = action.payload;
      if (state.storeId && state.storeId !== storeId) {
        const ok =
          typeof window !== "undefined" &&
          window.confirm(
            "O seu carrinho tem produtos de outra loja. Deseja esvaziar e adicionar desta loja?",
          );
        if (!ok) return state;
        return {
          storeId,
          storeName,
          storeSlug,
          deliveryFee,
          items: [{ ...item, qty: 1 }],
        };
      }
      const existing = state.items.find((i) => i.productId === item.productId);
      const items = existing
        ? state.items.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { ...item, qty: 1 }];
      return { storeId, storeName, storeSlug, deliveryFee, items };
    }
    case "changeQty": {
      const items = state.items
        .map((i) => (i.productId === action.productId ? { ...i, qty: i.qty + action.delta } : i))
        .filter((i) => i.qty > 0);
      if (items.length === 0) return EMPTY;
      return { ...state, items };
    }
    case "remove": {
      const items = state.items.filter((i) => i.productId !== action.productId);
      if (items.length === 0) return EMPTY;
      return { ...state, items };
    }
  }
}

interface CartContextValue {
  state: CartState;
  add: (payload: Extract<Action, { type: "add" }>["payload"]) => void;
  changeQty: (productId: string, delta: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  subtotal: number;
  totalQty: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function broadcast() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cibo:cart-change"));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, EMPTY);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", payload: JSON.parse(raw) as CartState });
    } catch {}
    hydrated.current = true;
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      broadcast();
    } catch {}
  }, [state]);

  const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = state.items.reduce((s, i) => s + i.qty, 0);

  const value: CartContextValue = {
    state,
    add: (p) => dispatch({ type: "add", payload: p }),
    changeQty: (productId, delta) => dispatch({ type: "changeQty", productId, delta }),
    remove: (productId) => dispatch({ type: "remove", productId }),
    clear: () => dispatch({ type: "clear" }),
    subtotal,
    totalQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
