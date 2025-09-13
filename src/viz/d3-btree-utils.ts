import * as d3 from 'd3';
import { BTreeNode } from '../btree';

export interface D3BTreeNode<T> {
  id: string;
  keys: T[];
  isLeaf: boolean;
  children: D3BTreeNode<T>[];
  x?: number;
  y?: number;
}

export interface BTreeRenderConfig {
  nodeWidth: number;
  keyHeight: number;
  levelSeparation: number;
  nodeSeparation: number;
}

export const DEFAULT_BTREE_CONFIG: BTreeRenderConfig = {
  nodeWidth: 50,
  keyHeight: 30,
  levelSeparation: 180,
  nodeSeparation: 40,
};

/**
 * Converts a B-tree node to D3 hierarchy format
 */
export function convertToD3Tree<T>(
  node: BTreeNode<T> | null,
  id = 'root'
): D3BTreeNode<T> | null {
  if (!node) return null;

  return {
    id,
    keys: node.keys,
    isLeaf: node.isLeaf,
    children: node.children.map((child, i) =>
      convertToD3Tree(child, `${id}-${i}`)
    ).filter(Boolean) as D3BTreeNode<T>[]
  };
}

/**
 * Creates a D3 tree layout with B-tree optimized spacing
 */
export function createBTreeLayout<T>(
  width: number,
  height: number,
  config: Partial<BTreeRenderConfig> = {}
): d3.TreeLayout<D3BTreeNode<T>> {
  const finalConfig = { ...DEFAULT_BTREE_CONFIG, ...config };

  return d3.tree<D3BTreeNode<T>>()
    .size([height - 100, width - 200])
    .separation((a, b) => {
      // Calculate separation based on node heights
      const aHeight = a.data.keys.length * finalConfig.keyHeight;
      const bHeight = b.data.keys.length * finalConfig.keyHeight;
      const maxHeight = Math.max(aHeight, bHeight);
      const baseSeparation = Math.max(1, maxHeight / finalConfig.keyHeight);
      return a.parent === b.parent ? baseSeparation : baseSeparation * 1.5;
    });
}

/**
 * Adjusts node positions to prevent overlap
 */
export function adjustNodePositions<T>(
  treeData: d3.HierarchyPointNode<D3BTreeNode<T>>,
  config: Partial<BTreeRenderConfig> = {}
): void {
  const finalConfig = { ...DEFAULT_BTREE_CONFIG, ...config };

  // Group nodes by level
  const nodesByLevel: Array<Array<d3.HierarchyPointNode<D3BTreeNode<T>>>> = [];
  treeData.descendants().forEach(node => {
    const level = node.depth;
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    nodesByLevel[level].push(node);
  });

  // Adjust vertical spacing within each level
  nodesByLevel.forEach(level => {
    level.sort((a, b) => a.x! - b.x!);

    for (let i = 1; i < level.length; i++) {
      const prevNode = level[i - 1];
      const currNode = level[i];

      const prevHeight = prevNode.data.keys.length * finalConfig.keyHeight;
      const currHeight = currNode.data.keys.length * finalConfig.keyHeight;
      const minSpacing = (prevHeight + currHeight) / 2 + finalConfig.nodeSeparation;

      const requiredY = prevNode.x! + minSpacing;
      if (currNode.x! < requiredY) {
        const adjustment = requiredY - currNode.x!;
        for (let j = i; j < level.length; j++) {
          level[j].x! += adjustment;
        }
      }
    }
  });
}

/**
 * Draws links (connections) between B-tree nodes
 */
export function drawBTreeLinks<T>(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  treeData: d3.HierarchyPointNode<D3BTreeNode<T>>
): void {
  g.selectAll('.link')
    .data(treeData.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d => {
      const sourceX = d.source.y! + 50;
      const sourceY = d.source.x!;
      const targetX = d.target.y! + 50;
      const targetY = d.target.x!;

      return `M ${sourceX},${sourceY}
              C ${(sourceX + targetX) / 2},${sourceY}
                ${(sourceX + targetX) / 2},${targetY}
                ${targetX},${targetY}`;
    })
    .attr('fill', 'none')
    .attr('stroke', '#666')
    .attr('stroke-width', 2);
}

export interface KeyRenderOptions<T> {
  getKeyDisplay: (key: T) => string;
  getKeyId: (key: T) => string | number;
  onKeyHover?: (key: T, element: SVGRectElement) => void;
  onKeyLeave?: (key: T, element: SVGRectElement) => void;
}

/**
 * Renders individual keys within a B-tree node
 */
export function renderNodeKeys<T>(
  nodeSelection: d3.Selection<SVGGElement, d3.HierarchyPointNode<D3BTreeNode<T>>, any, any>,
  config: Partial<BTreeRenderConfig> = {},
  options: KeyRenderOptions<T>
): void {
  const finalConfig = { ...DEFAULT_BTREE_CONFIG, ...config };

  nodeSelection.each(function(d) {
    const nodeData = d.data;
    const keyCount = nodeData.keys.length;
    const actualNodeHeight = keyCount * finalConfig.keyHeight;
    const actualNodeWidth = finalConfig.nodeWidth;

    // Add rectangle for node background
    d3.select(this)
      .append('rect')
      .attr('x', -actualNodeWidth / 2)
      .attr('y', -actualNodeHeight / 2)
      .attr('width', actualNodeWidth)
      .attr('height', actualNodeHeight)
      .attr('fill', 'white')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('rx', 4);

    // Add keys as separate boxes within the node (vertically stacked)
    nodeData.keys.forEach((key, i) => {
      const keyGroup = d3.select(this)
        .append('g')
        .attr('transform', `translate(0,${-actualNodeHeight / 2 + i * finalConfig.keyHeight + finalConfig.keyHeight / 2})`);

      // Add key separator lines (horizontal)
      if (i > 0) {
        keyGroup.append('line')
          .attr('x1', -actualNodeWidth / 2)
          .attr('y1', -finalConfig.keyHeight / 2)
          .attr('x2', actualNodeWidth / 2)
          .attr('y2', -finalConfig.keyHeight / 2)
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1);
      }

      // Add invisible background for individual key hover detection
      const hoverRect = keyGroup.append('rect')
        .attr('x', -actualNodeWidth / 2)
        .attr('y', -finalConfig.keyHeight / 2)
        .attr('width', actualNodeWidth)
        .attr('height', finalConfig.keyHeight)
        .attr('fill', 'transparent')
        .attr('class', 'key-hover-area')
        .attr('data-key-id', options.getKeyId(key));

      // Add key text
      keyGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .attr('class', 'key-text')
        .text(options.getKeyDisplay(key));
    });
  });
}

/**
 * Adds hover effects to individual keys
 */
export function addKeyHoverEffects<T>(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  onHover?: (keyId: string, element: SVGRectElement) => void,
  onLeave?: (keyId: string, element: SVGRectElement) => void
): void {
  g.selectAll('.key-hover-area')
    .on('mouseover', function(event) {
      const keyId = d3.select(this).attr('data-key-id');

      // Default highlight behavior
      d3.select(this)
        .attr('fill', '#f0f8ff')
        .attr('stroke', '#2196F3')
        .attr('stroke-width', 2);

      // Custom hover callback
      if (onHover) {
        onHover(keyId, this as SVGRectElement);
      }
    })
    .on('mouseout', function(event) {
      const keyId = d3.select(this).attr('data-key-id');

      // Default reset behavior
      d3.select(this)
        .attr('fill', 'transparent')
        .attr('stroke', 'none');

      // Custom leave callback
      if (onLeave) {
        onLeave(keyId, this as SVGRectElement);
      }
    });
}