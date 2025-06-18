import React, { useEffect, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: '20px', color: 'white', background: '#000814' }}>
      <h2>Something went wrong:</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#000814',
      color: 'white'
    }}>
      <div>Loading 3D Physics Simulation...</div>
    </div>
  );
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="three-body-container">
        <div className="scene-container">
          <Suspense fallback={<LoadingFallback />}>
            <Scene3D />
          </Suspense>
        </div>
        <ControlPanel />
      </div>
    </ErrorBoundary>
  );
};

export default Block;