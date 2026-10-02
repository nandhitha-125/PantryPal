import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePantry } from "../context/usePantry";
import { getExpiryStatus } from "../utils/expiryUtils";
import "./ExpiringSoonPage.css";

export default function ExpiringSoonPage() {
  const { groceries, loadingGroceries, openEditModal } = usePantry();
  const navigate = useNavigate();

  // Partition items into Expired and Expiring Within 3 Days
  const { expiredItems, expiringSoonItems } = useMemo(() => {
    const expired = [];
    const expiringSoon = [];

    groceries.forEach((item) => {
      const statusInfo = getExpiryStatus(item.expiryDate);
      if (statusInfo.label === "Expired") {
        expired.push({ ...item, statusInfo });
      } else if (statusInfo.status === "urgent" || statusInfo.status === "expiring") {
        expiringSoon.push({ ...item, statusInfo });
      }
    });

    return { expiredItems: expired, expiringSoonItems: expiringSoon };
  }, [groceries]);

  const totalUrgent = expiredItems.length + expiringSoonItems.length;

  const handleCookWithItem = (itemName) => {
    // Navigate to Recipe Ideas and pass this ingredient
    navigate("/app/recipes", { state: { searchIngredient: itemName } });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="expiring-page animate-fade-in">
      {/* Header */}
      <div className="expiring-header">
        <div className="expiring-title-group">
          <div className="header-badge-row">
            <h1 className="expiring-title display-title">Expiring Soon Watchlist</h1>
            {totalUrgent > 0 && (
              <span className="urgent-badge">{totalUrgent} Action Items</span>
            )}
          </div>
          <p className="expiring-subtitle">
            Keep food waste at zero by prioritizing meals with items approaching expiration
          </p>
        </div>

        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/app/inventory")}
        >
          ← Back to All Inventory
        </button>
      </div>

      {loadingGroceries && (
        <div className="expiring-card status-card">
          <span className="spinner"></span>
          <p>Analyzing pantry expiration dates...</p>
        </div>
      )}

      {/* Zero Expiring Items: Joyful celebration state */}
      {!loadingGroceries && totalUrgent === 0 && (
        <div className="expiring-card celebration-card">
          <div className="celebration-icon">🎉</div>
          <h2 className="celebration-title">Your Pantry is 100% Fresh!</h2>
          <p className="celebration-desc">
            No items are expired or expiring within the next 3 days. Your pantry rotation is on point!
          </p>
          <div className="celebration-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/app/recipes")}
            >
              Explore Recipe Ideas
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/app/inventory")}
            >
              View All Groceries
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      {!loadingGroceries && totalUrgent > 0 && (
        <div className="expiring-sections">
          {/* 1. Expired Items (If any) */}
          {expiredItems.length > 0 && (
            <section className="urgency-section" aria-labelledby="expired-heading">
              <div className="urgency-header danger-header">
                <span className="urgency-dot danger-dot">●</span>
                <h2 id="expired-heading" className="urgency-title">
                  Past Expiration ({expiredItems.length})
                </h2>
                <span className="urgency-hint">Please inspect before consuming</span>
              </div>

              <div className="urgency-grid">
                {expiredItems.map((item) => (
                  <div key={item._id} className="urgent-item-card danger-card">
                    <div className="card-top">
                      <div>
                        <h3 className="item-name">{item.name}</h3>
                        <span className="item-meta">{item.category} • {item.quantity} {item.unit}</span>
                      </div>
                      <span className="badge badge-urgent">Expired</span>
                    </div>

                    <div className="card-expiry-info">
                      <span className="date-text">Expired on: {formatDate(item.expiryDate)}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        type="button"
                        className="btn-card-action"
                        onClick={() => openEditModal(item)}
                      >
                        Update Date
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Expiring in Next 3 Days */}
          {expiringSoonItems.length > 0 && (
            <section className="urgency-section" aria-labelledby="soon-heading">
              <div className="urgency-header warning-header">
                <span className="urgency-dot warning-dot">●</span>
                <h2 id="soon-heading" className="urgency-title">
                  Expiring in Next 3 Days ({expiringSoonItems.length})
                </h2>
                <span className="urgency-hint">Great candidates for dinner tonight</span>
              </div>

              <div className="urgency-grid">
                {expiringSoonItems.map((item) => (
                  <div key={item._id} className="urgent-item-card warning-card">
                    <div className="card-top">
                      <div>
                        <h3 className="item-name">{item.name}</h3>
                        <span className="item-meta">{item.category} • {item.quantity} {item.unit}</span>
                      </div>
                      <span className="badge badge-expiring">
                        <span className="status-dot"></span>
                        {item.statusInfo.label}
                      </span>
                    </div>

                    <div className="card-expiry-info">
                      <span className="date-text">Expires on: {formatDate(item.expiryDate)}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        type="button"
                        className="btn-card-primary"
                        onClick={() => handleCookWithItem(item.name)}
                      >
                        🍳 Find Recipes with This
                      </button>
                      <button
                        type="button"
                        className="btn-card-action"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
