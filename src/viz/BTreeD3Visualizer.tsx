import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { BTree } from '../btree';
import { useD3Zoom } from './hooks/useD3Zoom';
import {
  convertToD3Tree,
  createBTreeLayout,
  adjustNodePositions,
  drawBTreeLinks,
  renderNodeKeys,
  addKeyHoverEffects,
  DEFAULT_BTREE_CONFIG
} from './d3-btree-utils';

interface BTreeVisualizerProps {
  tree: BTree<number>;
}


export const BTreeD3Visualizer: React.FC<BTreeVisualizerProps> = ({ tree }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setupZoom, applyInitialTransform } = useD3Zoom({ svgRef, initialOffset: 100 });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const root = tree.getRoot();
    if (!root) {
      svg.attr('width', 1200)
        .attr('height', 600);

      svg.append('text')
        .attr('x', 600)
        .attr('y', 300)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '24px')
        .attr('font-family', 'Arial, sans-serif')
        .attr('fill', '#666')
        .text('Empty Tree - Insert some values to see the B-tree structure');

      return;
    }

    const width = svgRef.current.clientWidth || 1200;
    const height = svgRef.current.clientHeight || 600;

    svg.attr('width', width)
      .attr('height', height);

    const g = svg.append('g');
    const zoom = setupZoom(svg, g);

    // Convert BTree to D3 hierarchy using shared utility
    const d3TreeData = convertToD3Tree(root);
    if (!d3TreeData) return;

    const hierarchyRoot = d3.hierarchy(d3TreeData);

    // Create tree layout using shared utility
    const treeLayout = createBTreeLayout<number>(width, height, { nodeWidth: 50 });
    const treeData = treeLayout(hierarchyRoot);

    // Adjust positions using shared utility
    adjustNodePositions(treeData);

    // Draw links using shared utility
    drawBTreeLinks(g, treeData);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y! + 50},${d.x!})`);

    // Render node keys using shared utility
    renderNodeKeys(nodes, { nodeWidth: 50 }, {
      getKeyDisplay: (key) => key.toString(),
      getKeyId: (key) => key.toString()
    });

    // Add hover effects using shared utility
    addKeyHoverEffects(g);

    applyInitialTransform(svg, g, zoom, { width, height });

  }, [tree]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />
    </div>
  );
};

export const createSampleTree = (order: number = 4): BTree<number> => {
  const tree = new BTree<number>(order);

  const keys = [10, 20, 5, 6, 12, 30, 7, 17, 3, 8, 4, 2];
  keys.forEach(key => tree.insert(key));

  return tree;
};