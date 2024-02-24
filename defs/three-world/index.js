import ThreeWorldElement from "./element.js";

const element = {
	tagName: "three-world",
	definition: ThreeWorldElement
};

window.customElements.define(element.tagName, element.definition);

export { element, ThreeWorldElement };
export default ThreeWorldElement;
