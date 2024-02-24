import { Entity, componentRegistry, parseUnverifiedConfig } from "three-ecs";

import { generateComponentFromAttribute, getComponentFromEntity, parseAttributeAsThreeValue } from "../../utils/index.js";


export default class ThreeEntityElement extends HTMLElement {
	// PRIVATE PROPERTIES
	// ---------------------------------
	// DOM
	#entity;

	// BOUND METHODS
	#addChildren;	

	// HELPERS
	#entityObserver;
	#componentObserver;
	#entityCheck;


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
			else if (Object.keys(entity.constructor.mappings).includes(name)){
				this.#mapAttributeToProperty(name, value);
			}
			// otherwise dispatch a scolding for having useless attributes
			else {
				console.warn(
					"[WARNING](Entity) Unknown component", 
					name, 
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
				...Object.keys(entity.constructor.mappings)
			]
		});
	}// constructor
	init(){
		// create the underlying entity that the element wraps
		return new Entity();
	}// init

	disconnectedCallback(){
		cancelAnimationFrame(this.#entityCheck);
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
			else if(Object.keys(this.#entity.constructor.mappings).includes(attributeName)){
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
		for(const element of elements){
			this.#addECSElement(element);
		}
	}// #addECSElements
	#addECSElement = element => {
		/*
			NOTE: 
				because we can't know for sure when the custom-element definition will be registered
				it might be the case that the parent receives the custom element before it has its functionality;
				in which case the entity would not be present when the MutationObserver fires its observation -
				the workaround for this is to treat the mutation as the trigger to start looking for the entity
				instead of assuming it'll be there from the get-go.
		*/
		const checkForEntity = () => {
			const { entity } = element;

			if(entity){
				// store a reference to the element on the entity
				entity.element = element;

				// add the entity to the scene
				this.entity.add(entity);
			} else this.#entityCheck = requestAnimationFrame(checkForEntity);
		}// checkForEntity

		// start looking for the entity
		checkForEntity();
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
		console.log("setting", name, "to", attributeValue);

		const value = parseAttributeAsThreeValue(name, attributeValue);

		console.log("parsed", attributeValue, "as", value);
		this.#entity.applyProperty(name, value);
	}// #mapAttributeToProperty

}// ThreeEntity
