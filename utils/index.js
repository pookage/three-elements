import { Color } from "three";

import { Geometry, Material, Mesh, Camera } from "three-ecs";

// map core three-ecs components to strings that would make for valid HTML attributes
export const attributeRegistry = new Map(
	[ Geometry, Material, Mesh, Camera ].map(ComponentConstructor => ([
		toKebab(ComponentConstructor.name),
		ComponentConstructor
	]))
);

export function generateComponentFromAttribute(attribute, value){
	const ComponentConstructor = attributeRegistry.get(attribute);
	const config               = parseAttributeValueAsJSON(value)
	const component            = new ComponentConstructor(config);

	return component;
}// generateComponentFromAttribute

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

export function getComponentFromEntity(attribute, entity){
	const ComponentConstructor = attributeRegistry.get(attribute);
	const component            = entity.components.get(ComponentConstructor);

	return component;
}// getComponentFromEntity

export function toKebab(str){
	// NOTE: this was taken from ABabin's answer on stackoverflow: https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
	return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
}// toKebab
