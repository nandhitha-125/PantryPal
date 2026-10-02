import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { PantryProvider } from "./context/PantryContext";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import InventoryPage from "./pages/InventoryPage";
import ExpiringSoonPage from "./pages/ExpiringSoonPage";
import RecipeIdeasPage from "./pages/RecipeIdeasPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

// Protected route wrapper — redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3A8B35",
        color: "#fff",
        fontSize: "18px",
      }}>
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Guest route — redirects to app if already logged in
function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Navigate to="/app/inventory" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Pages — only for guests */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

          {/* Protected App Shell */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <PantryProvider>
                  <AppLayout />
                </PantryProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/inventory" replace />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="expiring" element={<ExpiringSoonPage />} />
            <Route path="recipes" element={<RecipeIdeasPage />} />
            <Route path="shopping-list" element={<ShoppingListPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
