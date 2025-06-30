import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Button, Input, Card, List, message, Typography, Space, Radio } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function Home() {
  const [questions, setQuestions] = useState([]);
  const [sortType, setSortType] = useState('latest');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const fetchQuestions = async (q = '') => {
    setSearching(true);
    const res = await axios.get('http://localhost:5000/api/questions' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    setQuestions(res.data);
    setSearching(false);
  };
  useEffect(() => { fetchQuestions(); }, []);
  // 排序逻辑
  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortType === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return b.answerCount - a.answerCount;
    }
  });
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <Title level={2} style={{ margin: 0, display: 'inline-block' }}>匿名提问广场</Title>
        <Input.Search
          placeholder="搜索问题..."
          allowClear
          enterButton
          style={{ width: 240, marginLeft: 32, verticalAlign: 'middle' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={v => fetchQuestions(v)}
          loading={searching}
        />
      </Header>
      <Content style={{ maxWidth: 600, margin: '32px auto', width: '100%' }}>
        <Space style={{ marginBottom: 24 }}>
          <Button type="primary" icon={<PlusOutlined />}>
            <Link to="/ask" style={{ color: '#fff' }}>我要提问</Link>
          </Button>
          <Radio.Group value={sortType} onChange={e => setSortType(e.target.value)}>
            <Radio.Button value="latest">最新</Radio.Button>
            <Radio.Button value="hot">最热</Radio.Button>
          </Radio.Group>
        </Space>
        <List
          dataSource={sortedQuestions}
          renderItem={q => (
            <List.Item>
              <Card style={{ width: '100%' }}>
                <Link to={`/question/${q._id}`}><b>{q.content}</b></Link>
                <div style={{ color: '#888', marginTop: 8, fontSize: 12 }}>
                  提问时间：{new Date(q.createdAt).toLocaleString()} &nbsp;|&nbsp; 回答数：{q.answerCount}
                </div>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: '暂无问题，快来提问吧！' }}
        />
      </Content>
      <Footer style={{ textAlign: 'center', color: '#888' }}>匿名提问 &copy; 2024</Footer>
    </Layout>
  );
}

function Ask() {
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      message.warning('问题内容不能为空');
      return;
    }
    await axios.post('http://localhost:5000/api/questions', { content });
    message.success('提问成功！');
    navigate('/');
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <Title level={2} style={{ margin: 0 }}>我要提问</Title>
      </Header>
      <Content style={{ maxWidth: 600, margin: '32px auto', width: '100%' }}>
        <Card>
          <form onSubmit={handleSubmit}>
            <Input.TextArea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="请输入你的问题..." />
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit">提交问题</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回首页</Button>
            </Space>
          </form>
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center', color: '#888' }}>匿名提问 &copy; 2024</Footer>
    </Layout>
  );
}

function CommentList({ answerId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const fetchComments = async () => {
    const res = await axios.get(`http://localhost:5000/api/answers/${answerId}/comments`);
    setComments(res.data);
  };
  useEffect(() => { fetchComments(); }, [answerId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      message.warning('评论内容不能为空');
      return;
    }
    setLoading(true);
    await axios.post(`http://localhost:5000/api/answers/${answerId}/comments`, { content });
    setContent('');
    setLoading(false);
    fetchComments();
    message.success('评论已提交！');
  };
  return (
    <Card size="small" style={{ marginTop: 12, background: '#fafafa' }} bodyStyle={{ padding: 12 }}>
      <List
        size="small"
        header={<b>评论</b>}
        dataSource={comments}
        renderItem={c => (
          <List.Item>
            <span>{c.content}</span>
            <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</span>
          </List.Item>
        )}
        locale={{ emptyText: '暂无评论' }}
      />
      <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
        <Space>
          <Input
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下你的评论..."
            size="small"
            style={{ width: 200 }}
          />
          <Button type="primary" htmlType="submit" size="small" loading={loading}>评论</Button>
        </Space>
      </form>
    </Card>
  );
}

function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const fetchData = async () => {
    const qlist = await axios.get('http://localhost:5000/api/questions');
    setQuestion(qlist.data.find(q => q._id === id));
    const ans = await axios.get(`http://localhost:5000/api/questions/${id}/answers`);
    setAnswers(ans.data);
  };
  useEffect(() => { fetchData(); }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      message.warning('回答内容不能为空');
      return;
    }
    await axios.post(`http://localhost:5000/api/questions/${id}/answers`, { content });
    setContent('');
    message.success('回答已提交！');
    fetchData();
  };
  if (!question) return <div>加载中...</div>;
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <Title level={2} style={{ margin: 0 }}>问题详情</Title>
      </Header>
      <Content style={{ maxWidth: 600, margin: '32px auto', width: '100%' }}>
        <Card style={{ marginBottom: 24 }}>
          <b>{question.content}</b>
          <div style={{ color: '#888', marginTop: 8, fontSize: 12 }}>提问时间：{new Date(question.createdAt).toLocaleString()}</div>
        </Card>
        <Card title="所有回答" style={{ marginBottom: 24 }}>
          <List
            dataSource={answers}
            renderItem={a => (
              <List.Item style={{ display: 'block' }}>
                <div>
                  <Text>{a.content}</Text>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <CommentList answerId={a._id} />
              </List.Item>
            )}
            locale={{ emptyText: '暂无回答' }}
          />
        </Card>
        <Card title="我要回答">
          <form onSubmit={handleSubmit}>
            <Input.TextArea value={content} onChange={e => setContent(e.target.value)} rows={3} placeholder="请输入你的回答..." />
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" htmlType="submit">提交回答</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回首页</Button>
            </Space>
          </form>
        </Card>
      </Content>
      <Footer style={{ textAlign: 'center', color: '#888' }}>匿名提问 &copy; 2024</Footer>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
