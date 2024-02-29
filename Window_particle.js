import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;


export
const Window_Spring = 
    class Window_Spring{
    constructor() {
        this.particles = [];
        this.springs = [];
        this.elasitiy = 0;
        this.viscosity = 0;
        this.gravity = vec3(0, -9.8, 0);
        this.method = 0;
        this.time = 0;
        this.pulled = false;
        // You will need to add properties for ground parameters, integration method, etc.
    }

   

  createParticles(number) {
    this.particles = []; // Reset the particle system
    for (let i = 0; i < number; i++) {
      // Initialize particles at the origin or as per specific requirements
      this.particles.push(new Particle());
    }
  }

  create(numParticles,particleDistance,ks, kd){
    for (let i = 0; i < numParticles; i++) {
        const position = vec3(8.0, (20.0-i) * particleDistance, 0.8); // Start from (0.0, 5.0, 0.0) and place them along the x-axis
        const particle = new Particle(1, position); // Assuming mass of 1 for all particles
        this.particles.push(particle);
    }
    // Link particles with springs
    for (let i = 0; i < numParticles - 1; i++) {
        const spring = new Spring(this.particles[i], this.particles[i + 1], ks, kd, particleDistance);
        this.springs.push(spring);
        // console.log(ks,kd);
    }

  }

  // Method to add placeholders for a specified number of springs
  createSprings(number) {
    for (let i = 0; i < number; i++) {
      this.springs.push(null); // Add null or a placeholder spring object
    }
  }

  setTimeout(t){
    this.time = t;
  }

  ground(el, vis){
    this.elasitiy = el;
    this.viscosity = vis;
  }

  link(sindex, pindex1, pindex2, ks, kd, length) {
    // Validate indices
    if (pindex1 < 0 || pindex1 >= this.particles.length || pindex2 < 0 || pindex2 >= this.particles.length) {
      console.error("Invalid particle index: ", pindex1, pindex2);
      return;
    }
    // Retrieve particles
    let particle1 = this.particles[pindex1];
    let particle2 = this.particles[pindex2];

    // Determine the rest length
    const restLength = length < 0 ? particle1.position.minus(particle2.position).norm() : length;

    // Create a new spring with the specified properties
    const newSpring = new Spring(particle1, particle2, ks, kd, restLength);
    
    // Check if sindex is within bounds and replace or add the spring accordingly
    if (sindex >= 0 && sindex < this.springs.length) {
      // console.log("get in");
      this.springs[sindex] = newSpring;
      console.log(this.springs[0]);
    } else if (sindex === this.springs.length) {
      // Adding a new spring at the end
      this.springs.push(newSpring);
    } else {
      console.error("Invalid spring index: " + sindex);
    }
}
update(times_pairwise) {
    // Fix the first particle's position
    const mu_k = 0.9;
    this.particles[0].position = vec3(8, 4, 0.8); // Set to desired fixed position
    this.particles[0].velocity = vec3(0, 0, 0); // Ensure it does not move
    // this.particles[0].force = vec3(0, 0, 0); // No force applied

    // Apply gravity and update all other particles
    for (let i = 1; i < this.particles.length; i++) {
        let particle = this.particles[i];
        // particle.force = vec3(0,0,0); // Reset force
        particle.applyForce(this.gravity.times(particle.mass)); // Apply gravity
        // console.log(this.particles[i].force);
    }

    // Apply spring forces between connected particles
    this.springs.forEach(spring => {
        spring.applySpringForce(); // Apply spring forces as usual
        
    });


    for (let particle of this.particles) {
    //   particle.resolveCollisionWithGround(this.elasitiy, this.viscosity, mu_k);
      // particle.integrate_Euler(times_pairwise);
     
    //   console.log(particle.force);
      particle.integrate_Sy(times_pairwise);
    
    }
}


// Method to apply a temporary pulling force to the last particle
applyPullingForce() {
    const pullingForceMagnitude = -4000; // Set the magnitude of the pulling force
    const pullingForce = vec3(0, pullingForceMagnitude, 0); // Pulling down
    const lastParticleIndex = this.particles.length - 1; // Apply to the last particle
    this.particles[lastParticleIndex].applyForce(pullingForce);
    this.pulled = true; // Mark the system as having been pulled
    
}

// Make sure to include a reset method to clear the pulling state if necessary
resetPulling() {
    this.pulled = false;
}



  draw(webgl_manager, uniforms, shapes, materials){
    // console.log('drwaw')
    const red = color(1, 0.9, 1, 1);
    let ball_radius = 0.02;
    for(const p of this.particles){
      // const p = this.particle.particles[i];
        // Assuming each particle has a position property
        // console.log(p)
        let ball_transform = Mat4.translation(p.position[0], p.position[1], p.position[2])
            .times(Mat4.scale(ball_radius, ball_radius, ball_radius));
        // Ensure 'blue' is defined correctly as a color
        const blueColor = color(0, 0, 0, 1); // Example: Define blue using your color function
        shapes.ball.draw(webgl_manager, uniforms, ball_transform, { ...materials.metal, color: blueColor });
    }
   for (const s of this.springs) {
      const p1 = s.particle1.position;
      const p2 = s.particle2.position;
      const springVector = p2.minus(p1);
      const len = springVector.norm();
      const center = p1.plus(p2).times(0.5);

      // Handle the special case when the spring is vertical.
      if (Math.abs(springVector[0]) < 1e-6 && Math.abs(springVector[2]) < 1e-6) {
        // Vertical spring: We can construct the model transformation without rotation.
        let model_trans = Mat4.translation(center[0], center[1], center[2])
                          .times(Mat4.scale(0.003, len / 2, 0.003));

        shapes.box.draw(webgl_manager, uniforms, model_trans, { ...materials.plastic, color: red });
      } else {
        // Non-vertical spring: We can proceed with the cross product and rotation.
        const p = springVector.normalized();
        const v = vec3(0,1,0); // Up vector
        const axis = v.cross(p).normalized();
        const angle = Math.acos(v.dot(p));

        let model_trans = Mat4.translation(center[0], center[1], center[2])
                          .times(Mat4.rotation(angle, axis[0], axis[1], axis[2]))
                          .times(Mat4.scale(0.003, len / 2, 0.003));

        shapes.box.draw(webgl_manager, uniforms, model_trans, { ...materials.plastic, color: red });
      }
  }

  }

}

class Particle {
  constructor(mass, position = vec3(0, 0, 0), velocity = vec3(0, 0, 0)) {
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
    this.force = vec3(0, 0, 0); // Initialize total force acting on particle
    this.acceleration = vec3(0, 0, 0);
  }

  // Method to update the particle's properties
  setProperties(mass, position, velocity) {
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
  }


  setAcceleration(g){
    // console.log(this.acceleration);
    this.acceleration = g.times(1/this.mass);
  }

  applyForce(force) {
    // console.log(`Before applying force: ${this.force}`);
    this.force = this.force.plus(force);
    this.acceleration = this.force.times(1/this.mass);
  }
  
  resolveCollisionWithGround(elasticity, viscosity, mu_s, mu_k) {
    const groundPoint = vec3(0, 0, 0); // Ground position P_g
    const groundNormal = vec3(0, 1, 0); // Ground normal n̂
    const restitution = 0.8; // Coefficient of restitution
    let distance = this.position.minus(groundPoint).dot(groundNormal); // Distance from the ground
    let relativeVelocity = this.velocity.dot(groundNormal); // Velocity towards the ground
    let tangentialVelocity = this.velocity.minus(groundNormal.times(relativeVelocity));

    // Calculate the spring force using Hooke's Law
    let springForce = groundNormal.times(elasticity * Math.max(distance, 0));
    // Calculate the damping force
    let dampingForce = groundNormal.times(viscosity * relativeVelocity);

    // Calculate the normal force (spring + damping)
    let normalForce = groundNormal.times(this.force.dot(groundNormal)).times(-1);

    // Update the force with spring and damping forces
    this.force = this.force.plus(springForce.minus(dampingForce));

    // Apply friction if the object is touching the ground
    if (distance < 0) {
      this.position = this.position.plus(groundNormal.times(-distance));
      this.velocity = this.velocity.minus(groundNormal.times(relativeVelocity * (1 + restitution)));

      // Check if the tangential force exceeds the static friction
  if (tangentialVelocity.norm() > 0) {
    let tangentialForceMagnitude = this.force.minus(normalForce).norm();
    let normalForceMagnitude = normalForce.norm();

    // If the tangential force is less than static friction threshold, apply a scaled-down force
    if (tangentialForceMagnitude < mu_s * normalForceMagnitude) {
      // Apply a slowdown factor to the velocity
      let slowdownFactor = tangentialForceMagnitude / (mu_s * normalForceMagnitude);
      this.velocity = this.velocity.times(slowdownFactor);
      // Scale down the acceleration as well
      this.acceleration = this.acceleration.times(slowdownFactor);
    } else {
      // Otherwise, apply kinetic friction
      let frictionDirection = tangentialVelocity.normalized().times(-1);
      let frictionForceMagnitude = mu_k * normalForceMagnitude;
      let frictionForce = frictionDirection.times(frictionForceMagnitude);
      this.force = this.force.plus(frictionForce);
      // Adjust the velocity for kinetic friction
      // this.velocity = this.velocity.plus(frictionForce.times(1/this.mass).times(timestep));
  }
}
}
  }

  integrate_Sy(timestep) {// Symlectiv Euler
    this.velocity = this.velocity.plus(this.acceleration.times(timestep));
    this.position = this.position.plus(this.velocity.times(timestep));
    // this.resolveCollisionWithGround();
    this.acceleration = vec3(0,0,0);
    // this.velocity = vec3(0,0,0);
    this.force = vec3(0, 0, 0); 
  }

  integrate_Euler(timestep){
    this.position = this.position.plus(this.velocity.times(timestep));
    // Then update the velocity using the current acceleration
    this.velocity = this.velocity.plus(this.acceleration.times(timestep));
    // Reset acceleration and force for the next step
    this.acceleration = vec3(0, 0, 0);
    this.force = vec3(0, 0, 0);
  }
  
  integrate_VelocityVerlet(timestep) {
    // Update position with current velocity and half the timestep's acceleration
    this.position = this.position.plus(this.velocity.times(timestep))
                                  .plus(this.acceleration.times(0.5 * timestep * timestep));

    // Store the current acceleration to use for the velocity update
    const currentAcceleration = this.acceleration.copy();

    // Typically, you would calculate the new force and thus the new acceleration here,
    // since it may depend on the new position. For example:
    // this.force = calculateForce(this.position, this.velocity, ...);
    // this.acceleration = this.force.times(1 / this.mass);

    // Then update velocity with the average of the current and new accelerations
    this.velocity = this.velocity.plus(currentAcceleration.plus(this.acceleration).times(0.5 * timestep));
}
}


class Spring {
  constructor(particle1, particle2, ks, kd, restLength) {
    this.particle1 = particle1;
    this.particle2 = particle2;
    this.ks = ks; // Spring constant
    this.kd = kd; // Damping constant
    this.restLength = restLength;
  }

  applySpringForce() {
    let distanceVec = this.particle2.position.minus(this.particle1.position);
    let distance = distanceVec.norm(); // Ensure this is correctly calling the magnitude method
    // console.log(distance);
    let forceDirection = distanceVec.normalized();
    let stretch = distance - this.restLength;
    // console.log(this.ks);
    let forceMagnitude = this.ks * stretch;
    let forceVector = forceDirection.times(forceMagnitude);
    // console.log(forceVector);
    let velocityDifference = this.particle2.velocity.minus(this.particle1.velocity);
    // console.log(forceVector);
    let dampingForce = velocityDifference.dot(forceDirection)*this.kd;
    let dampingVector = forceDirection.times(dampingForce);
    // console.log(dampingVector);
    let totalForce = forceVector.plus(dampingVector);
    // console.log("total", totalForce)
    // console.log(this.particle1.force);
    // console.log(this.particle2.force);
    this.particle1.applyForce(totalForce);
    this.particle2.applyForce(totalForce.times(-1));
    // console.log(this.particle1.force, this.particle2.force);
    
  }
}