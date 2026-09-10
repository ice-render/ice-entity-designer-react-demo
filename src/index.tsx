import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 故意包一层 StrictMode：开发模式下 effect 会「挂载 → 卸载 → 再挂载」，
// <EntityDesignerCanvas> 必须能安全地重复 init / destroy（引擎侧 init 幂等 + destroy 解绑全局监听）。
const container = document.getElementById('root');
createRoot(container as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
