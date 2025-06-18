import React from 'react';
import { useSimulationStore } from './store';
import { PhysicsEngine } from './physics';
import * as THREE from 'three';

export default function ControlPanel() {
  const {
    bodies,
    selectedBodyId,
    editMode,
    isRunning,
    showTrails,
    showVelocityVectors,
    gravitationalConstant,
    timeScale,
    
    // Actions
    updateBody,
    removeBody,
    selectBody,
    setEditMode,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setShowTrails,
    setShowVelocityVectors,
    setGravitationalConstant,
    setTimeScale,
    loadPreset
  } = useSimulationStore();

  const selectedBody = bodies.find(body => body.id === selectedBodyId);

  const handleBodyUpdate = (field: string, value: any) => {
    if (!selectedBody) return;
    
    const updates: any = {};
    
    if (field === 'mass') {
      updates.mass = parseFloat(value);
      updates.radius = Math.pow(parseFloat(value), 1/3) * 0.3;
    } else if (field === 'positionX') {
      updates.position = new THREE.Vector3(parseFloat(value), selectedBody.position.y, selectedBody.position.z);
    } else if (field === 'positionY') {
      updates.position = new THREE.Vector3(selectedBody.position.x, parseFloat(value), selectedBody.position.z);
    } else if (field === 'positionZ') {
      updates.position = new THREE.Vector3(selectedBody.position.x, selectedBody.position.y, parseFloat(value));
    } else if (field === 'velocityX') {
      updates.velocity = new THREE.Vector3(parseFloat(value), selectedBody.velocity.y, selectedBody.velocity.z);
    } else if (field === 'velocityY') {
      updates.velocity = new THREE.Vector3(selectedBody.velocity.x, parseFloat(value), selectedBody.velocity.z);
    } else if (field === 'velocityZ') {
      updates.velocity = new THREE.Vector3(selectedBody.velocity.x, selectedBody.velocity.y, parseFloat(value));
    } else if (field === 'color') {
      updates.color = value;
    }
    
    updateBody(selectedBody.id, updates);
  };

  return (
    <div className="control-panel">
      <div className="panel-section">
        <h3>Simulation Controls</h3>
        <div className="button-group">
          <button
            className={editMode === 'place' ? 'active' : ''}
            onClick={() => setEditMode('place')}
            disabled={isRunning}
          >
            Place Bodies
          </button>
          <button
            className={editMode === 'edit' ? 'active' : ''}
            onClick={() => setEditMode('edit')}
            disabled={isRunning}
          >
            Edit Bodies
          </button>
        </div>
        
        <div className="button-group">
          {!isRunning ? (
            <button 
              onClick={startSimulation}
              disabled={bodies.length < 2}
              className="start-btn"
            >
              Start Simulation
            </button>
          ) : (
            <button onClick={pauseSimulation} className="pause-btn">
              Pause
            </button>
          )}
          <button onClick={resetSimulation} className="reset-btn">
            Reset
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3>Presets</h3>
        <div className="button-group">
          <button onClick={() => loadPreset('figure8')}>
            Figure-8
          </button>
          <button onClick={() => loadPreset('triangle')}>
            Triangle
          </button>
          <button onClick={() => loadPreset('random')}>
            Random
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3>Display Options</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showTrails}
            onChange={(e) => setShowTrails(e.target.checked)}
          />
          Show Trails
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showVelocityVectors}
            onChange={(e) => setShowVelocityVectors(e.target.checked)}
          />
          Show Velocity Vectors
        </label>
      </div>

      <div className="panel-section">
        <h3>Physics Parameters</h3>
        <div className="slider-group">
          <label>
            Gravitational Constant: {gravitationalConstant.toFixed(2)}
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={gravitationalConstant}
              onChange={(e) => setGravitationalConstant(parseFloat(e.target.value))}
              disabled={isRunning}
            />
          </label>
        </div>
        <div className="slider-group">
          <label>
            Time Scale: {timeScale.toFixed(1)}x
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>

      {selectedBody && (
        <div className="panel-section selected-body">
          <h3>Selected Body</h3>
          <div className="body-controls">
            <div className="control-group">
              <label>
                Mass: {selectedBody.mass.toFixed(2)}
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={selectedBody.mass}
                  onChange={(e) => handleBodyUpdate('mass', e.target.value)}
                  disabled={isRunning}
                />
              </label>
            </div>

            <div className="control-group">
              <h4>Position</h4>
              <div className="vector-inputs">
                <label>
                  X:
                  <input
                    type="number"
                    step="0.1"
                    value={selectedBody.position.x.toFixed(2)}
                    onChange={(e) => handleBodyUpdate('positionX', e.target.value)}
                    disabled={isRunning}
                  />
                </label>
                <label>
                  Y:
                  <input
                    type="number"
                    step="0.1"
                    value={selectedBody.position.y.toFixed(2)}
                    onChange={(e) => handleBodyUpdate('positionY', e.target.value)}
                    disabled={isRunning}
                  />
                </label>
                <label>
                  Z:
                  <input
                    type="number"
                    step="0.1"
                    value={selectedBody.position.z.toFixed(2)}
                    onChange={(e) => handleBodyUpdate('positionZ', e.target.value)}
                    disabled={isRunning}
                  />
                </label>
              </div>
            </div>

            <div className="control-group">
              <h4>Initial Velocity</h4>
              <div className="vector-inputs">
                <label>
                  X:
                  <input
                    type="number"
                    step="0.1"
                    value={selectedBody.velocity.x.toFixed(2)}
                    onChange={(e) => handleBodyUpdate('velocityX', e.target.value)}
                    disabled={isRunning}
                  />
                </label>
                <label>
                  Y:
                  <input
                    type="number"
                    step="0.1"
                    value={selectedBody.velocity.y.toFixed(2)}
                    onChange={(e) => handleBodyUpdate('velocityY', e.target.value)}
                    disabled={isRunning}
                  />
                </label>
                <label>
                  Z:
                  <input
                    type="number"
                    step="0.1"
                    value={selectedBody.velocity.z.toFixed(2)}
                    onChange={(e) => handleBodyUpdate('velocityZ', e.target.value)}
                    disabled={isRunning}
                  />
                </label>
              </div>
            </div>

            <div className="control-group">
              <label>
                Color:
                <input
                  type="color"
                  value={selectedBody.color}
                  onChange={(e) => handleBodyUpdate('color', e.target.value)}
                  disabled={isRunning}
                />
              </label>
            </div>

            <button
              onClick={() => {
                removeBody(selectedBody.id);
                selectBody(null);
              }}
              className="remove-btn"
              disabled={isRunning}
            >
              Remove Body
            </button>
          </div>
        </div>
      )}

      <div className="panel-section">
        <h3>Instructions</h3>
        <div className="instructions">
          <p><strong>Place Mode:</strong> Click in 3D space to place new bodies</p>
          <p><strong>Edit Mode:</strong> Click bodies to select and modify them</p>
          <p><strong>Simulation:</strong> Watch gravitational interactions unfold</p>
          <p><strong>Camera:</strong> Drag to rotate, scroll to zoom, right-drag to pan</p>
        </div>
      </div>
    </div>
  );
}