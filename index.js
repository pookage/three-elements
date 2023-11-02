import ThreeEntity from "./three-entity/index.js";
import ThreeWorld from "./three-world/index.js";

const componentRegistry = new Map();

const elements = [
	ThreeEntity,
	ThreeWorld
];

export { elements, componentRegistry };
