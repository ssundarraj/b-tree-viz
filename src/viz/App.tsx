import React, { useState } from 'react';
import { BTree } from '../btree';
import TreeVisualizer from './components/TreeVisualizer';

function App() {
  const [tree] = useState(() => {
    const btree = new BTree<number>(3);
    // Add some preset values
    [10, 20, 5, 6, 12, 30, 7, 17].forEach(val => btree.insert(val));
    return btree;
  });

  return (
    <div className="app">
      <h1>B-Tree Visualizer</h1>
      <TreeVisualizer tree={tree} />
    </div>
  );
}

export default App;