import React, { useEffect, useState } from 'react';
import { Card, List, Button, message, Typography, Modal } from 'antd';
import axios from 'axios';
const { Title } = Typography;

const API_BASE = 'https://2-wendawangzhan-production.up.railway.app';

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [comments, setComments] = useState([]);
  const token = localStorage.getItem('admin_token');

  const fetchAll = async () => {
    const qs = await axios.get(`${API_BASE}/api/questions`);
    setQuestions(qs.data);
    const as = await axios.get(`${API_BASE}/api/answers`);
    setAnswers(as.data);
    const cs = await axios.get(`${API_BASE}/api/comments`);
    setComments(cs.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (type, id) => {
    Modal.confirm({
      title: '确认删除？',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/api/${type}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('删除成功');
          fetchAll();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: '32px auto' }}>
      <Title level={2}>管理员后台</Title>
      <Card title="所有问题" style={{ marginBottom: 24 }}>
        <List
          dataSource={questions}
          renderItem={q => (
            <List.Item actions={[<Button danger onClick={() => handleDelete('questions', q._id)}>删除</Button>]}> 
              <div>{q.content} <span style={{ color: '#888', marginLeft: 8 }}>{new Date(q.createdAt).toLocaleString()}</span></div>
            </List.Item>
          )}
        />
      </Card>
      <Card title="所有回答" style={{ marginBottom: 24 }}>
        <List
          dataSource={answers}
          renderItem={a => (
            <List.Item actions={[<Button danger onClick={() => handleDelete('answers', a._id)}>删除</Button>]}> 
              <div>{a.content} <span style={{ color: '#888', marginLeft: 8 }}>{new Date(a.createdAt).toLocaleString()}</span></div>
            </List.Item>
          )}
        />
      </Card>
      <Card title="所有评论">
        <List
          dataSource={comments}
          renderItem={c => (
            <List.Item actions={[<Button danger onClick={() => handleDelete('comments', c._id)}>删除</Button>]}> 
              <div>{c.content} <span style={{ color: '#888', marginLeft: 8 }}>{new Date(c.createdAt).toLocaleString()}</span></div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
} 