import { Color } from "three";
import { componentRegistry } from "three-ecs";

export function generateComponentFromAttribute(name, value){
	const constructor = componentRegistry.get(name);
	const config      = parseAttributeValueAsJSON(value)
	const component   = new constructor(config);

	return component;
}// generateComponentFromAttribute

export function parseAttributeValueAsJSON(attribute = ""){
	console.warn("[TODO] Parsing attribute values as JSON does not currently convert to THREE.js types - may need further refactoring to support this");
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

export function getComponentFromEntity(componentName, entity){
	const name      = componentRegistry.get(componentName).name;
	const component = entity.components.get(name);

	return component;
}// getComponentFromEntity
