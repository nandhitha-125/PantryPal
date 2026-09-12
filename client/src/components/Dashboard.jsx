import { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Dashboard({ refreshKey = 0, onEdit, onDeleteSuccess }) {
  // 1. State for groceries, loading status, and error messages
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // 2. Fetch groceries from Express API
  const fetchGroceries = () => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:5000/api/groceries")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} (${response.statusText})`);
        }
        return response.json();
      })
      .then((data) => {
        setGroceries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.message || "Failed to connect to the server. Please ensure the backend is running."
        );
        setLoading(false);
      });
  };

  // 3. useEffect to fetch on initial component mount and when refreshKey updates
  useEffect(() => {
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
          setGroceries(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.message || "Failed to connect to the server. Please ensure the backend is running."
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // 4. Handle Delete grocery item
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

  // 5. Calculate Summary Metrics from the live groceries array
  const totalItems = groceries.length;

  const totalCategories = new Set(
    groceries.map((item) => item.category?.trim()).filter(Boolean)
  ).size;

  // Calculate items expiring within the next 3 days
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const threeDaysFromNow = new Date(startOfToday);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  threeDaysFromNow.setHours(23, 59, 59, 999);

  const expiringSoonCount = groceries.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry <= threeDaysFromNow;
  }).length;

  // Helper to determine expiry badge color and label
  const getExpiryStatus = (expiryDateString) => {
    if (!expiryDateString) {
      return { status: "fresh", label: "Fresh" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDateString);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "urgent", label: "Expired" };
    } else if (diffDays === 0) {
      return { status: "urgent", label: "Expires Today" };
    } else if (diffDays <= 3) {
      return { status: "expiring", label: `${diffDays}d left` };
    } else {
      return { status: "fresh", label: "Fresh" };
    }
  };

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

        <div className="summary-card warning-card">
          <div className="summary-icon warning-icon" aria-hidden="true">
            ⚠️
          </div>
          <div className="summary-content">
            <span className="summary-label">Expiring Soon</span>
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
          <div>
            <h2 id="groceries-heading" className="groceries-title">
              Your Groceries
            </h2>
            <p className="groceries-subtitle">
              Current ingredients and expiry tracking
            </p>
          </div>
          <button
            type="button"
            className="view-all-btn"
            aria-label="View all grocery items"
          >
            View All
          </button>
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

        {/* Empty State Message */}
        {!loading && !error && groceries.length === 0 && (
          <div className="dashboard-status-box empty-box">
            <p>No groceries found in your pantry yet. Add some items to get started!</p>
          </div>
        )}

        {/* Live Groceries Table */}
        {!loading && !error && groceries.length > 0 && (
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
                {groceries.map((item) => {
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
