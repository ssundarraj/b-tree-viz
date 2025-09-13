import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { BTree, BTreeNode } from '../btree';
import { useD3Zoom } from './hooks/useD3Zoom';

interface BTreeVisualizerProps {
  tree: BTree<number>;
}

interface D3Node {
  id: string;
  keys: number[];
  isLeaf: boolean;
  children: D3Node[];
  x?: number;
  y?: number;
}

const convertToD3Tree = (node: BTreeNode<number> | null, id = 'root'): D3Node | null => {
  if (!node) return null;
  
  return {
    id,
    keys: node.keys,
    isLeaf: node.isLeaf,
    children: node.children.map((child, i) => 
      convertToD3Tree(child, `${id}-${i}`)
    ).filter(Boolean) as D3Node[]
  };
};

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
    const nodeWidth = 80;
    const nodeHeight = 40;
    const levelSeparation = 180;
    const nodeSeparation = 20;

    svg.attr('width', width)
      .attr('height', height);

    const g = svg.append('g');
    const zoom = setupZoom(svg, g);

    // Convert BTree to D3 hierarchy
    const d3TreeData = convertToD3Tree(root);
    if (!d3TreeData) return;

    const hierarchyRoot = d3.hierarchy(d3TreeData);
    
    // Create tree layout (horizontal)
    const treeLayout = d3.tree<D3Node>()
      .size([height - 100, width - 200])
      .separation((a, b) => {
        // Calculate separation based on node heights
        const aHeight = a.data.keys.length * 30;
        const bHeight = b.data.keys.length * 30;
        const maxHeight = Math.max(aHeight, bHeight);
        // Use a multiplier based on node size
        const baseSeparation = maxHeight / 30; // Scale factor
        return a.parent === b.parent ? baseSeparation : baseSeparation * 1.5;
      });

    // Generate the tree structure
    const treeData = treeLayout(hierarchyRoot);
    
    // Adjust positions to prevent overlap
    const nodesByLevel: Array<Array<any>> = [];
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
        
        const prevHeight = prevNode.data.keys.length * 30;
        const currHeight = currNode.data.keys.length * 30;
        const minSpacing = (prevHeight + currHeight) / 2 + 40; // 40px buffer
        
        const requiredY = prevNode.x! + minSpacing;
        if (currNode.x! < requiredY) {
          const adjustment = requiredY - currNode.x!;
          // Shift this node and all subsequent nodes down
          for (let j = i; j < level.length; j++) {
            level[j].x! += adjustment;
          }
        }
      }
    });

    // Draw links (connections between nodes)
    const links = g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        // Swap x and y for horizontal layout
        const sourceX = d.source.y! + 50;
        const sourceY = d.source.x!;
        const targetX = d.target.y! + 50;
        const targetY = d.target.x!;
        
        // Create curved path
        return `M ${sourceX},${sourceY}
                C ${(sourceX + targetX) / 2},${sourceY}
                  ${(sourceX + targetX) / 2},${targetY}
                  ${targetX},${targetY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 2);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y! + 50},${d.x!})`);

    // Calculate node dimensions based on number of keys (vertical layout)
    nodes.each(function(d) {
      const nodeData = d.data;
      const keyCount = nodeData.keys.length;
      const keyHeight = 30;
      const actualNodeHeight = keyCount * keyHeight;
      const actualNodeWidth = 50;
      
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
          .attr('transform', `translate(0,${-actualNodeHeight / 2 + i * keyHeight + keyHeight / 2})`);

        // Add key separator lines (horizontal now)
        if (i > 0) {
          keyGroup.append('line')
            .attr('x1', -actualNodeWidth / 2)
            .attr('y1', -keyHeight / 2)
            .attr('x2', actualNodeWidth / 2)
            .attr('y2', -keyHeight / 2)
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1);
        }

        // Add key text
        keyGroup.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(key);
      });
    });

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