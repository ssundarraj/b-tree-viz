import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { BTreeNode } from '../btree';

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

interface D3Node {
  id: string;
  keys: IndexPointer[];
  isLeaf: boolean;
  children: D3Node[];
  x?: number;
  y?: number;
}

const convertToD3Tree = (node: BTreeNode<IndexPointer> | null, id = 'root'): D3Node | null => {
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

export const IndexBTreeVisualizer: React.FC<IndexBTreeVisualizerProps> = ({ tree, tableData, showArrows = true }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const root = tree.getRoot();
    const width = 1200;
    const height = 500;
    const treeWidth = 700;
    const tableX = treeWidth + 50;
    const tableWidth = 400;

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
    
    // Create tree layout (horizontal) - constrained to left side
    const treeLayout = d3.tree<D3Node>()
      .size([height - 100, treeWidth - 150])
      .separation((a, b) => {
        // Calculate separation based on node heights
        const aHeight = a.data.keys.length * 30;
        const bHeight = b.data.keys.length * 30;
        const maxHeight = Math.max(aHeight, bHeight);
        const baseSeparation = maxHeight / 30;
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
        const minSpacing = (prevHeight + currHeight) / 2 + 40;
        
        const requiredY = prevNode.x! + minSpacing;
        if (currNode.x! < requiredY) {
          const adjustment = requiredY - currNode.x!;
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
      const actualNodeWidth = 60;
      
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

        // Add invisible background for individual key hover detection
        keyGroup.append('rect')
          .attr('x', -actualNodeWidth / 2)
          .attr('y', -keyHeight / 2)
          .attr('width', actualNodeWidth)
          .attr('height', keyHeight)
          .attr('fill', 'transparent')
          .attr('class', 'key-hover-area')
          .attr('data-key-id', key.id);

        // Add key text (just show the ID)
        keyGroup.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .attr('class', 'key-text')
          .text(key.id);
      });
    });

    // Render SQL Table
    const rowHeight = 35;
    const headerHeight = 40;
    const tableStartY = 50;
    
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
              const targetX = tableX - 5;
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

    // Add hover effects for individual keys
    g.selectAll('.key-hover-area')
      .on('mouseover', function(event) {
        const keyId = parseInt(d3.select(this).attr('data-key-id'));
        
        // Highlight the key background
        d3.select(this)
          .attr('fill', '#f0f8ff')
          .attr('stroke', '#2196F3')
          .attr('stroke-width', 2);
        
        // Highlight corresponding table row
        g.selectAll('.table-row')
          .filter(d => d.id === keyId)
          .selectAll('rect')
          .attr('fill', '#fff3cd')
          .attr('stroke', '#ffc107')
          .attr('stroke-width', 2);
        
        // Highlight corresponding arrow (only if arrows are shown)
        if (showArrows) {
          g.selectAll('.index-arrow')
            .filter(d => d.id === keyId)
            .attr('stroke', '#ff6b35')
            .attr('stroke-width', 3)
            .attr('opacity', 1);
        }
      })
      .on('mouseout', function(event) {
        const keyId = parseInt(d3.select(this).attr('data-key-id'));
        
        // Reset key background
        d3.select(this)
          .attr('fill', 'transparent')
          .attr('stroke', 'none');
        
        // Reset table row
        const tableRowIndex = tableData.findIndex(row => row.id === keyId);
        g.selectAll('.table-row')
          .filter(d => d.id === keyId)
          .selectAll('rect')
          .attr('fill', tableRowIndex % 2 === 0 ? '#f8f9fa' : 'white')
          .attr('stroke', '#eee')
          .attr('stroke-width', 0.5);
        
        // Reset arrow (only if arrows are shown)
        if (showArrows) {
          g.selectAll('.index-arrow')
            .filter(d => d.id === keyId)
            .attr('stroke', '#2196F3')
            .attr('stroke-width', 2)
            .attr('opacity', 0.7);
        }
      });

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

  }, [tree, tableData, showArrows]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', background: '#f9f9f9' }} />
    </div>
  );
};