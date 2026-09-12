import type { FlowDesigner, FlowNodeKind, FlowPort } from 'ice-entity-designer/react';

type SeedNode = { kind: FlowNodeKind; title: string; left: number; top: number };
type SeedEdge = { from: number; to: number; label?: string; sourcePort?: FlowPort; targetPort?: FlowPort };

/** 示例流程：下单履约（坐标写死，保证每次打开一致） */
const SEED_NODES: SeedNode[] = [
  { kind: 'terminator', title: '开始', left: 610, top: 60 },
  { kind: 'process', title: '浏览商品', left: 590, top: 190 },
  { kind: 'process', title: '提交订单', left: 590, top: 320 },
  { kind: 'decision', title: '库存充足？', left: 600, top: 460 },
  { kind: 'process', title: '创建支付单', left: 590, top: 650 },
  { kind: 'decision', title: '支付成功？', left: 600, top: 790 },
  { kind: 'process', title: '安排发货', left: 590, top: 980 },
  { kind: 'terminator', title: '结束', left: 610, top: 1120 },
  { kind: 'io', title: '通知补货', left: 990, top: 460 },
  { kind: 'terminator', title: '结束（缺货）', left: 1010, top: 630 },
  { kind: 'process', title: '关闭订单', left: 990, top: 790 },
  { kind: 'terminator', title: '结束（未成交）', left: 1010, top: 960 },
];

const SEED_EDGES: SeedEdge[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4, label: '是' },
  { from: 3, to: 8, label: '否', sourcePort: 'R', targetPort: 'L' },
  { from: 8, to: 9 },
  { from: 4, to: 5 },
  { from: 5, to: 6, label: '是' },
  { from: 5, to: 10, label: '否', sourcePort: 'R', targetPort: 'L' },
  { from: 10, to: 11 },
  { from: 6, to: 7 },
];

/**
 * 用命令式 API 铺一个示例流程（也顺带演示 FlowDesigner 的 createNode / createEdge）。
 * 走 API 而不是快照 JSON，是为了让连线的端点由库按插槽算出，保证连线吸附正确。
 */
export function seedFlow(designer: FlowDesigner): void {
  designer.clear();
  const created = SEED_NODES.map((node) => designer.createNode(node.kind, node));
  SEED_EDGES.forEach((edge) => {
    designer.createEdge({
      sourceId: created[edge.from].state.id,
      targetId: created[edge.to].state.id,
      label: edge.label,
      sourcePort: edge.sourcePort,
      targetPort: edge.targetPort,
    });
  });
  designer.select(null);
  designer.resetHistory();
  designer.fitViewport();
}
