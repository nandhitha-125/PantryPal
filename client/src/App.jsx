import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import AddGroceryForm from "./components/AddGroceryForm";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddItem = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleGroceryAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onAddItem={handleAddItem}
        expiringCount={3}
      />

      <main className="main-content">
        <Dashboard refreshKey={refreshKey} />
      </main>

      <AddGroceryForm
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleGroceryAdded}
      />
    </div>
  );
}

export default App;

