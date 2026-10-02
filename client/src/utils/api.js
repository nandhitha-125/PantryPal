// Central API base URL — reads from Vite env variable, falls back to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API = {
  AUTH: `${API_BASE}/api/auth`,
  GROCERIES: `${API_BASE}/api/groceries`,
  SHOPPING: `${API_BASE}/api/shopping`,
  RECIPES: `${API_BASE}/api/recipes`,
};

export default API_BASE;
