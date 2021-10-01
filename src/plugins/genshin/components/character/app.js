const template =
`<div class="character">
    <CharacterBase
        :uid="data.uid"
        :name="data.name"
        :element="data.element"
        :level="data.level"
        :fetter="data.fetter"
        :constellation="data.activedConstellationNum"
        :id="data.id"
    ></CharacterBase>
    <CharacterArtifact
        :artifactList="artifacts"
    ></CharacterArtifact>
    <CharacterWeapon
        :weapon="data.weapon"
    ></CharacterWeapon>
</div>`;

import Vue from "../../public/js/vue.js";
import { parseURL, request } from "../../public/js/src.js";
import CharacterBase from "./base.js";
import CharacterArtifact from "./artifact.js";
import CharacterWeapon from "./weapon.js";

export default Vue.defineComponent( {
	name: "CharacterApp",
	template,
	components: {
		CharacterBase,
		CharacterArtifact,
		CharacterWeapon
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/character?qq=${ urlParams.qq }&name=${ urlParams.name }` );

		function setStyle( colorList ) {
			document.documentElement.style.setProperty("--baseInfoColor",    colorList[0]);
			document.documentElement.style.setProperty("--contentColor",     colorList[1]);
			document.documentElement.style.setProperty("--backgroundColor",  colorList[2]);
			document.documentElement.style.setProperty("--elementColor",     colorList[3]);
			document.documentElement.style.setProperty("--titleColor",       colorList[4]);
			document.documentElement.style.setProperty("--splitLineColor",   colorList[5]);
		}

		switch ( data.element ) {
			case "Anemo":   setStyle([
				"rgb( 28,  91,  72)", "rgb( 44, 128, 100)",
				"rgb( 44, 128, 100)", "rgb( 44, 128, 100)",
				"rgb( 45, 148, 116)", "rgb( 59, 167, 132)"
			]); break;
			case "Cryo":    setStyle([
				"rgb( 50, 105, 133)", "rgb(  5, 162, 195)",
				"rgb( 16, 168, 212)", "rgb(  5, 162, 195)",
				"rgb(  6, 188, 240)", "rgb(  5, 165, 199)"
			]); break;
			case "Dendro":  setStyle([
				// 暂无
			]); break;
			case "Electro": setStyle([
				"rgb( 46,  34,  84)", "rgb( 81,  56, 151)",
				"rgb( 83,  66, 146)", "rgb( 81,  56, 151)",
				"rgb(117,  93, 195)", "rgb( 80,  55, 161)"
			]); break;
			case "Geo":     setStyle([
				"rgb( 92,  76,  21)", "rgb(176, 141,  46)",
				"rgb(201, 144,  20)", "rgb(176, 141,  46)",
				"rgb(206, 171,  66)", "rgb(210, 155,  21)"
			]); break;
			case "Hydro":   setStyle([
				"rgb( 23,  64,  91)", "rgb( 43, 127, 175)",
				"rgb( 37, 106, 153)", "rgb( 43, 127, 175)",
				"rgb( 77, 162, 211)", "rgb( 42, 123, 174)"
			]); break;
			case "Pyro":    setStyle([
				"rgb(119,  31,  19)", "rgb(176,  45,  28)",
				"rgb(189,  46,  29)", "rgb(176,  45,  28)",
				"rgb(218,  52,  34)", "rgb(191,  61,  27)"
			]); break;
			case "None":    setStyle([
				"rgb( 72,  72,  72)", "rgb(111, 117, 113)",
				"rgb(111, 111, 111)", "rgb(111, 117, 113)",
				"rgb(136, 136, 136)", "rgb(123, 123, 123)"
			]); break;
		}

		let artifacts = [];
		for ( let i = 1; i <= 5; i++ ) {
			const info = data.artifacts.find( el => el.pos === i );
			artifacts[i] = info ? info : "empty";
		}

		return {
			urlParams,
			data,
			artifacts
		}
	}
} );