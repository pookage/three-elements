import { World } from "three-ecs";

import { ThreeEntity } from "../three-entity/index.js";

import styles from "./styles.css" assert { type: "css" };


export default class ThreeWorld extends ThreeEntity {
	// INTERFACE
	// ---------------------------------
	// PUBLIC METHODS
	// ~~ lifecycle jazz ~~
	init(){
		// give element a shadow root for the <canvas> to live in
		const shadow = this.attachShadow({ mode: "open" });

		// create the THREE.js entity for this element
		const world = window.WORLD = new World();
		
		// apply styles that will only affect this element
		shadow.adoptedStyleSheets = [ styles ];

		// build the element DOM
		shadow.appendChild(world.canvas);

		return world;
	}// init

	connectedCallback(){
		super.connectedCallback();
		this.entity.connected();
		this.entity.play();
	}// connectedCallback
}// ThreeWorld
