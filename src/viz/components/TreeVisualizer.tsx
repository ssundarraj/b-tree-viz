import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { BTree, BTreeNode } from '../../btree';

interface TreeVisualizerProps {
  tree: BTree<number>;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ tree }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const root = tree.getRoot();
    if (!root) {
      svg.append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('fill', '#999')
        .text('Empty Tree');
      console.log('B-Tree Structure: Empty Tree');
      return;
    }

    // Log tree structure to console
    const logTreeStructure = (node: BTreeNode<number>, depth = 0): void => {
      const indent = '  '.repeat(depth);
      console.log(`${indent}Node: [${node.keys.join(', ')}]`);
      if (!node.isLeaf && node.children.length > 0) {
        node.children.forEach((child, i) => {
          console.log(`${indent}  Child ${i}:`);
          logTreeStructure(child, depth + 2);
        });
      }
    };

    console.log('\n=== B-Tree Structure ===');
    logTreeStructure(root);
    console.log('========================\n');

    const width = 800;
    const height = 500;
    const nodeWidth = 40;
    const nodeHeight = 35;
    const levelHeight = 80;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, 50)`);

    // Calculate positions for nodes
    const calculateNodePositions = (
      node: BTreeNode<number>, 
      x: number, 
      y: number, 
      levelWidth: number
    ) => {
      const boxWidth = node.keys.length * nodeWidth + (node.keys.length - 1) * 5;
      
      // Draw node rectangle for each key
      node.keys.forEach((key, i) => {
        const keyX = x - boxWidth / 2 + i * (nodeWidth + 5);
        
        g.append('rect')
          .attr('x', keyX)
          .attr('y', y)
          .attr('width', nodeWidth)
          .attr('height', nodeHeight)
          .attr('fill', '#718096')
          .attr('stroke', '#4a5568')
          .attr('stroke-width', 2)
          .attr('rx', 4);

        g.append('text')
          .attr('x', keyX + nodeWidth / 2)
          .attr('y', y + nodeHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(key);
      });

      // Draw children recursively
      if (!node.isLeaf && node.children.length > 0) {
        const childWidth = levelWidth / node.children.length;
        const startX = x - levelWidth / 2 + childWidth / 2;
        
        node.children.forEach((child, i) => {
          const childX = startX + i * childWidth;
          
          // Draw line to child
          g.append('line')
            .attr('x1', x)
            .attr('y1', y + nodeHeight)
            .attr('x2', childX)
            .attr('y2', y + levelHeight)
            .attr('stroke', '#a0aec0')
            .attr('stroke-width', 2);
          
          calculateNodePositions(
            child,
            childX,
            y + levelHeight,
            childWidth * 0.9
          );
        });
      }
    };

    calculateNodePositions(root, 0, 0, width * 0.8);

  }, [tree]);

  return (
    <svg ref={svgRef} style={{ width: '100%', height: '500px' }}></svg>
  );
};

export default TreeVisualizer;