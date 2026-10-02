import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { API } from "../utils/api";
import "./ShoppingListPage.css";

const DEFAULT_SHOPPING_ITEMS = [
  { _id: "shop-demo-1", name: "Avocados (Hass)", quantity: 3, completed: false },
  { _id: "shop-demo-2", name: "Almond Milk (Unsweetened)", quantity: 1, completed: true },
  { _id: "shop-demo-3", name: "Whole Wheat Penne Pasta", quantity: 2, completed: false },
  { _id: "shop-demo-4", name: "Fresh Basil Leaves", quantity: 1, completed: false },
];

export default function ShoppingListPage() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineDemo, setIsOfflineDemo] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [nameInput, setNameInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");

  const refreshItems = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    fetch(API.SHOPPING, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const loaded = Array.isArray(data) ? data : [];
          setItems(loaded);
          setIsOfflineDemo(false);
          setError(null);
          setLoading(false);
          localStorage.setItem("pantrypal_shopping", JSON.stringify(loaded));
        }
      })
      .catch((err) => {
        if (isMounted) {
          clearTimeout(timeoutId);
          setError(err.message || "Failed to connect to database");
          const cached = localStorage.getItem("pantrypal_shopping");
          let fallback = DEFAULT_SHOPPING_ITEMS;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                fallback = parsed;
              }
            } catch {
              fallback = DEFAULT_SHOPPING_ITEMS;
            }
          }
          setItems(fallback);
          setIsOfflineDemo(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [refreshKey, token]);

  const totalCount = items.length;
  const remainingCount = items.filter((i) => !i.completed).length;
  const completedCount = totalCount - remainingCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setActionError(null);
    const parsedQty = parseFloat(qtyInput.trim());
    const payload = {
      name: trimmed,
      quantity: !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1,
      completed: false,
    };

    try {
      const res = await fetch(API.SHOPPING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedItem = await res.json();
        setItems((prev) => {
          const next = [savedItem, ...prev];
          localStorage.setItem("pantrypal_shopping", JSON.stringify(next));
          return next;
        });
        setNameInput("");
        setQtyInput("");
        return;
      }
    } catch {
      // Local fallback
    }

    const localItem = { ...payload, _id: `shop-local-${Date.now()}` };
    setItems((prev) => {
      const next = [localItem, ...prev];
      localStorage.setItem("pantrypal_shopping", JSON.stringify(next));
      return next;
    });
    setNameInput("");
    setQtyInput("");
  };

  // Optimistic Toggle Checkbox
  const handleToggleItem = async (id, currentCompleted) => {
    setActionError(null);
    const targetState = !currentCompleted;

    setItems((prev) => {
      const next = prev.map((i) => (i._id === id ? { ...i, completed: targetState } : i));
      localStorage.setItem("pantrypal_shopping", JSON.stringify(next));
      return next;
    });

    try {
      await fetch(`${API.SHOPPING}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: targetState }),
      });
    } catch {
      // Keep local state
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    setActionError(null);
    setItems((prev) => {
      const next = prev.filter((i) => i._id !== id);
      localStorage.setItem("pantrypal_shopping", JSON.stringify(next));
      return next;
    });

    try {
      await fetch(`${API.SHOPPING}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Keep local state
    }
  };

  // Clear Completed
  const handleClearCompleted = async () => {
    const completedItems = items.filter((i) => i.completed);
    if (completedItems.length === 0) return;

    const confirmed = window.confirm(
      `Clear ${completedItems.length} purchased item${completedItems.length > 1 ? "s" : ""}?`
    );
    if (!confirmed) return;

    setActionError(null);
    setItems((prev) => {
      const next = prev.filter((i) => !i.completed);
      localStorage.setItem("pantrypal_shopping", JSON.stringify(next));
      return next;
    });

    try {
      for (const item of completedItems) {
        await fetch(`${API.SHOPPING}/${item._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Local state already updated
    }
  };


  return (
    <div className="shopping-page animate-fade-in">
      {/* Header */}
      <div className="shopping-header">
        <div className="shopping-title-group">
          <h1 className="shopping-title display-title">Shopping List</h1>
          <p className="shopping-subtitle">
            Plan your groceries, tick off purchased staples, and keep your pantry restocked
          </p>
        </div>

        {completedCount > 0 && (
          <button
            type="button"
            className="btn-outline"
            onClick={handleClearCompleted}
            title="Remove completed items"
          >
            Clear Completed ({completedCount})
          </button>
        )}
      </div>

      {/* Offline / Demo Notice */}
      {isOfflineDemo && (
        <div className="offline-notice-banner">
          <div className="offline-notice-content">
            <span className="offline-badge">DEMO / OFFLINE PREVIEW</span>
            <span>
              Connected to local storage preview. If your MongoDB Atlas cluster is active, make sure your IP is whitelisted (<code>0.0.0.0/0</code>) in Atlas Network Access.
            </span>
          </div>
          <button type="button" className="btn-retry-notice" onClick={refreshItems}>
            Retry MongoDB
          </button>
        </div>
      )}

      {/* Progress Bar Strip */}
      {totalCount > 0 && (
        <div className="progress-card">
          <div className="progress-info">
            <span className="progress-label">
              <strong>{remainingCount}</strong> item{remainingCount !== 1 ? "s" : ""} remaining
            </span>
            <span className="progress-pct">{progressPercent}% complete</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      {/* Add Item Form Bar */}
      <form onSubmit={handleAddItem} className="add-item-bar">
        <input
          type="text"
          className="input-item-name"
          placeholder="Add an item (e.g. Sourdough bread, Oat milk)..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          required
        />
        <input
          type="number"
          step="any"
          min="1"
          className="input-item-qty"
          placeholder="Qty (1)"
          value={qtyInput}
          onChange={(e) => setQtyInput(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          + Add Item
        </button>
      </form>

      {/* Error notification */}
      {actionError && (
        <div className="shopping-error-alert" role="alert">
          <span>⚠️ {actionError}</span>
          <button type="button" onClick={() => setActionError(null)}>✕</button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="shopping-status-card">
          <span className="spinner"></span>
          <p>Syncing shopping list from database...</p>
        </div>
      )}

      {/* Error state (only when no items loaded) */}
      {!loading && error && totalCount === 0 && (
        <div className="shopping-status-card error-card">
          <p className="status-title">Unable to Connect to Shopping List</p>
          <p className="status-desc">{error}</p>
          <button type="button" className="btn-primary" onClick={refreshItems}>
            Retry
          </button>
        </div>
      )}

      {/* Empty List state */}
      {!loading && totalCount === 0 && !error && (
        <div className="shopping-status-card empty-card">
          <div className="empty-cart-icon">🛒</div>
          <p className="status-title">Your Shopping List is Clear</p>
          <p className="status-desc">
            Add groceries above, or use &ldquo;Add Missing to Shopping List&rdquo; inside Recipe Ideas.
          </p>
        </div>
      )}

      {/* Shopping Items List */}
      {!loading && totalCount > 0 && (
        <div className="shopping-list-card">
          <ul className="shopping-items-list">
            {items.map((item) => (
              <li
                key={item._id}
                className={`shopping-row ${item.completed ? "row-completed" : ""}`}
              >
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item._id, item.completed)}
                    className="item-checkbox"
                  />
                  <span className="checkbox-custom">
                    {item.completed && "✓"}
                  </span>
                  <span className="item-name-text">{item.name}</span>
                </label>

                <div className="row-right">
                  <span className="item-qty-badge">
                    qty: {item.quantity || 1}
                  </span>
                  <button
                    type="button"
                    className="btn-delete-item"
                    onClick={() => handleDeleteItem(item._id)}
                    title={`Delete ${item.name}`}
                    aria-label={`Delete ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
