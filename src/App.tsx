import { useEffect, useRef, useState } from 'react';
import { EntityDesignerCanvas, FlowDesignerCanvas, useFlowDesigner } from 'ice-entity-designer/react';
import type { EntityDesignerHandle, FlowDesignerHandle } from 'ice-entity-designer/react';
import Toolbar from './Toolbar';
import SidePanel from './SidePanel';
import FlowToolbar from './FlowToolbar';
import FlowSidePanel from './FlowSidePanel';
import { seedProjectJson } from './seed';
import { seedFlow } from './flowSeed';

type Mode = 'entity' | 'flow';

/** 在画布子树内用 useFlowDesigner() 铺示例流程（挂载后执行一次） */
function FlowSeed({ onSeeded }: { onSeeded: () => void }) {
  const flow = useFlowDesigner();
  const seededRef = useRef(false);

  useEffect(() => {
    if (flow && !seededRef.current) {
      seededRef.current = true;
      seedFlow(flow);
      onSeeded();
    }
  }, [flow, onSeeded]);

  return null;
}

/**
 * 示例应用：两种视图共享同一套绑定写法。
 * - ER：<EntityDesignerCanvas> + EntityDesignerHandle（默认视图）
 * - 流程图：<FlowDesignerCanvas> + FlowDesignerHandle + useFlowDesigner()
 *
 * 工具条在画布之外，通过 ref 调用命令式 API；侧栏由画布的 children 渲染，
 * 用对应的 hook 读取同一实例；onChange 里刷新统计（流程图的 onChange 在拖动节点时也会触发）。
 */
export default function App() {
  const [mode, setMode] = useState<Mode>('entity');
  const entityRef = useRef<EntityDesignerHandle>(null);
  const flowRef = useRef<FlowDesignerHandle>(null);
  const [version, setVersion] = useState(0);
  const [schemaText, setSchemaText] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [flowJson, setFlowJson] = useState('');

  const bump = () => setVersion((v) => v + 1);

  return (
    <div className="app">
      <header className="header">
        <h1>ice-entity-designer · React 集成示例</h1>
        <p>
          用 webpack + React 18 + TypeScript 演示 <code>ice-entity-designer/react</code>：
          <code>ref</code> 命令式 API、<code>useEntityDesigner()</code> / <code>useFlowDesigner()</code> 共享实例、
          <code>onChange</code> 变更回调（受控模式写法见 README）。
        </p>
        <div className="mode-switch">
          <button className={mode === 'entity' ? 'active' : ''} onClick={() => setMode('entity')}>
            ER 模型（EntityDesignerCanvas）
          </button>
          <button className={mode === 'flow' ? 'active' : ''} onClick={() => setMode('flow')}>
            流程图（FlowDesignerCanvas）
          </button>
        </div>
      </header>

      {mode === 'entity' ? (
        <>
          <Toolbar apiRef={entityRef} onChanged={bump} onIssues={setIssues} onSchema={setSchemaText} />
          <div className="body">
            <EntityDesignerCanvas
              ref={entityRef}
              className="canvas-box"
              width={1080}
              height={620}
              defaultValue={seedProjectJson}
              onChange={() => bump()}
            >
              <SidePanel version={version} schemaText={schemaText} issues={issues} />
            </EntityDesignerCanvas>
          </div>
        </>
      ) : (
        <>
          <FlowToolbar apiRef={flowRef} onChanged={bump} onJson={setFlowJson} />
          <div className="body">
            <FlowDesignerCanvas
              ref={flowRef}
              className="canvas-box"
              width={1080}
              height={620}
              onChange={() => bump()}
            >
              <FlowSeed onSeeded={bump} />
              <FlowSidePanel version={version} jsonText={flowJson} />
            </FlowDesignerCanvas>
          </div>
        </>
      )}
    </div>
  );
}
