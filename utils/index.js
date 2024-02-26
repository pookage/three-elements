import { Color } from "three";

import {
	Component, System,
	Geometry, Material, Mesh, Camera 
} from "three-ecs";

// map core three-ecs components to strings that would make for valid HTML attributes
export const attributeRegistry = new Map(
	[ Geometry, Material, Mesh, Camera ].map(ComponentConstructor => ([
		toKebab(ComponentConstructor.name),
		ComponentConstructor
	]))
);

export function generateInstanceFromAttribute(attribute, value){
	const Constructor = attributeRegistry.get(attribute);
	const config      = parseAttributeValueAsJSON(value)
	const instance    = new Constructor(config);

	return instance;
}// generateInstanceFromAttribute

export function parseAttributeValueAsJSON(attribute = ""){
	return !!attribute
		? JSON.parse(`{${
			attribute.split(";")
				.map(property => {
					const [ key, value ] = property.split(":");
					const entry = typeof key !== "undefined" && typeof value !== "undefined"
						? `"${key.trim()}":"${value.trim()}"`
						: undefined;

					return entry;
				})
				.filter(entry => !!entry)
				.join(",")
		}}`)
		: {}
}// parseAttributeValueAsJSON

export function getInstanceFromEntity(attribute, entity){
	const Constructor = attributeRegistry.get(attribute);

	let instance;
	if      (Constructor instanceof Component) instance = entity.components.get(Constructor);
	else if (Constructor instanceof System)    instance = entity.systems.get(Constructor);
	else {
		console.warn(
			`WARNING](three-elements) Unable to get attribute: ${attribute} as ${Constructor?.name}`,
			"from",
			entity,
			"via",
			entity.element,
			`as it is not an instance of either the ${Component.name} or ${System.name} class`,
			`- please ensure that the ${Constructor.name} extends either ${Component.name} or ${System.name}`,
			"which can be imported from the three-ecs library directly"
		);
	}

	return instance;
}// getInstanceFromEntity

export function toKebab(str){
	// NOTE: this was taken from ABabin's answer on stackoverflow: https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
	return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
}// toKebab
