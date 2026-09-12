import { useState } from "react";
import "./Navbar.css";

export default function Navbar({
  activeTab = "inventory",
  onTabChange,
  onAddItem,
  onSearch,
  searchQuery = "",
  expiringCount = 3,
  notificationsCount = 2,
}) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const isControlled = onSearch !== undefined;
  const currentSearch = isControlled ? searchQuery : internalSearchQuery;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: "inventory", label: "Inventory", icon: "inventory" },
    {
      id: "expiring",
      label: "Expiring Soon",
      icon: "alert",
      badge: expiringCount > 0 ? expiringCount : null,
      badgeType: "warning",
    },
    { id: "recipes", label: "Recipe Ideas", icon: "recipe" },
    { id: "shopping", label: "Shopping List", icon: "shopping" },
  ];

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    if (!isControlled) {
      setInternalSearchQuery(query);
    }
    if (onSearch) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    if (!isControlled) {
      setInternalSearchQuery("");
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <header className="pantry-navbar-container">
      <nav className="pantry-navbar" aria-label="Main Navigation">
        {/* Brand Logo */}
        <div className="navbar-left">
          <button
            className="navbar-brand-btn"
            onClick={() => handleTabClick("inventory")}
            title="PantryPal Home"
          >
            <div className="navbar-logo-icon">
              {/* Fresh Leaf / Pantry Basket SVG Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="logo-svg"
              >
                <path
                  d="M12 3V6M8.5 4.5L10 6.5M15.5 4.5L14 6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 10C4 8.89543 4.89543 8 6 8H18C19.1046 8 20 8.89543 20 10V10.5C20 15.5 16.5 20 12 20C7.5 20 4 15.5 4 10.5V10Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 13C9.5 14.5 10.5 15.5 12 15.5C13.5 15.5 14.5 14.5 15 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="navbar-brand-text">
              <span className="brand-name">
                Pantry<span className="brand-highlight">Pal</span>
              </span>
              <span className="brand-badge">Smart Tracker</span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="navbar-center">
          <div className="search-bar">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search groceries, ingredients..."
              value={currentSearch}
              onChange={handleSearchChange}
              aria-label="Search pantry items"
            />
            {currentSearch ? (
              <button
                className="search-clear-btn"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : (
              <span className="search-shortcut">⌘K</span>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link-btn ${isActive ? "active" : ""}`}
                onClick={() => handleTabClick(item.id)}
              >
                {/* SVG Icons based on item */}
                {item.icon === "inventory" && (
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                )}

                {item.icon === "alert" && (
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                )}

                {item.icon === "recipe" && (
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M17.66 12.34l1.41-1.41M12 22a7 7 0 0 0 7-7c0-2-1.2-3-2-4.5-.8-1.5-1-2.5-1-4.5H8c0 2-.2 3-1 4.5-.8 1.5-2 2.5-2 4.5a7 7 0 0 0 7 7z" />
                  </svg>
                )}

                {item.icon === "shopping" && (
                  <svg
                    className="nav-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                )}

                <span>{item.label}</span>

                {item.badge && (
                  <span className={`nav-badge ${item.badgeType || ""}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Actions & Add Item */}
        <div className="navbar-right">
          {/* Notifications button */}
          <div className="notification-wrapper">
            <button
              className="icon-action-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              title="Notifications"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificationsCount > 0 && (
                <span className="notification-dot"></span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <span className="notif-title">Pantry Alerts</span>
                  <span className="notif-badge">{expiringCount} urgent</span>
                </div>
                <ul className="notifications-list">
                  <li className="notif-item urgent">
                    <span className="notif-icon">⚠️</span>
                    <div>
                      <p className="notif-text">Whole Milk expires in 2 days</p>
                      <span className="notif-time">Dairy • 1L</span>
                    </div>
                  </li>
                  <li className="notif-item">
                    <span className="notif-icon">🥬</span>
                    <div>
                      <p className="notif-text">Spinach expiring tomorrow</p>
                      <span className="notif-time">Produce • 200g</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Add Item Primary CTA */}
          <button
            className="add-item-btn"
            onClick={onAddItem}
            title="Add Grocery Item"
          >
            <svg
              className="btn-plus-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Item</span>
          </button>

          {/* User Profile Avatar */}
          <button
            className="user-profile-btn"
            title="My Pantry Profile"
            aria-label="User Profile"
          >
            <div className="avatar-circle">
              <span>PP</span>
            </div>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          {/* Mobile Search */}
          <div className="mobile-search">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search groceries..."
              value={currentSearch}
              onChange={handleSearchChange}
            />
          </div>

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-item ${
                  currentTab === item.id ? "active" : ""
                }`}
                onClick={() => handleTabClick(item.id)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeType || ""}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Add Item Action */}
          <button
            className="mobile-add-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onAddItem) onAddItem();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Grocery
          </button>
        </div>
      )}
    </header>
  );
}
