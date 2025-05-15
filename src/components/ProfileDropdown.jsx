import React, { useState, useEffect } from "react";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, Space, Avatar, Modal, Input, message } from "antd";
import { useNavigate } from "react-router-dom";

const profiles = [
  { id: "u1", name: "Ahmet", password: "1" },
  { id: "u2", name: "Ayşe", password: "2" },
  { id: "u3", name: "Mehmet", password: "3" },
  { id: "u0", name: "Çıkış" },
];

const items = profiles.map((p) => ({ key: p.id, label: p.name }));

const ProfileDropdown = ({ username }) => {
  const navigate = useNavigate();

  const [selectedProfile, setSelectedProfile] = useState(
    () =>
      localStorage.getItem("selectedProfile") || username || profiles[0].name
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [inputPassword, setInputPassword] = useState("");

  useEffect(() => {
    localStorage.setItem("selectedProfile", selectedProfile);
  }, [selectedProfile]);

  const handleMenuClick = ({ key }) => {
    const selected = profiles.find((p) => p.id === key);
    if (!selected) return;
    if (selected.id === "u0") {
      // Çıkış
      localStorage.removeItem("selectedProfile");
      navigate("/");
    } else {
      // Şifre doğrulaması için modal aç
      setPendingId(selected.id);
      setInputPassword("");
      setModalVisible(true);
    }
  };

  const handleOk = () => {
    const profile = profiles.find((p) => p.id === pendingId);
    if (profile && profile.password === inputPassword) {
      setSelectedProfile(profile.name);
      setModalVisible(false);
      message.success(`${profile.name} başarıyla seçildi`);
    } else {
      message.error("Şifre yanlış, lütfen tekrar deneyin");
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setPendingId(null);
  };

  return (
    <>
      <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
        <Space style={{ cursor: "pointer" }}>
          <Avatar size={28} icon={<UserOutlined />} />
          {selectedProfile}
          <DownOutlined />
        </Space>
      </Dropdown>

      <Modal
        title={
          pendingId
            ? `Personel: ${profiles.find((p) => p.id === pendingId)?.name}`
            : "Profil Doğrulama"
        }
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Doğrula"
        cancelText="İptal"
      >
        <Input.Password
          placeholder="Şifre girin"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ProfileDropdown;
