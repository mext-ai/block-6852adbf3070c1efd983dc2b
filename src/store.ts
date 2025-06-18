import { create } from 'zustand';
import { Body, PhysicsEngine } from './physics';

export interface SimulationState {
  // Simulation state
  bodies: Body[];
  isRunning: boolean;
  physics: PhysicsEngine;
  
  // UI state
  selectedBodyId: string | null;
  editMode: 'place' | 'edit' | 'simulate';
  showTrails: boolean;
  showVelocityVectors: boolean;
  showForceVectors: boolean;
  
  // Simulation parameters
  gravitationalConstant: number;
  timeScale: number;
  trailLength: number;
  
  // Actions
  setBodies: (bodies: Body[]) => void;
  addBody: (body: Body) => void;
  updateBody: (id: string, updates: Partial<Body>) => void;
  removeBody: (id: string) => void;
  selectBody: (id: string | null) => void;
  
  // Simulation controls
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  
  // Settings
  setEditMode: (mode: 'place' | 'edit' | 'simulate') => void;
  setShowTrails: (show: boolean) => void;
  setShowVelocityVectors: (show: boolean) => void;
  setShowForceVectors: (show: boolean) => void;
  setGravitationalConstant: (G: number) => void;
  setTimeScale: (scale: number) => void;
  setTrailLength: (length: number) => void;
  
  // Presets
  loadPreset: (preset: string) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => {
  const physics = new PhysicsEngine(1.0);
  
  return {
    // Initial state
    bodies: [],
    isRunning: false,
    physics,
    
    // UI state
    selectedBodyId: null,
    editMode: 'place',
    showTrails: true,
    showVelocityVectors: false,
    showForceVectors: false,
    
    // Simulation parameters
    gravitationalConstant: 1.0,
    timeScale: 1.0,
    trailLength: 500,
    
    // Actions
    setBodies: (bodies) => {
      set({ bodies });
      physics.setBodies(bodies);
    },
    
    addBody: (body) => {
      const { bodies } = get();
      const newBodies = [...bodies, body];
      set({ bodies: newBodies });
      physics.setBodies(newBodies);
    },
    
    updateBody: (id, updates) => {
      const { bodies } = get();
      const newBodies = bodies.map(body => 
        body.id === id ? { ...body, ...updates } : body
      );
      set({ bodies: newBodies });
      physics.setBodies(newBodies);
    },
    
    removeBody: (id) => {
      const { bodies } = get();
      const newBodies = bodies.filter(body => body.id !== id);
      set({ bodies: newBodies, selectedBodyId: null });
      physics.setBodies(newBodies);
    },
    
    selectBody: (id) => set({ selectedBodyId: id }),
    
    // Simulation controls
    startSimulation: () => {
      set({ isRunning: true, editMode: 'simulate' });
    },
    
    pauseSimulation: () => {
      set({ isRunning: false });
    },
    
    resetSimulation: () => {
      const { bodies } = get();
      // Reset positions and velocities to initial state
      bodies.forEach(body => {
        body.trail = [];
      });
      physics.reset();
      set({ isRunning: false, editMode: 'edit' });
    },
    
    stepSimulation: () => {
      physics.update();
      set({ bodies: [...get().bodies] }); // Trigger re-render
    },
    
    // Settings
    setEditMode: (mode) => set({ editMode: mode }),
    setShowTrails: (show) => set({ showTrails: show }),
    setShowVelocityVectors: (show) => set({ showVelocityVectors: show }),
    setShowForceVectors: (show) => set({ showForceVectors: show }),
    
    setGravitationalConstant: (G) => {
      physics.setGravitationalConstant(G);
      set({ gravitationalConstant: G });
    },
    
    setTimeScale: (scale) => {
      physics.setTimeStep(0.016 * scale);
      set({ timeScale: scale });
    },
    
    setTrailLength: (length) => set({ trailLength: length }),
    
    // Presets
    loadPreset: (preset) => {
      const configurations = PhysicsEngine.getStableConfigurations();
      const config = configurations[preset as keyof typeof configurations];
      if (config) {
        const newBodies = config();
        set({ 
          bodies: newBodies, 
          selectedBodyId: null,
          editMode: 'edit'
        });
        physics.setBodies(newBodies);
      }
    }
  };
});