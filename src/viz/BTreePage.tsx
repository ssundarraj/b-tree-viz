import React, { useState, useEffect } from 'react';
import { BTreeD3Visualizer, createSampleTree } from './BTreeD3Visualizer';
import { BTree } from '../btree';
import { ControlPanel, ControlButton, ControlInput } from './components/ControlPanel';
import { BST } from './BST';
import { BSTVisualizer } from './BSTVisualizer';
import { getRandomBTreeValue } from './randomGenerators';

export const BTreePage: React.FC = () => {
  // Load initial state from localStorage or use defaults
  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('btree-viz-tree-order');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [tree, setTree] = useState(() => {
    const savedValues = localStorage.getItem('btree-viz-tree-values');
    const savedOrder = localStorage.getItem('btree-viz-tree-order');

    if (savedValues && savedOrder) {
      try {
        const values = JSON.parse(savedValues);
        const orderNum = parseInt(savedOrder, 10);
        const newTree = new BTree<number>(orderNum);
        values.forEach((v: number) => newTree.insert(v));
        return newTree;
      } catch (e) {
        console.error('Failed to restore tree from localStorage', e);
      }
    }
    return createSampleTree();
  });

  const [inputValue, setInputValue] = useState(() => getRandomBTreeValue().toString());
  const [message, setMessage] = useState('');

  const [showComparison, setShowComparison] = useState(() => {
    const saved = localStorage.getItem('btree-viz-show-comparison');
    return saved === 'true';
  });

  const [bst, setBst] = useState<BST<number>>(() => {
    const savedValues = localStorage.getItem('btree-viz-tree-values');

    if (savedValues) {
      try {
        const values = JSON.parse(savedValues) as number[];
        const sortedValues = values.sort((a, b) => a - b);
        return BST.fromSortedArray(sortedValues);
      } catch (e) {
        console.error('Failed to restore BST from localStorage', e);
      }
    }

    const values = createSampleTree()
      .traverse()
      .sort((a, b) => a - b);
    return BST.fromSortedArray(values);
  });

  // Save state to localStorage whenever tree changes
  useEffect(() => {
    const values = tree.traverse();
    localStorage.setItem('btree-viz-tree-values', JSON.stringify(values));
  }, [tree]);

  // Save order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('btree-viz-tree-order', order.toString());
  }, [order]);

  // Save showComparison to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('btree-viz-show-comparison', showComparison.toString());
  }, [showComparison]);

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage('Please enter a valid number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newTree = new BTree<number>(order);
    // Copy existing tree values
    const values = tree.traverse();
    values.forEach((v) => newTree.insert(v));
    // Insert new value
    newTree.insert(value);
    setTree(newTree);

    // Update BST with new values
    const sortedValues = [...values, value].sort((a, b) => a - b);
    setBst(BST.fromSortedArray(sortedValues));

    // Generate new random number for next insert
    setInputValue(getRandomBTreeValue().toString());
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

    const newTree = new BTree<number>(order);
    // Copy existing tree values except the one to delete
    const values = tree.traverse();
    const deleted = values.includes(value);

    if (!deleted) {
      setMessage(`Value ${value} not found in tree`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newValues = values.filter((v) => v !== value);
    newValues.forEach((v) => newTree.insert(v));
    setTree(newTree);

    // Update BST with remaining values
    const sortedValues = newValues.sort((a, b) => a - b);
    setBst(BST.fromSortedArray(sortedValues));

    // Generate new random number for next operation
    setInputValue(getRandomBTreeValue().toString());
    setMessage(`Deleted ${value}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClear = () => {
    setTree(new BTree<number>(order));
    setBst(new BST<number>());
    setMessage('Tree cleared');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    // Clear localStorage when resetting
    localStorage.removeItem('btree-viz-tree-values');
    localStorage.removeItem('btree-viz-tree-order');
    localStorage.removeItem('btree-viz-show-comparison');

    const sampleTree = createSampleTree(order);
    setTree(sampleTree);

    const values = sampleTree.traverse().sort((a, b) => a - b);
    setBst(BST.fromSortedArray(values));

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
      <ControlPanel title={`B-Tree vs BST Comparison`} message={message}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginTop: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Order:</span>
          <ControlInput
            type="number"
            value={order.toString()}
            onChange={(value) => {
              const num = parseInt(value);
              if (!isNaN(num) && num >= 3 && num <= 20) {
                setOrder(num);
                // Automatically rebuild tree with new order
                const values = tree.traverse();
                const newTree = new BTree<number>(num);
                values.forEach((v) => newTree.insert(v));
                setTree(newTree);

                // Update BST as well
                const sortedValues = values.sort((a, b) => a - b);
                setBst(BST.fromSortedArray(sortedValues));
              }
            }}
            placeholder="3-20"
            min={3}
            max={20}
            width={60}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            BST Comparison
          </label>
        </div>
      </ControlPanel>

      {showComparison ? (
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '20px',
                zIndex: 5,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              B-Tree
            </div>
            <div style={{ width: '100%', height: '100%' }}>
              <BTreeD3Visualizer tree={tree} />
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '20px',
                zIndex: 5,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Balanced BST
            </div>
            <div style={{ width: '100%', height: '100%' }}>
              <BSTVisualizer bst={bst} />
            </div>
          </div>
        </div>
      ) : (
        <BTreeD3Visualizer tree={tree} />
      )}
    </div>
  );
};
