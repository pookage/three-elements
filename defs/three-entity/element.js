import { Entity, componentRegistry, parseUnverifiedConfig } from "three-ecs";

import { generateComponentFromAttribute, getComponentFromEntity, parseAttributeAsThreeValue } from "../../utils/index.js";


export default class ThreeEntity extends HTMLElement {
	// PRIVATE PROPERTIES
	// ---------------------------------
	// DOM
	#entity;

	// BOUND METHODS
	#addChildren;

	// STATIC STATE
	#entityObserver;
	#componentObserver;


	// INTERFACE
	// ---------------------------------
	// PUBLIC PROPERTIES
	// ~~ getters ~~
	get entity(){ return this.#entity; }

	// PUBLIC METHODS
	// ~~ lifecycle jazz ~~
	constructor(){
		super();

		// argument binding
		this.#addChildren = this.#addECSElements.bind(this, this.children);

		// initialise the three-ecs entity
		const entity = this.#entity = this.init();

		// create observers to mirror HTML elements with the underlying entities
		const entityObserver    = this.#entityObserver    = new MutationObserver(this.#handleDOMMutation);
		const componentObserver = this.#componentObserver = new MutationObserver(this.#handleAttributeChange);

		// apply attributes to the underlying entity
		for(const { name, value } of this.attributes){
			// add any components specified as attributes
			if(componentRegistry.has(name)) this.#addComponent(name, value);
			// if the attribute is a mapped property, then apply the mapping directly to the entity
			else if (entity.constructor.mappedProperties.includes(name)){
				this.#mapAttributeToProperty(name, value);
			}
			// otherwise dispatch a scolding for having useless attributes
			else {
				console.warn(
					"[WARNING](Entity) Unknown component", 
					attributeName, 
					"added to",
					this,
					" - the component has probably not been registered; make sure the component has been imported to register it."
				);
			}
		}

		// translate the existing DOM into the Scene tree
		this.#addECSElements(this.children);

		// observe any added / removed direct children to / from this entity
		entityObserver.observe(this, { childList: true })

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
	init(){
		// create the underlying entity that the element wraps
		return new Entity();
	}// init

	disconnectedCallback(){
		this.#entityObserver.disconnect();
		this.entity.disconnected();
		this.entity.parent.remove(this.entity);
	}// disconnectedCallback


	// MUTATION HANDLERS
	// ---------------------------------
	#handleDOMMutation = mutations => {
		for(const { addedNodes } of mutations){
			for(const element of addedNodes){
				this.#addECSElement(element);
			}
		}
	}// #handleDOMMutation

	#handleAttributeChange = mutations => {
		for(const { attributeName, oldValue } of mutations){
			// if the attribute maps to a component apply the mutation as a component
			if(componentRegistry.has(attributeName)){
				const componentWasRemoved = value === undefined;
				const componentWasAdded   = !!value && oldValue === null;

				if(componentWasRemoved)    this.#removeComponent(attributeName);
				else if(componentWasAdded) this.#addComponent(attributeName, value);
				else                       this.#updateComponent(attributeName, value);
			}
			// if the attribute is a mapped property, then apply the mapping directly to the entity
			else if(this.#entity.constructor.mappedProperties.includes(attributeName)){
				this.#mapAttributeToProperty(attributeName, value);
			} 
			// otherwise dispatch a scolding for having useless attributes
			else {
				console.warn(
					"[WARNING](Entity) Unknown component", 
					attributeName, 
					"added to",
					this,
					" - the component has probably not been registered; make sure the component has been imported to register it."
				);
			}
		}
	}// #handleAttributeChange


	// UTILS
	// ---------------------------------
	#addECSElements = elements => {
		console.warn("[TODO] Confirm if the visibility check here is necessary following the refactor")
		// if the page is visible, then go ahead and build the DOM 
		if(document.visibilityState === "visible" && elements){
			document.removeEventListener("visibilitychange", this.#addChildren);
			for(const element of elements){
				this.#addECSElement(element);
			}
		} 
		// if the page is not initially visible, then hold-off adding children to avoid lifecycle errors
		else document.addEventListener("visibilitychange", this.#addChildren);
	}// #addECSElements
	#addECSElement = element => {
		if(element){
			const { entity } = element;
			if(entity){
				// store a reference to the element on the entity
				entity.element = element;

				// add the entity to the scene
				this.entity.add(entity);
			}
		}
	}// #addECSElement

	#addComponent = (name, value) => {
		const component = generateComponentFromAttribute(name, value);

		this.#entity.addComponent(component);
	}// #addComponent
	#removeComponent = name => {
		const component = getComponentFromEntity(name, this.#entity);

		this.#entity.removeComponent(component);
	}// #removeComponent
	#updateComponent = (name, value) => {
		const component        = getComponentFromEntity(name, this.#entity);
		const unverifiedConfig = parseAttributeValueAsJSON(value);
		const config           = parseUnverifiedConfig(unverifiedConfig);

		Object.apply(component.data, verifiedConfig);
	}// #updateComponent

	#mapAttributeToProperty = (name, attributeValue) => {
		const value = parseAttributeAsThreeValue(name, attributeValue);
		this.#entity.applyProperty(name, value);
	}// #mapAttributeToProperty

}// ThreeEntity
