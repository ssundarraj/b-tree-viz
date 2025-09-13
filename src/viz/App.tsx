import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { BTreePage } from './BTreePage';
import { TablePage } from './TablePage';

const App: React.FC = () => {
  return (
    <Router basename="/b-tree-viz">
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/btree" element={<BTreePage />} />
          <Route path="/table" element={<TablePage />} />
          <Route path="/" element={<Navigate to="/btree" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;