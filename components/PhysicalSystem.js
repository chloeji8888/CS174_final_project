import { tiny, defs } from "../examples/common.js";
const { vec3, Mat4 } = tiny;

/** 
 * @classdesc Base class representing a system with certain physical rules
 */
export class PhysicalSystem {
  constructor(position = vec3(0, 0, 0)) {
    /** Configuration */
    this.dt = 1 / 1000;
    this.gravity = 9.8;
    this.integration = "euler";

    this.physical_objects = [];

    // Drawing
    this.position = vec3(0, 0, 0);
    this.scale = Mat4.scale(1, 1, 1);
  }

  /** Step and Update */
  update(dt = this.dt) {
    for (let i = 0; i < this.physical_objects.length; i++) {
      this.physical_objects[i].apply_gravity(this.gravity);
      this.physical_objects[i].update(dt, this.integration);
    }
  }

  /** Drawing Utilities */

  // Set scale of this system
  set_scale(scale_x, scale_y, scale_z) {
    this.scale = Mat4.scale(scale_x, scale_y, scale_z);
  }

  // Convert a Vector3 to Matrix4
  get_transform(position) {
    return Mat4.translation(position[0], position[1], position[2]);
  }

  draw(webgl_manager, uniforms) {}
}
