const template = `
<div class="character-box">
	<div class="avatar-box" :style="{'background-image': getRarityBg(char.rarity)}">
		<img
			class="element"
			v-if="char.element !== 'None'"
			:src="getElementIcon(char.element)"
			alt="ERROR"
		/>
		<span v-if="char.activedConstellationNum" class="constellation">{{ char.activedConstellationNum }}</span>
		<div v-if="char.name !== '旅行者'" class="fetter-box">
			<img src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Item_Companionship_EXP.png" alt="ERROR" />
			<span>{{ char.fetter }}</span>
			<span>{{ char.fetter }}</span>
		</div>
		<img class="rarity" :src="getRarity(char.rarity)" alt="ERROR" />
		<img class="profile" :src="char.icon" alt="ERROR" />
	</div>
	<p class="detail">
		<span class="name">{{ char.name }}</span>
		<span class="level">Lv.{{ char.level }}</span>
	</p>
	<div class="info planA-style" v-if="type === 'weaponA'">
		<CharacterWeapon
			class="chara-weapon-box"
			:weapon="char.weapon"
			:get-rarity-bg="getRarityBg"
		/>
	</div>
	<div class="info planB-style" v-else-if="type === 'weaponB'">
		<p>
			<span class="weapon">武器: {{ char.weapon.name }}</span>
			<span class="level">Lv.{{ char.weapon.level }}</span>
		</p>
	</div>
</div>`;

import CharacterWeapon from "./character-weapon.js";

const { defineComponent } = Vue;

export default defineComponent( {
	name: "CharacterBox",
	template,
	props: {
		char: Object,
		type: {
			type: String,
			default: "normal"
		}
	},
	components: {
		CharacterWeapon
	},
	setup() {
		/* 针对埃洛伊处理 */
		function getRarity( rarity ) {
			rarity = rarity === 105 ? "5" : rarity;
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/stars/Icon_${ rarity }_Stars.png`;
		}
		
		function getRarityBg( rarity ) {
			rarity = rarity === 105 ? "5a" : rarity;
			return `url(https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/rarity_bg/Background_Item_${ rarity }_Star.png)`;
		}
		
		/* 获取属性图标 */
		function getElementIcon( element ) {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/element/Element_${ element }.png`;
		}
		
		return {
			getRarity,
			getRarityBg,
			getElementIcon
		};
	}
} );
