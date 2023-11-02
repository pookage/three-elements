# `three-elements`

This library takes the Entity Component System defined in [three-ecs](https://github.com/pookage/three-ecs), and adds custom-element definitions that facilitate their usage in HTML - where entities are elements, and components are attributes.

## Installation

1. Ensure that three.js has already been added to your importmap
2. Ensure that [three-ecs](https://github.com/pookage/three-ecs) has already been added to your project and importmap
3. Clone this repo to your project folder
4. Add `"three-elements"` to your `importmap`


## Usage

1. Import and register the exported `elements` definitions as custom elements (along with any of your own definitions)
2. Import and register any of your custom `three-ecs` components to the exported `componentRegistry`


### Example

```html
<DOCTYPE html>
<html>
	<head>
		<script type="importmap">
			{
				"three":           "https://unpkg.com/three@0.157.0/build/three.module.min.js",
				"three/addons/":   "https://unpkg.com/three@0.157.0/examples/jsm/",
				"three-ecs":       "./lib/three-ecs/index.js",
				"three-ecs/":      "./lib/three-ecs/",
				"three-elements":  "./lib/three-elements/index.js",
				"three-elements/": "./lib/three-elements/",
			}
		</script>
		<script type="module">
			import { elements, componentRegistry } from "three-elements";
			import MyComponent from "./path/to/my-three-ecs-component.js";

			// add component definition for usage in three-elements
			componentRegistry.set("my-component", MyComponent);

			// add three-elements custom element definitions
			for(const { tagName, definition } of elements){
				window.customElements.define(tagName, definition);
			}
		</script>
	</head>
	<body>
		<three-world>
			<!-- add a user-controlled camera to the scene -->
			<three-entity
				position="0 1.5 -5"
				camera
				wasd-controls
				look-controls
			></three-entity>

			<!-- add a blue box to the scene -->
			<three-entity
				position="-1 0 0"
				geometry="
					primitive: box;
					height: 1;
					width: 1;
					depth: 1;
				"
				material="color: blue"
				mesh
			></three-entity>

			<!-- add an entity with your custom component to the scene -->
			<a-entity 
				my-component
			></a-entity>
		</three-world>
	</body>
</html>

```

>**NOTE:** Please view the documentation on [three-ecs](https://github.com/pookage/three-ecs) for instructions on how to write a custom component


### Defining your own Elements

More documentation coming soon - but, for now, the gist is:

```javascript
import { ThreeEntity } from "three-elements";

class MyEntity extends ThreeEntity {
	// called when initialised
	constructor(){
		super();
	}

	// called when added to the scene
	connectedCallback(){}

	// called when removed from the scene
	disconnectedCallback(){}
}
```

It's likely that the primary use-case for defining your own elements would be to always to create something that will always be initialised with the same components, which is a feature I expect to add to the base `ThreeEntity` class soon enough.  Watch this space.
