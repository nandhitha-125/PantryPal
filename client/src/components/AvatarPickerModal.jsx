import { useState } from "react";
import AvatarRender, { AVATAR_LIST } from "./AvatarRender";
import { useAuth } from "../context/useAuth";
import "./AvatarPickerModal.css";

export default function AvatarPickerModal({ isOpen, onClose, onSelect }) {
  const { user, updateProfile } = useAuth();
  const [filterGender, setFilterGender] = useState("all");
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    user?.avatarId || (user?.gender === "boy" ? "male_1" : "female_1")
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const filteredAvatars = AVATAR_LIST.filter((avatar) => {
    if (filterGender === "all") return true;
    return avatar.gender === filterGender;
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const chosenAvatar = AVATAR_LIST.find((a) => a.id === selectedAvatarId);
      const newGender = chosenAvatar ? chosenAvatar.gender : "female";
      if (updateProfile) {
        await updateProfile({ avatarId: selectedAvatarId, gender: newGender });
      }
      if (onSelect) onSelect(selectedAvatarId);
      onClose();
    } catch (err) {
      console.error("Failed to save avatar:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-modal-backdrop" onClick={onClose}>
      <div className="avatar-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="avatar-modal-header">
          <div className="modal-title-group">
            <span className="modal-eyebrow">Personalize Your Profile</span>
            <h2 className="modal-title">Choose Your Avatar Character</h2>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Gender Filter Tabs */}
        <div className="avatar-filter-row">
          <button
            type="button"
            className={`filter-tab-btn ${filterGender === "all" ? "active" : ""}`}
            onClick={() => setFilterGender("all")}
          >
            🌟 All Avatars ({AVATAR_LIST.length})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterGender === "female" ? "active" : ""}`}
            onClick={() => setFilterGender("female")}
          >
            👧 Female Characters
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterGender === "male" ? "active" : ""}`}
            onClick={() => setFilterGender("male")}
          >
            👦 Male Characters
          </button>
        </div>

        {/* Avatar Grid Gallery */}
        <div className="avatar-gallery-grid">
          {filteredAvatars.map((item) => {
            const isSelected = selectedAvatarId === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={`avatar-selection-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedAvatarId(item.id)}
              >
                <div className="avatar-preview-box">
                  <AvatarRender avatarId={item.id} size={90} />
                  {isSelected && <span className="selected-check-badge">✓</span>}
                </div>
                <span className="avatar-card-name">{item.name}</span>
                <span className="avatar-card-tag">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="avatar-modal-footer">
          <span className="selected-hint">
            Selected: <strong>{AVATAR_LIST.find((a) => a.id === selectedAvatarId)?.name || "Character"}</strong>
          </span>
          <div className="modal-footer-btns">
            <button type="button" className="btn-secondary-modal" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary-modal"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Set as My Avatar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
