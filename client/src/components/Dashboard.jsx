import "./Dashboard.css";

// Temporary placeholder grocery data
const placeholderGroceries = [
  {
    id: 1,
    name: "Bread",
    category: "Bakery",
    quantity: "1 loaf",
    expiryDate: "Sep 10",
    status: "urgent", // Red: expired/urgent
    statusLabel: "Urgent",
  },
  {
    id: 2,
    name: "Tomato",
    category: "Produce",
    quantity: "5 pieces",
    expiryDate: "Sep 12",
    status: "expiring", // Yellow/Orange: expiring soon
    statusLabel: "Expiring Soon",
  },
  {
    id: 3,
    name: "Milk",
    category: "Dairy",
    quantity: "3 litres",
    expiryDate: "Sep 15",
    status: "fresh", // Green: fresh
    statusLabel: "Fresh",
  },
  {
    id: 4,
    name: "Eggs",
    category: "Dairy",
    quantity: "12 pieces",
    expiryDate: "Sep 20",
    status: "fresh", // Green: fresh
    statusLabel: "Fresh",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* 1. Welcome Section */}
      <section className="dashboard-welcome" aria-labelledby="welcome-heading">
        <h1 id="welcome-heading" className="welcome-title">
          Good morning! 👋
        </h1>
        <p className="welcome-subtitle">Here's what's in your pantry</p>
      </section>

      {/* 2. Summary Cards */}
      <section className="summary-cards" aria-label="Pantry Summary">
        <div className="summary-card">
          <div className="summary-icon total-icon" aria-hidden="true">
            📦
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Items</span>
            <span className="summary-value">12</span>
          </div>
        </div>

        <div className="summary-card warning-card">
          <div className="summary-icon warning-icon" aria-hidden="true">
            ⚠️
          </div>
          <div className="summary-content">
            <span className="summary-label">Expiring Soon</span>
            <span className="summary-value warning-text">3</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon category-icon" aria-hidden="true">
            🏷️
          </div>
          <div className="summary-content">
            <span className="summary-label">Categories</span>
            <span className="summary-value">4</span>
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

        {/* Responsive Table Wrapper */}
        <div className="table-responsive">
          <table className="groceries-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Category</th>
                <th scope="col">Quantity</th>
                <th scope="col">Expiry Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {placeholderGroceries.map((item) => (
                <tr key={item.id}>
                  <td className="item-name-cell">
                    <span className="item-name">{item.name}</span>
                  </td>
                  <td>
                    <span className="category-pill">{item.category}</span>
                  </td>
                  <td className="quantity-cell">{item.quantity}</td>
                  <td className="expiry-cell">{item.expiryDate}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      <span className="status-dot"></span>
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
