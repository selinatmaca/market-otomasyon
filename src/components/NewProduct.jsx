import React, { useState } from "react";
import { Button, Modal } from "antd";

const NewProduct = ({ onAddProduct }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBarkod, setProductBarkod] = useState("");
  const [productQty, setProductQty] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleAddProduct = async () => {
    if (!productName || !productPrice || !productBarkod || !productQty) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    // 1) Frontend state'i için benzersiz id ekliyoruz
    const newProduct = {
      id: Date.now().toString(), // React key
      barkod: parseInt(productBarkod, 10),
      name: productName,
      price: parseFloat(productPrice),
      qty: parseInt(productQty, 10),
    };
    onAddProduct(newProduct);

    // 2) Sheets'e sadece [barkod, name, price, qty] gönder
    const values = [
      [newProduct.barkod, newProduct.name, newProduct.price, newProduct.qty],
    ];

    try {
      console.log("Gönderilen veriler (Sheets):", values);
      const response = await fetch(
        "https://v1.nocodeapi.com/omerbah/google_sheets/hVfQEvxzzoNyDyyk?tabId=Sayfa1",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const resultText = await response.text();
      if (!response.ok) {
        console.error("API error:", resultText);
        alert("Ürün eklenirken hata oluştu.");
      } else {
        console.log("Satır eklendi:", resultText);
        alert(`${newProduct.name} başarıyla eklendi!`);
      }
    } catch (err) {
      console.error("Fetch hatası:", err);
      alert(`API isteği başarısız oldu: ${err.message}`);
    }

    // 3) Formu temizle ve modal kapat
    setProductName("");
    setProductPrice("");
    setProductBarkod("");
    setProductQty("");
    setIsModalOpen(false);
  };

  return (
    <div className="new-product">
      {!isModalOpen ? (
        <Button
          style={{
            marginRight: "2px",
            color: "white",
            backgroundColor: "#228B22",
          }}
          onClick={showModal}
        >
          Yeni Ürün Ekle
        </Button>
      ) : (
        <Modal
          title="Yeni Ürün Ekle"
          open={isModalOpen}
          onOk={handleAddProduct}
          onCancel={handleCancel}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              placeholder="Ürün Adı"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              placeholder="Fiyat"
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
            <input
              placeholder="Barkod"
              type="number"
              value={productBarkod}
              onChange={(e) => setProductBarkod(e.target.value)}
            />
            <input
              placeholder="Qty"
              type="number"
              value={productQty}
              onChange={(e) => setProductQty(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NewProduct;
