import { PhysicalSystem } from "./PhysicalSystem.js";
import { PhysicalObject } from "./PhysicalObject.js";
import { Curve_Shape } from "./Curve_Shape.js";
import { tiny, defs } from "../examples/common.js";
import { Spring } from "./Spring.js";
import { Shape_From_File } from "../examples/obj-file-demo.js";
const { vec3, color, Mat4, Texture } = tiny;

export class Star extends PhysicalSystem {
  constructor(angle=Math.PI / 3, m=1, ks=1, es=1, length=1.5) {
    super();

    // Timer
    this.t = 0;
    this.angle = angle;

    // Initialize Fixed Point
    this.fixed = new PhysicalObject(this); // not physically simulated
    this.fixed.set_scale(.05, .05, .05);
    this.fixed.shape = null;

    // Initialize Star
    this.star = new PhysicalObject(
      this,
      m,
      this.fixed.position.minus(vec3(0, length, 0))
    );
    this.star.set_scale(.2, .2, .2);
    this.star.shape = new Shape_From_File("../assets/star.obj");
    this.star.rotation = Mat4.identity()
      .times(Mat4.rotation(Math.PI / 2, 0, 0, 1))
      .times(Mat4.rotation(this.angle, 0, 1, 0));

    this.physical_objects.push(this.fixed);
    this.physical_objects.push(this.star);

    // Initialize Connection
    this.spring = new Spring(this, ks, es, length);
    this.spring.curve_shape = new Curve_Shape(
      null,
      1000,
      color(0.92, 0.92, 0.92, 1)
    );
    this.spring.pindex1 = 0; // fixed
    this.spring.pindex2 = 1; // star

    this.physical_objects.push(this.spring)

    // Materials
    this.star_material = {
        shader: new defs.Black_white_Phong(),
        ambient: .4,
        diffusivity: 30,
        color: color(.3, .3, .3, 1),
    };
  }

  update(dt = this.dt) {
    // Update timer
    this.t += 1;

    // Fixed is hanging on the wall, and so we do not
    //  apply gravity to it at this stage.
    this.spring.update();

    this.fixed.update(dt);

    this.star.apply_gravity();
    let [dir, elastic_force, _viscous] = this.spring.get_force(this.star);
    let viscous_force = _viscous.times(this.star.velocity.dot(dir));

    this.star.apply_force(elastic_force);
    this.star.apply_force(viscous_force);

    // Update
    this.star.update();
  }

  /** Drawing Utilities */
  draw(webgl_manager, uniforms) {
    let transform = this.get_transform(this.position);

    // Draw bell and paper
    this.fixed.draw(webgl_manager, uniforms, transform, this.star_material);

    this.star.draw(webgl_manager, uniforms, transform, this.star_material);

    // Draw spring
    let curve_function = (t) => this.spring.interpolate(t).plus(this.position);
    this.spring.curve_shape.update(webgl_manager, uniforms, curve_function);
    this.spring.curve_shape.draw(webgl_manager, uniforms);
  }
}