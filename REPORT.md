# Project Report: Ticket Booth

## Team: Three Ticket Sellers

### Team Members and Contacts

- **Zhenyuxi Ji**
  - UID: 805741639
  - Email: chloeji8888@gmail.com

- **Haotian Yi**
  - UID: 605724155
  - Email: yi2021@g.ucla.edu

- **Laiyin Dai**
  - UID: 005569647
  - Email: dailaiyin@g.ucla.edu

### Introduction

The Ticket Booth project offers a dynamic and interactive experience, simulating the perspective of a ticket seller. This immersive experience is enriched by the ability to interact with various objects within the scene and observe the changing seasons through the booth's windows.

### Algorithms

The project employs several algorithms for its simulation, including:

1. **Splines**
   - Hermite
   - Catmull-Rom (implemented but not used)
2. **Collision** based on
   - Restitution
   - Spring damper model
3. **Physics**
   - Forces and momentum for non-angular systems
   - Integration techniques including Euler, Symplectic, and Verlet
4. **Particle System** for the construction of the Newton Cradle

Other advanced features outside course materials include:

1. Custom toon-like shaders
2. Complicated mathematical equations and derivatives
3. Staging management

### Helpful Notes for Grading

The project's components are distributed among the team members, reflecting diverse methodologies tailored to their specific responsibilities. Key parts of the source code include:

1. Major scene-construction and components: `part_one_hermite.js`
2. Component-based design: Located within the `./components directory`
3. Newton Cradle Simulation: `newtoncradle.js`
4. Custom shaders can be found in the `./examples/common-shaders.js` file.