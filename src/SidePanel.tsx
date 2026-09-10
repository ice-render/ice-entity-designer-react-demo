import { useEntityDesigner } from 'ice-entity-designer/react';

export type SidePanelProps = {
  /** 每次模型变更由 App 递增；作为依赖驱动重新读取统计 */
  version: number;
  /** TypeORM Schema 文本 */
  schemaText: string;
  /** 校验结果 */
  issues: any[];
};

/**
 * 侧栏：演示在画布子树内用 useEntityDesigner() 直接读取实例。
 * 它由 <EntityDesignerCanvas> 的 children 渲染，因此天然拿到同一个 EntityDesigner。
 */
export default function SidePanel({ version, schemaText, issues }: SidePanelProps) {
  const designer = useEntityDesigner();

  return (
    <div className="side">
      <div className="card">
        <h3>当前模型（useEntityDesigner）</h3>
        {designer ? (
          <div className="stats" data-version={version}>
            实体 <strong>{designer.entities.length}</strong> 个 · 关系 <strong>{designer.relations.length}</strong> 条
          </div>
        ) : (
          <div className="empty">初始化中…</div>
        )}
      </div>

      <div className="card">
        <h3>校验结果</h3>
        {issues.length === 0 ? (
          <div className="ok">暂无问题（点击「校验」运行）</div>
        ) : (
          <ul>
            {issues.map((issue, index) => (
              <li key={index}>
                {issue.level === 'error' ? '错误：' : '警告：'}
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>TypeORM Schema</h3>
        {schemaText ? <pre>{schemaText}</pre> : <div className="empty">点击「导出 TypeORM Schema」查看</div>}
      </div>
    </div>
  );
}
