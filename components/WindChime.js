import { PhysicalSystem } from './PhysicalSystem.js'
import { PhysicalObject } from './PhysicalObject.js'
import { tiny, defs } from '../examples/common.js'
const { vec3 } = tiny;


// A small windchime
class WindChime extends PhysicalSystem {
    constructor() {
        super();

        // Initialize BellShape
        this.bell   = new PhysicalObject(this);
        this.bell.position = vec3(0, -.2, 0);
        this.bell_shape = new defs.Cube();

        // Initialize PaperPiece
        this.paper = new PhysicalObject(this);
        this.paper.position = vec3(0, .2, 0);
        this.paper_shape = new defs.Square();
    }

    /** Drawing Utilities */
    draw(webgl_manager, uniforms) {
        for (let i = 0; i < this.physical_objects.length; i++)
            this.physical_objects[i].draw(
              webgl_manager,
              uniforms,
              this.position,
              {
                shader: new defs.Phong_Shader(),
                ambient: 1.0,
                color: curve_color,
              }
            );
    }
}