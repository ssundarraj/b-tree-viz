import React, { useState } from 'react';
import { BTreeD3Visualizer, createSampleTree } from './BTreeD3Visualizer';
import { BTree } from '../btree';

const App: React.FC = () => {
  const [tree, setTree] = useState(() => createSampleTree());
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const newTree = new BTree<number>(4);
    // Copy existing tree values
    const values = tree.traverse();
    values.forEach(v => newTree.insert(v));
    // Insert new value
    newTree.insert(value);
    setTree(newTree);
    setInputValue('');
    setMessage(`Inserted ${value}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const newTree = new BTree<number>(4);
    // Copy existing tree values except the one to delete
    const values = tree.traverse();
    const deleted = values.includes(value);
    
    if (!deleted) {
      setMessage(`Value ${value} not found in tree`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    values.filter(v => v !== value).forEach(v => newTree.insert(v));
    setTree(newTree);
    setInputValue('');
    setMessage(`Deleted ${value}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClear = () => {
    setTree(new BTree<number>(4));
    setMessage('Tree cleared');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    setTree(createSampleTree());
    setMessage('Tree reset to sample');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInsert();
    }
  };
  
  return (
    <div className="app">
      <div style={{ 
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px 20px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>
          B-Tree Visualizer (Order 4)
        </h1>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a number"
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              width: '120px'
            }}
          />
          <button
            onClick={handleInsert}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Insert
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: '#f44336',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Delete
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: '#FF9800',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Clear
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: '#2196F3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Reset
          </button>
        </div>
        
        {message && (
          <div style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: '#e3f2fd',
            color: '#1976d2',
            fontSize: '13px'
          }}>
            {message}
          </div>
        )}
      </div>
      
      <BTreeD3Visualizer tree={tree} />
    </div>
  );
};

export default App;