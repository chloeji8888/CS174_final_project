import { PhysicalSystem } from './PhysicalSystem.js'
import { PhysicalObject } from './PhysicalObject.js'
import { Curve_Shape } from './Curve_Shape.js';
import { tiny, defs } from '../examples/common.js'
import { Spring } from './Spring.js';
const { vec3, color, Mat4, Texture } = tiny;


// A small windchime
export class WindChime extends PhysicalSystem {
    constructor() {
        super();

        // Timer
        this.t = 0;

        // Material
        this.material = {
          shader: new defs.Black_white_Phong(),
          ambient: .2,
          diffusivity: 0.5,
          color: color(0.92, 0.92, 0.92, 1),
          
        };

        this.material_bookmark = {
          shader: new defs.Black_white_Phong(),
          ambient: 0.1,
          diffusivity: 1,
          color: color(1, 1, 1, 1),
          // texture: new Texture("../assets/bookmark.png")
        };

        // Initialize BellShape
        this.bell   = new PhysicalObject(this, 1);
        this.bell.position = vec3(0, .3, 0);
        this.bell.set_scale(.05, .05, .05);
        this.bell_shape = new defs.Cube();

        // Initialize PaperPiece
        this.paper = new PhysicalObject(this, .05);
        this.paper.position = vec3(0, 0, 0);
        this.paper.set_scale(.03, .15, .001);
        this.paper_shape = new defs.Square();

        this.physical_objects.push(this.bell);
        this.physical_objects.push(this.paper);

        // Initialize Connection
        this.spring = new Spring(this, 5, 1, .2);
        this.spring.curve_shape = new Curve_Shape(
          null,
          1000,
          color(.92, .92, .92, 1)
        );
        this.spring.pindex1 = 0;    // bell
        this.spring.pindex2 = 1;    // paper
    }

    /** Update */
    update(dt=this.dt) {
        // Update timer
        this.t += 1;

        // Bell is hanging on the wall, and so we do not
        //  apply gravity to it at this stage.
        this.spring.p2_hinge = this.paper.position.plus(vec3(0, .15, 0));
        this.spring.update();

        this.bell.update(dt);

        this.paper.apply_gravity();
        let [dir, elastic_force, _viscous] = this.spring.get_force(this.paper);
        let viscous_force = _viscous.times(this.paper.velocity.dot(dir));

        this.paper.apply_force(elastic_force);
        this.paper.apply_force(viscous_force);
        this.paper.apply_force(
            vec3(0,  0, Math.random() * 0.001));
        this.paper.rotation = this.paper.rotation
            .times(Mat4.rotation(Math.sin(this.t/3000) * Math.random() * 0.0007, 0, 1, 0));

        // Update
        this.paper.update();
    }

    /** Drawing Utilities */
    draw(webgl_manager, uniforms) {
        let transform = this.get_transform(this.position);

        // Draw bell and paper
        // for (let i = 0; i < this.physical_objects.length; i++) {
        //     this.physical_objects[i].draw(
        //       webgl_manager,
        //       uniforms,
        //       transform,
        //       this.material
        //     );
        // }

        this.bell.draw(webgl_manager, uniforms, transform, this.material);
        this.paper.draw(webgl_manager, uniforms, transform, this.material_bookmark);

        // Draw spring
        let curve_function = (t) => 
            this.spring.interpolate(t).plus(this.position);
        this.spring.curve_shape.update(webgl_manager, uniforms, curve_function);
        this.spring.curve_shape.draw(webgl_manager, uniforms);
    }
}