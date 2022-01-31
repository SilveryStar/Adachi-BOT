const template = `<Base :data="data">
	<AbyssOverview v-if="data.floor === '0'" :data="data"/>
	<AbyssFloor v-else :data="data"/>
</Base>`;

import { parseURL, request } from "../../public/js/src.js";
import Base from "./base.js";
import AbyssFloor from "./floor.js";
import AbyssOverview from "./overview.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "AbyssApp",
	template,
	components: {
		AbyssFloor,
		AbyssOverview,
		Base
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/abyss?qq=${ urlParams.qq }&floor=${ urlParams.floor }` );
		return { data }
	}
} );
