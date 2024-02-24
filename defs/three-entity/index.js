import ThreeEntityElement from "./element.js";

const element = {
	tagName: "three-entity",
	definition: ThreeEntityElement
};

window.customElements.define(element.tagName, element.definition);

export { element, ThreeEntityElement };
export default ThreeEntityElement;
