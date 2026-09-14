# ice-entity-designer-react-demo

[ice-entity-designer](../ice-entity-designer) 的 **React 集成示例工程**（独立仓库，与 `ice-entity-designer` 平级）。

演示如何在 React 18 + TypeScript + **webpack** 中使用 `ice-entity-designer/react` 的**两种视图绑定**
—— ER 图 `<EntityDesignerCanvas>` 与流程图 `<FlowDesignerCanvas>`（页面顶部有视图切换）：

| 能力 | ER 视图 | 流程视图 |
|---|---|---|
| 挂载即初始化 / 卸载即销毁 | `<EntityDesignerCanvas>` 内部创建 ICE + EntityDesigner，StrictMode 双挂载安全 | `<FlowDesignerCanvas>`，同一套挂载语义 |
| 命令式 API（`ref`） | `src/Toolbar.tsx`：新增实体、连接关系、撤销/重做、校验、导出 Schema | `src/FlowToolbar.tsx`：加节点（过程 / 判定 / 起止 / 输入输出）、删除选中、撤销/重做、导出 JSON |
| 共享实例（`useXxxDesigner()`） | `src/SidePanel.tsx`：子树内直接读实体数 / 关系数 | `src/FlowSidePanel.tsx`：读节点数 / 连线数，并直接改选中项 |
| 变更回调（`onChange`） | `src/App.tsx`：模型变更后刷新统计 | 同左；**拖动节点也会触发** |
| 非受控初值（`defaultValue`） | `src/seed.ts` 的示例 ER 模型（User / UserProfile / Role / Permission / Customer / Order） | `src/flowSeed.ts` 的示例流程（下单履约：开始 → 浏览商品 → … → 结束） |

## 1. 运行

```bash
npm install --ignore-scripts
npm run start    # http://localhost:8080
```

> **为什么要加 `--ignore-scripts`**：本工程用 `file:` 链接同级仓库，npm 在链接阶段会遍历
> **被链接包的依赖树**并执行它们的 `prepare` 脚本。`ice-entity-designer` 锁定的
> `typescript@4.6.2` 在已发布的包里带着 `prepare: gulp build-eslint-rules`（那是 TypeScript
> 仓库自己的开发脚本），`gulp` 不存在 → 安装以 `code 127` 失败。这是**既有问题**，
> 与引擎/绑定层的改动无关（已用 A/B 验证：去掉本工程的 `prepare` 后同样失败）。
> 该脚本对本工程无意义，跳过即可；TypeScript 5.6+ 的包已不再带这个 `prepare`，
> 把两个仓库的 `typescript` 升上去也能根治。

生产构建：

```bash
npm run build    # 产物在 dist/
```

类型检查：

```bash
npm run types:check
```

## 2. 目录

```
.
├── public/index.html      # HtmlWebpackPlugin 模板（含页面样式）
├── src/
│   ├── index.tsx          # 入口
│   ├── App.tsx            # 布局 + ER / 流程图两种视图的切换
│   ├── Toolbar.tsx        # ER：命令式 API 演示（ref）
│   ├── SidePanel.tsx      # ER：useEntityDesigner() 演示（画布子树内）
│   ├── seed.ts            # ER：示例模型（serializeProject 结构）
│   ├── FlowToolbar.tsx    # 流程图：命令式 API 演示（ref）
│   ├── FlowSidePanel.tsx  # 流程图：useFlowDesigner() 演示 + 改选中项
│   └── flowSeed.ts        # 流程图：示例流程（下单履约，坐标写死）
├── tsconfig.json
└── webpack.config.js
```

## 3. 核心用法

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

### 3.1 受控模式

把项目快照交给 React state 管理（与 `defaultValue` 二选一）：

```tsx
const [project, setProject] = useState(initialJson);

<EntityDesignerCanvas
  value={project}                                    // 外部改这个 → 同步进画布
  onChange={({ snapshot }) => setProject(snapshot)}  // 内部变更上报（同值回传不会重复载入）
/>
```

> 流程图（`FlowDesignerCanvas` / `useFlowDesigner()` / `FlowDesignerHandle`）与上方**形状完全一致**，
> 只是把 `Entity*` 换成 `Flow*` —— 见 `src/FlowToolbar.tsx` / `src/FlowSidePanel.tsx`。

## 4. 依赖说明

依赖 `ice-entity-designer` + **引擎内核 `ice-render`**：`ice-entity-designer` 把 `ice-render` 作为
**peer 依赖**（产物里保持 `import ... from 'ice-render'`，**不打包**），所以宿主必须自己装同一份引擎实例：

```json
"ice-entity-designer": "file:../ice-entity-designer",
"ice-render": "^2.6.0",
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

React 绑定（`ice-entity-designer/react`）**已随 `0.3.0` 发布到 npm**。这里仍用 `file:` 指向同级仓库，
是为了能联调**本地尚未发布的**绑定改动；不需要联调时换成版本号即可：

```json
"ice-entity-designer": "^0.3.0",
"ice-render": "^2.6.0",
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

## 5. 已知约束

- **本工程是生产构建（webpack + terser），类名会被压缩**。这正是它能发现「按类名判类型」隐藏缺陷的原因：
  `constructor.name === 'Entity'` 在压缩后变成 `'Dr' === 'Entity'`，判断**静默失效**且页面不报错。
  库侧因此统一改用稳定标识 `Entity.typeId` / `Relation.typeId`（见 `src/utils/component_type_util.ts`），
  并由 `tests/designer/type-mangling.test.ts` 显式模拟改名锁住契约。
  这些 `typeId` 自 2026-09-13 起是 **`namespace:Type` 格式**（`ice-entity-designer:Entity`、
  `ice-entity-designer:FlowNode`…），因此本工程判型也统一写成 `selected.constructor.typeId === FlowNode.typeId`，
  **不要**再写 `=== 'FlowNode'` 这类字面量（升级后会静默失效）。
- **类型检查要求两侧的 `@types/react` 版本一致**。本工程用 `file:` 链接时，仓库自身与其 `node_modules` 里的
  `@types/react` 会各被解析一次；两者版本不同（例如 18.2.0 vs 18.3.31）会报
  `TS2786: 'EntityDesignerCanvas' cannot be used as a JSX component`。
  两侧都新增 `@types/react` 到同一版本即可（当前均为 18.3.x）。

## 6. 备注

- 构建工具是 **webpack**（`webpack` + `webpack-cli` + `webpack-dev-server` + `ts-loader` + `html-webpack-plugin`），不是 Vite。
- `tsconfig.json` 里的 `"types": []` 是刻意设置：避免从上层 `node_modules` 自动引入不兼容的 `@types/*`。
- 若项目 TypeScript ≥ 4.7，可把 `moduleResolution` 改为 `"bundler"` 或 `"node16"`，由 `exports` 解析 `ice-entity-designer/react` 的类型；旧版解析器可依赖包内的 `react.d.ts` 垫片。
