import Box from "three-ecs/primitives/box/index.js";
import ThreeEntity from "./../three-entity/element.js";

export default class ThreeBox extends ThreeEntity {
	init(){
		return new Box();
	}// inint
}// ThreeBox
