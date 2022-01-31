const template = `<div class="room-base">
	<SectionTitle showSubTitle>
		<template #default>第{{ ["一", "二", "三"][roomData.index - 1] }}间</template>
		<template #sub>
			<img v-for="item of roomData.maxStar" :key="item" :class="{'star-crush': item > roomData.star}" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/star.png" alt="ERROR" />
		</template>
	</SectionTitle>
	<span class="time">{{ stamp2date }}</span>
	<div class="room-info">
		<div v-for="(harf, harfIndex) of roomData.battles" ::key="harfIndex" class="room-info-half">
			<h3>{{["上半", "下半"][harfIndex]}}</h3>
			<div class="character-list">
				<template v-for="(char, index) in harf.avatars" :key="index">
					<CharacterItem class="character-item" :char="char" type="level"/>
					<img src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/abyss/diamond.png" alt="ERROR"/>
				</template>
			</div>
		</div>
	</div>
</div>`;

import SectionTitle from "./section-title.js";
import CharacterItem from "./character-item.js";

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "AbyssRoom",
	template,
	components: {
		SectionTitle,
		CharacterItem
	},
	props: {
		roomData: Object
	},
	setup( props ) {
		const stamp2date = computed( () => {
			const date = new Date( parseInt( props.roomData.battles[0].timestamp ) * 1000 );
			return date.toLocaleDateString().replace( /\//g, "-" ) + " " + date.toTimeString().split( " " )[0];
		} );
		
		return {
			stamp2date
		}
	}
} );
