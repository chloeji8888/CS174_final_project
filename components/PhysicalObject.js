import { tiny, defs } from '../examples/common.js'
const { vec3, Shape, Mat4 } = tiny;

/** 
 * @classdesc Base class representing objects that follow physical rules 
 */
export class PhysicalObject {
  constructor(
    physicalSystem,
    mass = 1,
    position = vec3(0, 0, 0),
    velocity = vec3(0, 0, 0)
  ) {
    /** Physical system */
    this.physicalSystem = physicalSystem;

    /** Basic properties */
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;

    this.force = vec3(0, 0, 0);
    this.acceleration = vec3(0, 0, 0);
    this.prevPosition = position;

    /** Draw properties */
    this.shape = new defs.Cube();   // Default shape is a cube
    this.scale = Mat4.scale(1, 1, 1);
    this.rotation = Mat4.rotation(0, 0, 1, 0);
  }

  /** Update motion properties */
  apply_force(force) {
    this.force.add_by(force);
  }

  apply_gravity(g=this.physicalSystem.gravity) {
    this.force.add_by(vec3(0, -g, 0).times(this.mass));
  }

  _update_acceleration() {
    this.acceleration = this.force.times(1 / this.mass);
  }

  _update_velocity(dt) {
    this.velocity.add_by(this.acceleration.times(dt));
  }

  _update_velocity_verlet(dt) {
    let velocity_change = this.acceleration;
    this._update_acceleration();
    velocity_change.add_by(this.acceleration);
    velocity_change.scale_by(dt);
    velocity_change.scale_by(0.5);
    this.velocity.add_by(velocity_change);
  }

  _update_position(dt) {
    this.position.add_by(this.velocity.times(dt));
  }

  _update_position_verlet(dt) {
    let position_change = this.velocity
      .times(dt)
      .plus(this.acceleration.times(dt ** 2 / 2));
    this.position.add_by(position_change);
  }

  /* Update with dt seconds elapsed */
  update(dt=this.physicalSystem.dt, integration='euler') {
    /* Update prevPosition */
    this.prevPosition = this.position.copy();

    /* Forward Euler */
    if (integration === "euler") {
      this._update_acceleration();
      this._update_position(dt);
      this._update_velocity(dt); // Update position first with old velocity value
    } else if (integration === "symplectic") {
      /* Symplectic Euler */

      this._update_acceleration();
      this._update_velocity(dt);
      this._update_position(dt); // Update position with new velocity value
    } else {
      /* Verlet Time Integration */
      // Position first since it requires old velocity
      this._update_position_verlet(dt);
      this._update_velocity_verlet(dt);
    }

    this.force = vec3(0, 0, 0); // Clear force
  }

  /** Drawing Utilities */

  // Set scale of this object
  set_scale(scale_x, scale_y, scale_z) {
    this.scale = Mat4.scale(scale_x, scale_y, scale_z);
  }

  // Convert a Vector3 to Matrix4
  get_transform(position) {
    return Mat4.translation(position[0], position[1], position[2]);
  }

  draw(webgl_manager, uniforms, base_transform, material) {
    if (this.shape === null) return;

    let absolute_transform = base_transform
      .times(this.get_transform(this.position))
      .times(this.rotation)
      .times(this.scale);

    this.shape.draw(webgl_manager, uniforms, absolute_transform, material);
  }
}