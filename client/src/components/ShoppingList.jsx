import { useState, useEffect } from "react";
import "./ShoppingList.css";

const INITIAL_SHOPPING_ITEMS = [
  { id: "item-1", name: "Extra Virgin Olive Oil", quantity: "1 bottle", completed: false },
  { id: "item-2", name: "Organic Eggs", quantity: "1 dozen", completed: false },
  { id: "item-3", name: "Sourdough Bread", quantity: "1 loaf", completed: true },
  { id: "item-4", name: "Fresh Spinach", quantity: "200g", completed: false },
];

let itemCounter = 100;
function createShoppingItem(name, quantity = "") {
  itemCounter += 1;
  return {
    id: `item-${Date.now()}-${itemCounter}`,
    name,
    quantity,
    completed: false,
  };
}

export default function ShoppingList({ onTabChange }) {
  // Shopping items stored in React state with localStorage persistence
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("pantrypal_shopping_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback to initial items on error
    }
    return INITIAL_SHOPPING_ITEMS;
  });

  const [nameInput, setNameInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");

  // Keep localStorage synchronized whenever items state changes
  useEffect(() => {
    try {
      localStorage.setItem("pantrypal_shopping_list", JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  // Derived metrics
  const totalItems = items.length;
  const remainingCount = items.filter((item) => !item.completed).length;
  const completedCount = totalItems - remainingCount;

  // Add a new shopping item
  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    setItems((prev) => [createShoppingItem(trimmedName, qtyInput.trim()), ...prev]);
    setNameInput("");
    setQtyInput("");
  };

  // Toggle item checkbox (checked/unchecked)
  const handleToggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Delete an individual item
  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all completed items
  const handleClearCompleted = () => {
    setItems((prev) => prev.filter((item) => !item.completed));
  };

  // Quick-add sample item via data attribute
  const handleQuickAddClick = (e) => {
    const staple = e.currentTarget.dataset.staple;
    if (!staple) return;
    setItems((prev) => [createShoppingItem(staple), ...prev]);
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
              placeholder="Qty (optional, e.g. 500g, 2 packs)"
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

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="shopping-empty-box" role="status">
            <div className="empty-icon" aria-hidden="true">
              🛒
            </div>
            <h2 className="empty-title">Your shopping list is empty</h2>
            <p className="empty-desc">
              All caught up! Add ingredients or essentials you need to buy on your next grocery run.
            </p>
            <button
              type="button"
              className="add-btn"
              onClick={() => {
                setItems(INITIAL_SHOPPING_ITEMS);
              }}
            >
              Load Sample List
            </button>
          </div>
        )}

        {/* List of Items */}
        {totalItems > 0 && (
          <ul className="shopping-items-list" aria-label="Shopping items">
            {items.map((item) => (
              <li
                key={item.id}
                className={`shopping-item-row ${item.completed ? "completed" : ""}`}
              >
                <div className="item-left">
                  <label className="item-checkbox-label">
                    <input
                      type="checkbox"
                      className="item-checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleItem(item.id)}
                      aria-label={`Mark ${item.name} as ${item.completed ? "incomplete" : "complete"}`}
                    />
                  </label>

                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    {item.quantity && (
                      <span className="item-quantity-pill">{item.quantity}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="item-delete-btn"
                  onClick={() => handleDeleteItem(item.id)}
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
