# PV Mapping System

PV Mapping 系统是一个智能化的临床试验数据映射平台，旨在辅助用户将不同来源的临床试验数据（Source Data）标准化映射到目标标准框架（Target Framework，如 CDISC, RBM 等）。系统结合了基于 LLM（大语言模型）的自动映射建议和直观的人工交互编辑功能。

## 功能特性

- **数据集管理**: 支持导入和查看源数据（Excel格式），自动解析 Sheet 和 Fields（含样例数据预览）。
- **标准框架管理**: 支持多种目标标准的定义和查看。
- **智能映射生成**: 集成 LLM (DeepSeek/OpenAI)，自动分析源数据与目标标准的语义匹配度，生成推荐映射。
- **交互式映射编辑**: 
  - 提供表格和卡片两种视图。
  - 支持字段筛选、冲突检测。
  - 显示 AI 推荐的置信度 (Confidence) 和推理理由 (Rationale)。
- **版本控制与历史记录**: 记录映射的保存版本和详细变更历史，支持查看和回溯。

## 技术架构

### 前端 (Frontend)
- **Framework**: React 18, TypeScript, Vite
- **UI Library**: TailwindCSS, Shadcn/UI
- **Icons**: Lucide React
- **HTTP Client**: Fetch API (支持 Server-Sent Events 流式响应)

### 后端 (Backend)
- **Framework**: FastAPI (Python 3.9+)
- **Database**: MySQL (SQLAlchemy ORM)
- **LLM Integration**: LangChain
- **Data Processing**: Pandas, OpenPyXL

## 快速开始

### 1. 环境准备
- Node.js (v18+)
- Python (v3.9+)
- MySQL Database

### 2. 配置后端

后端需要配置数据库连接和 LLM 密钥。请在 `backend/` 目录下创建 `.env` 文件：

```ini
# backend/.env

# Database Connection
DATABASE_URL=mysql+pymysql://root:@localhost:3306/pv_mapping_db

# LLM Configuration
LLM_MODEL=deepseek-chat
LLM_BASE_URL=https://chat.r2ai.com.cn/v1
LLM_API_KEY=your_api_key_here
```

**安全提示**: `backend/.env` 文件包含敏感信息，已被包含在 `.gitignore` 中，请勿提交到版本控制系统。

### 3. 安装依赖

**前端**:
```bash
cd frontend
npm install
```

**后端**:
```bash
# 建议使用虚拟环境
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 4. 初始化数据库

项目包含示例数据种子脚本，用于导入 `backend/excels` 目录下的测试数据 (IMP 文件夹)。
**警告**: 此操作会 Drop 并重建所有数据库表。

```bash
# 确保在项目根目录下运行，且已激活后端虚拟环境
python -m backend.app.seed_real_data
```

### 5. 启动服务

**使用一键启动脚本 (Mac/Linux)**:
```bash
./deploy.sh prod
```

**或分别启动**:

后端 (默认端口 8000):
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

前端 (默认端口 3000):
```bash
cd frontend
npm run dev
```

访问 `http://localhost:3000` 开始使用。

## 目录结构

- `frontend/`: React 前端项目
  - `src/components/`: UI 组件 (DatasetSelector, FrameworkSelector, MappingEditorV2 等)
  - `src/api/`: API 客户端定义
- `backend/`: FastAPI 后端项目
  - `app/models.py`: SQLAlchemy 数据库模型
  - `app/schemas.py`: Pydantic 数据验证模型
  - `app/api/v1/`: RESTful API 路由
  - `app/services/`: 业务逻辑 (Mapping Generation, LLM Factory)
- `backend/excels/`: 用于初始化的示例 Excel 数据源