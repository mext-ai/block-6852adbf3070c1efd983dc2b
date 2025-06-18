import * as THREE from 'three';

export interface Body {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  radius: number;
  color: string;
  trail: THREE.Vector3[];
}

export class PhysicsEngine {
  private bodies: Body[] = [];
  private G = 6.674e-11; // Gravitational constant (scaled for visualization)
  private timeStep = 0.016; // ~60fps
  private maxTrailLength = 500;

  constructor(gravitationalConstant = 1.0) {
    this.G = gravitationalConstant;
    this.timeStep = 0.016;
  }

  setBodies(bodies: Body[]) {
    this.bodies = bodies;
  }

  setGravitationalConstant(G: number) {
    this.G = G;
  }

  setTimeStep(dt: number) {
    this.timeStep = dt;
  }

  update() {
    if (this.bodies.length < 2) return;

    // Calculate forces on each body
    const forces: THREE.Vector3[] = this.bodies.map(() => new THREE.Vector3(0, 0, 0));

    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const body1 = this.bodies[i];
        const body2 = this.bodies[j];

        // Calculate distance vector
        const r = new THREE.Vector3().subVectors(body2.position, body1.position);
        const distance = r.length();

        // Avoid division by zero and unrealistic close encounters
        if (distance < 0.1) continue;

        // Calculate gravitational force magnitude
        const forceMagnitude = (this.G * body1.mass * body2.mass) / (distance * distance);

        // Calculate force vector (normalized)
        const forceDirection = r.normalize();
        const force = forceDirection.multiplyScalar(forceMagnitude);

        // Apply Newton's third law
        forces[i].add(force);
        forces[j].sub(force);
      }
    }

    // Update velocities and positions
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i];
      
      // F = ma, so a = F/m
      const acceleration = forces[i].divideScalar(body.mass);
      
      // Update velocity: v = v + a*dt
      body.velocity.add(acceleration.multiplyScalar(this.timeStep));
      
      // Update position: p = p + v*dt
      const deltaPosition = body.velocity.clone().multiplyScalar(this.timeStep);
      body.position.add(deltaPosition);

      // Add to trail
      body.trail.push(body.position.clone());
      if (body.trail.length > this.maxTrailLength) {
        body.trail.shift();
      }
    }
  }

  getBodies(): Body[] {
    return this.bodies;
  }

  reset() {
    this.bodies.forEach(body => {
      body.trail = [];
    });
  }

  // Utility methods for creating initial conditions
  static createBody(
    position: [number, number, number],
    velocity: [number, number, number],
    mass: number,
    radius?: number,
    color?: string
  ): Body {
    return {
      id: Math.random().toString(36).substr(2, 9),
      position: new THREE.Vector3(...position),
      velocity: new THREE.Vector3(...velocity),
      mass,
      radius: radius || Math.pow(mass, 1/3) * 0.5,
      color: color || `hsl(${Math.random() * 360}, 70%, 60%)`,
      trail: []
    };
  }

  // Predefined stable configurations
  static getStableConfigurations() {
    return {
      figure8: () => [
        PhysicsEngine.createBody([-1, 0, 0], [0.347, 0.532, 0], 1, 0.3, '#ff6b6b'),
        PhysicsEngine.createBody([1, 0, 0], [0.347, 0.532, 0], 1, 0.3, '#4ecdc4'),
        PhysicsEngine.createBody([0, 0, 0], [-0.694, -1.064, 0], 1, 0.3, '#45b7d1')
      ],
      triangle: () => [
        PhysicsEngine.createBody([2, 0, 0], [0, 0.5, 0], 1, 0.3, '#ff6b6b'),
        PhysicsEngine.createBody([-1, 1.732, 0], [-0.433, -0.25, 0], 1, 0.3, '#4ecdc4'),
        PhysicsEngine.createBody([-1, -1.732, 0], [0.433, -0.25, 0], 1, 0.3, '#45b7d1')
      ],
      random: () => [
        PhysicsEngine.createBody(
          [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 2 - 1],
          [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 1 - 0.5],
          0.5 + Math.random() * 2,
          undefined,
          '#ff6b6b'
        ),
        PhysicsEngine.createBody(
          [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 2 - 1],
          [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 1 - 0.5],
          0.5 + Math.random() * 2,
          undefined,
          '#4ecdc4'
        ),
        PhysicsEngine.createBody(
          [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 2 - 1],
          [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 1 - 0.5],
          0.5 + Math.random() * 2,
          undefined,
          '#45b7d1'
        )
      ]
    };
  }
}