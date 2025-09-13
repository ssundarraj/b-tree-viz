import React, { useState } from 'react';
import { BTree } from '../btree';
import { IndexBTreeVisualizer } from './IndexBTreeVisualizer';
import { ControlPanel, ControlButton, ControlInput } from './components/ControlPanel';

interface TableRow {
  id: number;
  name: string;
}

interface IndexPointer {
  id: number;
  rowIndex: number;
}

// Custom B-tree that stores index pointers instead of just values
class IndexBTree extends BTree<IndexPointer> {
  constructor() {
    super(4, (a, b) => a.id - b.id);
  }

  insertRecord(id: number, rowIndex: number): void {
    this.insert({ id, rowIndex });
  }

  findRowIndex(id: number): number | null {
    const found = this.findPointer(id);
    return found ? found.rowIndex : null;
  }

  private findPointer(id: number): IndexPointer | null {
    const root = this.getRoot();
    return this.searchPointer(root, id);
  }

  private searchPointer(node: any, id: number): IndexPointer | null {
    if (!node) return null;

    let i = 0;
    while (i < node.keys.length && id > node.keys[i].id) {
      i++;
    }

    if (i < node.keys.length && id === node.keys[i].id) {
      return node.keys[i];
    }

    if (node.isLeaf) return null;
    return this.searchPointer(node.children[i], id);
  }

  deleteRecord(id: number): boolean {
    const pointer = this.findPointer(id);
    if (!pointer) return false;
    return this.delete(pointer);
  }
}

const createInitialData = (): { table: TableRow[], index: IndexBTree } => {
  const initialRows: TableRow[] = [
    { id: 10, name: 'Alice Johnson' },
    { id: 25, name: 'Bob Smith' },
    { id: 5, name: 'Charlie Brown' },
    { id: 15, name: 'Diana Prince' },
    { id: 30, name: 'Eve Davis' },
    { id: 8, name: 'Frank Miller' }
  ];
  
  const index = new IndexBTree();
  initialRows.forEach((row, idx) => {
    index.insertRecord(row.id, idx);
  });
  
  return { table: initialRows, index };
};

export const TablePage: React.FC = () => {
  const initialData = createInitialData();
  const [table, setTable] = useState<TableRow[]>(initialData.table);
  const [index, setIndex] = useState(initialData.index);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [showArrows, setShowArrows] = useState(true);

  const handleInsert = () => {
    const idNum = parseInt(id);
    if (isNaN(idNum) || !name.trim()) {
      setMessage('Please enter a valid ID and name');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Check if ID already exists
    if (index.findRowIndex(idNum) !== null) {
      setMessage(`ID ${idNum} already exists`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newRow: TableRow = { id: idNum, name: name.trim() };
    const newTable = [...table, newRow];
    const rowIndex = newTable.length - 1;

    // Create new index
    const newIndex = new IndexBTree();
    // Copy existing index entries
    const existingData = table.map((row, idx) => ({ id: row.id, rowIndex: idx }));
    existingData.forEach(data => newIndex.insertRecord(data.id, data.rowIndex));
    // Add new entry
    newIndex.insertRecord(idNum, rowIndex);

    setTable(newTable);
    setIndex(newIndex);
    setId('');
    setName('');
    setMessage(`Inserted record with ID ${idNum}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = () => {
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      setMessage('Please enter a valid ID');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const rowIndex = index.findRowIndex(idNum);
    if (rowIndex === null) {
      setMessage(`Record with ID ${idNum} not found`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Remove from table and rebuild index
    const newTable = table.filter(row => row.id !== idNum);
    const newIndex = new IndexBTree();
    newTable.forEach((row, idx) => {
      newIndex.insertRecord(row.id, idx);
    });

    setTable(newTable);
    setIndex(newIndex);
    setId('');
    setName('');
    setMessage(`Deleted record with ID ${idNum}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClear = () => {
    setTable([]);
    setIndex(new IndexBTree());
    setMessage('Table and index cleared');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    const resetData = createInitialData();
    setTable(resetData.table);
    setIndex(resetData.index);
    setMessage('Reset to initial sample data');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInsert();
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <ControlPanel title="SQL Table with B-Tree Index" message={message}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <ControlInput
            value={id}
            onChange={setId}
            onKeyPress={handleKeyPress}
            placeholder="ID (number)"
            width={100}
          />
          <ControlInput
            value={name}
            onChange={setName}
            onKeyPress={handleKeyPress}
            placeholder="Name"
          />
          <ControlButton onClick={handleInsert} color="green">
            Insert
          </ControlButton>
          <ControlButton onClick={handleDelete} color="red">
            Delete
          </ControlButton>
          <ControlButton onClick={handleClear} color="orange">
            Clear
          </ControlButton>
          <ControlButton onClick={handleReset} color="blue">
            Reset
          </ControlButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
            <input
              type="checkbox"
              checked={showArrows}
              onChange={(e) => setShowArrows(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show index arrows
          </label>
        </div>
      </ControlPanel>

      <IndexBTreeVisualizer tree={index} tableData={table} showArrows={showArrows} />
    </div>
  );
};