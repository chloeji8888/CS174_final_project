import { PhysicalObject } from "./PhysicalObject.js";
import { Curve_Shape } from "./Curve_Shape.js";

export class Spring extends PhysicalObject {
  constructor(physicalSystem, elasticity = 0, viscosity = 0, length = 1) {
    super(physicalSystem, 0);

    this.elasticity = elasticity;
    this.viscosity = viscosity;
    this.length = length;
    this.physicalSystem = physicalSystem;

    // Physical objects attached to
    this.pindex1 = null;
    this.pindex2 = null;

    // Drawing
    this.curve_shape = null;

    // Buffer values
    this.p1_position_buf = null;
    this.p2_position_buf = null;

    this.p1_hinge = null;
    this.p2_hinge = null;   // Default be the center of the object
  }

  /** Physical Simulation */
  get_force(particle) {
    /* Which particle - used to determine force direction */
    let F = false;
    let p1 = this.physicalSystem.physical_objects[this.pindex1];
    let p2 = this.physicalSystem.physical_objects[this.pindex2];

    if (particle === p1) F = true;
    else F = false;

    /* Direction */
    let dir = this.p1_position_buf.minus(this.p2_position_buf);
    let elastic_magnitude = dir.norm();

    if (F) dir.scale_by(-1 / elastic_magnitude);
    else dir.scale_by(1 / elastic_magnitude);

    /* Magnitude */
    elastic_magnitude = this.elasticity * (elastic_magnitude - this.length);
    let viscous_force_partial = dir.times(-this.viscosity);

    return [dir, dir.times(elastic_magnitude), viscous_force_partial];
  }

  // Update buffer values - called before updating particles
  update() {
    if (this.pindex1 != null)
      this.p1_position_buf =
        this.physicalSystem.physical_objects[this.pindex1].position.copy();

    if (this.pindex2 != null)
      this.p2_position_buf =
        this.physicalSystem.physical_objects[this.pindex2].position.copy();
  }

  /** Draw */
  get_p1_hinge(hinge_pt = this.p1_hinge) {
    if (hinge_pt === null)
      return this.physicalSystem.physical_objects[this.pindex1].position;
    else return hinge_pt;
  }

  get_p2_hinge(hinge_pt = this.p2_hinge) {
    if (hinge_pt === null)
      return this.physicalSystem.physical_objects[this.pindex2].position;
    else return hinge_pt;
  }

  interpolate(t) {
    let p1 = this.get_p1_hinge();
    let p2 = this.get_p2_hinge();
    return p1.times(t).plus(p2.times(1 - t));
  }
}
