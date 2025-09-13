import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { BST, BSTNode } from './BST';
import { useD3Zoom } from './hooks/useD3Zoom';

interface BSTVisualizerProps {
  bst: BST<number>;
}

interface D3BSTNode {
  id: string;
  value: number;
  children: D3BSTNode[];
  x?: number;
  y?: number;
}

const convertToD3Tree = (node: BSTNode<number> | null, id = 'root'): D3BSTNode | null => {
  if (!node) return null;

  const children: D3BSTNode[] = [];
  if (node.left) {
    const leftChild = convertToD3Tree(node.left, `${id}-L`);
    if (leftChild) children.push(leftChild);
  }
  if (node.right) {
    const rightChild = convertToD3Tree(node.right, `${id}-R`);
    if (rightChild) children.push(rightChild);
  }

  return {
    id,
    value: node.value,
    children
  };
};

export const BSTVisualizer: React.FC<BSTVisualizerProps> = ({ bst }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setupZoom, applyInitialTransform } = useD3Zoom({ svgRef, initialOffset: 100 });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const root = bst.getRoot();
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
        .text('Empty BST - Insert some values to see the binary search tree structure');

      return;
    }

    const width = svgRef.current.clientWidth || 1200;
    const height = svgRef.current.clientHeight || 600;

    svg.attr('width', width)
      .attr('height', height);

    const g = svg.append('g');
    const zoom = setupZoom(svg, g);

    // Convert BST to D3 hierarchy
    const d3TreeData = convertToD3Tree(root);
    if (!d3TreeData) return;

    const hierarchyRoot = d3.hierarchy(d3TreeData);

    // Create tree layout (horizontal like B-tree)
    const treeLayout = d3.tree<D3BSTNode>()
      .size([height - 200, width - 200])
      .separation((a, b) => a.parent === b.parent ? 1 : 2);

    // Generate the tree structure
    const treeData = treeLayout(hierarchyRoot);

    // Draw links (connections between nodes) - swap x/y for horizontal layout
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.y! + 100)
      .attr('y1', d => d.source.x! + 100)
      .attr('x2', d => d.target.y! + 100)
      .attr('y2', d => d.target.x! + 100)
      .attr('stroke', '#666')
      .attr('stroke-width', 2);

    // Draw nodes - swap x/y for horizontal layout
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y! + 100},${d.x! + 100})`);

    // Add rounded rectangles for nodes (like B-tree)
    nodes.append('rect')
      .attr('x', -25)
      .attr('y', -20)
      .attr('width', 50)
      .attr('height', 40)
      .attr('fill', 'white')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('rx', 4);

    // Add text for node values
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(d => d.data.value);

    // Add hover effects
    nodes
      .on('mouseover', function() {
        d3.select(this).select('rect')
          .attr('fill', '#f0f8ff')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function() {
        d3.select(this).select('rect')
          .attr('fill', 'white')
          .attr('stroke-width', 2);
      });

    applyInitialTransform(svg, g, zoom, { width, height });

  }, [bst, setupZoom, applyInitialTransform]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />
    </div>
  );
};