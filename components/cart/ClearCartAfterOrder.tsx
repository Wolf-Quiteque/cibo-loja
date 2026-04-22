"use client";

import { useEffect } from "react";
import { useCart } from "./cart-store";

export function ClearCartAfterOrder() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
