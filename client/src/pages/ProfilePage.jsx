import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePantry } from "../context/usePantry";
import AvatarRender from "../components/AvatarRender";
import AvatarPickerModal from "../components/AvatarPickerModal";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { groceries, expiringCount, shoppingList } = usePantry();
  const navigate = useNavigate();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  const userAvatarId = user?.avatarId || (user?.gender === "boy" ? "male_1" : "female_1");

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      if (updateProfile) {
        await updateProfile({ name: nameInput.trim() });
      }
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
    }
  };

  return (
    <div className="profile-page-wrapper">
      {/* Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-left">
          <span className="profile-badge-tag">User Profile Dashboard</span>
          <h1 className="profile-main-name">{user?.name || "Pantry User"}</h1>
          <p className="profile-email-tag">
            <span className="profile-status-online" />
            {user?.email || "user@pantrypal.app"}
          </p>
        </div>
        <div className="profile-header-actions">
          <button
            type="button"
            className="btn-profile-secondary"
            onClick={() => navigate("/app/inventory")}
          >
            ← Back to Pantry
          </button>
          <button
            type="button"
            className="btn-profile-danger"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="profile-showcase-container">
        <div className="profile-avatar-hero-card">
          {/* Avatar Graphic Frame */}
          <div className="avatar-ring-container">
            <div className="avatar-glowing-ring">
              <AvatarRender avatarId={userAvatarId} size={150} />
            </div>
            <button
              type="button"
              className="btn-change-avatar-floating"
              onClick={() => setIsAvatarModalOpen(true)}
              title="Change Avatar"
            >
              ✏️ Pick Avatar
            </button>
          </div>

          {/* User Name Below Avatar */}
          <div className="profile-name-box">
            {isEditingName ? (
              <div className="edit-name-inline">
                <input
                  type="text"
                  className="edit-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                />
                <button type="button" className="btn-save-inline" onClick={handleSaveName}>
                  Save
                </button>
                <button type="button" className="btn-cancel-inline" onClick={() => setIsEditingName(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="user-name-title-group">
                <h2 className="user-profile-display-name">{user?.name || "Pantry User"}</h2>
                <button
                  type="button"
                  className="btn-edit-pencil"
                  onClick={() => {
                    setNameInput(user?.name || "");
                    setIsEditingName(true);
                  }}
                  title="Edit Name"
                >
                  ✏️
                </button>
              </div>
            )}
            <span className="user-gender-tag">
              {user?.gender === "boy" || user?.gender === "male" ? "👦 Male Avatar" : "👧 Female Avatar"}
            </span>
          </div>

          {/* User Info Details Grid */}
          <div className="profile-info-grid">
            <div className="info-item-tile">
              <span className="tile-label">Email Address</span>
              <span className="tile-value">{user?.email || "Not set"}</span>
            </div>
            <div className="info-item-tile">
              <span className="tile-label">Mobile Number</span>
              <span className="tile-value">{user?.mobile || "Not set"}</span>
            </div>
            <div className="info-item-tile">
              <span className="tile-label">Member Status</span>
              <span className="tile-value highlight-green">Active Pantry Pal</span>
            </div>
          </div>

          {/* Pantry Quick Stats Row */}
          <div className="profile-pantry-stats-row">
            <div className="profile-stat-box">
              <span className="stat-number-bold">{groceries?.length || 0}</span>
              <span className="stat-label-muted">Pantry Items</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat-box">
              <span className="stat-number-bold warning-highlight">{expiringCount || 0}</span>
              <span className="stat-label-muted">Expiring Soon</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat-box">
              <span className="stat-number-bold">{shoppingList?.length || 0}</span>
              <span className="stat-label-muted">Shopping List</span>
            </div>
          </div>

          {/* Avatar Change Action Banner */}
          <button
            type="button"
            className="btn-pick-avatar-hero"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            🎨 Pick & Customise Avatar Character
          </button>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={() => setIsAvatarModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="profile-modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-icon">🚪</div>
            <h3 className="modal-confirm-title">Sign Out of PantryPal?</h3>
            <p className="modal-confirm-desc">
              Are you sure you want to sign out? Your pantry data is safely saved for your next session.
            </p>
            <div className="modal-confirm-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-logout"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  navigate("/login");
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
