import React from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // CSS’i import etmeyi unutmayın

const profiles = [
  { id: "u1", name: "Ahmet", password: "1" },
  { id: "u2", name: "Ayşe", password: "2" },
  { id: "u3", name: "Mehmet", password: "3" },
];

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    if (
      profiles.some(
        (profile) =>
          profile.name === values.username &&
          profile.password === values.password
      )
    ) {
      console.log("Success:", values);
      onLogin(values.username, values.password); // Kullanıcı adını üst bileşene ilet
      navigate("/main");
    } else {
      console.log("Hatalı Giriş!");
      alert("Hatalı Giriş!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Giriş Yap</h2>
        <Form
          name="login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Kullanıcı Adı"
            name="username"
            rules={[
              { required: true, message: "Lütfen kullanıcı adınızı girin!" },
            ]}
          >
            <Input placeholder="Kullanıcı adı" />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[{ required: true, message: "Lütfen şifrenizi girin!" }]}
          >
            <Input.Password placeholder="●●●●●●●●" />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{ offset: 8, span: 16 }}
          >
            <Checkbox>Beni Hatırla</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Giriş
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
