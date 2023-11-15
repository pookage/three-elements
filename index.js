import ThreeEntityElement, { definition as ThreeEntity } from "./three-entity/index.js";
import ThreeWorldElement,  { definition as ThreeWorld  } from "./three-world/index.js";

const elements = [
	ThreeEntityElement,
	ThreeWorldElement
];

export { 
	// grouped custom element definitions
	elements,
	// individual custom element definitions
	ThreeEntity, ThreeWorld
};
