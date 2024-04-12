import { World } from "three-ecs";

import { ThreeEntityElement } from "../three-entity/index.js";

import styles from "./styles.css" with { type: "css" };


export default class ThreeWorldElement extends ThreeEntityElement {
	// INTERFACE
	// ---------------------------------
	// PUBLIC METHODS
	// ~~ lifecycle jazz ~~
	constructor(){
		super();

		this.init = this.init.bind(this);

		// give element a shadow root for the <canvas> to live in
		const shadow = this.attachShadow({ mode: "open" });

		// apply styles that will only affect this element
		shadow.adoptedStyleSheets = [ styles ];
	}// constructor
	init(){
		// create the THREE.js entity for this element
		const world = window.WORLD = new World();

		return world;
	}// init

	connectedCallback(){
		super.connectedCallback();

		// build the element DOM
		this.shadowRoot.appendChild(this.entity.canvas);

		this.entity.connected();
		this.entity.play();
	}// connectedCallback
}// ThreeWorldElement
