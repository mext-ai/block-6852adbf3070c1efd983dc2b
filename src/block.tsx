import React, { useEffect, Suspense, Component } from 'react';
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

// Simple Error Boundary Component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3-Body Simulation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          background: '#000814',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2>3D Simulation Error</h2>
          <p>There was an issue loading the 3D physics simulation.</p>
          <pre style={{ 
            color: 'red', 
            fontSize: '12px', 
            maxWidth: '80%', 
            overflow: 'auto',
            background: 'rgba(255,255,255,0.1)',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Simulation
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function LoadingFallback() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#000814',
      color: 'white',
      fontSize: '18px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '10px' }}>🌌</div>
        <div>Loading 3D Physics Simulation...</div>
      </div>
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
      setTimeout(() => {
        loadPreset('triangle');
      }, 100);
    }
  }, [bodies.length, initialBodies, loadPreset]);

  return (
    <ErrorBoundary>
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