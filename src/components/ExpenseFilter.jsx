import React, { useEffect, useState } from "react";
import { Select } from "antd";
import axios from "axios";
import "./ExpenseFilter.css";

const ExpenseFilter = ({ selected, onChangeFilter }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ürünleri Google Sheets'ten çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://v1.nocodeapi.com/omerbah/google_sheets/hVfQEvxzzoNyDyyk?tabId=Sayfa1"
        );
        const fetched = response.data.data.map((item) => ({
          id: item.id,
          name: item.name,
        }));
        setProducts(fetched);
      } catch (error) {
        console.error("Ürünler alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtre değiştiğinde parent'a aktar
  const handleFilterChange = (value) => {
    // "all" seçeneğinde boş string göndererek tüm ürünleri göster
    const filterValue = value === "all" ? "" : value;
    onChangeFilter(filterValue);
  };

  // Select için seçenekler: "Tümü" + ürün adları
  const options = [
    { value: "all", label: "Tümü" },
    ...products.map((p) => ({ value: p.name, label: p.name })),
  ];

  return (
    <div className="expenses-filter">
      <div className="expenses-filter__control">
        <label>Ürün Adına Göre Filtrele</label>
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Ürün seçin"
          value={selected || "all"}
          onChange={handleFilterChange}
          options={options}
          optionFilterProp="label"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ExpenseFilter;
