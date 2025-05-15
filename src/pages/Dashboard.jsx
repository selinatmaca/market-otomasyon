import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Divider,
  Table,
  Statistic,
  Space,
  Menu,
  AutoComplete,
} from "antd";
import { useNavigate } from "react-router-dom";
import { AppstoreOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import "./Dashboard.css";

const SHEET_URL =
  "https://v1.nocodeapi.com/omerbah/google_sheets/hVfQEvxzzoNyDyyk?tabId=Sayfa1";

const TRACK_URL =
  "https://v1.nocodeapi.com/omerbah/google_sheets/hVfQEvxzzoNyDyyk?tabId=UrunTakip";

export default function Dashboard({ filter }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBarkod, setSearchBarkod] = useState("");
  const [options, setOptions] = useState([]);

  const items = [
    { label: "Kasa", key: "/main", icon: <AppstoreOutlined /> },
    {
      label: "Ürün Takip",
      key: "/main/urun-takip",
      icon: <ClockCircleOutlined />,
    },
  ];
  const onMenuClick = (e) => navigate(e.key);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(SHEET_URL);
        setProducts(
          res.data.data.map((item, idx) => ({
            id: idx + 2,
            row: idx + 2,
            barkod: Number(item.barkod),
            name: item.name,
            price: Number(item.price),
            stock: Number(item.qty),
          }))
        );
      } catch (err) {
        console.error("Ürünler alınırken hata:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getPanelValue = (text) =>
    products
      .filter((p) => p.barkod.toString().startsWith(text))
      .map((p) => ({ value: p.barkod.toString() }));

  const onSearch = (text) => {
    setSearchBarkod(text);
    setOptions(getPanelValue(text));
  };

  const onAddByBarkod = () => {
    const num = Number(searchBarkod);
    const prod = products.find((p) => p.barkod === num);
    if (!prod) return alert("Ürün bulunamadı");
    addToCart(prod);
  };

  const addToCart = (prod) => {
    const now = new Date().toISOString();
    setCart((prev) => {
      const exists = prev.find((x) => x.id === prod.id);
      if (exists) {
        if (exists.qty + 1 > prod.stock) return prev;
        return prev.map((x) =>
          x.id === prod.id ? { ...x, qty: x.qty + 1, date: now } : x
        );
      }
      if (prod.stock <= 0) return prev;
      return [...prev, { ...prod, qty: 1, date: now }];
    });
  };
  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const updateStock = async (row, newQty) => {
    // body içinde mutlaka "row_id" ve güncellemek istediğiniz sütun adı  (qty) olmalı
    const body = {
      row_id: row,
      qty: newQty,
    };
    await axios.put(SHEET_URL, body, {
      headers: { "Content-Type": "application/json" },
    });
  };

  const handlePayment = async () => {
    if (!cart.length) return alert("Sepet boş");

    // ► salesperson değişkenini burada tanımla:
    const salesperson = localStorage.getItem("selectedProfile") || "Bilinmiyor";

    try {
      // 1) Stok güncelle
      for (const item of cart) {
        const newQty = item.stock - item.qty;
        await updateStock(item.row, newQty);
        // yerelde de güncelle
        setProducts((prev) =>
          prev.map((p) => (p.row === item.row ? { ...p, stock: newQty } : p))
        );
      }

      // 2) Satış logunu yaz (5. sütun olarak salesperson ekleniyor)
      for (const item of cart) {
        const dateStr = new Date().toLocaleString("tr-TR");
        const logBody = [
          [item.barkod, item.name, item.qty, dateStr, salesperson],
        ];
        await axios.post(TRACK_URL, logBody, {
          headers: { "Content-Type": "application/json" },
        });
      }

      // 3) Sepeti temizle ve kullanıcıyı bilgilendir
      setCart([]);
      alert("Ödeme ve log kaydedildi");
    } catch (err) {
      console.error("Ödeme sırasında hata:", err);
      alert("Ödeme sırasında bir hata oluştu, konsolu kontrol edin.");
    }
  };

  const filteredProducts = filter
    ? products.filter((p) => p.name === filter)
    : products;

  const columns = [
    { title: "Barkod", dataIndex: "barkod", key: "barkod" },
    { title: "Ürün Adı", dataIndex: "name", key: "name" },
    {
      title: "Satın Alınan Adet",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      render: (d) => (d ? new Date(d).toLocaleString("tr-TR") : "—"),
    },
  ];

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="dashboard-page">
      <Menu onClick={onMenuClick} mode="horizontal" items={items} />
      {loading ? (
        <h2>Yükleniyor…</h2>
      ) : (
        <>
          <Row>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <h2>Sepet</h2>
              <Table
                dataSource={cart}
                columns={columns}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: "Sepet boş" }}
              />
              <Divider />
              <Row justify="end" align="middle">
                <Statistic title="Toplam" value={totalAmount} suffix="₺" />
                <Button
                  type="primary"
                  onClick={handlePayment}
                  disabled={!cart.length}
                  style={{ marginLeft: 16 }}
                >
                  Ödeme Yap
                </Button>
              </Row>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <h2 style={{ marginLeft: 60 }}>Ürün Listesi</h2>
              <Space style={{ marginBottom: 16 }}>
                <AutoComplete
                  options={options}
                  style={{ width: 200, marginLeft: 60 }}
                  onSearch={onSearch}
                  onSelect={(val) => setSearchBarkod(val)}
                  value={searchBarkod}
                  placeholder="Barkod gir"
                  allowClear
                />
                <Button
                  onClick={onAddByBarkod}
                  type="primary"
                  disabled={
                    // geçerli barkodlu ürünü bulup stok kontrolü
                    !(
                      products.find((p) => p.barkod === Number(searchBarkod))
                        ?.stock > 0
                    )
                  }
                >
                  +
                </Button>
              </Space>
              <Row gutter={[16, 16]}>
                {filteredProducts.map((prod) => (
                  <Col key={prod.id} xs={24} sm={12} md={8} lg={6}>
                    <Button
                      block
                      disabled={prod.stock <= 0} // ← stok 0 ise pasif
                      onClick={() => addToCart(prod)}
                    >
                      {prod.name} — {prod.price} ₺ (Stok: {prod.stock})
                    </Button>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
