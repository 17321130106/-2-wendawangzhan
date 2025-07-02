require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Comment = require('./models/Comment');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// 连接 MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('已连接到 MongoDB Atlas 云数据库');
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err);
  });

app.get('/', (req, res) => {
  res.send('匿名提问回答后端已启动');
});

// 发布问题
app.post('/api/questions', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '内容不能为空' });
    const question = await Question.create({ content });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有问题（带回答数，支持关键词搜索）
app.get('/api/questions', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { content: { $regex: q, $options: 'i' } } : {};
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    // 查询每个问题的回答数
    const questionIds = questions.map(q => q._id);
    const answerCounts = await Answer.aggregate([
      { $match: { questionId: { $in: questionIds } } },
      { $group: { _id: '$questionId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    answerCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });
    const result = questions.map(q => ({
      ...q.toObject(),
      answerCount: countMap[q._id.toString()] || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 为某个问题添加回答
app.post('/api/questions/:id/answers', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '内容不能为空' });
    const answer = await Answer.create({ questionId: req.params.id, content });
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取某个问题的所有回答
app.get('/api/questions/:id/answers', async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.id }).sort({ createdAt: -1 });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 为某个回答添加评论
app.post('/api/answers/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '内容不能为空' });
    const comment = await Comment.create({ answerId: req.params.id, content });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取某个回答的所有评论
app.get('/api/answers/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ answerId: req.params.id }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 管理员登录接口
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

// 管理员权限中间件
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.admin) return next();
    return res.status(403).json({ error: '无权限' });
  } catch {
    return res.status(401).json({ error: '登录已过期' });
  }
}

// 删除问题
app.delete('/api/questions/:id', adminAuth, async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 删除回答
app.delete('/api/answers/:id', adminAuth, async (req, res) => {
  await Answer.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 删除评论
app.delete('/api/comments/:id', adminAuth, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 替换监听端口和地址，兼容 Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});