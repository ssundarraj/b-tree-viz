import React from 'react';

interface AnimationControlsProps {
  isAnimating: boolean;
  isPlaying: boolean;
  canStep: boolean;
  animationSpeed: number;
  onStep: () => void;
  onPlayPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  isAnimating,
  isPlaying,
  canStep,
  animationSpeed,
  onStep,
  onPlayPause,
  onStop,
  onSpeedChange,
}) => {
  return (
    <div className="section">
      <h3>Animation Controls</h3>
      <div className="controls-row">
        <button onClick={onStep} disabled={!isAnimating || !canStep || isPlaying}>
          Step
        </button>
        <button onClick={onPlayPause} disabled={!isAnimating || !canStep}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={onStop} disabled={!isAnimating} className="danger">
          Stop
        </button>
      </div>
      
      <div className="slider-control">
        <label htmlFor="speed">Speed:</label>
        <input
          id="speed"
          type="range"
          min="100"
          max="3000"
          step="100"
          value={animationSpeed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
        />
        <span>{(animationSpeed / 1000).toFixed(1)}s</span>
      </div>
    </div>
  );
};

export default AnimationControls;