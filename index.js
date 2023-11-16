import ThreeEntityElement, { definition as ThreeEntity } from "./three-entity/index.js";
import ThreeWorldElement,  { definition as ThreeWorld  } from "./three-world/index.js";
import ThreeBoxElement,    { definition as ThreeBox }    from "./three-box/index.js";

const elements = [
	ThreeEntityElement,
	ThreeWorldElement,
	ThreeBoxElement
];

export { 
	// grouped custom element definitions
	elements,
	// individual custom element definitions
	ThreeEntity, ThreeWorld
};
