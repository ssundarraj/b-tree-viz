import React, { useState, useCallback, useRef } from 'react';
import { BTree } from '../btree';
import CodeEditor from './components/CodeEditor';
import AnimationControls from './components/AnimationControls';
import TreeVisualizer from './components/TreeVisualizer';
import Console from './components/Console';

export interface Operation {
  type: 'insert' | 'delete' | 'search';
  value: number;
  line: string;
}

export interface ConsoleMessage {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

function App() {
  const [btreeOrder, setBtreeOrder] = useState(3);
  const [tree, setTree] = useState(() => new BTree<number>(btreeOrder));
  const [operations, setOperations] = useState<Operation[]>([]);
  const [currentOpIndex, setCurrentOpIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [treeVersion, setTreeVersion] = useState(0); // Force re-render
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addConsoleMessage = useCallback((message: ConsoleMessage) => {
    setConsoleMessages(prev => [...prev, message]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  const resetTree = useCallback(() => {
    const newTree = new BTree<number>(btreeOrder);
    setTree(newTree);
    setTreeVersion(v => v + 1);
    setCurrentOpIndex(-1);
    setIsAnimating(false);
    setIsPlaying(false);
    clearConsole();
    addConsoleMessage({ type: 'info', message: `B-Tree reset with order ${btreeOrder}` });
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
  }, [btreeOrder, addConsoleMessage, clearConsole]);

  const parseOperations = useCallback((code: string): Operation[] => {
    const lines = code.split('\n').filter(line => line.trim());
    const ops: Operation[] = [];

    for (const line of lines) {
      const insertMatch = line.match(/tree\.insert\((\d+)\)/);
      const deleteMatch = line.match(/tree\.delete\((\d+)\)/);
      const searchMatch = line.match(/tree\.search\((\d+)\)/);

      if (insertMatch) {
        ops.push({ type: 'insert', value: parseInt(insertMatch[1]), line });
      } else if (deleteMatch) {
        ops.push({ type: 'delete', value: parseInt(deleteMatch[1]), line });
      } else if (searchMatch) {
        ops.push({ type: 'search', value: parseInt(searchMatch[1]), line });
      }
    }

    return ops;
  }, []);

  const executeOperation = useCallback((op: Operation) => {
    addConsoleMessage({ type: 'info', message: `Executing: ${op.line}` });
    
    try {
      switch (op.type) {
        case 'insert':
          tree.insert(op.value);
          addConsoleMessage({ type: 'success', message: `Inserted ${op.value}` });
          break;
        case 'delete':
          const deleted = tree.delete(op.value);
          if (deleted) {
            addConsoleMessage({ type: 'success', message: `Deleted ${op.value}` });
          } else {
            addConsoleMessage({ type: 'warning', message: `Value ${op.value} not found` });
          }
          break;
        case 'search':
          const found = tree.search(op.value);
          if (found) {
            addConsoleMessage({ type: 'success', message: `Found ${op.value}` });
          } else {
            addConsoleMessage({ type: 'warning', message: `${op.value} not found` });
          }
          break;
      }
      setTreeVersion(v => v + 1);
    } catch (error) {
      addConsoleMessage({ 
        type: 'error', 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  }, [tree, addConsoleMessage]);

  const handleAnimate = useCallback((code: string) => {
    resetTree();
    const ops = parseOperations(code);
    setOperations(ops);
    setCurrentOpIndex(-1);
    setIsAnimating(true);
    addConsoleMessage({ type: 'info', message: `Parsed ${ops.length} operations` });
  }, [parseOperations, resetTree, addConsoleMessage]);

  const handleStep = useCallback(() => {
    if (currentOpIndex < operations.length - 1) {
      const nextIndex = currentOpIndex + 1;
      setCurrentOpIndex(nextIndex);
      executeOperation(operations[nextIndex]);
    } else {
      setIsAnimating(false);
      setIsPlaying(false);
      addConsoleMessage({ type: 'info', message: 'Animation complete' });
    }
  }, [currentOpIndex, operations, executeOperation, addConsoleMessage]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    setIsAnimating(false);
    setIsPlaying(false);
    setCurrentOpIndex(-1);
    resetTree();
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
  }, [resetTree]);

  // Auto-play effect
  React.useEffect(() => {
    if (isPlaying && isAnimating) {
      animationTimerRef.current = setTimeout(() => {
        handleStep();
      }, animationSpeed);
    }
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [isPlaying, isAnimating, handleStep, animationSpeed]);

  // Stop playing if animation ends
  React.useEffect(() => {
    if (currentOpIndex >= operations.length - 1 && operations.length > 0) {
      setIsPlaying(false);
    }
  }, [currentOpIndex, operations]);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>B-Tree Visualizer</h1>
          <p>Interactive visualization for B-Tree operations</p>
        </div>

        <div className="main-content">
          <div className="sidebar">
            <div className="section">
              <h3>Tree Configuration</h3>
              <div className="controls-row">
                <label htmlFor="order">Order:</label>
                <input
                  id="order"
                  type="number"
                  min="3"
                  max="10"
                  value={btreeOrder}
                  onChange={(e) => setBtreeOrder(parseInt(e.target.value) || 3)}
                  disabled={isAnimating}
                />
                <button onClick={resetTree} disabled={isAnimating}>
                  Reset Tree
                </button>
              </div>
            </div>

            <CodeEditor onAnimate={handleAnimate} disabled={isAnimating} />

            <AnimationControls
              isAnimating={isAnimating}
              isPlaying={isPlaying}
              canStep={currentOpIndex < operations.length - 1}
              animationSpeed={animationSpeed}
              onStep={handleStep}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
              onSpeedChange={setAnimationSpeed}
            />

            {isAnimating && operations.length > 0 && (
              <div className="current-operation">
                <strong>Current:</strong> {
                  currentOpIndex >= 0 
                    ? operations[currentOpIndex].line 
                    : 'Ready to start'
                }
                <div style={{ marginTop: '5px', fontSize: '0.9rem', opacity: 0.7 }}>
                  Step {currentOpIndex + 1} of {operations.length}
                </div>
              </div>
            )}
          </div>

          <div className="visualization">
            <TreeVisualizer 
              tree={tree} 
              version={treeVersion}
              highlightedNode={
                currentOpIndex >= 0 && operations[currentOpIndex] 
                  ? operations[currentOpIndex].value 
                  : undefined
              }
              operationType={
                currentOpIndex >= 0 && operations[currentOpIndex]
                  ? operations[currentOpIndex].type
                  : undefined
              }
            />
            <Console messages={consoleMessages} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;