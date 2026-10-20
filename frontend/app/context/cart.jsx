import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "examplatform.cart";
const CartContext = createContext(null);

function readCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("examplatform:cart"));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);

    function sync() {
      setItems(readCart());
    }
    window.addEventListener("storage", sync);
    window.addEventListener("examplatform:cart", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("examplatform:cart", sync);
    };
  }, []);

  function add(packageItem) {
    if (!packageItem?.id) return;
    setItems((current) => {
      if (current.some((item) => item.id === packageItem.id)) return current;
      const next = [
        ...current,
        {
          id: packageItem.id,
          title: packageItem.title,
          slug: packageItem.slug,
          description: packageItem.description,
          price: Number(packageItem.price) || 0,
          level: packageItem.level,
        },
      ];
      persist(next);
      return next;
    });
  }

  function remove(packageId) {
    setItems((current) => {
      const next = current.filter((item) => item.id !== packageId);
      persist(next);
      return next;
    });
  }

  function clear() {
    setItems([]);
    persist([]);
  }

  function has(packageId) {
    return items.some((item) => item.id === packageId);
  }

  const subtotal = useMemo(
    () => Math.round(items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) * 100) / 100,
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.length,
      subtotal,
      add,
      remove,
      clear,
      has,
    }),
    [items, ready, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
