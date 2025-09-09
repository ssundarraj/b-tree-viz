import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e0e0e0',
    padding: '15px 20px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const linkStyle = (isActive: boolean) => ({
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    background: isActive ? '#2196F3' : 'transparent',
    color: isActive ? 'white' : '#333',
    border: isActive ? 'none' : '1px solid #ddd',
    transition: 'all 0.2s ease'
  });

  return (
    <nav style={navStyle}>
      <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
        Data Structure Visualizer
      </h2>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link 
          to="/btree" 
          style={linkStyle(location.pathname === '/btree')}
        >
          B-Tree
        </Link>
        <Link 
          to="/table" 
          style={linkStyle(location.pathname === '/table')}
        >
          SQL Table + Index
        </Link>
      </div>
    </nav>
  );
};