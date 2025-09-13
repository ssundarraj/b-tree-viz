import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { BTreeNode } from '../btree';
import { useD3Zoom } from './hooks/useD3Zoom';
import {
  convertToD3Tree,
  createBTreeLayout,
  adjustNodePositions,
  drawBTreeLinks,
  renderNodeKeys,
  addKeyHoverEffects
} from './d3-btree-utils';

interface IndexPointer {
  id: number;
  rowIndex: number;
}

interface TableRow {
  id: number;
  name: string;
}

interface IndexBTreeVisualizerProps {
  tree: any; // IndexBTree
  tableData: TableRow[];
  showArrows?: boolean;
}


export const IndexBTreeVisualizer: React.FC<IndexBTreeVisualizerProps> = ({ tree, tableData, showArrows = true }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setupZoom, applyInitialTransform } = useD3Zoom({ svgRef, initialOffset: 100 });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const root = tree.getRoot();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const treeWidth = Math.min(700, width * 0.5);
    const availableRightSpace = width - treeWidth - 100; // Space for table area
    const tableWidth = Math.min(350, availableRightSpace * 0.8);
    const tableX = treeWidth + 100 + (availableRightSpace - tableWidth) / 2; // Center table in right area

    if (!root) {
      // Show empty tree message
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);
      
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '18px')
        .attr('font-family', 'Arial, sans-serif')
        .attr('fill', '#666')
        .text('Empty Index - Insert records to see the B-tree index');
      
      return;
    }

    svg.attr('width', width)
      .attr('height', height);

    const g = svg.append('g');
    const zoom = setupZoom(svg, g);

    // Convert BTree to D3 hierarchy using shared utility
    const d3TreeData = convertToD3Tree(root);
    if (!d3TreeData) return;

    const hierarchyRoot = d3.hierarchy(d3TreeData);

    // Create tree layout using shared utility with custom size for left side
    const maxTreeHeight = Math.min(400, height * 0.6);
    const treeLayout = createBTreeLayout<IndexPointer>(treeWidth - 150, maxTreeHeight, { nodeWidth: 60 });
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
    renderNodeKeys(nodes, { nodeWidth: 60 }, {
      getKeyDisplay: (key) => key.id.toString(),
      getKeyId: (key) => key.id
    });

    // Render SQL Table
    const rowHeight = 35;
    const headerHeight = 40;
    const tableStartY = Math.max(100, (height - (headerHeight + tableData.length * rowHeight)) / 2);
    
    // Table background
    g.append('rect')
      .attr('x', tableX)
      .attr('y', tableStartY - 5)
      .attr('width', tableWidth)
      .attr('height', headerHeight + tableData.length * rowHeight + 10)
      .attr('fill', 'white')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    // Table title
    g.append('text')
      .attr('x', tableX + tableWidth / 2)
      .attr('y', tableStartY - 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#333')
      .text('users table');

    // Table header
    const headerGroup = g.append('g');
    
    headerGroup.append('rect')
      .attr('x', tableX)
      .attr('y', tableStartY)
      .attr('width', tableWidth)
      .attr('height', headerHeight)
      .attr('fill', '#e9ecef')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1);

    headerGroup.append('line')
      .attr('x1', tableX + 80)
      .attr('y1', tableStartY)
      .attr('x2', tableX + 80)
      .attr('y2', tableStartY + headerHeight)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1);

    headerGroup.append('text')
      .attr('x', tableX + 40)
      .attr('y', tableStartY + headerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#333')
      .text('id');

    headerGroup.append('text')
      .attr('x', tableX + 80 + (tableWidth - 80) / 2)
      .attr('y', tableStartY + headerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#333')
      .text('name');

    // Table rows
    const tableRows = g.selectAll('.table-row')
      .data(tableData)
      .enter()
      .append('g')
      .attr('class', 'table-row')
      .attr('data-row-id', d => d.id);

    tableRows.each(function(d, i) {
      const rowY = tableStartY + headerHeight + i * rowHeight;
      
      // Row background
      d3.select(this).append('rect')
        .attr('x', tableX)
        .attr('y', rowY)
        .attr('width', tableWidth)
        .attr('height', rowHeight)
        .attr('fill', i % 2 === 0 ? '#f8f9fa' : 'white')
        .attr('stroke', '#eee')
        .attr('stroke-width', 0.5);

      // Column separator
      d3.select(this).append('line')
        .attr('x1', tableX + 80)
        .attr('y1', rowY)
        .attr('x2', tableX + 80)
        .attr('y2', rowY + rowHeight)
        .attr('stroke', '#eee')
        .attr('stroke-width', 1);

      // ID column
      d3.select(this).append('text')
        .attr('x', tableX + 40)
        .attr('y', rowY + rowHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace')
        .attr('fill', '#333')
        .text(d.id);

      // Name column
      d3.select(this).append('text')
        .attr('x', tableX + 90)
        .attr('y', rowY + rowHeight / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '13px')
        .attr('font-family', 'Arial, sans-serif')
        .attr('fill', '#333')
        .text(d.name);
    });

    // Conditionally add arrows if showArrows is true
    let arrows: any[] = [];
    
    if (showArrows) {
      // Add arrow marker definition for arrowheads
      const defs = svg.append('defs');
      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#2196F3')
        .attr('stroke', '#2196F3');

      // Collect all index pointers from the tree
      nodes.each(function(nodeData) {
        const node = d3.select(this);
        const nodeTransform = node.attr('transform');
        const translateRegex = /translate\(([^,]+),([^)]+)\)/;
        const match = nodeTransform.match(translateRegex);
        
        if (match) {
          const nodeX = parseFloat(match[1]);
          const nodeY = parseFloat(match[2]);
          
          nodeData.data.keys.forEach((key, keyIndex) => {
            // Find the corresponding table row
            const tableRowIndex = tableData.findIndex(row => row.id === key.id);
            if (tableRowIndex !== -1) {
              const keyHeight = 30;
              const actualNodeHeight = nodeData.data.keys.length * keyHeight;
              
              // Source point (right edge of index entry)
              const sourceX = nodeX + 30; // Right edge of node
              const sourceY = nodeY + (-actualNodeHeight / 2 + keyIndex * keyHeight + keyHeight / 2);
              
              // Target point (left edge of table row)
              const targetX = tableX - 10;
              const targetY = tableStartY + headerHeight + tableRowIndex * rowHeight + rowHeight / 2;
              
              arrows.push({
                sourceX,
                sourceY,
                targetX,
                targetY,
                id: key.id
              });
            }
          });
        }
      });

      // Draw the arrow paths
      g.selectAll('.index-arrow')
        .data(arrows)
        .enter()
        .append('path')
        .attr('class', 'index-arrow')
        .attr('d', d => {
          const midX = (d.sourceX + d.targetX) / 2;
          return `M ${d.sourceX},${d.sourceY}
                  C ${midX},${d.sourceY}
                    ${midX},${d.targetY}
                    ${d.targetX},${d.targetY}`;
        })
        .attr('fill', 'none')
        .attr('stroke', '#2196F3')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('opacity', 0.7);
    }

    // Add hover effects for individual keys using shared utility with custom callbacks
    addKeyHoverEffects(g,
      (keyId: string) => {
        const keyIdNum = parseInt(keyId);

        // Highlight corresponding table row
        g.selectAll('.table-row')
          .filter(d => d.id === keyIdNum)
          .selectAll('rect')
          .attr('fill', '#fff3cd')
          .attr('stroke', '#ffc107')
          .attr('stroke-width', 2);

        // Highlight corresponding arrow (only if arrows are shown)
        if (showArrows) {
          g.selectAll('.index-arrow')
            .filter(d => d.id === keyIdNum)
            .attr('stroke', '#ff6b35')
            .attr('stroke-width', 3)
            .attr('opacity', 1);
        }
      },
      (keyId: string) => {
        const keyIdNum = parseInt(keyId);

        // Reset table row
        const tableRowIndex = tableData.findIndex(row => row.id === keyIdNum);
        g.selectAll('.table-row')
          .filter(d => d.id === keyIdNum)
          .selectAll('rect')
          .attr('fill', tableRowIndex % 2 === 0 ? '#f8f9fa' : 'white')
          .attr('stroke', '#eee')
          .attr('stroke-width', 0.5);

        // Reset arrow (only if arrows are shown)
        if (showArrows) {
          g.selectAll('.index-arrow')
            .filter(d => d.id === keyIdNum)
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2)
            .attr('opacity', 0.7);
        }
      }
    );

    // Add hover effects for table rows
    tableRows
      .on('mouseover', function(event, rowData) {
        // Highlight the table row
        d3.select(this).selectAll('rect')
          .attr('fill', '#fff3cd')
          .attr('stroke', '#ffc107')
          .attr('stroke-width', 2);
        
        // Highlight corresponding arrows (only if arrows are shown)
        if (showArrows) {
          g.selectAll('.index-arrow')
            .filter(d => d.id === rowData.id)
            .attr('stroke', '#ff6b35')
            .attr('stroke-width', 3)
            .attr('opacity', 1);
        }
        
        // Highlight corresponding index key
        g.selectAll('.key-hover-area')
          .filter(function() {
            return parseInt(d3.select(this).attr('data-key-id')) === rowData.id;
          })
          .attr('fill', '#f0f8ff')
          .attr('stroke', '#2196F3')
          .attr('stroke-width', 2);
      })
      .on('mouseout', function(event, rowData) {
        const tableRowIndex = tableData.findIndex(row => row.id === rowData.id);
        
        // Reset table row
        d3.select(this).selectAll('rect')
          .attr('fill', tableRowIndex % 2 === 0 ? '#f8f9fa' : 'white')
          .attr('stroke', '#eee')
          .attr('stroke-width', 0.5);
        
        // Reset arrows (only if arrows are shown)
        if (showArrows) {
          g.selectAll('.index-arrow')
            .filter(d => d.id === rowData.id)
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2)
            .attr('opacity', 0.7);
        }
        
        // Reset index key
        g.selectAll('.key-hover-area')
          .filter(function() {
            return parseInt(d3.select(this).attr('data-key-id')) === rowData.id;
          })
          .attr('fill', 'transparent')
          .attr('stroke', 'none');
      });

    applyInitialTransform(svg, g, zoom, { width, height });

  }, [tree, tableData, showArrows]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', background: '#f5f5f5' }} />
    </div>
  );
};