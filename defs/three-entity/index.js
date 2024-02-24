import ThreeEntity from "./element.js";

const element = {
	tagName: "three-entity",
	definition: ThreeEntity
};

window.customElements.define(element.tagName, element.definition);

export { element, ThreeEntity };
export default ThreeEntity;
