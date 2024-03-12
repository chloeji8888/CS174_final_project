import { Curve_Shape } from "./Curve_Shape.js";
import { tiny, defs } from "../examples/common.js";
const { vec3, color, Shape, Mat4 } = tiny;


export class HermiteSpline {
  constructor() {
    this.controlPoints = []; // array of vec3
    this.tangents = []; // array of vec3
  }

  /* Helper Methods */

  h00(t) {
    return 2 * Math.pow(t, 3) - 3 * Math.pow(t, 2) + 1;
  }

  h10(t) {
    return Math.pow(t, 3) - 2 * Math.pow(t, 2) + t;
  }

  h01(t) {
    return -2 * Math.pow(t, 3) + 3 * Math.pow(t, 2);
  }

  h11(t) {
    return Math.pow(t, 3) - Math.pow(t, 2);
  }

  scale_t(t, si, ei) {
    return t - si;
  }

  scale_tangent(m, interval) {
    return m.times(interval);
  }

  get_arc_length(num_samples = 1000) {
    console.log(this.controlPoints);
    console.log(this.tangents);

    // Special case: spline is empty
    if (this.controlPoints.length == 0 || this.tangents.length == 0) return 0;

    // In general
    let arc_length = 0;
    let last_point = this.get_position(0);

    for (let i = 1; i <= num_samples; i++) {
      let progress = i / num_samples;

      console.log(i, progress);

      let new_point = this.get_position(progress);
      let estimate_vec = new_point.minus(last_point);

      console.log("New point: " + new_point);
      console.log("Last point: " + last_point);

      arc_length += estimate_vec.norm();

      last_point = new_point;

      console.log(estimate_vec);
      console.log(estimate_vec.norm());
    }

    return arc_length;
  }

  /* Interpolation */
  // t is in [0, 1]
  get_position(t) {
    // Number of sections
    let num_sec = this.controlPoints.length - 1;
    let extended_t = t * num_sec;

    let si; // Left control-points index
    let ei; // Right control-points index
    if (t == 1) si = num_sec - 1;
    else si = Math.floor(extended_t);
    ei = si + 1;

    // Scaled time t used for hermite equation
    let st = this.scale_t(extended_t, si, ei);

    // Related control points and tangents
    let ps = this.controlPoints[si];
    let pe = this.controlPoints[ei];
    let ms = this.tangents[si];
    let me = this.tangents[ei];

    ms = this.scale_tangent(ms, 1 / num_sec);
    me = this.scale_tangent(me, 1 / num_sec);

    console.log("Start point: " + ps);
    console.log("End point: " + pe);
    console.log("Start tangent: " + ms);
    console.log("End tangent: " + me);

    return ps
      .times(this.h00(st))
      .plus(ms.times(this.h10(st)))
      .plus(pe.times(this.h01(st)))
      .plus(me.times(this.h11(st)));
  }

  get_tangent(t) {
    // Number of sections
    let num_sec = this.controlPoints.length - 1;
    let extended_t = t * num_sec;

    let si; // Left control-points index
    let ei; // Right control-points index
    if (t == 1) si = num_sec - 1;
    else si = Math.floor(extended_t);
    ei = si + 1;

    // Scaled time t used for hermite equation
    let st = this.scale_t(extended_t, si, ei);

    // Related control points and tangents
    let ps = this.controlPoints[si];
    let pe = this.controlPoints[ei];
    let ms = this.tangents[si];
    let me = this.tangents[ei];

    ms = this.scale_tangent(ms, 1 / num_sec);
    me = this.scale_tangent(me, 1 / num_sec);

    return ms.times(st).plus(me.times(1 - st));
  }

  /* Getters & Setters */
  add_point(x, y, z, tx, ty, tz) {
    this.controlPoints.push(vec3(x, y, z));
    this.tangents.push(vec3(tx, ty, tz));
  }
}
