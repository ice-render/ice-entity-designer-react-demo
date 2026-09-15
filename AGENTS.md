# AGENTS.md — ice-entity-designer-react-demo

## 项目定位

`ice-entity-designer` 的 **React 集成示例工程**（独立仓库，与 `ice-entity-designer` 平级）。
演示在 React 18 + TypeScript + **webpack** 里使用 `ice-entity-designer/react` 绑定：

- `<EntityDesignerCanvas>`：挂载即初始化 / 卸载即销毁，**StrictMode 双挂载安全**；
- `ref` 命令式 API（`src/Toolbar.tsx`）：新增实体、连接关系、撤销/重做、校验、导出 Schema；
- `useEntityDesigner()` 共享实例（`src/SidePanel.tsx`，画布子树内直接读数）；
- `onChange` 变更回调（`src/App.tsx`）与 `defaultValue` / `value` 受控·非受控两种用法。

**本仓不可替代的价值**：它是家族里**唯一跑「下游生产压缩」的地方** —— webpack 生产构建会 mangle 类名，
而 `ice-entity-designer` 自己的 rollup 构建配了 `keep_classnames`，所以示例页与单测都发现不了
「按类名判类型」这类缺陷。**改动应用层 / React 绑定层后，值得在这里跑一遍生产构建验证。**

## 分支与发版约定（家族铁律）

- 本仓主线是 **`master`**（远端默认分支也是它）。
- 实现改动走临时分支（`chore/*`、`refactor/*`）合入 `master`，别直接在 `master` 上写实现。
- 远端：Gitee `origin` + GitHub `origin-github`，**两处都要推**。
- 注：本仓名下的 `dev` 分支**不是开发主线**，当前落后 `master` 若干提交，别往上写改动。

## 门禁

只有两项（示例工程，没有 jest / e2e）：

- `npm run types:check` —— `tsc --noEmit`（顺带验证 `.d.ts` 与包内 `react.d.ts` 垫片）
- `npm run build` —— webpack 生产构建（顺带验证 `exports` 子路径 `ice-entity-designer/react` 的解析）

**手工验收**（改动绑定层后跑一遍，工作目录本仓）：

1. `npm install --ignore-scripts`（为什么必须加见「已知的坑」第 1 条）
2. `npm run build` → 起静态服务（用本仓端口 8095：`http-server -p 8095 -c-1 dist`；webpack dev 仍用 8080）
3. 用 Playwright 打开页面断言：初始 **`实体 6 个 · 关系 4 条`**（`src/seed.ts` 种子模型）、
   新增实体 +1、连接 +1 关系、撤销/重做来回、导出 Schema 可解析、重置回 6/4，
   且 **console / page error 均为 0**。

> 判据**不要只看「有没有报错」**：`constructor.name` 判型那类缺陷是**零报错、但所有操作静默无效**
> （压缩后变成 `'Dr' === 'Entity'`）。所以要断言「+1 / 撤销真的生效」，而不是只看控制台没红。

## 已知的坑（改之前先看）

1. **`npm install` 必须加 `--ignore-scripts`（既有问题，非本仓改动引入）**：`file:` 链接会让 npm 遍历
   **被链接包的依赖树**执行 `prepare`，命中 `ice-entity-designer` 锁定的 `typescript@4.6.2`（其已发布包带着
   `prepare: gulp build-eslint-rules`，那是 TypeScript 仓库自己的开发脚本）→ `gulp` 不存在 →
   `npm error code 127`。已 A/B 验证与 `prepare` / husky 无关。根治：两个仓库的 `typescript` 升到 5.6+
   （那些版本不再带这个 `prepare`）。
2. **别在本仓手工 symlink `node_modules/@types` 到兄弟仓库**：npm 会顺着 symlink 写进本仓 `node_modules`，
   曾把 `@types/jest` 清空、`tsc` 从 0 error 变 1430 error。坏了用 `npm ci` 还原，并清掉 npm 留下的
   `node_modules/.<name>-<hash>` staging symlink。
3. **两侧 `@types/react` 版本必须一致**（当前均为 18.3.x）：`file:` 链接下，仓库自身与其 `node_modules`
   里的 `@types/react` 会各被解析一次；版本不同（如 18.2.0 vs 18.3.31）即报
   `TS2786: 'EntityDesignerCanvas' cannot be used as a JSX component`。
4. **`package-lock.json` 刻意不入库**（见 `.gitignore` 里的说明）：`file:` 链接会把依赖解析成指向
   兄弟仓库 `node_modules` 的 link 条目，锁一份不可复现的清单只会误导。
5. **判类型一律用稳定 `typeId`，别用类名或字符串字面量**：`selected.constructor.typeId === FlowNode.typeId`
   （`typeId` 是 `namespace:Type` 格式，如 `ice-entity-designer:Entity`）。
   写成 `=== 'Entity'` / `=== 'FlowNode'` 会在生产压缩或命名空间升级后**静默失效**。
6. `tsconfig.json` 的 `"types": []` 是刻意设置：避免从上层 `node_modules` 自动引入不兼容的 `@types/*`。

## 家族级事实来源

- 引擎仓的 `AGENTS.md`（`../ice-render/AGENTS.md`）汇总了跨仓铁律（渲染 / 序列化 / 事件 / i18n 边界 / 动画等）；
  本仓改动涉及引擎契约时以那份为准。
- React 绑定本身在 `../ice-entity-designer/src/react`（发布为 `ice-entity-designer/react` 子路径）。
