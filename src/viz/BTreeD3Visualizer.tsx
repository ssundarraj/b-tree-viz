import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { BTree, BTreeNode } from '../btree';

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

  useEffect(() => {
    if (!svgRef.current) return;

    const root = tree.getRoot();
    if (!root) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1200;
    const height = 600;
    const nodeWidth = 80;
    const nodeHeight = 40;
    const levelSeparation = 180;
    const nodeSeparation = 20;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create container for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Convert BTree to D3 hierarchy
    const d3TreeData = convertToD3Tree(root);
    if (!d3TreeData) return;

    const hierarchyRoot = d3.hierarchy(d3TreeData);
    
    // Create tree layout (horizontal)
    const treeLayout = d3.tree<D3Node>()
      .size([height - 100, width - 200])
      .separation((a, b) => {
        return a.parent === b.parent ? 1 : 1.5;
      });

    // Generate the tree structure
    const treeData = treeLayout(hierarchyRoot);

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

    // Center the tree initially
    const bounds = g.node()?.getBBox();
    if (bounds) {
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;
      
      const scale = 0.8 * Math.min(width / fullWidth, height / fullHeight);
      const translate = [width / 2 - scale * midX, height / 2 - scale * midY];
      
      svg.call(
        zoom.transform as any,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    }

  }, [tree]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />
    </div>
  );
};

export const createSampleTree = (): BTree<number> => {
  const tree = new BTree<number>(4);
  
  const keys = [10, 20, 5, 6, 12, 30, 7, 17, 3, 8, 4, 2];
  keys.forEach(key => tree.insert(key));
  
  return tree;
};