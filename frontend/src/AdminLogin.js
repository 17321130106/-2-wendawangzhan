import React, { useState } from 'react';
import { Input, Button, message, Card } from 'antd';
import axios from 'axios';

const API_BASE = 'https://2-wendawangzhan-production.up.railway.app';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/admin/login`, { username, password });
      localStorage.setItem('admin_token', res.data.token);
      message.success('登录成功');
      if (onLogin) onLogin();
    } catch {
      message.error('用户名或密码错误');
    }
  };
  return (
    <Card title="管理员登录" style={{ maxWidth: 300, margin: '80px auto' }}>
      <Input placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} style={{ marginBottom: 12 }} />
      <Input.Password placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: 12 }} />
      <Button type="primary" block onClick={handleLogin}>登录</Button>
    </Card>
  );
} 