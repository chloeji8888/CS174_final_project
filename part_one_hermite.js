import {tiny, defs} from './examples/common.js';
import { Window_Spring } from './Window_particle.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

// TODO: you should implement the required classes here or in another file.

export
const Part_one_hermite_base = defs.Part_one_hermite_base =
    class Part_one_hermite_base extends Component
    {                                          // **My_Demo_Base** is a Scene that can be added to any display canvas.
                                               // This particular scene is broken up into two pieces for easier understanding.
                                               // The piece here is the base class, which sets up the machinery to draw a simple
                                               // scene demonstrating a few concepts.  A subclass of it, Part_one_hermite,
                                               // exposes only the display() method, which actually places and draws the shapes,
                                               // isolating that code so it can be experimented with on its own.
      init()
      {
        console.log("init")

        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape it
        // would be redundant to tell it again.  You should just re-use the
        // one called "box" more than once in display() to draw multiple cubes.
        // Don't define more than one blueprint for the same thing here.
        this.shapes = { 'box'  : new defs.Cube(),
          'ball' : new defs.Subdivision_Sphere( 4 ),
          'axis' : new defs.Axis_Arrows(),
          'square': new defs.Square(),
          'cube' : new defs.Cube() };

        // *** Materials: ***  A "material" used on individual shapes specifies all fields
        // that a Shader queries to light/color it properly.  Here we use a Phong shader.
        // We can now tweak the scalar coefficients from the Phong lighting formulas.
        // Expected values can be found listed in Phong_Shader::update_GPU().
        const phong = new defs.Phong_Shader();
        const tex_phong = new defs.Textured_Phong();
        this.materials = {};
        this.materials.plastic = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) }
        this.materials.metal   = { shader: phong, ambient: .2, diffusivity: 1, specularity:  1, color: color( .9,.5,.9,1 ) }
        this.materials.rgb = { shader: tex_phong, ambient: .5, texture: new Texture( "assets/rgb.jpg" ) }
        this.materials.wall = { shader: phong, ambient: .1, diffusivity: .5, specularity: 0, color: color( .9, .9, .9, 1) }
        this.materials.table = {
          shader: phong,
          ambient: .2,
          diffusivity: 0.7,
          specularity: 0.1,
          color: color(.8, .4, 0, 1)
        };
        this.materials.skybox = {
          shader: phong,
          ambient: .7,
          diffusivity: 0,
          specularity: 0,
          color: color(0.68, .85, 1, 1)
        }
        this.materials.slat = {
          shader: phong,
          ambient: 0.2,
          diffusivity: 1,
          specularity: 1,
          color: color(1, 1, 1, 1),
        };

        this.ball_location = vec3(1, 1, 1);
        this.ball_radius = 0.05;

        this.Window_Spring = new Window_Spring();

        this.Window_Spring.create(8, 0.2, 5000, 100);

        // TODO: you should create a Spline class instance
      }
        constructor(){
        super();
        this.t_sim = 0; 
      }

      render_animation( caller )
      {                                                // display():  Called once per frame of animation.  We'll isolate out
        // the code that actually draws things into Part_one_hermite, a
        // subclass of this Scene.  Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if( !caller.controls )
        { this.animated_children.push( caller.controls = new defs.Movement_Controls( { uniforms: this.uniforms } ) );
          caller.controls.add_mouse_controls( caller.canvas );

          // Define the global camera and projection matrices, which are stored in shared_uniforms.  The camera
          // matrix follows the usual format for transforms, but with opposite values (cameras exist as
          // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
          // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() or
          // orthographic() automatically generate valid matrices for one.  The input arguments of
          // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.

          // !!! Camera changed here
          Shader.assign_camera( Mat4.look_at(vec3(10, 2.65, 0), vec3(0, 2, 0), vec3(0, 1, 0)), this.uniforms);
        }
        this.uniforms.projection_transform = Mat4.perspective( Math.PI/4, caller.width/caller.height, 1, 100 );

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by
        // the shader when coloring shapes.  See Light's class definition for inputs.
        const t = this.t = this.uniforms.animation_time/1000;
        const angle = Math.sin( t );

        // const light_position = Mat4.rotation( angle,   1,0,0 ).times( vec4( 0,-1,1,0 ) ); !!!
        // !!! Light changed here
        const light_position = vec4(0, 10,  0, 1.0);
        const room_light_position = vec4(12, 5, 0, 1.0);
        this.uniforms.lights = [ defs.Phong_Shader.light_source( light_position, color( 1,1,1,1 ), 1000000 ), defs.Phong_Shader.light_source( room_light_position, color(1, 1, 1, 1), 10) ];

        // draw axis arrows.
        this.shapes.axis.draw(caller, this.uniforms, Mat4.identity(), this.materials.rgb);

        // Draw the wall
        let right_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 1, -1.75))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(.9, 5, .1))
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          right_wall_transform,
          this.materials.wall
        );

        let left_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 1, 1.75))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(.9, 5, .1));
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          left_wall_transform,
          this.materials.wall
        );

        let bottom_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 1, 0))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(1, .95, .1));
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          bottom_wall_transform,
          this.materials.wall
        );

        // Draw the table
        let table_transform = Mat4.identity()
          .times(Mat4.translation(9, 2, 0))
          .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
          .times(Mat4.scale(1, 1, 1))
        this.shapes.square.draw(
          caller,
          this.uniforms,
          table_transform,
          this.materials.table
        )

        // Draw the skybox
        this.shapes.ball.draw(
          caller, 
          this.uniforms,
          Mat4.identity().times(Mat4.scale(50, 50, 50)),
          this.materials.skybox
        )

     
        // Calculate the time step based on the frame rate
        const frameRate = 60; // Target frame rate
        let dt = 1.0 / frameRate; // Time step for display updates

        // Clamp dt to a maximum value to prevent instability (1/30 is suggested in your feedback)
        dt = Math.min(1.0 / 30, dt);

        
        // Calculate the next simulation time
        const t_next = this.t_sim + dt;
        

        // Use a smaller time step for the simulation updates to maintain stability
        const t_step = 1 / 1000; // A smaller time step for the simulation (e.g., 1 millisecond)

        // Update the simulation in steps until reaching the next display time
        for (; this.t_sim <= t_next; this.t_sim += t_step) {
          this.Window_Spring.update(t_step)
        }

        this.Window_Spring.draw(caller, this.uniforms, this.shapes, this.materials);


      }
    }


export class Ticket_Booth extends Part_one_hermite_base{   
  constructor() {
    // Initialize properties
    super();
    this.top_slat_y = 4;
    this.lowest_slat_y = 2.5;
    this.slat_distance_y = 0.1;
    // Other initialization code as necessary
  }

  render_animation( caller )
  {                                                // display():  Called once per frame of animation.  For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
    // different matrix value to control where the shape appears.

    // Variables that are in scope for you to use:
    // this.shapes.box:   A vertex array object defining a 2x2x2 cube.
    // this.shapes.ball:  A vertex array object defining a 2x2x2 spherical surface.
    // this.materials.metal:    Selects a shader and draws with a shiny surface.
    // this.materials.plastic:  Selects a shader and draws a more matte surface.
    // this.lights:  A pre-made collection of Light objects.
    // this.hover:  A boolean variable that changes when the user presses a button.
    // shared_uniforms:  Information the shader needs for drawing.  Pass to draw().
    // caller:  Wraps the WebGL rendering context shown onscreen.  Pass to draw().

    // Call the setup code that we left inside the base class:
    super.render_animation( caller );

    /**********************************
     Start coding down here!!!!
     **********************************/
        // From here on down it's just some example shapes drawn for you -- freely
        // replace them with your own!  Notice the usage of the Mat4 functions
        // translation(), scale(), and rotation() to generate matrices, and the
        // function times(), which generates products of matrices.

    const blue = color( 0,0,1,1 ), yellow = color( 1,0.7,0,1 );

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.plastic, color: yellow } );

    // !!! Draw ball (for reference)
    let ball_transform = Mat4.translation(this.ball_location[0], this.ball_location[1], this.ball_location[2])
        .times(Mat4.scale(this.ball_radius, this.ball_radius, this.ball_radius));
    this.shapes.ball.draw( caller, this.uniforms, ball_transform, { ...this.materials.metal, color: blue } );

    // TODO: you should draw spline here.

    

    for (let y = this.top_slat_y; y >= this.lowest_slat_y; y -= this.slat_distance_y) {
      let slat_transform = Mat4.identity()
        .times(Mat4.translation(7.75, y, 0))
        .times(Mat4.rotation(-(Math.PI * 2) / 3, 0, 0, 1))
        .times(Mat4.scale(0.08, 0.002, 0.83));

      this.shapes.cube.draw(
        caller,
        this.uniforms,
        slat_transform,
        this.materials.slat
      );
    }
  }

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including  

    this.key_triggered_button( "Pull the strip", [], this.pullStrip);
    
  }

  pullStrip() {
    // Trigger the pulling force
    // Adjust the position of the lowest slat
  this.lowest_slat_y += 0.1; // Change this value as needed for the desired speed

  // Ensure the new position does not exceed the top position
  if (this.lowest_slat_y > this.top_slat_y) {
    this.lowest_slat_y = this.top_slat_y;
  }
    this.Window_Spring.applyPullingForce();
    
  }
}
