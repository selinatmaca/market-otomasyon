import React, { useState } from "react";
import { Routes, Route, Navigate, Link, Outlet } from "react-router-dom";
import "antd/dist/reset.css";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UrunTakip from "./pages/UrunTakip";
import ProfileDropdown from "./components/ProfileDropdown";
import ExpenseFilter from "./components/ExpenseFilter";
import NewProduct from "./components/NewProduct";

import "./App.css";

// /main altı için ortak layout
function MainLayout({ username, filter, setFilter, products, handleAdd }) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <ProfileDropdown username={username} />
        <ExpenseFilter selected={filter} onChangeFilter={setFilter} />
        <NewProduct onAddProduct={handleAdd} />
      </header>

      <div className="dashboard-container">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState("");
  const [filter, setFilter] = useState("");
  const [products, setProducts] = useState([]);

  const handleAddProduct = (newProduct) =>
    setProducts((prev) => [...prev, newProduct]);

  return (
    // DİKKAT: Burada BrowserRouter yok!
    <Routes>
      {/* / → Login */}
      <Route
        path="/"
        element={<LoginPage onLogin={(name) => setUsername(name)} />}
      />

      {/* /main ve alt rotalar */}
      <Route
        path="/main"
        element={
          <MainLayout
            username={username}
            filter={filter}
            setFilter={setFilter}
            products={products}
            handleAdd={handleAddProduct}
          />
        }
      >
        {/* /main → Dashboard */}
        <Route
          index
          element={<Dashboard filter={filter} products={products} />}
        />
        {/* /main/urun-takip → UrunTakip */}
        <Route path="urun-takip" element={<UrunTakip />} />
      </Route>

      {/* Diğer tüm yolları /’a yönlendir */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
