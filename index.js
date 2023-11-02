import { components } from "three-ecs/index.js";

import ThreeEntityElement, { definition as ThreeEntity } from "./three-entity/index.js";
import ThreeWorldElement,  { definition as ThreeWorld  } from "./three-world/index.js";

const componentRegistry = new Map();

const elements = [
	ThreeEntityElement,
	ThreeWorldElement
];


// register the core definitions from three-ecs for usage in three-elements
for(const { name, definition } of components){
	componentRegistry.set(name, definition);
}


export { 
	// grouped custom element definitions
	elements,
	// individual custom element definitions
	ThreeEntity, ThreeWorld,
	// registry interface
	componentRegistry
};
