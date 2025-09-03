import React, { useState } from 'react';

interface CodeEditorProps {
  onAnimate: (code: string) => void;
  disabled?: boolean;
}

const defaultCode = `tree.insert(10);
tree.insert(20);
tree.insert(5);
tree.insert(6);
tree.insert(12);
tree.insert(30);
tree.insert(7);
tree.insert(17);
tree.search(12);
tree.delete(6);
tree.search(6);`;

const CodeEditor: React.FC<CodeEditorProps> = ({ onAnimate, disabled }) => {
  const [code, setCode] = useState(defaultCode);

  const handleAnimate = () => {
    if (code.trim()) {
      onAnimate(code);
    }
  };

  return (
    <div className="section">
      <h3>B-Tree Operations</h3>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={12}
        disabled={disabled}
        placeholder="Enter B-tree operations..."
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleAnimate} disabled={disabled || !code.trim()}>
          Animate
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;