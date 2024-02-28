import { tiny, defs } from "../examples/common.js";
const { vec3 } = tiny;

/** 
 * @classdesc Base class representing a system with certain physical rules
 */
class PhysicalSystem {
  constructor(position=vec3(0, 0, 0)) {
    /** Configuration */
    this.dt = 1 / 1000;
    this.gravity = 9.8;
    this.integration = 'euler';

    this.physical_objects = [];

    // Drawing
    this.transform = vec3(0, 0, 0);
  }

  /** Step and Update */
  update(dt = this.dt) {
    for (let i = 0; i < this.physical_objects.length; i++) {
        this.physical_objects[i].apply_gravity(this.gravity);
        this.physical_objects[i].update(dt, this.integration);
    }
  }

  /** Drawing Utilities */
  draw(webgl_manager, uniforms) {
    
  }
}
