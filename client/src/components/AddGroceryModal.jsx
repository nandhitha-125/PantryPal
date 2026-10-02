import { useState, useEffect } from "react";
import { usePantry } from "../context/usePantry";
import "./AddGroceryModal.css";

const CATEGORIES = [
  "Produce",
  "Fruits & Vegetables",
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

const formatDateForInput = (dateVal) => {
  if (!dateVal) return "";
  if (typeof dateVal === "string" && dateVal.includes("T")) {
    return dateVal.split("T")[0];
  }
  if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

function GroceryModalForm({ editingItem, isEdit, closeModal, saveGroceryItem }) {
  const [formData, setFormData] = useState(() => ({
    name: editingItem?.name || "",
    category: editingItem?.category || "",
    quantity: editingItem?.quantity !== undefined ? editingItem.quantity : "",
    unit: editingItem?.unit || "pcs",
    expiryDate: formatDateForInput(editingItem?.expiryDate),
  }));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter the grocery item name.");
      return;
    }
    if (!formData.category) {
      setErrorMessage("Please select a category.");
      return;
    }
    const numQty = parseFloat(formData.quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMessage("Please enter a valid positive quantity.");
      return;
    }
    if (!formData.expiryDate) {
      setErrorMessage("Please select an expiration date.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name: trimmedName,
      category: formData.category,
      quantity: numQty,
      unit: formData.unit || "pcs",
      expiryDate: new Date(formData.expiryDate).toISOString(),
    };

    try {
      await saveGroceryItem(payload, isEdit, editingItem?._id);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save grocery. Please check backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-card"
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="modal-title"
    >
      {/* Modal Header */}
      <div className="modal-header">
        <div className="modal-title-group">
          <h2 id="modal-title" className="modal-title">
            {isEdit ? "Edit Grocery Item" : "Add New Grocery"}
          </h2>
          <p className="modal-subtitle">
            {isEdit
              ? "Update item details and expiration timeline"
              : "Record an ingredient in your pantry inventory"}
          </p>
        </div>
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeModal}
          aria-label="Close dialog"
          disabled={submitting}
        >
          ✕
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="modal-error-banner" role="alert">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="modal-form" noValidate>
        {/* Item Name */}
        <div className="form-group">
          <label htmlFor="modal-item-name" className="form-label">
            Item Name <span className="req-star">*</span>
          </label>
          <input
            id="modal-item-name"
            name="name"
            type="text"
            className="form-input"
            placeholder="e.g., Organic Spinach, Sourdough Bread..."
            value={formData.name}
            onChange={handleChange}
            autoFocus
            disabled={submitting}
            required
          />
        </div>

        {/* Category Dropdown */}
        <div className="form-group">
          <label htmlFor="modal-item-category" className="form-label">
            Category <span className="req-star">*</span>
          </label>
          <select
            id="modal-item-category"
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="" disabled>Select category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Quantity and Unit in 2 columns */}
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="modal-item-qty" className="form-label">
              Quantity <span className="req-star">*</span>
            </label>
            <input
              id="modal-item-qty"
              name="quantity"
              type="number"
              min="0"
              step="1"
              className="form-input"
              placeholder="e.g. 12"
              value={formData.quantity}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-item-unit" className="form-label">
              Unit
            </label>
            <select
              id="modal-item-unit"
              name="unit"
              className="form-select"
              value={formData.unit}
              onChange={handleChange}
              disabled={submitting}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expiration Date */}
        <div className="form-group">
          <label htmlFor="modal-item-expiry" className="form-label">
            Expiration Date <span className="req-star">*</span>
          </label>
          <input
            id="modal-item-expiry"
            name="expiryDate"
            type="date"
            className="form-input"
            value={formData.expiryDate}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          <span className="input-hint">
            We track shelf-life and notify you before groceries spoil.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel-modal"
            onClick={closeModal}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-pantry-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="btn-spinner"></span>
                <span>Saving...</span>
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "🌿 Add to Pantry"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddGroceryModal() {
  const { isAddModalOpen, editingItem, closeModal, saveGroceryItem } = usePantry();

  const isEdit = Boolean(editingItem && editingItem._id);

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    if (!isAddModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isAddModalOpen, closeModal]);

  if (!isAddModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={closeModal} role="dialog" aria-modal="true">
      <GroceryModalForm
        key={editingItem?._id || "new"}
        editingItem={editingItem}
        isEdit={isEdit}
        closeModal={closeModal}
        saveGroceryItem={saveGroceryItem}
      />
    </div>
  );
}
