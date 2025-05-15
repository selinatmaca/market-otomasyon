import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, DatePicker, Button, Space, Menu } from "antd";
import { AppstoreOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const TRACK_URL =
  "https://v1.nocodeapi.com/omerbah/google_sheets/hVfQEvxzzoNyDyyk?tabId=UrunTakip";

const { RangePicker } = DatePicker;

// "12.05.2025 23:49:23" → Date objesi
const parseDate = (str) => {
  const [datePart, timePart] = str.split(" ");
  const [day, month, year] = datePart.split(".");
  const [hour, minute, second] = timePart.split(":");
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  );
};

export default function UrunTakip() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);

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
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(TRACK_URL);
        setLogs(
          res.data.data.map((r, idx) => ({
            key: idx,
            barkod: r.barkod,
            name: r.name,
            qtyPurchased: Number(r.qtyPurchased),
            date: parseDate(r.date),
            salesperson:
              r.salesperson || localStorage.getItem("selectedProfile") || "-",
          }))
        );
      } catch (err) {
        console.error("Loglar alınırken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = dateRange
    ? logs.filter((l) => {
        const start = dateRange[0].startOf("day").toDate();
        const end = dateRange[1].endOf("day").toDate();
        return l.date >= start && l.date <= end;
      })
    : logs;

  const columns = [
    { title: "Barkod", dataIndex: "barkod", key: "barkod" },
    { title: "Ürün Adı", dataIndex: "name", key: "name" },
    {
      title: "Satın Alınan Adet",
      dataIndex: "qtyPurchased",
      key: "qtyPurchased",
    },
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      render: (d) => d.toLocaleString("tr-TR"),
    },
    { title: "Personel", dataIndex: "salesperson", key: "salesperson" },
  ];

  return (
    <div>
      <Menu onClick={onMenuClick} mode="horizontal" items={items} />

      <Table
        dataSource={filteredLogs}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
