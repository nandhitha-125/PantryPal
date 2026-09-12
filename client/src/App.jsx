import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import RecipeIdeas from "./components/RecipeIdeas";
import ShoppingList from "./components/ShoppingList";
import AddGroceryForm from "./components/AddGroceryForm";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expiringCount, setExpiringCount] = useState(0);

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

  const handleExpiringCountChange = useCallback((count) => {
    setExpiringCount(count);
  }, []);

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
          <RecipeIdeas onTabChange={setActiveTab} />
        ) : activeTab === "shopping" ? (
          <ShoppingList onTabChange={setActiveTab} />
        ) : (
          <Dashboard
            refreshKey={refreshKey}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onExpiringCountChange={handleExpiringCountChange}
            onEdit={handleEditItem}
            onDeleteSuccess={handleGroceryDeleted}
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

