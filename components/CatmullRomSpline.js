import { Curve_Shape } from "./Curve_Shape.js";
import { tiny, defs } from "../examples/common.js";
import { HermiteSpline } from "./HermiteSpline.js";
const { vec3, color, Shape, Mat4 } = tiny;

export class CatmullRomSpline {
  constructor() {
    this.hermite = new HermiteSpline();
  }

  add_point(x, y, z) {
    let n = this.hermite.controlPoints.length;

    this.hermite.add_point(x, y, z, 0, 0, 0);

    if (n > 2) {
        this.hermite.tangents[n - 1] = 
            this.hermite.controlPoints[n - 2].plus(this.hermite.controlPoints[n].times(1 / 2))
    }
  }

  get_position(t) {
    return this.hermite.get_position(t);
  }
}
