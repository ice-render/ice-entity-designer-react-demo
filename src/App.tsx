import { useRef, useState } from 'react';
import { EntityDesignerCanvas } from 'ice-entity-designer/react';
import type { EntityDesignerHandle } from 'ice-entity-designer/react';
import Toolbar from './Toolbar';
import SidePanel from './SidePanel';
import { seedProjectJson } from './seed';

/**
 * 示例应用：
 * - 工具条在画布之外，通过 ref 调用命令式 API；
 * - 侧栏由 <EntityDesignerCanvas> 的 children 渲染，用 useEntityDesigner() 读取同一实例；
 * - 画布用 defaultValue 载入示例模型（非受控），onChange 里刷新统计。
 */
export default function App() {
  const apiRef = useRef<EntityDesignerHandle>(null);
  const [version, setVersion] = useState(0);
  const [schemaText, setSchemaText] = useState('');
  const [issues, setIssues] = useState<any[]>([]);

  const bump = () => setVersion((v) => v + 1);

  return (
    <div className="app">
      <header className="header">
        <h1>ice-entity-designer · React 集成示例</h1>
        <p>
          用 webpack + React 18 + TypeScript 演示 <code>ice-entity-designer/react</code>：
          <code>ref</code> 命令式 API、<code>useEntityDesigner()</code> 共享实例、<code>onChange</code> 变更回调（受控模式写法见 README）。
        </p>
      </header>

      <Toolbar apiRef={apiRef} onChanged={bump} onIssues={setIssues} onSchema={setSchemaText} />

      <div className="body">
        <EntityDesignerCanvas
          ref={apiRef}
          className="canvas-box"
          width={1080}
          height={620}
          defaultValue={seedProjectJson}
          onChange={() => bump()}
        >
          <SidePanel version={version} schemaText={schemaText} issues={issues} />
        </EntityDesignerCanvas>
      </div>
    </div>
  );
}
