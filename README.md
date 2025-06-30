# 匿名提问与回答网站

## 项目简介

本项目是一个支持匿名提问、匿名回答和评论的全栈网站，适合用于校园、社区、兴趣小组等场景。用户无需注册即可自由提问、回答和评论，所有内容公开展示。

## 主要功能
- 匿名发布问题
- 匿名回答问题
- 回答下可匿名评论
- 问题支持"最新/最热"排序
- 支持关键词搜索问题
- 响应式美观界面（Ant Design）

## 技术栈
- 前端：React + Ant Design + Axios + React Router
- 后端：Node.js + Express + Mongoose
- 数据库：MongoDB（本地或云端 Atlas）

## 本地启动方法

### 1. 克隆项目

```bash
# 进入你的工作目录
cd 你的工作目录
# 克隆代码（假设已上传到 GitHub）
git clone 仓库地址
cd 项目目录
```

### 2. 启动后端

```bash
cd backend
npm install
# 配置数据库连接
# 在 backend 目录下新建 .env 文件，内容如下：
# MONGODB_URI=你的MongoDB连接字符串
npm install dotenv
npx nodemon index.js
# 或 node index.js
```

- 默认端口：5000
- 启动成功后访问 http://localhost:5000/api/questions 可看到接口返回

### 3. 启动前端

```bash
cd frontend
npm install
npm start
```

- 默认端口：3000
- 启动后访问 http://localhost:3000

### 4. 主要页面
- 首页：问题列表、搜索、排序、提问入口
- 提问页：输入并提交新问题
- 问题详情页：查看问题、所有回答、提交回答、评论

## 云端部署建议

- **前端**：推荐部署到 [Vercel](https://vercel.com/) 或 [Netlify](https://www.netlify.com/)
- **后端**：推荐部署到 [Render](https://render.com/) 或 [Railway](https://railway.app/)
- **数据库**：推荐使用 [MongoDB Atlas](https://www.mongodb.com/atlas/database) 免费云数据库

### 云部署简要流程
1. 注册 MongoDB Atlas，创建数据库，获取连接字符串
2. 后端上传到 GitHub，Render 新建 Web Service，配置 MONGODB_URI 环境变量
3. 前端上传到 GitHub，Vercel 新建项目，API 地址改为 Render 分配的后端地址
4. 部署完成后即可获得全球可访问的网址

## 目录结构
```
.
├── backend/    # Node.js + Express 后端
│   ├── models/ # Mongoose 数据模型
│   └── index.js
├── frontend/   # React 前端
│   └── src/
└── README.md
```

## 联系与支持
如有问题或建议，欢迎提 issue 或联系开发者。 