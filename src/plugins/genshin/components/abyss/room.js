const template =
`<div class="room">
	<div class="split-line"></div>
	<p class="unlocked" v-if="roomData === undefined">
		该间暂无挑战记录
	</p>
	<div class="battle" v-else>
		<span class="room-name">第{{ roomData.index }}间</span>
		<span class="time">{{ stamp2date }}</span>
		<div class="long" v-if="floor >= 5">
			<CharacterList v-for="b in roomData.battles" :chars="b.avatars" type="level"/>
			<span class="up">上间</span>
			<span class="down">下间</span>
		</div>
		<div class="short" v-else>
			<CharacterList :chars="roomData.battles[0].avatars" type="level"/>
		</div>
		<div class="star">
			<img class="star-img" src="../../public/images/abyss/star.png" alt="ERROR"/>
			<span class="star-num">{{ roomData.star }}/{{ roomData.maxStar }}</span>
		</div>
	</div>
</div>`;

import Vue from "../../public/js/vue.js";
import CharacterList from "./character-list.js";

export default Vue.defineComponent( {
	name: "AbyssRoom",
	template,
	components: {
		CharacterList
	},
	props: {
		roomData: Object,
		floor: Number
	},
	setup( props ) {
		const stamp2date = Vue.computed( () => {
			const date = new Date( parseInt( props.roomData.battles[0].timestamp ) * 1000 );
			return  date.toLocaleDateString().replace( /\//g, "-" ) + " " + date.toTimeString().split( " " )[0];
		} );
		
		return {
			stamp2date
		}
	}
} );