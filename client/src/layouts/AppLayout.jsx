import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePantry } from "../context/usePantry";
import { useAuth } from "../context/useAuth";
import AddGroceryModal from "../components/AddGroceryModal";
import AvatarRender from "../components/AvatarRender";
import AvatarPickerModal from "../components/AvatarPickerModal";
import "./AppLayout.css";

export default function AppLayout() {
  const {
    expiringCount,
    urgentItems,
    openAddModal,
    globalSearch,
    setGlobalSearch,
    groceries,
  } = usePantry();

  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const closeNavigation = () => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  };

  // Determine current page breadcrumb label
  const getPageTitle = () => {
    if (location.pathname.includes("/inventory")) return "Pantry Inventory";
    if (location.pathname.includes("/expiring")) return "Expiring Soon Watchlist";
    if (location.pathname.includes("/recipes")) return "Recipe Ideas";
    if (location.pathname.includes("/shopping-list")) return "Shopping List";
    return "Pantry Management";
  };

  return (
    <div className="app-shell">
      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <button
            type="button"
            className="brand-link"
            onClick={() => {
              closeNavigation();
              navigate("/");
            }}
            title="PantryPal Home"
          >
            <div className="brand-icon-box">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="brand-leaf-svg"
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
                  fillOpacity="0.18"
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
            <div className="brand-text">
              <span className="brand-title">Pantry<span className="brand-highlight">Pal</span></span>
              <span className="brand-tag">Food-Tech</span>
            </div>
          </button>
          
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeNavigation}
            aria-label="Close Side Panel"
            title="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" aria-label="Application Navigation">
          <div className="nav-section">
            <span className="nav-section-title">PANTRY MANAGEMENT</span>
            <ul className="nav-list">
              <li>
                <NavLink
                  to="/app/inventory"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="active-indicator" aria-hidden="true"></span>
                  <svg
                    className="nav-item-icon"
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
                  <span className="nav-item-label">Inventory</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/app/expiring"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="active-indicator" aria-hidden="true"></span>
                  <svg
                    className="nav-item-icon"
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
                  <span className="nav-item-label">Expiring Soon</span>
                  {expiringCount > 0 && (
                    <span className="nav-item-badge warning">{expiringCount}</span>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">DISCOVERY & TASKS</span>
            <ul className="nav-list">
              <li>
                <NavLink
                  to="/app/recipes"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="active-indicator" aria-hidden="true"></span>
                  <svg
                    className="nav-item-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M17.66 12.34l1.41-1.41M12 22a7 7 0 0 0 7-7c0-2-1.2-3-2-4.5-.8-1.5-1-2.5-1-4.5H8c0 2-.2 3-1 4.5-.8 1.5-2 2.5-2 4.5a7 7 0 0 0 7 7z" />
                  </svg>
                  <span className="nav-item-label">Recipe Ideas</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/app/shopping-list"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="active-indicator" aria-hidden="true"></span>
                  <svg
                    className="nav-item-icon"
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
                  <span className="nav-item-label">Shopping List</span>
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">ACCOUNT & PROFILE</span>
            <ul className="nav-list">
              <li>
                <NavLink
                  to="/app/profile"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    `nav-item-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="active-indicator" aria-hidden="true"></span>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}>
                    <AvatarRender avatarId={user?.avatarId || (user?.gender === "boy" ? "male_1" : "female_1")} size={20} />
                  </div>
                  <span className="nav-item-label">My Profile</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer Widget: Pantry Health */}
        <div className="sidebar-footer">
          <div className="pantry-health-card">
            <div className="pantry-health-header">
              <span className="health-title">Pantry Status</span>
              <span className="health-dot"></span>
            </div>
            <p className="health-stats">
              <strong>{groceries.length}</strong> items tracked
              {expiringCount > 0 ? ` • ${expiringCount} expiring soon` : " • All fresh"}
            </p>
            <button
              type="button"
              className="quick-add-sidebar-btn"
              onClick={openAddModal}
            >
              + Quick Add Grocery
            </button>
          </div>

          <div className="sidebar-landing-link-box">
            <NavLink to="/" onClick={closeNavigation} className="landing-back-link">
              ← Back to Landing Page
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 2. Main Content Layout (Top Header + Outlet) */}
      <div className="app-main-wrapper">
        {/* Top Header Navigation */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Side Panel Navigation"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="mobile-toggle-label">Menu</span>
            </button>

            {/* Breadcrumb path */}
            <div className="topbar-breadcrumb">
              <span className="crumb-root">Pantry</span>
              <span className="crumb-separator">/</span>
              <span className="crumb-current">{getPageTitle()}</span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="topbar-center">
            <div className="global-search-box">
              <svg
                className="search-svg"
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
                placeholder="Search pantry items..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                aria-label="Search pantry inventory"
              />
              {globalSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setGlobalSearch("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="topbar-right">
            {/* Urgent Notifications Bell */}
            <div className="notifications-container" ref={notifRef}>
              <button
                type="button"
                className="topbar-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View Expiry Notifications"
                title="Expiry Alerts"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {expiringCount > 0 && <span className="notification-badge"></span>}
              </button>

              {showNotifications && (
                <div className="notifications-menu">
                  <div className="notifications-header">
                    <span className="notif-heading">Expiry Watchlist</span>
                    <span className="notif-count-badge">
                      {expiringCount} urgent
                    </span>
                  </div>
                  {urgentItems.length === 0 ? (
                    <div className="notif-empty">
                      <span>✓ All items are currently fresh!</span>
                    </div>
                  ) : (
                    <ul className="notif-list">
                      {urgentItems.map((item) => (
                        <li key={item._id} className="notif-item">
                          <span className="notif-warning-icon">⚠️</span>
                          <div className="notif-info">
                            <span className="notif-item-name">{item.name}</span>
                            <span className="notif-item-meta">
                              {item.category} • {item.quantity} {item.unit}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="notif-footer">
                    <button
                      type="button"
                      className="notif-view-all"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/app/expiring");
                      }}
                    >
                      View All Expiring Items →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Add Grocery CTA (+ ADD NEW GROCERY - Matches Reference Button) */}
            <button
              type="button"
              className="btn-primary add-grocery-top-btn"
              onClick={openAddModal}
              title="Add grocery item to pantry"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Grocery</span>
            </button>

            {/* User Avatar Circle -> Navigates to User Profile */}
            <div
              className="user-avatar-badge"
              title={`${user?.name || "User"} — View Profile`}
              onClick={() => {
                closeNavigation();
                navigate("/app/profile");
              }}
              style={{ cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <AvatarRender
                avatarId={user?.avatarId || (user?.gender === "boy" ? "male_1" : "female_1")}
                size={34}
              />
            </div>
          </div>
        </header>

        {/* Route Content Area */}
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
        <NavLink
          to="/app/inventory"
          onClick={closeNavigation}
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="mobile-tab-label">Inventory</span>
        </NavLink>

        <NavLink
          to="/app/expiring"
          onClick={closeNavigation}
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? "active" : ""}`}
        >
          <div className="mobile-tab-icon-wrapper">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
            {expiringCount > 0 && <span className="mobile-tab-badge">{expiringCount}</span>}
          </div>
          <span className="mobile-tab-label">Expiring</span>
        </NavLink>

        <NavLink
          to="/app/recipes"
          onClick={closeNavigation}
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M17.66 12.34l1.41-1.41M12 22a7 7 0 0 0 7-7c0-2-1.2-3-2-4.5-.8-1.5-1-2.5-1-4.5H8c0 2-.2 3-1 4.5-.8 1.5-2 2.5-2 4.5a7 7 0 0 0 7 7z" />
          </svg>
          <span className="mobile-tab-label">Recipes</span>
        </NavLink>

        <NavLink
          to="/app/shopping-list"
          onClick={closeNavigation}
          className={({ isActive }) => `mobile-bottom-tab ${isActive ? "active" : ""}`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="mobile-tab-label">Shopping</span>
        </NavLink>

        <button
          type="button"
          className={`mobile-bottom-tab ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="mobile-tab-label">Side Panel</span>
        </button>
      </nav>

      {/* Global Add/Edit Modal */}
      <AddGroceryModal />
    </div>
  );
}
