# Three-Elements

This project wraps the [Three-ECS](https://github.com/pookage/three-ecs) library around a library of custom elements; allowing the developer to write [Three.js](https://threejs.org/) scenes in HTML, where the elements are entities and their attributes generate components.

## Cloning the Repo

1. `git clone https://github.com/pookage/three-elements.git` to install the repo locally
2. `cd three-elements` to navigate into the project folder
3. `git submodule add https://github.com/pookage/three-ecs.git lib/three-ecs` to install the `three-ecs` dependency

> **NOTE:** Instead of the steps above; is is possible, apparently, to use: `git clone --recurse-submodules -j8 git://github.com/pookage/three-elements.git` - but I've had mixed success with this.
