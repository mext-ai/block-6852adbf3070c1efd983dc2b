import React, { useEffect } from 'react';
import Scene3D from './Scene3D';
import ControlPanel from './ControlPanel';
import { useSimulationStore } from './store';
import './styles.css';

interface BlockProps {
  title?: string;
  description?: string;
  initialBodies?: number;
  showPresets?: boolean;
}

const Block: React.FC<BlockProps> = ({ 
  title = "3-Body Problem Simulation",
  description = "Interactive gravitational simulation with customizable bodies",
  initialBodies = 0,
  showPresets = true
}) => {
  const { bodies, loadPreset } = useSimulationStore();

  useEffect(() => {
    // Send completion event for tracking
    const sendCompletion = () => {
      window.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'three-body-simulation', 
        completed: true,
        data: {
          bodiesCreated: bodies.length,
          interactionType: 'physics_simulation'
        }
      }, '*');
      
      window.parent?.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'three-body-simulation', 
        completed: true,
        data: {
          bodiesCreated: bodies.length,
          interactionType: 'physics_simulation'
        }
      }, '*');
    };

    // Send completion event immediately (for content blocks)
    sendCompletion();

    // Also send when user interacts with the simulation
    const handleUserInteraction = () => {
      sendCompletion();
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [bodies.length]);

  useEffect(() => {
    // Load a default preset if no bodies are present and initial bodies are requested
    if (bodies.length === 0 && initialBodies > 0) {
      loadPreset('triangle');
    }
  }, [bodies.length, initialBodies, loadPreset]);

  return (
    <div className="three-body-container">
      <div className="scene-container">
        <Scene3D />
      </div>
      <ControlPanel />
    </div>
  );
};

export default Block;