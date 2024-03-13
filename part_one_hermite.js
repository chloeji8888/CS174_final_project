import {tiny, defs} from './examples/common.js';
import { Window_Spring } from './Window_particle.js';
import { NewtonCradle } from './newtoncradle.js';
import {WindChime} from './components/WindChime.js'
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';
import { HermiteSpline } from './components/HermiteSpline.js';

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
          'cube' : new defs.Cube(),
          'test' : new defs.Subdivision_Sphere(4),
          'tree' : new Shape_From_File('./assets/Lowpoly_tree_sample.obj'),
          'bird' : new Shape_From_File('./assets/bird.obj'),
          'bird_wingspan' : new Shape_From_File('./assets/bird_wingspan.obj'),
          'bench': new Shape_From_File('./assets/Bench_HighRes.obj'),
          'teapot': new Shape_From_File('./assets/teapot.obj'),
          'male-model': new Shape_From_File('./assets/FinalBaseMesh.obj'),
        };

        // *** Materials: ***  A "material" used on individual shapes specifies all fields
        // that a Shader queries to light/color it properly.  Here we use a Phong shader.
        // We can now tweak the scalar coefficients from the Phong lighting formulas.
        // Expected values can be found listed in Phong_Shader::update_GPU().
        const phong = new defs.Phong_Shader();
        const tex_phong = new defs.Textured_Phong();
        const black_white_phong = new defs.Black_white_Phong();
        const texture = new defs.Textured_Phong(1);
        const hard_border_black_white_phong = new defs.Hard_border_Black_white_Phong();
        this.grey = {
          shader: phong,
          color: color(0.5, 0.5, 0.5, 1),
          ambient: 0,
          diffusivity: 0.3,
          specularity: 0.5,
          smoothness: 10,
        };

        // To show text you need a Material like this one:
        this.text_image = {
          shader: texture,
          ambient: 1,
          diffusivity: 0,
          specularity: 0,
          texture: new Texture("assets/text_inv.png"),
        };
        this.materials = {};
        this.materials.plastic = { shader: black_white_phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .1,.1,.1,1 ) }
        this.materials.metal   = { shader: black_white_phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .1,.1,.1,1 ) }
        this.materials.rgb = { shader: tex_phong, ambient: .5, texture: new Texture( "assets/rgb.jpg" ) }
        this.materials.wall = { shader: black_white_phong, ambient: .1, diffusivity: .5, specularity: 0, color: color( .9, .9, .9, 1) }
        this.materials.road = {
          shader: black_white_phong,
          ambient: 1,
          diffusivity: 1,
          specularity: 0,
          color: color(.1, .1, .1, 1),
        };
        this.materials.grassland = {
          shader: black_white_phong,
          ambient: .1,
          diffusivity: 2,
          specularity: 0,
          color: color(0.1, 0.1, 0.1, 1),
          // texture: new Texture('./assets/grassland.jpg', "NEAREST")
        };
        this.materials.table = {
          shader: black_white_phong,
          ambient: .1,
          diffusivity: 1,
          specularity: .4,
          color: color(0, 0, 0, 1)
        };
        this.materials.skybox = {
          shader: hard_border_black_white_phong,
          ambient: 0.8,
          diffusivity: 0,
          specularity: 1,
          color: color(1, 1, 1, 1)
          // color: color(.5, 0, 0, 1)
        }
        this.materials.slat = {
          shader: black_white_phong,
          ambient: 0.7,
          diffusivity: 1,
          specularity: 1,
          color: color(.7, .7, .7, 1),
        };
        this.materials.black = {
          shader: phong,
          ambient: 1,
          diffusivity: 0,
          specularity: 0,
          color: color(0, 0, 0, 1),
        };
        this.materials.bench = {
          shader: black_white_phong,
          ambient: 0.01,
          diffusivity: 1  ,
          specularity: 0.1,
          color: color(1, 1, 1, 1),
        };
        this.materials.rosetta = {
          shader: phong,
          ambient: 0,
          diffusivity: 0,
          specularity: 0,
          color: color(0, 0, 0, 1)
        }
        this.materials.cloud = {
          shader: phong,
          ambient: .4,
          diffusivity: .2,
          specularity: 0,
          color: color(1, 1, 1, 1)
        }
        this.materials.sun = {
          shader: black_white_phong,
          ambient: 1,
          diffusivity: 0,
          specularity: 0,
          color: color(1, 1, 1, 1)
        }
        this.materials.bird = {
          shader: black_white_phong,
          ambient: .6,
          diffusivity: 3,
          specularity: 0,
          color: color(0, .1, 0, 1)
        }

        this.ball_location = vec3(1, 1, 1);
        this.ball_radius = 0.05;

        this.pull_up_spring = new Window_Spring();
        this.pull_up = this.pull_up_spring.create(1.1, 8, 0.2, 5000, 100);

        this.pull_down_spring = new Window_Spring();
        this.pull_down = this.pull_down_spring.create(1.2, 8, .2, 5000, 100); 

        // Pulling springs control
        this.pulled_up_string_t = 0;
        this.pulled_down_string_t = 0;

        // TODO: you should create a Spline class instance
        this.windchime = new WindChime();
        this.newtoncradle = new NewtonCradle(5, 0.02, 0.02, vec3(8.5,2.2,.6), 0.15)
        this.windchime.position = vec3(8, 2.7, -1.2);

        // Text trial
        this.text = new Text_Line(20);

        // TODO: bird trail
        this.bird_trail = new HermiteSpline();
        this.bird_trail.add_point(-2, 3, 1.5, -1, -1, 1); // Start location

        // Fly around a little?
        this.bird_trail.add_point(-3, 2.7, 2, 1, -0, -1);
        this.bird_trail.add_point(-2, 2.4, 1.5, -1, 0, 2);
        this.bird_trail.add_point(-2.5, 2.5, 2, 1, .5, -1);
        this.bird_trail.add_point(-2, 3.1, 1.5, 0, -1, 0);
        this.bird_trail.add_point(-2, 3, 1.5, -1, -1, 1);

        // this.bird_trail.add_point(-2.2, 1.5, 2, -1, -2, -1);  // S-B point 1
        // this.bird_trail.add_point(-2.5, 1.25, 1.5, 0, 0, 0); // Bench location

        // TODO: sun trail
        this.sun_trail = new HermiteSpline();
        this.sun_trail.add_point(-5, 4, -4, 0, 0.2, 1)
        this.sun_trail.add_point(-6, 5, 0, 0, 0, 1)
        this.sun_trail.add_point(-5, 4, 4, 0, 0.2, -1)
        this.sun_trail.add_point(-6, 5, 0, 0, 0, -1);
        this.sun_trail.add_point(-5, 4, -4, 0, 0.2, 1)
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
        

        // draw axis arrows.
        // this.shapes.axis.draw(caller, this.uniforms, Mat4.identity(), this.materials.rgb);

        // Draw the wall
        let right_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 1, -1.75))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(.7, 5, .1))
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          right_wall_transform,
          this.materials.wall
        );

        let left_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 1, 1.75))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(.7, 5, .1));
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          left_wall_transform,
          this.materials.wall
        );

        let bottom_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 1, 0))
          .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
          .times(Mat4.scale(1.2, .95, .1));
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          bottom_wall_transform,
          this.materials.wall
        );

        let top_wall_transform = Mat4.identity()
          .times(Mat4.translation(7.75, 4, 0))
          .times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
          .times(Mat4.scale(1, 1, .3));
        this.shapes.cube.draw(
          caller,
          this.uniforms,
          top_wall_transform,
          this.materials.wall
        )

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

        // Draw teapot
        // let teapot_transform = Mat4.identity()
        //   .times(Mat4.translation(8.4, 2.12, -.6))
        //   .times(Mat4.rotation(Math.PI/2, -1, 0, 0))
        //   .times(Mat4.rotation(-Math.PI/3, 0, 0, 1))
        //   .times(Mat4.scale(.1, .1, .1))
        // let material_teapot = this.materials.metal;
        // material_teapot["color"] = color(1, 1, 1, 1);

        // this.shapes.teapot.draw(
        //   caller,
        //   this.uniforms,
        //   teapot_transform,
        //   this.materials.bench
        // )

        // Draw the skybox
        let temp = this.materials.skybox
        // temp["diffusity"] = Math.sin(t)
        temp["ambient"] = (Math.cos(t / 7) + 1) / 3;
        this.shapes.ball.draw(
          caller, 
          this.uniforms,
          Mat4.identity().times(Mat4.scale(10, 10, 9)).times(Mat4.translation(.2, 0, 0)),
          temp
        )

        // Draw window strips


        // Draw Newton's cradle
        let rod_transform = Mat4.identity()
          .times(Mat4.translation(8.5, 2.2, .68))
          .times(Mat4.scale(.005, .005, .12))

        this.shapes.cube.draw(caller, this.uniforms, rod_transform, this.materials.slat)
        this.newtoncradle.draw(caller, this.uniforms, this.shapes, this.materials);
        
        // Calculate the time step based on the frame rate
        const frameRate = 60; // Target frame rate
        let dt = 1.0 / frameRate; // Time step for display updates

        // Clamp dt to a maximum value to prevent instability (1/30 is suggested in your feedback)
        dt = Math.min(1.0 / 30, dt);

        
        // Calculate the next simulation time
        const t_next = this.t_sim + dt;
        

        // Use a smaller time step for the simulation updates to maintain stability
        const t_step = 1 / 10000; // A smaller time step for the simulation (e.g., 1 millisecond)

        // Update the simulation in steps until reaching the next display time
        for (; this.t_sim <= t_next; this.t_sim += t_step) {
          this.pull_up_spring.update(t_step)
          this.pull_down_spring.update(t_step)
          this.newtoncradle.update(t_step)
        }

        this.pull_up_spring.draw(caller, this.uniforms, this.shapes, this.materials);
        this.pull_down_spring.draw(caller, this.uniforms, this.shapes, this.materials)


        this.windchime.draw(caller, this.uniforms);

      }
    }


export class Ticket_Booth extends Part_one_hermite_base{   
  constructor() {
    // Initialize properties
    super();
    this.top_slat_y = 3.7;
    this.lowest_slat_y = 3.2;
    this.slat_distance_y = 0.1;
    this.num_slats = 20;
    // Other initialization code as necessary

    // Scripts - TODO: integrate into a class
    this.script_male = false;
    this.getDown = -1;
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

    const blue = color( 0,0,1,1 ), yellow = color( 1,0.7,0,1 ), gray = color(.8, .8, .8, 1), black = color(.2, .2, .2, 1), green = color(0, .4, 0, 1);

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    // this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.grassland, color: green } );
    this.shapes.box.draw( caller, this.uniforms, floor_transform, this.materials.grassland );

    // Draw road
    // let road_transform = Mat4.translation(-.2, 0.01, 0)
    //   .times(Mat4.scale(1, 0.01, 10))
    // this.shapes.box.draw(caller, this.uniforms, road_transform, this.materials.road);

    // !!! Draw ball (for reference)
    // let ball_transform = Mat4.translation(this.ball_location[0], this.ball_location[1], this.ball_location[2])
    //     .times(Mat4.scale(this.ball_radius, this.ball_radius, this.ball_radius));
    // this.shapes.ball.draw( caller, this.uniforms, ball_transform, { ...this.materials.metal, color: blue } );

    // TODO: you should draw spline here.



    // Update real-time light
    // Global light
    let c1 = color(1, 1, 1, 1), c2 = color(1, 0, 0, 1);

    let light_position = this.sun_trail.get_position((Math.cos(t / 14) + 1) / 2);
    light_position = vec4(light_position[0], light_position[1], light_position[2], 1.0);
    this.materials.sun["ambient"] = (Math.cos(t / 7) + 1) / 2 + .2;
    this.shapes.ball.draw(caller, this.uniforms, Mat4.translation(light_position[0], light_position[1], light_position[2]).times(Mat4.scale(.7, .7, .7)), this.materials.sun)
    // this.uniforms.lights = [ defs.Phong_Shader.light_source( light_position, color( 1,1,1,1 ), 1000000 ) ];

    let mod_cos = (t, p) => {
      t = t % (Math.PI * 2)
      if (t < p) return (Math.cos(Math.PI * t / p) + 1) / 2
      else return (Math.cos(Math.PI * (t - p) / (Math.PI * 2 - p) + Math.PI) + 1) / 2
    }
    this.uniforms.lights = [
      defs.Phong_Shader.light_source(
        light_position,
        color(
          1, 1, 1, 1
        ),
        mod_cos(t / 3.5, 3 / 2 * Math.PI) * 8
      ),
    ];

    // In-door lights
    const covered_percentage = (this.top_slat_y - this.lowest_slat_y) / 1.7
    const room_light_position = vec4(10, 2.5, 0, 1);
    this.uniforms.lights.push(
    defs.Phong_Shader.light_source(
      room_light_position,
      color(1, 1, 1, 1),
      1.3 * (1 - covered_percentage)
    ));

    // slowly increase lowest_slat_y
    if (this.pulled_up_string_t >= 0) {
      let multiplier = 0.002;
      if (this.script_male) multiplier *= 15;

      if (this.lowest_slat_y <= this.top_slat_y - .5)
        this.lowest_slat_y += multiplier * this.pulled_up_string_t;
      this.pulled_up_string_t -= .15;
    }

    if (this.pulled_down_string_t >= 0) {
      this.lowest_slat_y -= 0.002 * this.pulled_down_string_t;
      this.pulled_down_string_t -= .15;
    }

    const temp = (this.top_slat_y - this.lowest_slat_y) / this.num_slats;

    let slat_transform;
    for (let i = 0; i < this.num_slats; i++) {
        slat_transform = Mat4.identity()
        .times(Mat4.translation(7.75, this.top_slat_y - i * temp , 0))
        .times(Mat4.rotation(-(Math.PI * 2) / 3, 0, 0, 1))
        .times(Mat4.scale(0.07, 0.002, 1));

      this.shapes.cube.draw(
        caller,
        this.uniforms,
        slat_transform,
        this.materials.slat
      );
    }

    console.log("lowest", this.lowest_slat_y)
    slat_transform = Mat4.identity()
      .times(Mat4.translation(7.75, this.top_slat_y - (this.num_slats + .3) * temp - .1 * (this.lowest_slat_y - 2.7), 0))
      .times(Mat4.scale(0.05, 0.02, 1));
    this.shapes.cube.draw(
      caller,
      this.uniforms,
      slat_transform,
      this.materials.black
    )

    // Draw bench
    let bench_transform = Mat4.identity()
      .times(Mat4.translation(-2.5, .5, 1))
      .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    this.shapes.bench.draw(
      caller, 
      this.uniforms, 
      bench_transform, 
      this.materials.bench // TODO 
    )

    // Draw tree
    let tree_transform = Mat4.identity()
      .times(Mat4.translation(-2.5, 1.7, -1))
      .times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
    this.shapes.tree.draw(
      caller,
      this.uniforms,
      tree_transform,
      this.materials.bench // TODO
    )

    // Draw male-model
    if (this.script_male) {
      let male_transform = Mat4.identity()
        .times(Mat4.translation(7, 1.7, 0))
        .times(Mat4.rotation(Math.PI / 2, 0, 1, 0))
        .times(Mat4.scale(.8, .8, .8, 1))
      this.shapes['male-model'].draw(
        caller,
        this.uniforms,
        male_transform,
        this.materials.slat // TODO
      )

      // let rosetta_transform = Mat4.identity()
      //   .times(Mat4.translation(-3, .9, -3))
      //   .times(Mat4.rotation(Math.PI / 4, 0, 1, 0))
      //   .times(Mat4.scale(.4, .9, .1))
      // this.shapes.cube.draw(
      //   caller,
      //   this.uniforms,
      //   rosetta_transform,
      //   this.materials.rosetta
      // )
    }

    // Text
    // this.text.set_string("Spring...", caller);
    // this.text.draw(caller, this.uniforms, Mat4.identity().times(Mat4.translation(0, 4, 3)).times(Mat4.rotation(Math.PI / 2, 0, 1, 0).times(Mat4.scale(.2, .2, .2))), this.text_image)
    
    // TODO: Draw the bird
    let bird_progress;
    console.log("Getdown", this.getDown)
    if (this.getDown >= 0) {
      bird_progress = Math.min((t / 6 - this.getDown) * 3 / 4, 1);
    }
    else { 
      bird_progress = t / 6 - Math.floor(t / 6);
    }
    let bird_position = this.bird_trail.get_position(bird_progress);
    let bird_tangent = this.bird_trail.get_tangent(bird_progress);
    console.log("Progress", bird_progress)

    let up = vec3(0, 1, 0);
    let right = up.cross(bird_tangent).normalized();
    // let rotation = Mat4.of(
    //   [right[0], right[1], right[2], bird_position[0]],
    //   [up[0], up[1], up[2], bird_position[1]],
    //   [bird_tangent[0], bird_tangent[1], bird_tangent[2], bird_position[2]],
    //   [0, 0, 0, 1]
    // )
    // let _bird_transform = Mat4.look_at(bird_position, bird_position.plus(bird_tangent), up)
    
    // let wing_freq = Math.ceil(Math.random() * 100);
    // let wing_freq = 2;

    console.log("Bird tangent: ", bird_tangent)
    // console.log("Bird rotation: ", rotation, Mat4.identity())

    let bird_transform = Mat4.identity()
      .times(Mat4.translation(bird_position[0], bird_position[1], bird_position[2]))
      .times(Mat4.rotation(Math.PI / 1.2, 0, 1, 0))
      .times(Mat4.rotation(-.4, 0, 0, 1))
      .times(Mat4.rotation(Math.PI / 2, -1, 0, 0))
      // .times(rotation)
      .times(Mat4.scale(0.12, 0.12, 0.12));
    
    let bird;
    if (Math.floor(t * 80) % 2 == 0 || bird_progress >= 1) bird = this.shapes.bird;
    else {
      bird = this.shapes.bird_wingspan;
      bird_transform = bird_transform.times(Mat4.scale(0.955, 0.955, 0.955));
    }

    bird.draw(caller, this.uniforms, bird_transform, this.materials.bird)


    // Update Physics and Drawing
    

    // Update physical system
    this.windchime.dump(t, 1/60);

  }

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including  
    this.key_triggered_button("Pull the down-strip", ["N"], this.pullDownStrip);
    this.key_triggered_button( "Pull the up-strip", ['M'], this.pullUpStrip);
    this.key_triggered_button("Start Newton's cradle", ['L'], () => this.liftFirstSphere());
    this.key_triggered_button("Get down birdie", ['K'], () => this.getDownBirdie())
  }

  liftFirstSphere() {
    this.newtoncradle.startCradle();
  }

  pullUpStrip() {
    // Trigger the pulling force
    // Adjust the position of the lowest slat
    if (this.lowest_slat_y <= this.top_slat_y - .5) {
      // this.lowest_slat_y += .1;
      this.pulled_up_string_t = 5;
    }

    this.pull_up_spring.applyPullingForce();   
  }

  pullDownStrip() {
    if (this.lowest_slat_y >= 1.97) {
      this.pulled_down_string_t = 5;
    }
    else {
      this.script_male = true
    }

    this.pull_down_spring.applyPullingForce();
  }

  getDownBirdie() {
    this.bird_trail.add_point(-2.2, 1.5, 2, -1, -2, -1); // S-B point 1
    this.bird_trail.add_point(-2.5, 1.25, 1.5, 0, 0, 0); // Bench location
    this.getDown = Math.floor(this.uniforms.animation_time/1000 / 6);
  }
}
