# ice-entity-designer-react-demo

[ice-entity-designer](../ice-entity-designer) 的 **React 集成示例工程**（独立仓库，与 `ice-entity-designer` 平级）。

演示如何在 React 18 + TypeScript + **webpack** 中使用 `ice-entity-designer/react`：

| 能力 | 在本工程里的体现 |
|---|---|
| 挂载即初始化 / 卸载即销毁 | `<EntityDesignerCanvas>` 内部创建 ICE + EntityDesigner，StrictMode 双挂载安全 |
| 命令式 API（`ref`） | `src/Toolbar.tsx`：新增实体、连接关系、撤销/重做、校验、导出 Schema |
| 共享实例（`useEntityDesigner()`） | `src/SidePanel.tsx`：在画布子树内直接读取实体数 / 关系数 |
| 变更回调（`onChange`） | `src/App.tsx`：模型变更后刷新统计 |
| 非受控初值（`defaultValue`） | `src/seed.ts` 的示例模型（User / UserProfile / Role / Permission / Customer / Order） |

## 运行

```bash
npm install
npm run start    # http://localhost:8080
```

生产构建：

```bash
npm run build    # 产物在 dist/
```

类型检查：

```bash
npm run types:check
```

## 目录

```
.
├── public/index.html      # HtmlWebpackPlugin 模板（含页面样式）
├── src/
│   ├── index.tsx          # 入口
│   ├── App.tsx            # 布局：工具条 + 画布 + 侧栏
│   ├── Toolbar.tsx        # 命令式 API 演示（ref）
│   ├── SidePanel.tsx      # useEntityDesigner() 演示（画布子树内）
│   └── seed.ts            # 示例 ER 模型（serializeProject 结构）
├── tsconfig.json
└── webpack.config.js
```

## 核心用法

```tsx
import { useRef } from 'react';
import { EntityDesignerCanvas, useEntityDesigner } from 'ice-entity-designer/react';
import type { EntityDesignerHandle } from 'ice-entity-designer/react';

function Stats() {
  const designer = useEntityDesigner(); // 子树内取到同一个实例
  return <span>{designer ? `${designer.entities.length} 个实体` : '初始化中…'}</span>;
}

export default function App() {
  const ref = useRef<EntityDesignerHandle>(null);

  return (
    <>
      <button onClick={() => ref.current?.addEntity({ entityName: 'User' })}>新增实体</button>
      <button onClick={() => console.log(ref.current?.toSchemaString())}>导出 Schema</button>

      <EntityDesignerCanvas ref={ref} width={1080} height={620} defaultValue={initialJson} onChange={() => {}}>
        <Stats />
      </EntityDesignerCanvas>
    </>
  );
}
```

### 受控模式

把项目快照交给 React state 管理（与 `defaultValue` 二选一）：

```tsx
const [project, setProject] = useState(initialJson);

<EntityDesignerCanvas
  value={project}                                    // 外部改这个 → 同步进画布
  onChange={({ snapshot }) => setProject(snapshot)}  // 内部变更上报（同值回传不会重复载入）
/>
```

## 依赖说明

只需依赖 `ice-entity-designer` 一个包——它的**引擎内核（ice-render）已在构建时打包进去**，无需单独安装：

```json
"ice-entity-designer": "file:../ice-entity-designer",
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

因为 React 绑定（`ice-entity-designer/react`）目前在本地仓库的 `master` 上，尚未发布到 npm，所以用 `file:` 指向同级仓库。
等新版本发布后，换成版本号即可：

```json
"ice-entity-designer": "^0.0.17",
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

## 备注

- 构建工具是 **webpack**（`webpack` + `webpack-cli` + `webpack-dev-server` + `ts-loader` + `html-webpack-plugin`），不是 Vite。
- `tsconfig.json` 里的 `"types": []` 是刻意设置：避免从上层 `node_modules` 自动引入不兼容的 `@types/*`。
- 若项目 TypeScript ≥ 4.7，可把 `moduleResolution` 改为 `"bundler"` 或 `"node16"`，由 `exports` 解析 `ice-entity-designer/react` 的类型；旧版解析器可依赖包内的 `react.d.ts` 垫片。
