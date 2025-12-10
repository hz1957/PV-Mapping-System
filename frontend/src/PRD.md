# 临床试验数据映射系统 PRD
## Product Requirements Document

**文档版本：** v1.0  
**创建日期：** 2024-12-04  
**产品负责人：** [待填写]  
**研发负责人：** [待填写]

---

## 一、项目概述

### 1.1 项目背景
临床试验数据通常来自不同的数据采集系统（EDC），数据格式和字段命名各不相同。为了满足不同的监管要求（如FDA、NMPA）和数据使用场景（如可视化、监查、报表生成），需要将原始数据映射到标准化格式。传统的手动映射效率低、易出错，亟需一个智能化的数据映射工具。

### 1.2 产品目标
构建一个临床试验数据映射系统，支持用户：
- 快速选择源数据集
- 选择目标映射标准
- 智能生成字段映射关系
- 可视化编辑和调整映射
- 导出标准化映射配置
- 管理历史映射记录

### 1.3 目标用户
- **数据管理员（DM）**：负责临床试验数据的规范化处理
- **生物统计师**：需要将数据转换为分析所需的标准格式
- **质量保证人员（QA）**：审核数据映射的准确性

### 1.4 核心价值
- ⚡ **提升效率**：自动化映射减少80%的手动工作
- ✅ **降低错误**：智能匹配减少人为失误
- 📊 **可视化管理**：直观的表格视图便于审核
- 🔄 **可复用**：保存历史映射，相似项目快速复用

---

## 二、功能需求

### 2.1 功能架构图

```
临床试验数据映射系统
├── 数据集选择页面
│   ├── 数据集搜索与筛选
│   ├── 数据集信息预览
│   └── 历史记录入口
├── 目标标准选择页面
│   ├── 标准列表展示
│   ├── 标准详情预览
│   └── 标准选择确认
├── 字段映射编辑页面
│   ├── 映射表格展示（V1/V2版本）
│   ├── 字段映射编辑
│   ├── AI辅助建议（V1版本）
│   ├── 导出预览
│   └── 保存映射
├── 历史映射查看页面
│   ├── 历史记录列表
│   ├── 映射详情查看
│   ├── 编辑历史映射
│   └── 删除历史映射
└── 导出预览页面
    ├── 只读表格展示
    ├── 数据确认
    └── Excel导出
```

---

## 三、详细功能设计

### 3.1 数据集选择页面

#### 3.1.1 页面布局
- **顶部导航区域**
  - 页面标题："数据映射工具"
  - 副标题："选择需要进行映射的数据集"
  - 历史记录按钮（右上角，显示历史记录数量徽章）

- **主内容区域**
  - 搜索框（支持数据集名称和字段搜索）
  - 数据集网格展示（3列布局，响应式）
  - 每个数据集卡片显示：
    - 文件图标（根据扩展名显示不同图标）
    - 数据集名称
    - 表单数量
    - 字段总数
    - "生成映射"按钮

#### 3.1.2 交互逻辑
1. **搜索功能**
   - 实时搜索，支持中英文
   - 同时匹配数据集名称和包含的字段名称
   - 显示搜索结果数量

2. **数据集选择**
   - 点击"生成映射"按钮
   - 跳转到目标标准选择页面
   - 传递选中的数据集信息

3. **历史记录入口**
   - 点击右上角"查看历史"按钮
   - 跳转到历史映射页面
   - 徽章显示历史记录总数

#### 3.1.3 数据模型
```typescript
interface Dataset {
  id: string;              // 数据集唯一标识
  name: string;            // 数据集名称（含扩展名）
  headers: string[];       // 所有字段名（用于搜索）
  sheets: Sheet[];         // 表单列表
}

interface Sheet {
  name: string;            // 表单名称（如DM、AE、LB）
  columns: string[];       // 字段列表
}
```

---

### 3.2 目标标准选择页面

#### 3.2.1 页面布局
- **顶部导航区域**
  - 返回按钮
  - 页面标题："选择目标映射标准"
  - 副标题：显示已选择的数据集名称

- **主内容区域**
  - 标准列表（2列布局，响应式）
  - 每个标准卡片显示：
    - 标准名称（大标题）
    - 标准描述
    - 版本号
    - 字段数量
    - 包含的表单类型
    - "选择此标准"按钮

#### 3.2.2 支持的标准

| 标准ID | 标准名称 | 描述 | 版本 |
|--------|----------|------|------|
| 1 | PV: Visualization | 临床试验数据可视化标准 - 用于图表展示和数据分析 | v3.4 |
| 2 | DM: New data listing | 临床试验新数据清单标准 - 用于数据列表生成和报表输出 | R2 |
| 3 | CD: RBM | 基于风险的临床试验监查标准 - Risk-Based Monitoring | v2.0 |
| 4 | MM: patient profile | 患者档案标准 - 用于生成完整的受试者个人信息文档 | 2024 |

#### 3.2.3 交互逻辑
1. **标准选择**
   - 点击"选择此标准"按钮
   - 系统检查是否存在预定义映射
   - 生成初始映射数据
   - 跳转到映射编辑页面

2. **映射生成策略**
   - **优先级1**：使用预定义映射（精确匹配）
   - **优先级2**：智能匹配（基于字段名相似度）
   - **优先级3**：随机分配（保证每个字段都有映射）

#### 3.2.4 数据模型
```typescript
interface TargetFramework {
  id: string;              // 标准唯一标识
  name: string;            // 标准名称
  description: string;     // 标准描述
  version: string;         // 版本号
  sheets: TargetSheet[];   // 目标字段列表
}

interface TargetSheet {
  sheetName: string;       // 目标表单名称
  columnName: string;      // 目标字段名称
  note: string;            // 字段说明
}
```

---

### 3.3 字段映射编辑页面

#### 3.3.1 版本说明
系统提供两个版本的映射编辑器，用户可自由切换：

**V1版本特点：**
- ✅ 包含AI辅助字段（Confidence、Rationale）
- ✅ 适合需要AI建议和置信度评估的场景
- ✅ 8列完整映射表

**V2版本特点：**
- ✅ 简化版映射表（移除AI相关列）
- ✅ 更简洁的界面，专注核心映射
- ✅ 6列精简映射表

#### 3.3.2 页面布局（V1版本）
- **顶部导航区域**
  - 返回按钮
  - 页面标题："编辑字段映射"
  - 数据集名称
  - 操作按钮组：
    - 切换到V2版本
    - 导出预览
    - 保存映射

- **统计信息卡片**
  - 源数据集统计（表单数、字段数）
  - 映射进度（已映射数、完成率）

- **映射表格**
  - 列配置：
    1. Source_SheetName（源表单名称）- 180px
    2. Source_ColumnName（源字段名称）- 200px
    3. Standard_SheetName（标准表单名称）- 200px
    4. Standard_ColumnName（标准字段名称）- 220px
    5. 信息类型 - 150px，可编辑
    6. 备注 - 200px，可编辑
    7. Confidence（置信度）- 120px，只读
    8. Rationale（原因）- 300px，只读

#### 3.3.3 页面布局（V2版本）
与V1版本相同，但映射表格精简为6列：
1. Source_SheetName（源表单名称）- 200px
2. Source_ColumnName（源字段名称）- 220px
3. Standard_SheetName（标准表单名称）- 220px
4. Standard_ColumnName（标准字段名称）- 240px
5. 信息类型 - 180px，可编辑
6. 备注 - 240px，可编辑

#### 3.3.4 交互逻辑

**1. 版本切换**
- 点击"切换到V2版本"按钮
- 保留所有映射数据
- 切换表格展示形式
- 按钮文案相应切换

**2. 字段编辑**
- 双击可编辑单元格进入编辑模式
- 支持键盘导航（Tab、Enter、ESC）
- 实时保存修改
- 空值验证提示

**3. 表格交互**
- 固定表头（滚动时保持可见）
- 斑马纹行（提升可读性）
- 悬停高亮（Hover效果）
- 列宽可调整

**4. 导出预览**
- 点击"导出预览"按钮
- 跳转到导出预览页面
- 显示只读映射表
- 提供Excel导出功能

**5. 保存映射**
- 点击"保存映射"按钮
- 验证必填字段
- 保存到历史记录
- 跳转到历史页面
- 提示保存成功

#### 3.3.5 数据模型
```typescript
interface Mapping {
  sourceSheetName: string;      // 源表单名称（必填）
  sourceColumnName: string;     // 源字段名称（必填）
  standardSheetName: string;    // 标准表单名称（必填）
  standardColumnName: string;   // 标准字段名称（必填）
  infoType: string;             // 信息类型（可选）
  note: string;                 // 备注（可选）
  confidence: number;           // 置信度 0-1（仅V1）
  rationale: string;            // AI推理原因（仅V1）
}
```

---

### 3.4 历史映射查看页面

#### 3.4.1 页面布局
- **顶部导航区域**
  - 返回按钮
  - 页面标题："映射历史记录"
  - 记录总数显示

- **历史记录列表**
  - 卡片式展示
  - 每个记录卡片包含：
    - 数据集名称（大标题）
    - 保存时间（相对时间 + 绝对时间）
    - 映射数量统计
    - 操作按钮：
      - 编辑按钮（蓝色）
      - 删除按钮（红色）

- **空状态**
  - 显示提示信息："暂无历史记录"
  - 引导用户创建新映射

#### 3.4.2 交互逻辑

**1. 查看历史**
- 按保存时间倒序排列
- 显示相对时间（如"2小时前"）
- 悬停显示完整时间

**2. 编辑历史映射**
- 点击"编辑"按钮
- 加载历史映射数据
- 跳转到映射编辑页面
- 标记为编辑模式（保存时更新而非新建）

**3. 删除历史映射**
- 点击"删除"按钮
- 显示确认对话框
- 确认后从列表移除
- 更新记录总数

**4. 返回首页**
- 点击返回按钮
- 跳转到数据集选择页面

#### 3.4.3 数据模型
```typescript
interface SavedMapping {
  id: string;              // 唯一标识（时间戳）
  datasetName: string;     // 数据集名称
  mappings: Mapping[];     // 映射数据数组
  savedAt: string;         // 保存时间（ISO格式）
}
```

---

### 3.5 导出预览页面

#### 3.5.1 页面布局
- **顶部导航区域**
  - 返回按钮
  - 页面标题："导出预览"
  - 数据集名称
  - 导出按钮组：
    - 导出Excel（主按钮）

- **统计信息卡片**
  - 映射总数
  - 源表单数
  - 标准表单数

- **只读映射表格**
  - 采用V1样式但移除AI列
  - 6列展示：
    1. Source_SheetName
    2. Source_ColumnName
    3. Standard_SheetName
    4. Standard_ColumnName
    5. 信息类型
    6. 备注
  - 固定表头
  - 斑马纹行

#### 3.5.2 交互逻辑

**1. 导出Excel**
- 点击"导出Excel"按钮
- 生成Excel文件（使用xlsx库）
- 文件命名：`数据集名称_映射配置_日期.xlsx`
- 包含所有映射数据
- 自动下载到本地

**2. 返回编辑**
- 点击"返回"按钮
- 跳转回映射编辑页面
- 保留当前映射状态

#### 3.5.3 导出格式规范

**Excel文件结构：**
- Sheet名称："映射配置"
- 表头行：粗体、背景色#5b5fc7、白色文字
- 数据行：自动列宽、边框
- 编码：UTF-8

**列顺序：**
1. Source_SheetName
2. Source_ColumnName
3. Standard_SheetName
4. Standard_ColumnName
5. 信息类型
6. 备注

---

## 四、数据流程

### 4.1 完整用户流程

```
[开始] 
  ↓
[数据集选择页面]
  ├─→ 搜索数据集
  ├─→ 查看数据集信息
  └─→ 选择数据集 → [生成映射]
       ↓
[目标标准选择页面]
  ├─→ 查看标准详情
  └─→ 选择标准 → [生成映射]
       ↓
[字段映射编辑页面]
  ├─→ 查看映射表格
  ├─→ 编辑映射字段
  ├─→ 切换V1/V2版本
  ├─→ 导出预览 → [导出预览页面]
  │    ├─→ 确认数据
  │    ├─→ 导出Excel
  │    └─→ 返回编辑
  └─→ 保存映射 → [历史映射页面]
       ↓
[历史映射查看页面]
  ├─→ 查看历史记录
  ├─→ 编辑历史映射 → [返回编辑页面]
  ├─→ 删除历史映射
  └─→ 返回首页
```

### 4.2 数据状态管理

```typescript
// 应用状态
interface AppState {
  currentStep: 'selection' | 'framework' | 'mapping' | 'history' | 'preview';
  selectedDataset: Dataset | null;
  selectedFramework: TargetFramework | null;
  mappings: Mapping[];
  savedMappings: SavedMapping[];
  editingMappingId: string | null;
  editorVersion: 'v1' | 'v2';
}
```

---

## 五、UI/UX设计规范

### 5.1 设计系统

#### 5.1.1 颜色规范
```css
/* 主色调 */
--primary: #5b5fc7;           /* 品牌主色 - 蓝紫色 */
--primary-hover: #4a4eb5;     /* 主色悬停态 */
--primary-light: #e8e9f7;     /* 主色浅色背景 */

/* 背景色 */
--bg-primary: #f5f6f8;        /* 页面背景 */
--bg-card: #ffffff;           /* 卡片背景 */
--bg-hover: #f8f9fa;          /* 悬停背景 */

/* 文字色 */
--text-primary: #1a1a1a;      /* 主要文字 */
--text-secondary: #666666;    /* 次要文字 */
--text-muted: #999999;        /* 辅助文字 */

/* 边框色 */
--border-light: #e5e7eb;      /* 浅色边框 */
--border-medium: #d1d5db;     /* 中度边框 */

/* 功能色 */
--success: #10b981;           /* 成功 */
--warning: #f59e0b;           /* 警告 */
--error: #ef4444;             /* 错误 */
--info: #3b82f6;              /* 信息 */
```

#### 5.1.2 字体规范
- **主字体**：系统默认字体栈（不自定义font-size和font-weight）
- **等宽字体**：`'Consolas', 'Monaco', 'Courier New', monospace`（用于代码、字段名）

#### 5.1.3 间距规范
```
4px   - 最小间距
8px   - 小间距
12px  - 中小间距
16px  - 中间距
24px  - 大间距
32px  - 超大间距
48px  - 页面级间距
```

#### 5.1.4 圆角规范
```
4px  - 小圆角（按钮）
8px  - 中圆角（卡片、输入框）
12px - 大圆角（模态框）
```

#### 5.1.5 阴影规范
```css
/* 轻微阴影 */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* 中度阴影 */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* 重度阴影 */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);

/* 悬停阴影 */
box-shadow: 0 8px 16px rgba(91, 95, 199, 0.15);
```

### 5.2 组件规范

#### 5.2.1 按钮
```typescript
// 主要按钮
<Button className="bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white">
  主要操作
</Button>

// 次要按钮
<Button variant="outline">
  次要操作
</Button>

// 危险按钮
<Button variant="destructive">
  删除操作
</Button>
```

#### 5.2.2 输入框
```typescript
// 搜索框
<Input 
  type="text" 
  placeholder="搜索..." 
  className="max-w-md"
/>
```

#### 5.2.3 卡片
```typescript
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
</Card>
```

#### 5.2.4 表格
```typescript
<Table>
  <TableHeader className="sticky top-0 bg-white z-10">
    <TableRow>
      <TableHead>列名</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-gray-50">
      <TableCell>单元格</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 5.3 响应式设计

#### 5.3.1 断点规范
```
sm: 640px   - 小屏幕（手机横屏）
md: 768px   - 中屏幕（平板）
lg: 1024px  - 大屏幕（笔记本）
xl: 1280px  - 超大屏幕（桌面）
```

#### 5.3.2 网格布局
```typescript
// 数据集网格 - 响应式3列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 卡片 */}
</div>

// 标准选择网格 - 响应式2列
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* 卡片 */}
</div>
```

---

## 六、技术实现要点

### 6.1 技术栈

#### 6.1.1 前端框架
- **React 18+**：UI框架
- **TypeScript**：类型安全
- **Tailwind CSS 4.0**：样式系统
- **Vite**：构建工具

#### 6.1.2 UI组件库
- **shadcn/ui**：基础组件
  - Button, Input, Card, Table
  - Dialog, Sheet, Tabs
  - Select, Checkbox, Badge
- **lucide-react**：图标库

#### 6.1.3 工具库
- **date-fns**：时间处理
- **xlsx**：Excel导出

### 6.2 核心功能实现

#### 6.2.1 搜索功能
```typescript
// 实时搜索实现
const filteredDatasets = allDatasets.filter(dataset => {
  const searchLower = searchQuery.toLowerCase();
  
  // 匹配数据集名称
  if (dataset.name.toLowerCase().includes(searchLower)) {
    return true;
  }
  
  // 匹配字段名称
  return dataset.headers.some(header => 
    header.toLowerCase().includes(searchLower)
  );
});
```

#### 6.2.2 映射生成算法
```typescript
// 智能映射生成
function generateMappings(
  dataset: Dataset, 
  framework: TargetFramework
): Mapping[] {
  // 1. 检查预定义映射
  const predefined = getPredefinedMappings(dataset.name, framework.id);
  if (predefined.length > 0) {
    return predefined;
  }
  
  // 2. 智能匹配算法
  const mappings: Mapping[] = [];
  dataset.sheets.forEach(sheet => {
    sheet.columns.forEach(column => {
      // 查找最佳匹配的目标字段
      const bestMatch = findBestMatch(column, framework.sheets);
      
      mappings.push({
        sourceSheetName: sheet.name,
        sourceColumnName: column,
        standardSheetName: bestMatch.sheetName,
        standardColumnName: bestMatch.columnName,
        infoType: '',
        note: '智能匹配',
        confidence: bestMatch.confidence,
        rationale: bestMatch.rationale
      });
    });
  });
  
  return mappings;
}
```

#### 6.2.3 Excel导出实现
```typescript
import * as XLSX from 'xlsx';

function exportToExcel(
  mappings: Mapping[], 
  datasetName: string
) {
  // 准备数据
  const data = mappings.map(m => ({
    'Source_SheetName': m.sourceSheetName,
    'Source_ColumnName': m.sourceColumnName,
    'Standard_SheetName': m.standardSheetName,
    'Standard_ColumnName': m.standardColumnName,
    '信息类型': m.infoType,
    '备注': m.note
  }));
  
  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '映射配置');
  
  // 导出文件
  const fileName = `${datasetName}_映射配置_${
    new Date().toISOString().split('T')[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
}
```

#### 6.2.4 本地存储
```typescript
// 使用React State管理（可扩展为LocalStorage或IndexedDB）
const [savedMappings, setSavedMappings] = useState<SavedMapping[]>([]);

// 保存映射
function saveMapping(mapping: SavedMapping) {
  setSavedMappings(prev => [mapping, ...prev]);
}

// 更新映射
function updateMapping(id: string, mapping: SavedMapping) {
  setSavedMappings(prev => 
    prev.map(m => m.id === id ? mapping : m)
  );
}

// 删除映射
function deleteMapping(id: string) {
  setSavedMappings(prev => 
    prev.filter(m => m.id !== id)
  );
}
```

### 6.3 性能优化

#### 6.3.1 列表渲染优化
```typescript
// 使用React.memo优化卡片组件
export const DatasetCard = React.memo(({ dataset, onClick }) => {
  return (
    <Card onClick={onClick}>
      {/* 卡片内容 */}
    </Card>
  );
});
```

#### 6.3.2 表格虚拟滚动
```typescript
// 对于超大数据集，可使用react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={mappings.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* 行内容 */}
    </div>
  )}
</FixedSizeList>
```

---

## 七、测试要求

### 7.1 功能测试用例

#### 7.1.1 数据集选择
| 用例ID | 测试场景 | 操作步骤 | 预期结果 |
|--------|----------|----------|----------|
| TC-DS-01 | 搜索数据集 | 输入关键词"心血管" | 筛选出包含"心血管"的数据集 |
| TC-DS-02 | 搜索字段 | 输入"受试者编号" | 筛选出包含该字段的数据集 |
| TC-DS-03 | 生成映射 | 点击"生成映射"按钮 | 跳转到标准选择页面 |
| TC-DS-04 | 查看历史 | 点击"查看历史"按钮 | 跳转到历史页面 |

#### 7.1.2 标准选择
| 用例ID | 测试场景 | 操作步骤 | 预期结果 |
|--------|----------|----------|----------|
| TC-FS-01 | 选择标准 | 点击"选择此标准" | 生成映射并跳转 |
| TC-FS-02 | 返回上一页 | 点击返回按钮 | 返回数据集选择页面 |
| TC-FS-03 | 标准信息展示 | 查看标准卡片 | 显示名称、描述、版本 |

#### 7.1.3 映射编辑
| 用例ID | 测试场景 | 操作步骤 | 预期结果 |
|--------|----------|----------|----------|
| TC-ME-01 | 版本切换 | 点击"切换版本"按钮 | 切换V1/V2界面 |
| TC-ME-02 | 编辑字段 | 双击可编辑单元格 | 进入编辑模式 |
| TC-ME-03 | 保存映射 | 点击"保存映射"按钮 | 保存并跳转历史页面 |
| TC-ME-04 | 导出预览 | 点击"导出预览"按钮 | 跳转到预览页面 |
| TC-ME-05 | 表格滚动 | 滚动表格 | 表头固定不动 |

#### 7.1.4 历史管理
| 用例ID | 测试场景 | 操作步骤 | 预期结果 |
|--------|----------|----------|----------|
| TC-HM-01 | 查看历史 | 打开历史页面 | 显示所有保存的映射 |
| TC-HM-02 | 编辑历史 | 点击"编辑"按钮 | 加载映射进入编辑模式 |
| TC-HM-03 | 删除历史 | 点击"删除"按钮 | 显示确认对话框 |
| TC-HM-04 | 确认删除 | 确认删除操作 | 从列表移除记录 |

#### 7.1.5 导出功能
| 用例ID | 测试场景 | 操作步骤 | 预期结果 |
|--------|----------|----------|----------|
| TC-EP-01 | 导出Excel | 点击"导出Excel"按钮 | 下载.xlsx文件 |
| TC-EP-02 | 文件内容 | 打开导出的文件 | 包含所有映射数据 |
| TC-EP-03 | 返回编辑 | 点击"返回"按钮 | 返回编辑页面 |

### 7.2 兼容性测试

#### 7.2.1 浏览器兼容性
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

#### 7.2.2 设备兼容性
- ✅ 桌面端（1920x1080, 1366x768）
- ✅ 笔记本（1440x900, 1280x800）
- ✅ 平板（768x1024）
- ⚠️ 移动端（375x667）- 有限支持

### 7.3 性能测试

#### 7.3.1 性能指标
| 指标 | 目标值 | 测试场景 |
|------|--------|----------|
| 首屏加载时间 | < 2s | 打开数据集选择页面 |
| 搜索响应时间 | < 100ms | 输入搜索关键词 |
| 表格渲染时间 | < 1s | 渲染1000行映射数据 |
| Excel导出时间 | < 3s | 导出1000行数据 |
| 页面切换时间 | < 300ms | 页面间跳转 |

#### 7.3.2 压力测试
- 数据集数量：支持100+数据集
- 映射数量：支持1000+映射记录
- 历史记录：支持50+历史记录

---

## 八、部署方案

### 8.1 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 8.2 生产环境

#### 8.2.1 构建配置
```javascript
// vite.config.js
export default {
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-*'],
          'utils': ['xlsx', 'date-fns']
        }
      }
    }
  }
}
```

#### 8.2.2 部署方式
- **静态托管**：Vercel, Netlify, GitHub Pages
- **CDN加速**：CloudFlare, 阿里云CDN
- **容器化**：Docker + Nginx

#### 8.2.3 环境变量
```bash
# .env.production
VITE_APP_TITLE=临床试验数据映射系统
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.example.com
```

---

## 九、后续迭代计划

### 9.1 V1.1 版本（短期）
- [ ] 支持批量编辑映射
- [ ] 添加映射模板功能
- [ ] 支持导入Excel配置
- [ ] 优化搜索算法（模糊匹配）
- [ ] 添加操作历史记录（撤销/重做）

### 9.2 V1.2 版本（中期）
- [ ] AI智能推荐优化
- [ ] 支持自定义映射标准
- [ ] 添加数据验证规则
- [ ] 支持映射关系可视化（图形展示）
- [ ] 多用户协作功能

### 9.3 V2.0 版本（长期）
- [ ] 后端API集成
- [ ] 用户权限管理
- [ ] 映射审批流程
- [ ] 数据质量检查
- [ ] 批量数据处理
- [ ] 报表统计分析

---

## 十、附录

### 10.1 术语表

| 术语 | 英文 | 说明 |
|------|------|------|
| 数据集 | Dataset | 包含临床试验数据的文件，通常为Excel或CSV格式 |
| 表单 | Sheet | 数据集中的一个工作表，如DM、AE、LB等 |
| 字段 | Column/Field | 表单中的一列数据 |
| 映射 | Mapping | 将源字段对应到目标标准字段的关系 |
| 标准 | Standard/Framework | 目标数据格式规范，如CDISC、ICH等 |
| CDISC | CDISC | Clinical Data Interchange Standards Consortium |
| SDTM | SDTM | Study Data Tabulation Model |
| AE | Adverse Events | 不良事件 |
| DM | Demographics | 人口学信息 |
| LB | Laboratory | 实验室检查 |
| EDC | EDC | Electronic Data Capture，电子数据采集系统 |

### 10.2 参考文档
- CDISC SDTM Implementation Guide
- ICH E6(R2) GCP Guidelines
- FDA 21 CFR Part 11
- NMPA Clinical Trial Data Standards

### 10.3 联系方式
- **产品团队**：[邮箱]
- **研发团队**：[邮箱]
- **技术支持**：[邮箱]

---

## 文档变更记录

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|----------|
| v1.0 | 2024-12-04 | AI Assistant | 初始版本创建 |

---

**文档结束**
