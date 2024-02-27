import { Entity, Component, System, parseUnverifiedConfig } from "three-ecs";

import { 
	generateInstanceFromAttribute, 
	getInstanceFromEntity, 
	attributeRegistry,
	definitionRegistry
} from "../../utils/index.js";


export default class ThreeEntity extends HTMLElement {
	// PRIVATE PROPERTIES
	// ---------------------------------
	// DOM
	#entity;

	// BOUND METHODS
	#addChildren;	

	// HELPERS
	#entityObserver;
	#attributeObserver;
	#entityCheck;


	// INTERFACE
	// ---------------------------------
	// STATIC PROPERTIES
	static get mappings(){ return {}; }// get mappings
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
		const attributeObserver = this.#attributeObserver = new MutationObserver(this.#handleAttributeChange);

		// apply attributes to the underlying entity
		this.#applyAttributesToEntity(this.attributes, entity);

		// translate the existing DOM into the Scene tree
		this.#addECSElements(this.children);

		// observe any added / removed direct children to / from this entity
		entityObserver.observe(this, { childList: true })

		// observe any changes to this component's attributes that match the list of registered components
		attributeObserver.observe(this, { 
			attribute: true,
			attributeOldValue: true,
			attributeFilter: [ 
				...attributeRegistry.keys(),
				...Object.keys(entity.constructor.mappings),
				...Object.keys(this.constructor.mappings)
			]
		});
	}// constructor
	init(){
		// create the underlying entity that the element wraps
		return new Entity();
	}// init

	connectedCallback(){ }// connectedCallback

	disconnectedCallback(){
		cancelAnimationFrame(this.#entityCheck);
		this.#entityObserver.disconnect();
		this.#attributeObserver.disconnect();
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
			if(attributeRegistry.has(attributeName)){
				const attributeWasRemoved = value === undefined;
				const attributeWasAdded   = !!value && oldValue === null;

				if(attributeWasRemoved)    this.#removeInstance(attributeName);
				else if(attributeWasAdded) this.#addRegisteredInstance(attributeName, value);
				else                       this.#updateInstance(attributeName, value);
			}
			// if the attribute is a mapped property, then apply the mapping directly to the entity
			else if(Object.keys(this.#entity.constructor.mappings).includes(attributeName)){
				this.#mapAttributeToProperty(attributeName, value);
			} 
		}
	}// #handleAttributeChange


	// UTILS
	// ---------------------------------
	#applyAttributesToEntity = (attributes, entity) => {
		for(const { name, value } of attributes){
			// add any components specified as attributes
			if(attributeRegistry.has(name)) this.#addRegisteredInstance(name, value);
			// if the attribute is a mapped property, then apply the mapping directly to the entity
			else if(Object.keys(this.constructor.mappings).includes(name)){
				this.#mapAttributeToProperty(this.constructor.mappings[name], value)
			} else if (Object.keys(entity.constructor.mappings).includes(name)){
				this.#mapAttributeToProperty(name, value);
			}
			// otherwise dispatch a scolding for having useless attributes
			else {
				console.warn(
					`[WARNING](Entity) Unknown attribute '${name}' changed on`, 
					this,
					" - make sure it has been added to in the attributeRegistry", 
					attributeRegistry,
					`or included in the '${entity.constructor.name}' entity mappings`,
					entity.constructor.mappings,
					"to a definition in the attributeRegistry."
				);
			}
		}
	}// #applyAttributesToEntity

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

	#addRegisteredInstance = (attribute, value) => {
		const instance = generateInstanceFromAttribute(attribute, value);

		if(instance instanceof Component)   this.#entity.addComponent(instance);
		else if(instance instanceof System) this.#entity.addSystem(instance);
		else {
			console.warn(
				`WARNING](three-elements) Unable to add attribute: ${attribute} as ${instance?.constructor?.name}`,
				"to",
				this.#entity,
				"via",
				this,
				`as ${instance?.constructor?.name} is not an instance of either the ${Component.name} or ${System.name} class`,
				`- please ensure that the ${instance?.constructor?.name} extends either ${Component.name} or ${System.name}`,
				"which can be imported from the three-ecs library directly"
			);
		}
	}// #addRegisteredInstance
	#removeInstance = attribute => {
		const Constructor = attributeRegistry.get(attribute);

		// add the attribute as a component if it was registered as a component
		if(Constructor instanceof Component){
			this.#entity.removeComponent(
				this.#entity.components.get(Constructor)
			);
		}
		// add the attribute as a system if it was registered as a system
		else if (Constructor instanceof System){
			this.#entity.removeSystem(
				this.#entity.systems.get(Constructor)
			)
		}
		// if it was registered as an unrecognised type then warn of an implementation error
		else {
			console.warn(
				`WARNING](three-elements) Unable to remove attribute: ${attribute} as ${Constructor?.name}`,
				"from",
				entity,
				"via",
				entity.element,
				`as it is not an instance of either the ${Component.name} or ${System.name} class`,
				`- please ensure that the ${Constructor.name} extends either ${Component.name} or ${System.name}`,
				"which can be imported from the three-ecs library directly"
			);
		}
	}// #removeInstance
	#updateInstance = (name, value) => {
		const Constructor      = attributeRegistry.get(attribute);
		const instance         = getInstanceFromEntity(Constructor, this.#entity);
		const unverifiedConfig = parseAttributeValueAsJSON(value);
		const config           = parseUnverifiedConfig(unverifiedConfig);

		Object.apply(instance.data, verifiedConfig);
	}// #updateInstance

	#mapAttributeToProperty = (name, attributeValue) => {
		const value = definitionRegistry.has(attributeValue)
			? new (definitionRegistry.get(attributeValue))
			: attributeValue;

		this.#entity.applyProperty(name, value);
	}// #mapAttributeToProperty

}// ThreeEntity
