import { attributeRegistry } from "./utils/index.js";

import { ThreeEntityElement } from "./defs/three-entity/index.js";
import { ThreeWorldElement  } from "./defs/three-world/index.js";
import elements from "./defs/index.js";


/*
	wait until any user-scripts have been parsed before adding core definitions
	otherwise the attributeRegistry may not have the definitions required to
	instantiate the Components and Systems defined as attributes on the elements.
*/
window.addEventListener("DOMContentLoaded", () => {
	for(const { tagName, definition } of elements){
		window.customElements.define(tagName, definition)
	}
});


export {
	attributeRegistry,
	ThreeEntityElement,
	ThreeWorldElement
};
