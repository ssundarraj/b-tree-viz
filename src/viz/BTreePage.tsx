import React, { useState } from 'react';
import { BTreeD3Visualizer, createSampleTree } from './BTreeD3Visualizer';
import { BTree } from '../btree';
import { ControlPanel, ControlButton, ControlInput } from './components/ControlPanel';

export const BTreePage: React.FC = () => {
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
    <div style={{ height: '100vh' }}>
      <ControlPanel title="B-Tree Visualizer (Order 4)" message={message}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ControlInput
            value={inputValue}
            onChange={setInputValue}
            onKeyPress={handleKeyPress}
            placeholder="Enter a number"
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
      </ControlPanel>

      <BTreeD3Visualizer tree={tree} />
    </div>
  );
};