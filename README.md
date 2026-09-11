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

因为 React 绑定（`ice-entity-designer/react`）目前还只在本仓库的 `dev` 上（`master` 由 `dev` 快进跟随），尚未发布到 npm，所以用 `file:` 指向同级仓库。
等新版本发布后，换成版本号即可：

```json
"ice-entity-designer": "^0.0.17",
"react": "^18.2.0",
"react-dom": "^18.2.0"
```

## 已知约束

- **本工程是生产构建（webpack + terser），类名会被压缩**。这正是它能发现「按类名判类型」隐藏缺陷的原因：
  `constructor.name === 'Entity'` 在压缩后变成 `'Dr' === 'Entity'`，判断**静默失效**且页面不报错。
  库侧因此统一改用稳定标识 `Entity.typeId` / `Relation.typeId`（见 `src/utils/component_type_util.ts`），
  并由 `tests/designer/type-mangling.test.ts` 显式模拟改名锁住契约。
- **类型检查要求两侧的 `@types/react` 版本一致**。本工程用 `file:` 链接时，仓库自身与其 `node_modules` 里的
  `@types/react` 会各被解析一次；两者版本不同（例如 18.2.0 vs 18.3.31）会报
  `TS2786: 'EntityDesignerCanvas' cannot be used as a JSX component`。
  两侧都新增 `@types/react` 到同一版本即可（当前均为 18.3.x）。

## 备注

- 构建工具是 **webpack**（`webpack` + `webpack-cli` + `webpack-dev-server` + `ts-loader` + `html-webpack-plugin`），不是 Vite。
- `tsconfig.json` 里的 `"types": []` 是刻意设置：避免从上层 `node_modules` 自动引入不兼容的 `@types/*`。
- 若项目 TypeScript ≥ 4.7，可把 `moduleResolution` 改为 `"bundler"` 或 `"node16"`，由 `exports` 解析 `ice-entity-designer/react` 的类型；旧版解析器可依赖包内的 `react.d.ts` 垫片。
