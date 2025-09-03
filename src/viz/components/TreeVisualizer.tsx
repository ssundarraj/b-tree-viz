import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { BTree, BTreeNode } from '../../btree';

interface TreeVisualizerProps {
  tree: BTree<number>;
  version: number;
  highlightedNode?: number;
  operationType?: 'insert' | 'delete' | 'search';
}

interface TreeNodeData {
  node: BTreeNode<number>;
  x: number;
  y: number;
  width: number;
  height: number;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ 
  tree, 
  version, 
  highlightedNode,
  operationType 
}) => {
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
      return;
    }

    const width = 1000;
    const height = 600;
    const nodeWidth = 40;
    const nodeHeight = 35;
    const levelHeight = 100;
    const nodeSpacing = 15;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, 50)`);

    // Calculate positions for nodes
    const calculateNodePositions = (
      node: BTreeNode<number>, 
      x: number, 
      y: number, 
      levelWidth: number
    ): TreeNodeData[] => {
      const nodeData: TreeNodeData[] = [];
      const boxWidth = node.keys.length * nodeWidth + (node.keys.length - 1) * 5;
      
      nodeData.push({
        node,
        x: x - boxWidth / 2,
        y,
        width: boxWidth,
        height: nodeHeight
      });

      if (!node.isLeaf && node.children.length > 0) {
        const childWidth = levelWidth / node.children.length;
        const startX = x - levelWidth / 2 + childWidth / 2;
        
        node.children.forEach((child, i) => {
          const childX = startX + i * childWidth;
          const childNodes = calculateNodePositions(
            child,
            childX,
            y + levelHeight,
            childWidth * 0.9
          );
          nodeData.push(...childNodes);
        });
      }

      return nodeData;
    };

    const treeData = calculateNodePositions(root, 0, 0, width * 0.8);

    // Draw connections
    const connections = g.append('g').attr('class', 'connections');
    
    treeData.forEach(nodeData => {
      if (!nodeData.node.isLeaf && nodeData.node.children) {
        nodeData.node.children.forEach((child, i) => {
          const childData = treeData.find(d => d.node === child);
          if (childData) {
            connections.append('line')
              .attr('class', 'tree-link')
              .attr('x1', nodeData.x + nodeData.width / 2)
              .attr('y1', nodeData.y + nodeData.height)
              .attr('x2', childData.x + childData.width / 2)
              .attr('y2', childData.y);
          }
        });
      }
    });

    // Draw nodes
    const nodes = g.append('g').attr('class', 'nodes');

    treeData.forEach(nodeData => {
      const nodeGroup = nodes.append('g')
        .attr('class', 'tree-node')
        .attr('transform', `translate(${nodeData.x}, ${nodeData.y})`);

      // Draw keys in the node
      nodeData.node.keys.forEach((key, i) => {
        const keyX = i * (nodeWidth + 5);
        
        let rectClass = 'node-rect';
        if (highlightedNode === key) {
          if (operationType === 'search') rectClass += ' searching';
          else if (operationType === 'delete') rectClass += ' deleting';
          else if (operationType === 'insert') rectClass += ' splitting';
        }

        nodeGroup.append('rect')
          .attr('class', rectClass)
          .attr('x', keyX)
          .attr('y', 0)
          .attr('width', nodeWidth)
          .attr('height', nodeHeight);

        nodeGroup.append('text')
          .attr('class', 'node-key')
          .attr('x', keyX + nodeWidth / 2)
          .attr('y', nodeHeight / 2)
          .text(key);
      });
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${width / 2}, 50) scale(${event.transform.k})`);
      });

    svg.call(zoom);

  }, [tree, version, highlightedNode, operationType]);

  return (
    <div className="tree-container">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default TreeVisualizer;