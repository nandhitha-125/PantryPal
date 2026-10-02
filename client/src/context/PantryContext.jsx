import { useState, useEffect, useCallback, useMemo } from "react";
import { PantryContext } from "./pantryContextDef";
import { useAuth } from "./useAuth";
import { API } from "../utils/api";
import { isExpiringSoon, getExpiryStatus } from "../utils/expiryUtils";

const DEMO_GROCERIES = [
  {
    _id: "demo-1",
    name: "Organic Baby Spinach",
    category: "Produce",
    quantity: 200,
    unit: "g",
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-2",
    name: "Greek Whole Milk",
    category: "Dairy & Eggs",
    quantity: 1,
    unit: "L",
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-3",
    name: "Artisan Sourdough",
    category: "Bakery",
    quantity: 1,
    unit: "pcs",
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-4",
    name: "Roma Tomatoes",
    category: "Produce",
    quantity: 500,
    unit: "g",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-5",
    name: "Garlic Cloves",
    category: "Produce",
    quantity: 3,
    unit: "pcs",
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-6",
    name: "Aged Cheddar Cheese",
    category: "Dairy & Eggs",
    quantity: 250,
    unit: "g",
    expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-7",
    name: "Extra Virgin Olive Oil",
    category: "Pantry & Grains",
    quantity: 750,
    unit: "ml",
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "demo-8",
    name: "Plain Greek Yogurt",
    category: "Dairy & Eggs",
    quantity: 500,
    unit: "g",
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function PantryProvider({ children }) {
  const { token } = useAuth();

  const [groceries, setGroceries] = useState([]);
  const [loadingGroceries, setLoadingGroceries] = useState(true);
  const [groceriesError, setGroceriesError] = useState(null);
  const [isOfflineDemo, setIsOfflineDemo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Global search input state (shared between topbar and active page)
  const [globalSearch, setGlobalSearch] = useState("");

  // Helper to build auth headers
  const authHeaders = useCallback(() => {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Fetch inventory from Express MongoDB backend with fast timeout
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    fetch(API.GROCERIES, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error(`Server returned ${res.status} (${res.statusText})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const items = Array.isArray(data) ? data : [];
          setGroceries(items);
          setIsOfflineDemo(false);
          setGroceriesError(null);
          setLoadingGroceries(false);
          localStorage.setItem("pantrypal_groceries", JSON.stringify(items));
        }
      })
      .catch((err) => {
        if (isMounted) {
          clearTimeout(timeoutId);
          // Check localStorage or use rich demo defaults
          const cached = localStorage.getItem("pantrypal_groceries");
          let fallback = DEMO_GROCERIES;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                fallback = parsed;
              }
            } catch {
              fallback = DEMO_GROCERIES;
            }
          }
          setGroceries(fallback);
          setIsOfflineDemo(true);
          setGroceriesError(
            err.name === "AbortError"
              ? "MongoDB Atlas request timed out. Please check your Atlas Network Access whitelist (0.0.0.0/0)."
              : err.message || "Failed to connect to backend server."
          );
          setLoadingGroceries(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [refreshKey, token]);

  const refreshGroceries = useCallback(() => {
    setLoadingGroceries(true);
    setGroceriesError(null);
    setRefreshKey((k) => k + 1);
  }, []);

  // Compute live expiring soon count (<= 3 days)
  const expiringCount = useMemo(() => {
    if (!Array.isArray(groceries)) return 0;
    return groceries.filter((item) => isExpiringSoon(item.expiryDate)).length;
  }, [groceries]);

  // Compute live expired count
  const expiredCount = useMemo(() => {
    if (!Array.isArray(groceries)) return 0;
    return groceries.filter((item) => {
      const status = getExpiryStatus(item.expiryDate);
      return status.label === "Expired";
    }).length;
  }, [groceries]);

  // List of urgent expiring items for notifications
  const urgentItems = useMemo(() => {
    if (!Array.isArray(groceries)) return [];
    return groceries
      .filter((item) => isExpiringSoon(item.expiryDate))
      .slice(0, 5);
  }, [groceries]);

  // Modal actions
  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleGrocerySaved = useCallback(() => {
    refreshGroceries();
    closeModal();
  }, [refreshGroceries, closeModal]);

  // Delete action with graceful offline fallback
  const deleteGroceryItem = useCallback(
    async (item) => {
      if (!item || !item._id) return;
      try {
        const res = await fetch(`${API.GROCERIES}/${item._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          refreshGroceries();
          return;
        }
      } catch {
        // Fallback for offline / demo mode
      }

      setGroceries((prev) => {
        const updated = prev.filter((i) => i._id !== item._id);
        localStorage.setItem("pantrypal_groceries", JSON.stringify(updated));
        return updated;
      });
    },
    [refreshGroceries, token]
  );

  // Save (Create or Update) with graceful offline fallback
  const saveGroceryItem = useCallback(
    async (payload, isEdit, id) => {
      const url = isEdit
        ? `${API.GROCERIES}/${id}`
        : API.GROCERIES;
      const method = isEdit ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const saved = await res.json();
          refreshGroceries();
          closeModal();
          return saved;
        }
      } catch {
        // Fallback for offline / demo mode
      }

      // Local update
      if (isEdit) {
        setGroceries((prev) => {
          const updated = prev.map((i) =>
            i._id === id ? { ...i, ...payload } : i
          );
          localStorage.setItem("pantrypal_groceries", JSON.stringify(updated));
          return updated;
        });
      } else {
        const newItem = { ...payload, _id: `local-${Date.now()}` };
        setGroceries((prev) => {
          const updated = [newItem, ...prev];
          localStorage.setItem("pantrypal_groceries", JSON.stringify(updated));
          return updated;
        });
      }

      closeModal();
    },
    [refreshGroceries, closeModal, authHeaders]
  );

  const value = useMemo(
    () => ({
      groceries,
      loadingGroceries,
      groceriesError,
      isOfflineDemo,
      refreshGroceries,
      expiringCount,
      expiredCount,
      urgentItems,
      isAddModalOpen,
      editingItem,
      openAddModal,
      openEditModal,
      closeModal,
      handleGrocerySaved,
      deleteGroceryItem,
      saveGroceryItem,
      globalSearch,
      setGlobalSearch,
      token,
    }),
    [
      groceries,
      loadingGroceries,
      groceriesError,
      isOfflineDemo,
      refreshGroceries,
      expiringCount,
      expiredCount,
      urgentItems,
      isAddModalOpen,
      editingItem,
      openAddModal,
      openEditModal,
      closeModal,
      handleGrocerySaved,
      deleteGroceryItem,
      saveGroceryItem,
      globalSearch,
      setGlobalSearch,
      token,
    ]
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export default PantryProvider;
