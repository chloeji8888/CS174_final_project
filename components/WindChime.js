import { PhysicalSystem } from './PhysicalSystem.js'
import { PhysicalObject } from './PhysicalObject.js'
import { tiny, defs } from '../examples/common.js'
const { vec3, color } = tiny;


// A small windchime
export class WindChime extends PhysicalSystem {
    constructor() {
        super();

        // Material
        this.mateiral = {
          shader: new defs.Phong_Shader(),
          ambient: 1.0,
          diffusivity: .5,
          color: color(1, 1, 1, 1),
        };

        // Initialize BellShape
        this.bell   = new PhysicalObject(this);
        this.bell.position = vec3(0, .2, 0);
        this.bell.set_scale(.1, .1, .1);
        this.bell_shape = new defs.Cube();

        // Initialize PaperPiece
        this.paper = new PhysicalObject(this);
        this.paper.position = vec3(0, -.2, 0);
        this.paper.set_scale(.1, .3, .001);
        this.paper_shape = new defs.Square();

        this.physical_objects.push(this.bell);
        this.physical_objects.push(this.paper);
    }

    /** Drawing Utilities */
    draw(webgl_manager, uniforms) {
        let transform = this.get_transform(this.position);

        for (let i = 0; i < this.physical_objects.length; i++) {
            this.physical_objects[i].draw(
              webgl_manager,
              uniforms,
              transform,
              this.mateiral
            );
        }
    }
}