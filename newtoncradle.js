import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

class Particle {
  constructor(mass, pos, vel) {
      this.mass = mass;
      this.pos = pos;
      this.vel = vel;
      this.acc = vec3(0, 0, 0); 
      this.ext_force = vec3(0, 0, 0);
      this.valid = true; 
      this.prevPos = pos;
  }

  update(dt, integration_method) {
      if (!this.valid) {
          throw "Initialization not complete.";
      }
      switch (integration_method) {
        case "euler":
            this.secret_euler_update(this, dt);
            break;
        case "symplectic":
            this.secret_sym_update(this, dt);
            break;
        case "verlet":
            this.secret_verlet_update(this, dt);
            break;
    }
  }

  secret_euler_update(particle, dt) {
    particle.acc = particle.ext_force.times(1 / particle.mass);
    const newV = particle.vel.plus(particle.acc.times(dt));
    particle.pos = particle.pos.plus(particle.vel.times(dt));
    particle.vel = newV.copy();
  }

  secret_sym_update(particle, dt) {
    particle.acc = particle.ext_force.times(1 / particle.mass);
    particle.vel = particle.vel.plus(particle.acc.times(dt));
    particle.pos = particle.pos.plus(particle.vel.times(dt));
  }

  secret_verlet_update(particle, dt) {
    particle.acc = particle.ext_force.times(1 / particle.mass); 
    particle.pos = particle.pos.plus(particle.vel.times(dt).plus(particle.acc.times(0.5 * dt * dt)));
    particle.vel = particle.vel.plus(particle.acc.times(dt));

  }
}

class Spring {
  constructor(particle_1, particle_2, ks, kd, rest_length) {
      this.particle_1 = particle_1;
      this.particle_2 = particle_2;
      this.ks = ks;
      this.kd = kd;
      this.rest_length = rest_length;
      this.valid = true;
  }

  update() {
    if (!this.valid) {
        throw "Initialization not complete.";
    }

    const displacement = this.particle_2.pos.minus(this.particle_1.pos);
    const distance = displacement.norm();
    const unit_displacement = displacement.normalized();

    const relative_velocity = this.particle_2.vel.minus(this.particle_1.vel);

    //f_s
    const spring_force_magnitude = this.ks * (distance - this.rest_length);
    const spring_force = unit_displacement.times(spring_force_magnitude);

    //f_d
    const damping_force_magnitude = this.kd * relative_velocity.dot(unit_displacement);
    const damping_force = unit_displacement.times(damping_force_magnitude);

    //f_e
    const total_force = spring_force.plus(damping_force);
    //console.log(total_force);
    this.particle_1.ext_force = this.particle_1.ext_force.plus(total_force);
    this.particle_2.ext_force = this.particle_2.ext_force.minus(total_force);
  }
}


export class NewtonCradle {
    constructor(numSpheres, mass, radius, startPos, stringLength) {
        this.spheres = [];
        this.numSpheres = numSpheres;
        this.mass = mass;
        this.radius = radius;
        this.startPos = startPos;
        this.stringLength = stringLength;
        this.ropes = [];
        this.gravity = vec3(0, -0.981, 0);
        this.initSpheres();

        // True if right ball is lifted
        //this.leftRight = true;
        this.restitution = .99;
    }

    initSpheres() {
        let highKs = 1000; 
        let lowKd = 10;

        for (let i = 0; i < this.numSpheres; i++) {
            let pos = this.startPos.plus(vec3(0, -this.stringLength, i * 2 * this.radius));
            let vel = vec3(0, 0, 0);
            
            let newSphere = new Particle(this.mass, pos, vel);
            this.spheres.push(newSphere);

            //rope is attached from a fixed point and connected to the sphere (let rope.particle1 store this position)
            let anchorPos = this.startPos.plus(vec3(0, 0, i * 2 * this.radius));
            let newRope = new Spring(new Particle(this.mass, anchorPos, vec3(0,0,0)), newSphere, highKs, lowKd, this.stringLength);
            this.ropes.push(newRope);
        }
    }

    startCradle(){
        const liftAngle = -Math.PI / 4;
        const liftDistance = this.stringLength * Math.sin(liftAngle);
        const liftHeight = this.stringLength * (1 - Math.cos(liftAngle));

        if (this.spheres.length > 0) {
            let firstSphere = this.spheres[0];
            firstSphere.pos = this.startPos.plus(vec3(0, -liftHeight, liftDistance)); // Adjust position
            firstSphere.vel = vec3(0, 0, 0); // Reset velocity since it's being lifted up
        }
    }

    update(dt) {

        for (const sphere of this.spheres) {
            sphere.ext_force = this.gravity.times(sphere.mass);
        }

        for (const r of this.ropes) {
            r.update();
        }


        for (let i = 0; i < this.numSpheres - 1; i++) {
            let sphere1 = this.spheres[i];
            let sphere2 = this.spheres[i + 1];
            let distance = sphere1.pos.minus(sphere2.pos).norm();
            if (distance < 2 * this.radius /*- .0001*/) {
                //swap velocities for elastic collision
                let temp = sphere1.vel;
                sphere1.vel = sphere2.vel.times(this.restitution);
                sphere2.vel = temp.times(this.restitution);
            }
        }

        for (const sphere of this.spheres) {
            sphere.update(dt, "verlet");
        }

    }

    draw(webgl_manager, uniforms, shapes, materials) {
        //Draw spheres
        for (const s of this.spheres) {
            let model_transform = Mat4.translation(...s.pos).times(Mat4.scale(this.radius, this.radius, this.radius));
            shapes.ball.draw(webgl_manager, uniforms, model_transform, { ...materials.metal });
        }
    
        //Draw ropes
        for (const rope of this.ropes) {
            const p1 = rope.particle_1.pos; //Anchor point
            const p2 = rope.particle_2.pos; 
            const direction = p2.minus(p1).normalized();
            const up = vec3(0, 1, 0);
    
            let axis = up.cross(direction);
    
            if (axis.norm() < 1e-6) {
                axis = vec3(1, 0, 0); 
            } else {
                //console.log("ccc", axis)
                axis = axis.normalized(); 
            }
    
            const angle = Math.acos(up.dot(direction)); 
            
            const ropeLength = p1.minus(p2).norm();
            const center = p1.plus(p2).times(0.5);
    
            let model_transform = Mat4.translation(...center);
            if (angle > 0) {
                model_transform = model_transform.times(Mat4.rotation(angle, ...axis));
            }
            model_transform = model_transform.times(Mat4.scale(0.002, ropeLength / 2, 0.002));
    
            shapes.box.draw(webgl_manager, uniforms, model_transform, { ...materials.plastic });
        }
    }
}