import ThreeWorld from "./element.js";

const element = {
	tagName: "three-world",
	definition: ThreeWorld
};

window.customElements.define(element.tagName, element.definition);

export { element, ThreeWorld };
export default ThreeWorld;
