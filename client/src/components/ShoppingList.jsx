import { useState, useEffect, useCallback } from "react";
import "./ShoppingList.css";

export default function ShoppingList({ onTabChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [nameInput, setNameInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");

  // Fetch shopping items from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetch("http://localhost:5000/api/shopping", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status} (${res.statusText})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== "AbortError") {
          setError(err.message || "Failed to load shopping list.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:5000/api/shopping")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status} (${res.statusText})`);
        }
        return res.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load shopping list.");
        setLoading(false);
      });
  }, []);

  // Derived metrics
  const totalItems = items.length;
  const remainingCount = items.filter((item) => !item.completed).length;
  const completedCount = totalItems - remainingCount;

  // Add a new shopping item to MongoDB
  const handleAddItem = async (e) => {
    if (e) e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    setActionError(null);
    const payload = { name: trimmedName, completed: false };
    const parsedQty = Number(qtyInput.trim());
    if (qtyInput.trim() !== "" && !isNaN(parsedQty)) {
      payload.quantity = parsedQty;
    }

    try {
      const response = await fetch("http://localhost:5000/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add item to shopping list.");
      }

      const savedItem = await response.json();
      setItems((prev) => [savedItem, ...prev]);
      setNameInput("");
      setQtyInput("");
    } catch (err) {
      setActionError(err.message || "Failed to add item. Please try again.");
    }
  };

  // Toggle item completed status via PUT
  const handleToggleItem = async (id, currentCompleted) => {
    setActionError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/shopping/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update item.");
      }

      const updatedItem = await response.json();
      setItems((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
    } catch (err) {
      setActionError(err.message || "Failed to update item status.");
    }
  };

  // Delete an individual item via DELETE
  const handleDeleteItem = async (id) => {
    setActionError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/shopping/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete item.");
      }

      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setActionError(err.message || "Failed to delete item.");
    }
  };

  // Clear all completed items via existing DELETE API
  const handleClearCompleted = async () => {
    setActionError(null);
    const completedItems = items.filter((item) => item.completed);
    if (completedItems.length === 0) return;

    try {
      const deletePromises = completedItems.map(async (item) => {
        const res = await fetch(`http://localhost:5000/api/shopping/${item._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error(`Failed to delete completed item: ${item.name}`);
        }
      });

      await Promise.all(deletePromises);
      setItems((prev) => prev.filter((item) => !item.completed));
    } catch (err) {
      setActionError(err.message || "Failed to clear completed items.");
      handleRetry();
    }
  };

  // Quick-add sample item via data attribute
  const handleQuickAddClick = async (e) => {
    const staple = e.currentTarget.dataset.staple;
    if (!staple) return;

    setActionError(null);
    try {
      const response = await fetch("http://localhost:5000/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: staple, completed: false }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add staple.");
      }

      const savedItem = await response.json();
      setItems((prev) => [savedItem, ...prev]);
    } catch (err) {
      setActionError(err.message || "Failed to add staple item.");
    }
  };

  return (
    <div className="shopping-container">
      {/* 1. Header Section */}
      <section className="shopping-header" aria-labelledby="shopping-heading">
        <div className="shopping-title-row">
          <h1 id="shopping-heading" className="shopping-title">
            Shopping List 🛒
          </h1>
          {onTabChange && (
            <button
              type="button"
              className="back-to-inventory-btn"
              onClick={() => onTabChange("inventory")}
              aria-label="Back to Pantry Inventory"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Inventory</span>
            </button>
          )}
        </div>
        <p className="shopping-subtitle">
          Keep track of ingredients and household essentials to buy for your pantry
        </p>
      </section>

      {/* Action Error Alert */}
      {actionError && (
        <div className="shopping-action-error" role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Add Item Card */}
      <section className="shopping-add-card" aria-label="Add shopping item">
        <form onSubmit={handleAddItem} className="shopping-form">
          <label htmlFor="shopping-item-name" className="form-label">
            Add to Shopping List:
          </label>
          <div className="form-inputs-row">
            <input
              id="shopping-item-name"
              type="text"
              className="item-name-input"
              placeholder="Item name (e.g. Greek Yogurt, Avocados...)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              aria-label="Item name"
            />
            <input
              id="shopping-item-qty"
              type="text"
              className="item-qty-input"
              placeholder="Qty (optional, e.g. 2, 5)"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              aria-label="Item quantity"
            />
            <button
              type="submit"
              className="add-btn"
              disabled={!nameInput.trim()}
              aria-label="Add item to shopping list"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Item</span>
            </button>
          </div>

          {/* Quick-add suggestions */}
          <div className="quick-add-row">
            <span className="quick-add-label">Quick add:</span>
            {["Milk", "Eggs", "Bread", "Butter", "Garlic", "Bananas"].map((staple) => (
              <button
                key={staple}
                type="button"
                data-staple={staple}
                className="quick-chip"
                onClick={handleQuickAddClick}
                title={`Quickly add ${staple}`}
              >
                + {staple}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* 3. Shopping List Items Card */}
      <section className="shopping-list-card" aria-label="Shopping items list">
        {/* Toolbar: Counter + Clear Completed Button */}
        <div className="list-toolbar">
          <div className="list-count-badge">
            <span>
              {remainingCount === 1 ? "1 item remaining" : `${remainingCount} items remaining`}
            </span>
            {totalItems > 0 && (
              <span className="count-highlight">
                {completedCount} of {totalItems} completed
              </span>
            )}
          </div>

          <button
            type="button"
            className="clear-completed-btn"
            onClick={handleClearCompleted}
            disabled={completedCount === 0}
            aria-label="Clear completed items from shopping list"
            title={completedCount === 0 ? "No completed items to clear" : "Remove all checked items"}
          >
            Clear Completed ({completedCount})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="shopping-status-box shopping-loading-box">
            <div className="status-spinner" aria-hidden="true"></div>
            <p>Loading your shopping list...</p>
          </div>
        )}

        {/* Fetch Error State */}
        {!loading && error && (
          <div className="shopping-status-box shopping-error-box" role="alert">
            <span style={{ fontSize: "1.5rem" }} aria-hidden="true">
              ⚠️
            </span>
            <p style={{ fontWeight: 600, margin: 0 }}>Could not load shopping list</p>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{error}</p>
            <button type="button" className="retry-btn" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && totalItems === 0 && (
          <div className="shopping-empty-box" role="status">
            <div className="empty-icon" aria-hidden="true">
              🛒
            </div>
            <h2 className="empty-title">Your shopping list is empty</h2>
            <p className="empty-desc">
              All caught up! Add ingredients or essentials you need to buy on your next grocery run.
            </p>
          </div>
        )}

        {/* List of Items */}
        {!loading && !error && totalItems > 0 && (
          <ul className="shopping-items-list" aria-label="Shopping items">
            {items.map((item) => (
              <li
                key={item._id}
                className={`shopping-item-row ${item.completed ? "completed" : ""}`}
              >
                <div className="item-left">
                  <label className="item-checkbox-label">
                    <input
                      type="checkbox"
                      className="item-checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleItem(item._id, item.completed)}
                      aria-label={`Mark ${item.name} as ${item.completed ? "incomplete" : "complete"}`}
                    />
                  </label>

                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    {item.quantity !== null &&
                      item.quantity !== undefined &&
                      item.quantity !== "" && (
                        <span className="item-quantity-pill">{item.quantity}</span>
                      )}
                  </div>
                </div>

                <button
                  type="button"
                  className="item-delete-btn"
                  onClick={() => handleDeleteItem(item._id)}
                  aria-label={`Delete ${item.name} from list`}
                  title={`Delete ${item.name}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
