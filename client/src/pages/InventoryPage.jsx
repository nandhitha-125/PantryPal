import { useState, useMemo } from "react";
import { usePantry } from "../context/usePantry";
import { getExpiryStatus } from "../utils/expiryUtils";
import "./InventoryPage.css";

export default function InventoryPage() {
  const {
    groceries,
    loadingGroceries,
    groceriesError,
    isOfflineDemo,
    refreshGroceries,
    openAddModal,
    openEditModal,
    deleteGroceryItem,
    expiringCount,
    globalSearch,
    setGlobalSearch,
  } = usePantry();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [localSearch, setLocalSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Combine global search with local page search
  const effectiveSearch = localSearch || globalSearch;

  // Extract all unique categories present in inventory
  const availableCategories = useMemo(() => {
    const set = new Set();
    groceries.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [groceries]);

  // Combined filtered groceries
  const filteredGroceries = useMemo(() => {
    const q = effectiveSearch.trim().toLowerCase();
    return groceries.filter((item) => {
      const matchName = q ? (item.name || "").toLowerCase().includes(q) : true;
      const matchCat =
        selectedCategory === "All"
          ? true
          : (item.category || "").trim().toLowerCase() ===
            selectedCategory.toLowerCase();
      return matchName && matchCat;
    });
  }, [groceries, effectiveSearch, selectedCategory]);

  const totalItems = groceries.length;
  const totalCategories = availableCategories.filter((c) => c !== "All").length;

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setLocalSearch("");
    setGlobalSearch("");
  };

  const handleDelete = async (item) => {
    if (!item || !item._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove "${item.name}" from your pantry?`
    );
    if (!confirmed) return;

    setDeletingId(item._id);
    setActionError(null);

    try {
      await deleteGroceryItem(item);
    } catch (err) {
      setActionError(err.message || "Failed to delete item from inventory.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="inventory-page animate-fade-in">
      {/* 1. Page Header matching Reference design */}
      <div className="inventory-header">
        <div className="inventory-title-group">
          <h1 className="inventory-title display-title">Pantry Inventory</h1>
          <p className="inventory-subtitle">
            Manage your pantry stock, track expiration dates, and monitor fresh ingredients
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openAddModal}
          title="Add Grocery Item"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add New Grocery</span>
        </button>
      </div>

      {/* 2. Summary Metrics Bar */}
      <div className="metrics-strip">
        <div className="metric-box">
          <span className="metric-label">Total Groceries</span>
          <span className="metric-value">{totalItems}</span>
          <span className="metric-sub">Active items in stock</span>
        </div>

        <div className="metric-box warning-border">
          <span className="metric-label">Expiring Soon</span>
          <span className="metric-value text-warning">{expiringCount}</span>
          <span className="metric-sub">Within next 3 days</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Categories</span>
          <span className="metric-value">{totalCategories}</span>
          <span className="metric-sub">Stock departments</span>
        </div>
      </div>

      {/* 3. Filter & Search Controls Toolbar */}
      <div className="inventory-toolbar">
        <div className="toolbar-search">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by grocery name..."
            value={effectiveSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setGlobalSearch(e.target.value);
            }}
            aria-label="Search groceries by name"
          />
          {effectiveSearch && (
            <button
              type="button"
              className="toolbar-search-clear"
              onClick={handleClearFilters}
              aria-label="Clear filter search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills / Dropdown */}
        <div className="toolbar-category-select-wrapper">
          <label htmlFor="inventory-cat-select" className="sr-only">Category</label>
          <select
            id="inventory-cat-select"
            className="toolbar-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <span className="select-caret" aria-hidden="true">▾</span>
        </div>

        {(effectiveSearch || selectedCategory !== "All") && (
          <button
            type="button"
            className="btn-clear-filters"
            onClick={handleClearFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="error-banner" role="alert">
          <span>⚠️ {actionError}</span>
          <button type="button" onClick={() => setActionError(null)}>Dismiss</button>
        </div>
      )}

      {/* Offline / Demo Notice Banner */}
      {isOfflineDemo && (
        <div className="offline-notice-banner">
          <div className="offline-notice-content">
            <span className="offline-badge">DEMO / OFFLINE PREVIEW</span>
            <span>
              Connected to local storage preview. If your MongoDB Atlas cluster is active, make sure your IP is whitelisted (<code>0.0.0.0/0</code>) in Atlas Network Access.
            </span>
          </div>
          <button type="button" className="btn-retry-notice" onClick={refreshGroceries}>
            Retry MongoDB
          </button>
        </div>
      )}

      {/* 4. Loading State */}
      {loadingGroceries && (
        <div className="inventory-status-card">
          <span className="spinner"></span>
          <p>Connecting to pantry inventory...</p>
        </div>
      )}

      {/* Backend Connection Error (shown when no items available) */}
      {!loadingGroceries && groceriesError && totalItems === 0 && (
        <div className="inventory-status-card error-card">
          <p className="status-title">Unable to Connect to Server</p>
          <p className="status-desc">{groceriesError}</p>
          <button type="button" className="btn-primary" onClick={refreshGroceries}>
            Retry Connection
          </button>
        </div>
      )}

      {/* 5. Empty State: No items at all in database */}
      {!loadingGroceries && totalItems === 0 && !groceriesError && (
        <div className="inventory-status-card empty-card">
          <div className="empty-icon-box">📦</div>
          <p className="status-title">Your Pantry is Empty</p>
          <p className="status-desc">
            Get started by adding your first ingredients, staples, or groceries.
          </p>
          <button type="button" className="btn-primary" onClick={openAddModal}>
            + Add First Grocery Item
          </button>
        </div>
      )}

      {/* Empty State: Search/Filter match 0 items */}
      {!loadingGroceries && totalItems > 0 && filteredGroceries.length === 0 && (
        <div className="inventory-status-card empty-card">
          <p className="status-title">No Matching Groceries Found</p>
          <p className="status-desc">
            No items matched &ldquo;{effectiveSearch}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
          </p>
          <button type="button" className="btn-outline" onClick={handleClearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* 6. Desktop Enterprise Table (Directly adapted from Reference Screenshot) */}
      {!loadingGroceries && filteredGroceries.length > 0 && (
        <>
          <div className="table-wrapper desktop-only">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th scope="col">Item Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Expiry Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroceries.map((item) => {
                  const status = getExpiryStatus(item.expiryDate);
                  const isDeleting = deletingId === item._id;

                  return (
                    <tr key={item._id}>
                      <td className="item-name-cell">
                        <span className="item-avatar-icon">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </span>
                        <span className="item-title-text">{item.name}</span>
                      </td>

                      <td>
                        <span className="category-tag">{item.category}</span>
                      </td>

                      <td className="qty-cell">
                        {item.quantity} <span className="unit-text">{item.unit || "pcs"}</span>
                      </td>

                      <td className="date-cell">
                        {formatDate(item.expiryDate)}
                      </td>

                      <td>
                        <span className={`badge badge-${status.status}`}>
                          <span className="status-dot"></span>
                          {status.label}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className="actions-cluster">
                          {/* EDIT Button Matching Reference */}
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => openEditModal(item)}
                            disabled={isDeleting}
                            title="Edit grocery item"
                          >
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>EDIT</span>
                          </button>

                          {/* DELETE Button Matching Reference */}
                          <button
                            type="button"
                            className="btn-outline danger"
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting}
                            title="Delete grocery item"
                          >
                            {isDeleting ? (
                              <span className="spinner" style={{ width: 12, height: 12 }}></span>
                            ) : (
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            )}
                            <span>DELETE</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 7. Mobile-Responsive Cards (Eliminates horizontal scrolling on phones) */}
          <div className="mobile-cards-list mobile-only">
            {filteredGroceries.map((item) => {
              const status = getExpiryStatus(item.expiryDate);
              const isDeleting = deletingId === item._id;

              return (
                <div key={item._id} className="grocery-mobile-card">
                  <div className="mobile-card-header">
                    <span className="mobile-item-title">{item.name}</span>
                    <span className={`badge badge-${status.status}`}>
                      <span className="status-dot"></span>
                      {status.label}
                    </span>
                  </div>

                  <div className="mobile-card-meta">
                    <span className="category-tag">{item.category}</span>
                    <span className="mobile-card-qty">
                      {item.quantity} {item.unit || "pcs"}
                    </span>
                    <span className="mobile-card-expiry">
                      Exp: {formatDate(item.expiryDate)}
                    </span>
                  </div>

                  <div className="mobile-card-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => openEditModal(item)}
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-outline danger"
                      onClick={() => handleDelete(item)}
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
