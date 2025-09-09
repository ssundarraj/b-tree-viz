import React from 'react';
import { BTreeD3Visualizer, createSampleTree } from './BTreeD3Visualizer';

const App: React.FC = () => {
  const tree = createSampleTree();
  
  return (
    <div className="app">
      <h1 style={{ 
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 20px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        B-Tree Visualizer (Order 4) - Zoom & Pan Enabled
      </h1>
      <BTreeD3Visualizer tree={tree} />
    </div>
  );
};

export default App;