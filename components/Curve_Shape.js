import { tiny, defs } from "../examples/common.js";
const { vec3, color, Shape, Mat4 } = tiny;

export class Curve_Shape extends Shape {
  // curve_function: (t) => vec3
  constructor(curve_function, sample_count, curve_color = color(1, 0, 0, 1)) {
    super("position", "normal");

    this.material = {
      shader: new defs.Phong_Shader(),
      ambient: 1.0,
      color: curve_color,
    };
    this.sample_count = sample_count;

    if (curve_function && this.sample_count) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = i / this.sample_count;
        this.arrays.position.push(curve_function(t));
        this.arrays.normal.push(vec3(0, 0, 0)); // have to add normal to make Phong shader work.
      }
    }
  }

  draw(webgl_manager, uniforms) {
    // call super with "LINE_STRIP" mode
    super.draw(
      webgl_manager,
      uniforms,
      Mat4.identity(),
      this.material,
      "LINE_STRIP"
    );
  }

  update(webgl_manager, uniforms, curve_function) {
    if (curve_function && this.sample_count) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = (1.0 * i) / this.sample_count;
        this.arrays.position[i] = curve_function(t);
      }
    }
    // this.arrays.position.forEach((v, i) => v = curve_function(i / this.sample_count));
    this.copy_onto_graphics_card(webgl_manager.context);
    // Note: vertex count is not changed.
    // not tested if possible to change the vertex count.
  }
}
