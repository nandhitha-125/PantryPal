import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("inventory");

  const handleAddItem = () => {
    alert("Add Item modal or form triggered!");
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
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

