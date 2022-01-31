const template = `<div class="character-box">
	<div class="avatar-box" :style="{'background-image': getRarityBg(char.rarity)}">
		<img class="profile" :src="char.icon" alt="ERROR" />
	</div>
	<p class="detail">
		<span class="level">{{ getStr(char) }}</span>
	</p>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "CharacterBox",
	template,
	props: {
		char: Object,
		type: String
	},
	setup( props ) {
		/* 针对埃洛伊处理 */
		function getRarityBg( rarity ) {
			rarity = rarity === 105 ? "5a" : rarity;
			return `url(https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/rarity_bg/Background_Item_${ rarity }_Star.png)`;
		}
		
		const getStr = ( char ) => {
			return props.type === "level" ? "Lv." + char.level : char.value + "次";
		};
		
		return {
			getStr,
			getRarityBg
		}
	}
} );
