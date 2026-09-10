import type { RefObject } from 'react';
import type { EntityDesignerHandle } from 'ice-entity-designer/react';
import { seedProjectJson } from './seed';

const idField = { name: 'id', type: 'number', primary: true, autoIncrement: true, nullable: false };

export type ToolbarProps = {
  /** 画布组件的命令式句柄（由 App 持有并透传） */
  apiRef: RefObject<EntityDesignerHandle>;
  /** 模型变更后由 App 调用，用于刷新统计 */
  onChanged: () => void;
  /** 校验结果 */
  onIssues: (issues: any[]) => void;
  /** TypeORM Schema 文本 */
  onSchema: (schemaText: string) => void;
};

/** 工具条：演示通过 ref 调用命令式 API */
export default function Toolbar({ apiRef, onChanged, onIssues, onSchema }: ToolbarProps) {
  const api = () => apiRef.current;

  const addEntity = () => {
    const count = api()?.designer ? api()!.designer!.entities.length : 0;
    api()?.addEntity({ entityName: `Entity${count + 1}`, fields: [idField] });
    onChanged();
  };

  const addRelation = () => {
    const designer = api()?.designer;
    if (!designer || designer.entities.length < 2) {
      return;
    }
    const list = designer.entities;
    const source = list[list.length - 2];
    const target = list[list.length - 1];
    api()?.connect({
      sourceId: source.state.id,
      targetId: target.state.id,
      relationType: 'one-to-many',
      sourceField: 'id',
      targetField: 'id',
    });
    onChanged();
  };

  const exportSchema = () => {
    const schema = api()?.toSchemaObject() ?? [];
    onSchema(JSON.stringify(schema, null, 2));
  };

  const validate = () => {
    onIssues(api()?.validate() ?? []);
  };

  const reset = () => {
    api()?.loadProject(seedProjectJson);
    onIssues([]);
    onChanged();
  };

  return (
    <div className="toolbar">
      <button className="primary" onClick={addEntity}>
        新增实体
      </button>
      <button onClick={addRelation}>连接最后两个实体</button>
      <button
        onClick={() => {
          api()?.undo();
          onChanged();
        }}
      >
        撤销
      </button>
      <button
        onClick={() => {
          api()?.redo();
          onChanged();
        }}
      >
        重做
      </button>
      <button onClick={validate}>校验</button>
      <button onClick={exportSchema}>导出 TypeORM Schema</button>
      <button onClick={reset}>重置示例</button>
    </div>
  );
}
