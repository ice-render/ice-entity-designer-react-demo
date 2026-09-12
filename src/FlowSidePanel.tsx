import { useFlowDesigner } from 'ice-entity-designer/react';
import { FLOW_NODE_KINDS } from 'ice-entity-designer/react';

export type FlowSidePanelProps = {
  /** 每次模型变更由 App 递增；作为依赖驱动重新读取选中项与统计 */
  version: number;
  /** 导出的流程 JSON */
  jsonText: string;
};

const rowStyle = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } as const;
const labelStyle = { width: 56, color: '#475569', fontSize: 12 } as const;
const inputStyle = { flex: 1, minWidth: 0, padding: '4px 8px', fontSize: 12 } as const;

/**
 * 流程图侧栏：演示 useFlowDesigner() 读取同一实例，并直接把改动写回模型。
 *
 * 注意：这里由 React 负责 DOM 协调（面板控件不会被整块重建），因此颜色输入框
 * 是受控的 —— 与 vanilla 示例里「手写面板必须避免 innerHTML 重建」是同一个坑的两种解法。
 */
export default function FlowSidePanel({ version, jsonText }: FlowSidePanelProps) {
  const flow = useFlowDesigner();
  const selected: any = flow ? flow.selected : null;

  const commit = (patch: Record<string, any>) => {
    if (!flow || !selected) {
      return;
    }
    if (selected.constructor.typeId === 'FlowNode') {
      flow.updateNode(selected.state.id, patch);
    } else {
      flow.updateEdge(selected.state.id, patch);
    }
  };

  return (
    <div className="side">
      <div className="card">
        <h3>当前流程（useFlowDesigner）</h3>
        {flow ? (
          <div className="stats" data-version={version}>
            节点 <strong>{flow.nodes.length}</strong> 个 · 连线 <strong>{flow.edges.length}</strong> 条
            {flow.selectedId ? <span style={{ marginLeft: 8, color: '#64748b' }}>已选中</span> : null}
          </div>
        ) : (
          <div className="empty">初始化中…</div>
        )}
      </div>

      <div className="card">
        <h3>选中项属性</h3>
        {!flow || !selected ? (
          <div className="empty">点击画布中的节点或连线进行编辑（拖动节点时这里与 JSON 会实时同步）</div>
        ) : selected.constructor.typeId === 'FlowNode' ? (
          <div data-selected-kind="node">
            <div style={rowStyle}>
              <span style={labelStyle}>标题</span>
              <input
                style={inputStyle}
                defaultValue={selected.state.title}
                key={`title-${selected.state.id}-${selected.state.title}`}
                onBlur={(event) => commit({ title: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    (event.target as HTMLInputElement).blur();
                  }
                }}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>类型</span>
              <select
                style={inputStyle}
                value={selected.state.kind}
                onChange={(event) => {
                  const preset = FLOW_NODE_KINDS[event.target.value as keyof typeof FLOW_NODE_KINDS];
                  commit({
                    kind: event.target.value,
                    width: preset.width,
                    height: preset.height,
                    fillColor: preset.fill,
                    strokeColor: preset.stroke,
                  });
                }}
              >
                {Object.keys(FLOW_NODE_KINDS).map((kind) => (
                  <option key={kind} value={kind}>
                    {FLOW_NODE_KINDS[kind as keyof typeof FLOW_NODE_KINDS].label}
                  </option>
                ))}
              </select>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>填充</span>
              <input
                type="color"
                data-field="fill"
                value={selected.state.fillColor}
                onChange={(event) => commit({ fillColor: event.target.value })}
              />
              <span style={{ ...labelStyle, width: 32, marginLeft: 8 }}>边框</span>
              <input
                type="color"
                data-field="stroke"
                value={selected.state.strokeColor}
                onChange={(event) => commit({ strokeColor: event.target.value })}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>文字颜色</span>
              <input
                type="color"
                data-field="textColor"
                value={selected.state.textColor}
                onChange={(event) => commit({ textColor: event.target.value })}
              />
              <span style={{ ...labelStyle, width: 32, marginLeft: 8 }}>字号</span>
              <input
                style={inputStyle}
                type="number"
                data-field="fontSize"
                min={8}
                defaultValue={selected.state.fontSize}
                key={`fs-${selected.state.id}-${selected.state.fontSize}`}
                onBlur={(event) => commit({ fontSize: Number(event.target.value) || selected.state.fontSize })}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>尺寸</span>
              <input
                style={inputStyle}
                type="number"
                defaultValue={Math.round(selected.state.width)}
                key={`w-${selected.state.id}-${Math.round(selected.state.width)}`}
                onBlur={(event) => commit({ width: Number(event.target.value) || selected.state.width })}
              />
              <input
                style={inputStyle}
                type="number"
                defaultValue={Math.round(selected.state.height)}
                key={`h-${selected.state.id}-${Math.round(selected.state.height)}`}
                onBlur={(event) => commit({ height: Number(event.target.value) || selected.state.height })}
              />
            </div>
          </div>
        ) : (
          <div data-selected-kind="edge">
            <div style={rowStyle}>
              <span style={labelStyle}>标签</span>
              <input
                style={inputStyle}
                data-field="label"
                defaultValue={selected.state.label}
                key={`label-${selected.state.id}-${selected.state.label}`}
                onBlur={(event) => commit({ label: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    (event.target as HTMLInputElement).blur();
                  }
                }}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>形态</span>
              <select
                style={inputStyle}
                data-field="linkShape"
                value={selected.state.linkShape}
                onChange={(event) => commit({ linkShape: event.target.value })}
              >
                <option value="visio">Visio 折线</option>
                <option value="bezier">贝塞尔曲线</option>
              </select>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>连线颜色</span>
              <input
                type="color"
                data-field="lineColor"
                value={selected.state.style?.strokeStyle || '#475569'}
                onChange={(event) => commit({ style: { strokeStyle: event.target.value, fillStyle: event.target.value } })}
              />
              <span style={{ ...labelStyle, width: 32, marginLeft: 8 }}>粗细</span>
              <input
                style={inputStyle}
                type="number"
                data-field="lineWidth"
                min={0.5}
                step={0.5}
                defaultValue={selected.state.style?.lineWidth ?? 1.6}
                key={`lw-${selected.state.id}-${selected.state.style?.lineWidth}`}
                onBlur={(event) => commit({ style: { lineWidth: Number(event.target.value) || 1.6 } })}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>标签颜色</span>
              <input
                type="color"
                data-field="labelColor"
                value={selected.state.labelStyle?.fillStyle || '#334155'}
                onChange={(event) => commit({ labelStyle: { fillStyle: event.target.value } })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>流程 JSON</h3>
        {jsonText ? <pre>{jsonText}</pre> : <div className="empty">点击「导出 JSON」查看</div>}
      </div>
    </div>
  );
}
