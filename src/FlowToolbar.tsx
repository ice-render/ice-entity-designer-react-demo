import type { RefObject } from 'react';
import type { FlowDesignerHandle, FlowNodeKind } from 'ice-entity-designer/react';
import { seedFlow } from './flowSeed';

export type FlowToolbarProps = {
  /** 画布组件的命令式句柄（由 App 持有并透传） */
  apiRef: RefObject<FlowDesignerHandle>;
  /** 变更后由 App 调用，用于刷新统计与面板 */
  onChanged: () => void;
  /** 导出 JSON 文本 */
  onJson: (json: string) => void;
};

/** 流程图工具条：演示通过 ref 调用 FlowDesigner 的命令式 API */
export default function FlowToolbar({ apiRef, onChanged, onJson }: FlowToolbarProps) {
  const api = () => apiRef.current;

  const addNode = (kind: FlowNodeKind, title: string) => {
    api()?.addNode(kind, { title });
    onChanged();
  };

  const removeSelected = () => {
    const id = api()?.designer?.selectedId;
    if (id) {
      api()?.remove(id);
      onChanged();
    }
  };

  return (
    <div className="toolbar">
      <button className="primary" onClick={() => addNode('process', '新步骤')}>
        加处理
      </button>
      <button onClick={() => addNode('decision', '新判定？')}>加判定</button>
      <button onClick={() => addNode('terminator', '结束')}>加起止</button>
      <button onClick={() => addNode('io', '新输入输出')}>加输入输出</button>
      <button onClick={removeSelected}>删除选中</button>
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
      <button
        onClick={() => {
          api()?.fitViewport();
          onChanged();
        }}
      >
        适应视图
      </button>
      <button onClick={() => onJson(api()?.serialize() ?? '')}>导出 JSON</button>
      <button
        onClick={() => {
          const designer = api()?.designer;
          if (designer) {
            seedFlow(designer);
          }
          onChanged();
        }}
      >
        重置示例
      </button>
    </div>
  );
}
