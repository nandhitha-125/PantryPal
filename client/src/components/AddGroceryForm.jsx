import { useState, useEffect, useCallback } from "react";
import "./AddGroceryForm.css";

const CATEGORIES = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Poultry",
  "Seafood",
  "Bakery",
  "Pantry & Grains",
  "Canned Goods",
  "Snacks & Sweets",
  "Beverages",
  "Frozen Foods",
  "Condiments & Spices",
  "Other",
];

const UNITS = [
  "pcs",
  "kg",
  "g",
  "lbs",
  "oz",
  "L",
  "ml",
  "pack",
  "box",
  "can",
  "bottle",
  "bunch",
];

const initialFormState = {
  name: "",
  category: "",
  quantity: "",
  unit: "pcs",
  expiryDate: "",
};

export default function AddGroceryForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    resetForm();
    if (onClose) onClose();
  }, [loading, onClose, resetForm]);

  // Close modal on Escape key press and manage scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Please enter a grocery name.");
      return;
    }
    if (!formData.category) {
      setError("Please select a category.");
      return;
    }
    const numQuantity = Number(formData.quantity);
    if (!formData.quantity || isNaN(numQuantity) || numQuantity <= 0) {
      setError("Please provide a valid quantity greater than 0.");
      return;
    }
    if (!formData.unit.trim()) {
      setError("Please specify a unit.");
      return;
    }
    if (!formData.expiryDate) {
      setError("Please pick an expiry date.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      quantity: numQuantity,
      unit: formData.unit.trim(),
      expiryDate: formData.expiryDate,
    };

    try {
      const response = await fetch("http://localhost:5000/api/groceries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to add grocery item.");
      }

      // Success: reset form, notify parent, close modal
      resetForm();
      if (onSuccess) onSuccess(data);
      if (onClose) onClose();
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Please verify the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-grocery-title"
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-text">
            <div className="modal-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="badge-icon"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>New Item</span>
            </div>
            <h2 id="add-grocery-title" className="modal-title">
              Add to Pantry
            </h2>
            <p className="modal-subtitle">
              Fill in the item details to track stock and freshness.
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
            title="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-error-banner" role="alert">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="error-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-grocery-form" noValidate>
          {/* Grocery Name */}
          <div className="form-group">
            <label htmlFor="grocery-name" className="form-label">
              Grocery Name <span className="required-star">*</span>
            </label>
            <input
              id="grocery-name"
              type="text"
              name="name"
              placeholder="e.g., Whole Milk, Avocados, Greek Yogurt"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              autoFocus
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="grocery-category" className="form-label">
              Category <span className="required-star">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="grocery-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                className="form-select"
                required
              >
                <option value="" disabled>
                  Select a category...
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="select-arrow" aria-hidden="true">
                ▾
              </span>
            </div>
          </div>

          {/* Quantity and Unit in 2 columns */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="grocery-quantity" className="form-label">
                Quantity <span className="required-star">*</span>
              </label>
              <input
                id="grocery-quantity"
                type="number"
                name="quantity"
                placeholder="e.g., 2"
                min="0.1"
                step="any"
                value={formData.quantity}
                onChange={handleChange}
                disabled={loading}
                className="form-input"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="grocery-unit" className="form-label">
                Unit <span className="required-star">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="grocery-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <span className="select-arrow" aria-hidden="true">
                  ▾
                </span>
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="form-group">
            <label htmlFor="grocery-expiry" className="form-label">
              Expiry Date <span className="required-star">*</span>
            </label>
            <input
              id="grocery-expiry"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              disabled={loading}
              className="form-input date-input"
              required
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  <span>Adding Item...</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="submit-icon"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Add Grocery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
