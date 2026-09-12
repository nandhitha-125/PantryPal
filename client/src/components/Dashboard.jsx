import { useState, useEffect, useMemo, useCallback } from "react";
import { getExpiryStatus, isExpiringSoon } from "../utils/expiryUtils";
import "./Dashboard.css";

export default function Dashboard({
  refreshKey = 0,
  searchQuery = "",
  onSearchChange,
  activeTab = "inventory",
  onTabChange,
  onExpiringCountChange,
  onEdit,
  onDeleteSuccess,
  groceries: propGroceries,
  loading: propLoading,
  error: propError,
  onRetry: propRetry,
}) {
  // 1. State for groceries, loading status, and error messages
  const isControlled = propGroceries !== undefined;
  const [internalGroceries, setInternalGroceries] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState(null);

  const groceries = isControlled ? propGroceries : internalGroceries;
  const loading = propLoading !== undefined ? propLoading : internalLoading;
  const error = propError !== undefined ? propError : internalError;

  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const isExpiringFilterActive = activeTab === "expiring";

  // Notify parent component (Navbar) of the real expiring count using actual grocery data
  const updateExpiringCount = useCallback(
    (items) => {
      if (onExpiringCountChange && Array.isArray(items)) {
        const count = items.filter((item) => isExpiringSoon(item.expiryDate)).length;
        onExpiringCountChange(count);
      }
    },
    [onExpiringCountChange]
  );

  // 2. Fetch groceries from Express API
  const fetchGroceries = () => {
    if (propRetry) {
      propRetry();
      return;
    }

    setInternalLoading(true);
    setInternalError(null);

    fetch("http://localhost:5000/api/groceries")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} (${response.statusText})`);
        }
        return response.json();
      })
      .then((data) => {
        setInternalGroceries(data);
        setInternalLoading(false);
        updateExpiringCount(data);
      })
      .catch((err) => {
        setInternalError(
          err.message || "Failed to connect to the server. Please ensure the backend is running."
        );
        setInternalLoading(false);
      });
  };

  // 3. useEffect to fetch on initial component mount and when refreshKey updates
  useEffect(() => {
    if (isControlled) {
      updateExpiringCount(groceries);
      return;
    }

    let isMounted = true;

    fetch("http://localhost:5000/api/groceries")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} (${response.statusText})`);
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setInternalGroceries(data);
          setInternalLoading(false);
          updateExpiringCount(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setInternalError(
            err.message || "Failed to connect to the server. Please ensure the backend is running."
          );
          setInternalLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey, updateExpiringCount, isControlled, groceries]);

  // 4. Extract unique categories present in the grocery data
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set();
    groceries.forEach((item) => {
      if (item.category && item.category.trim()) {
        categoriesSet.add(item.category.trim());
      }
    });
    return [
      "All Categories",
      ...Array.from(categoriesSet).sort((a, b) => a.localeCompare(b)),
    ];
  }, [groceries]);

  // Fall back to "All Categories" if selected category is no longer present in inventory
  const activeCategory = availableCategories.includes(selectedCategory)
    ? selectedCategory
    : "All Categories";

  // 5. Combined filtering: case-insensitive search by name + category filter + expiring soon filter
  const filteredGroceries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return groceries.filter((item) => {
      const matchesSearch = query
        ? (item.name || "").toLowerCase().includes(query)
        : true;
      const matchesCategory =
        activeCategory === "All Categories"
          ? true
          : (item.category || "").trim().toLowerCase() ===
            activeCategory.toLowerCase();
      const matchesExpiry = isExpiringFilterActive
        ? isExpiringSoon(item.expiryDate)
        : true;

      return matchesSearch && matchesCategory && matchesExpiry;
    });
  }, [groceries, searchQuery, activeCategory, isExpiringFilterActive]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || activeCategory !== "All Categories" || isExpiringFilterActive
  );

  const handleClearFilters = () => {
    setSelectedCategory("All Categories");
    if (onSearchChange) {
      onSearchChange("");
    }
    if (onTabChange) {
      onTabChange("inventory");
    }
  };

  // 6. Handle Delete grocery item
  const handleDeleteItem = async (item) => {
    if (!item || !item._id) {
      setActionError("Invalid grocery identifier. Cannot delete item.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}" from your pantry?`
    );
    if (!confirmed) return;

    setDeletingId(item._id);
    setActionError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/groceries/${item._id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to delete grocery item.");
      }

      // Refresh Dashboard using the existing refreshKey architecture
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        fetchGroceries();
      }
    } catch (err) {
      setActionError(
        err.message || "Failed to delete item. Please verify the backend is running on port 5000."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // 7. Calculate Summary Metrics from the FULL live groceries array (preserves actual inventory totals)
  const totalItems = groceries.length;

  const totalCategories = new Set(
    groceries.map((item) => item.category?.trim()).filter(Boolean)
  ).size;

  // Calculate items expiring within the next 3 days using the unified expiry logic
  const expiringSoonCount = useMemo(
    () => groceries.filter((item) => isExpiringSoon(item.expiryDate)).length,
    [groceries]
  );

  // Helper to format date cleanly (e.g., "Sep 15")
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-container">
      {/* 1. Welcome Section */}
      <section className="dashboard-welcome" aria-labelledby="welcome-heading">
        <h1 id="welcome-heading" className="welcome-title">
          Good morning! 👋
        </h1>
        <p className="welcome-subtitle">Here's what's in your pantry</p>
      </section>

      {/* 2. Summary Cards with dynamic metrics */}
      <section className="summary-cards" aria-label="Pantry Summary">
        <div className="summary-card">
          <div className="summary-icon total-icon" aria-hidden="true">
            📦
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Items</span>
            <span className="summary-value">{totalItems}</span>
          </div>
        </div>

        <div
          className={`summary-card warning-card clickable-card ${
            isExpiringFilterActive ? "active-filter-card" : ""
          }`}
          onClick={() =>
            onTabChange &&
            onTabChange(isExpiringFilterActive ? "inventory" : "expiring")
          }
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTabChange &&
                onTabChange(isExpiringFilterActive ? "inventory" : "expiring");
            }
          }}
          aria-label={
            isExpiringFilterActive
              ? "Expiring Soon filter active. Click to view all inventory"
              : "Click to filter inventory by items expiring soon"
          }
          title={
            isExpiringFilterActive
              ? "Expiring Soon filter active (click to show all)"
              : "Click to filter items expiring soon"
          }
        >
          <div className="summary-icon warning-icon" aria-hidden="true">
            ⚠️
          </div>
          <div className="summary-content">
            <span className="summary-label">
              Expiring Soon {isExpiringFilterActive ? "• Active" : ""}
            </span>
            <span className="summary-value warning-text">{expiringSoonCount}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon category-icon" aria-hidden="true">
            🏷️
          </div>
          <div className="summary-content">
            <span className="summary-label">Categories</span>
            <span className="summary-value">{totalCategories}</span>
          </div>
        </div>
      </section>

      {/* 3. Your Groceries Section */}
      <section className="groceries-section" aria-labelledby="groceries-heading">
        <div className="groceries-header">
          <div className="groceries-header-info">
            <h2 id="groceries-heading" className="groceries-title">
              Your Groceries
            </h2>
            <p className="groceries-subtitle">
              {hasActiveFilters ? (
                <>
                  Showing <strong>{filteredGroceries.length}</strong> of {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"}
                  {isExpiringFilterActive && (
                    <button
                      type="button"
                      className="filter-chip filter-chip-warning"
                      onClick={() => onTabChange && onTabChange("inventory")}
                      title="Remove expiring soon filter"
                      aria-label="Remove expiring soon filter"
                    >
                      <span>⚠️ Expiring Soon</span>
                      <span className="filter-chip-remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  )}
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      className="filter-chip"
                      onClick={() => onSearchChange && onSearchChange("")}
                      title="Remove search filter"
                      aria-label="Remove search filter"
                    >
                      <span>Search: &ldquo;{searchQuery.trim()}&rdquo;</span>
                      <span className="filter-chip-remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  )}
                  {activeCategory !== "All Categories" && (
                    <button
                      type="button"
                      className="filter-chip"
                      onClick={() => setSelectedCategory("All Categories")}
                      title="Remove category filter"
                      aria-label="Remove category filter"
                    >
                      <span>Category: {activeCategory}</span>
                      <span className="filter-chip-remove" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  )}
                </>
              ) : (
                "Current ingredients and expiry tracking"
              )}
            </p>
          </div>

          <div className="groceries-controls">
            {/* Category Filter Dropdown */}
            <div className="category-filter-group">
              <label htmlFor="category-filter-select" className="filter-label">
                Category:
              </label>
              <div className="category-filter-wrapper">
                <select
                  id="category-filter-select"
                  className="category-filter-select"
                  value={activeCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter groceries by category"
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <span className="filter-select-arrow" aria-hidden="true">
                  ▾
                </span>
              </div>
            </div>

            {/* Clear Filters / View All Button */}
            {hasActiveFilters ? (
              <button
                type="button"
                className="view-all-btn clear-filter-btn"
                onClick={handleClearFilters}
                aria-label="Clear active search, category, and expiry filters"
                title="Reset all active filters"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                className="view-all-btn"
                onClick={handleClearFilters}
                aria-label="View all grocery items"
              >
                View All
              </button>
            )}
          </div>
        </div>

        {/* Action Error Banner (e.g. Delete failure) */}
        {actionError && (
          <div className="dashboard-status-box error-box action-error-box" role="alert">
            <span className="error-icon" aria-hidden="true">
              ⚠️
            </span>
            <div className="error-content">
              <p className="error-title">Action Failed</p>
              <p className="error-desc">{actionError}</p>
            </div>
            <button
              type="button"
              className="retry-btn dismiss-btn"
              onClick={() => setActionError(null)}
              aria-label="Dismiss error message"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Message */}
        {loading && (
          <div className="dashboard-status-box loading-box">
            <div className="status-spinner" aria-hidden="true"></div>
            <p>Loading your pantry groceries...</p>
          </div>
        )}

        {/* Friendly Error Message */}
        {!loading && error && (
          <div className="dashboard-status-box error-box" role="alert">
            <span className="error-icon" aria-hidden="true">
              ⚠️
            </span>
            <div className="error-content">
              <p className="error-title">Unable to load groceries</p>
              <p className="error-desc">{error}</p>
            </div>
            <button
              type="button"
              className="retry-btn"
              onClick={fetchGroceries}
              aria-label="Retry loading groceries"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State: Pantry is completely empty */}
        {!loading && !error && groceries.length === 0 && (
          <div className="dashboard-status-box empty-box">
            <p>No groceries found in your pantry yet. Add some items to get started!</p>
          </div>
        )}

        {/* Empty State: Filter or search produced no results */}
        {!loading && !error && groceries.length > 0 && filteredGroceries.length === 0 && (
          <div className="dashboard-status-box empty-box filter-empty-box" role="status">
            <div className="empty-filter-icon" aria-hidden="true">
              {isExpiringFilterActive ? "🎉" : "🔍"}
            </div>
            <p className="empty-filter-title">
              {isExpiringFilterActive
                ? "No groceries expiring soon"
                : "No groceries found"}
            </p>
            <p className="empty-filter-desc">
              {isExpiringFilterActive
                ? searchQuery.trim() || activeCategory !== "All Categories"
                  ? "No expiring groceries match your current search or category filter. Try clearing filters to view all pantry items."
                  : "Great news! None of your pantry items are expired or expiring within the next 3 days."
                : "No items match your current search or category filter. Try changing your search query or selecting another category."}
            </p>
            <button
              type="button"
              className="retry-btn reset-filter-action-btn"
              onClick={handleClearFilters}
              aria-label="Clear all filters and view inventory"
            >
              {isExpiringFilterActive ? "View All Groceries" : "Clear Filters"}
            </button>
          </div>
        )}

        {/* Live Groceries Table */}
        {!loading && !error && filteredGroceries.length > 0 && (
          <div className="table-responsive">
            <table className="groceries-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Category</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Expiry Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="actions-header-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroceries.map((item) => {
                  const statusInfo = getExpiryStatus(item.expiryDate);
                  const isDeleting = deletingId === item._id;

                  return (
                    <tr key={item._id || item.id}>
                      <td className="item-name-cell">
                        <span className="item-name">{item.name}</span>
                      </td>
                      <td>
                        <span className="category-pill">{item.category}</span>
                      </td>
                      <td className="quantity-cell">
                        {item.quantity} {item.unit || ""}
                      </td>
                      <td className="expiry-cell">
                        {formatExpiryDate(item.expiryDate)}
                      </td>
                      <td>
                        <span className={`status-badge status-${statusInfo.status}`}>
                          <span className="status-dot"></span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => onEdit && onEdit(item)}
                            disabled={isDeleting}
                            aria-label={`Edit ${item.name}`}
                            title={`Edit ${item.name}`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="action-icon"
                              aria-hidden="true"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span className="action-label">Edit</span>
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteItem(item)}
                            disabled={isDeleting}
                            aria-label={`Delete ${item.name}`}
                            title={`Delete ${item.name}`}
                          >
                            {isDeleting ? (
                              <span className="action-spinner" aria-hidden="true"></span>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="action-icon"
                                aria-hidden="true"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            )}
                            <span className="action-label">
                              {isDeleting ? "Deleting..." : "Delete"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
