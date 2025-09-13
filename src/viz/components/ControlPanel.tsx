import React from 'react';

interface ControlPanelProps {
  title: string;
  message?: string;
  children: React.ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ title, message, children }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '80px',
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
      <h2 style={{ margin: 0, fontSize: '18px' }}>
        {title}
      </h2>

      {children}

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
  );
};

interface ControlButtonProps {
  onClick: () => void;
  color: 'green' | 'red' | 'orange' | 'blue';
  children: React.ReactNode;
}

const colorMap = {
  green: '#4CAF50',
  red: '#f44336',
  orange: '#FF9800',
  blue: '#2196F3'
};

export const ControlButton: React.FC<ControlButtonProps> = ({ onClick, color, children }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: '4px',
        border: 'none',
        background: colorMap[color],
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
      }}
    >
      {children}
    </button>
  );
};

interface ControlInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder: string;
  width?: number;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
}

export const ControlInput: React.FC<ControlInputProps> = ({
  value,
  onChange,
  onKeyPress,
  placeholder,
  width = 120,
  type = 'text',
  min,
  max
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      min={min}
      max={max}
      style={{
        padding: '6px 10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
        width: `${width}px`
      }}
    />
  );
};