import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import RecipeIdeas from "./components/RecipeIdeas";
import ShoppingList from "./components/ShoppingList";
import AddGroceryForm from "./components/AddGroceryForm";
import { isExpiringSoon } from "./utils/expiryUtils";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [groceries, setGroceries] = useState([]);
  const [loadingGroceries, setLoadingGroceries] = useState(true);
  const [groceriesError, setGroceriesError] = useState(null);

  // Fetch actual grocery inventory once at application root level
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetch("http://localhost:5000/api/groceries", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} (${response.statusText})`);
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setGroceries(Array.isArray(data) ? data : []);
          setLoadingGroceries(false);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== "AbortError") {
          setGroceriesError(
            err.message || "Failed to connect to the server. Please ensure the backend is running."
          );
          setLoadingGroceries(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [refreshKey]);

  // Handler for retry button
  const handleRetryGroceries = useCallback(() => {
    setLoadingGroceries(true);
    setGroceriesError(null);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Compute live expiring count directly from real inventory
  const expiringCount = useMemo(() => {
    if (!Array.isArray(groceries)) return 0;
    return groceries.filter((item) => isExpiringSoon(item.expiryDate)).length;
  }, [groceries]);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleGrocerySaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleGroceryDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onAddItem={handleAddItem}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        expiringCount={expiringCount}
      />

      <main className="main-content">
        {activeTab === "recipes" ? (
          <RecipeIdeas
            onTabChange={setActiveTab}
            onAddItem={handleAddItem}
            groceries={groceries}
            loadingGroceries={loadingGroceries}
            groceriesError={groceriesError}
            onRetryPantry={handleRetryGroceries}
          />
        ) : activeTab === "shopping" ? (
          <ShoppingList onTabChange={setActiveTab} />
        ) : (
          <Dashboard
            refreshKey={refreshKey}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onEdit={handleEditItem}
            onDeleteSuccess={handleGroceryDeleted}
            groceries={groceries}
            loading={loadingGroceries}
            error={groceriesError}
            onRetry={handleRetryGroceries}
          />
        )}
      </main>

      <AddGroceryForm
        key={isAddModalOpen ? (editingItem?._id || "new-item-form") : "closed-form"}
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleGrocerySaved}
        itemToEdit={editingItem}
      />
    </div>
  );
}

export default App;

