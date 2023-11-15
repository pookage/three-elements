import { componentRegistry } from "three-ecs";
import Entity from "three-ecs/entity.js";


export default class ThreeEntity extends HTMLElement {

	// INTERFACE
	// ------------------------------
	get entity(){ return this.#entity }


	// PROPERTIES
	// ------------------------------
	#entity;
	#childObserver;
	#componentObserver;


	// ELEMENT LIFECYCLE JAZZ
	// ------------------------------
	constructor(){
		super();

		const entity = this.#entity = this.init();

		this.#addChildren();

		for(const { name, value } of this.attributes){
			if(componentRegistry.has(name)) this.#addComponent(name, value);
			else if (entity.constructor.mappedProperties.includes(name)){
				this.#mapAttributeToProperty(name, value);
			} else {
				console.warn("[ThreeEntity]", name, "does not exist in the component registry");
			}
		}

		// create observers to mirror HTML elements with the underlying entities
		const childObserver     = this.#childObserver = new MutationObserver(this.#handleDOMMutation);
		const componentObserver = this.#componentObserver = new MutationObserver(this.#handleAttributeChange)

		// observe any added / removed direct children to / from this entity
		childObserver.observe(this, { childList: true })

		// observe any changes to this component's attributes that match the list of registered components
		componentObserver.observe(this, { 
			attribute: true,
			attributeOldValue: true,
			attributeFilter: [ 
				...componentRegistry.keys(),
				...entity.constructor.mappedProperties
			]
		});
	}// constructor
	#addChildren = () => {
		// if the window is active - go ahead and add the children for this entity!
		if(document.visibilityState === "visible"){
			// add any children that are present at the point of DOM-construction
			for(const child of this.children){
				this.#addChild(child);
			}

			// remove any listeners now that shit's actually set-up correctly
			document.removeEventListener("visibilitychange", this.#addChildren);
		} 
		// if the window starts inactive, then wait for it to become active before adding them
		else document.addEventListener("visibilitychange", this.#addChildren);
	}// #addChildren

	connectedCallback(){
		this.entity.play();
	}// connectedCallback
	disconnectedCallback(){
		this.#childObserver.disconnect();
		this.entity.parent.remove(this.entity);
		this.entity.disconnected();
	}// disconnectedCallback


	// ENTITY LIFECYCLE JAZZ
	// ------------------------------
	init(){
		return new Entity();
	}// init


	// UTILS
	// -----------------------------------
	// SCENE TREE
	#addChild = (element) => {
		// NOTE: if this is called when the page is not visible, there may be issues: see #addChildren for fix
		return new Promise((resolve, reject) => {
			const checkForEntity = () => {
				const { entity } = element;

				if(entity){
					// let the entity know what three-element it has been added to
					entity.element = this;

					// add the entity to the scene
					this.entity.add(entity);

					// resolve the promise, so that if anything was waiting on it, it can progress
					resolve(entity)
				} else requestAnimationFrame(checkForEntity)
			}// checkForEntity

			// start looking for the child entity 
			checkForEntity();
		});
	}// #addCHild

	// COMPONENT
	#getComponent = name => {
		const componentKey   = componentRegistry.get(name).name;
		const component      = this.#entity.components.get(componentKey);

		return component;
	}// #getComponent
	#addComponent = (name, value) => {
		const constructor = componentRegistry.get(name);
		const config      = this.#parseAttributeConfig(value);

		this.#entity.addComponent(new constructor(config));
	}// #addComponent
	#updateComponent = (name, value) => {
		const component      = this.#getComponent(name);
		const config         = this.#parseAttributeConfig(value);
		const verifiedConfig = component.generateVerifiedConfig(config);

		// apply the updated object 
		Object.assign(component.data, verifiedConfig);
	}// #updateComponent
	#removeComponent = name => {
		this.#entity.removeComponent(
			this.#getComponent(name)
		);
	}// #removeComponent
	#parseAttributeConfig = (attribute = "") => {
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
	}// #parseAttributeConfig

	// MAPPED PROPERTIES
	#mapAttributeToProperty = (name, value) => {
		switch(name){
			case "position":
			case "rotation":
			case "scale": {
				const [ x, y, z ] = value.split(" ");
				this.#entity.applyProperty(name, { x, y, z });
				break;
			}
			case "visible": {
				const visible = value !== "false";
				this.#entity.applyProperty(name, visible);
				break
			}
		}
	}// #mapAttributeToProperty


	// EVENT HANDLERS
	// -----------------------------------
	#handleDOMMutation = (mutations) => {
		for(const { addedNodes } of mutations){
			for(const { entity } of addedNodes){
				this.#addChild(entity);
			}
		}
	}// #handleDOMMutation

	#handleAttributeChange = (mutations) => {
		for(const { attributeName, oldValue } of mutations){
			const value = this.attributes[attributeName]?.value;

			// if the attribute maps to a component - apply component logic
			if(componentRegistry.has(attributeName)){
				if(value === undefined)    this.#removeComponent(attributeName);
				else if(oldValue === null) this.#addComponent(attributeName, value);
				else                       this.#updateComponent(attributeName, value)
			} 

			// if the attribute maps to a property that the entity itself manages - apply that mapping
			else if (this.#entity.constructor.mappedProperties.includes(attributeName)){
				console.log("ra!")
				this.#mapAttributeToProperty(attributeName, value);
			}


		}
	}// #handleAttributeChange

}// ThreeEntity 
