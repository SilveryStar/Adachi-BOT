const template = `<div class="info-base" :class="backgroundClass">
	<header class="info-title">
		<div v-if="elementIcon" class="element-box">
			<img :src="elementIcon" alt="ERROR">
		</div>
    	<p class="title-and-name">
    		「<span v-show="title">{{ title }}·</span>{{ name }}」
    	</p>
    	<img :src="rarityIcon" alt="ERROR" class="rarity-icon">
	</header>
	<main>
		<div class="avatar-box">
			<img :src="mainImage" alt="ERROR"/>
        	<p class="introduce">{{ introduce || '暂无介绍' }}</p>
		</div>
		<div class="main-content">
			<slot></slot>
		</div>
	</main>
	<footer class="author">Created by Adachi-BOT</footer>
</div>`;

const { defineComponent, computed, toRefs } = Vue;

export default defineComponent( {
	name: "InfoApp",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {
				rarity: null,
				name: "",
				id: null,
				type: "",
				title: "",
				introduce: ""
			} )
		}
	},
	setup( props ) {
		const data = props.data;
		
		const elementFormat = {
			"风元素": "Anemo",
			"冰元素": "Cryo",
			"草元素": "Dendro",
			"雷元素": "Electro",
			"岩元素": "Geo",
			"水元素": "Hydro",
			"火元素": "Pyro"
		};
		
		/* 元素 icon */
		const elementIcon = computed( () => {
			return data.element ? `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/element/Element_${ elementFormat[data.element] }.png` : "";
		} )
		
		/* 星级 icon */
		const rarityIcon = computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/icon/BaseStar${ data.rarity }.png`
		} )
		
		const backgroundClass = computed( () => {
			return `rarity_${ data.rarity }`;
		} );

		const mainImage = computed( () => {
			const baseURL = "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/";
			switch ( data.type ) {
				case "角色":
					return baseURL + `character/${ data.id }.png`;
				case "武器":
					return baseURL + `weapon/${ data.name }.png`;
			}
		} );
		
		return {
			...toRefs( data ),
			elementIcon,
			rarityIcon,
			backgroundClass,
			mainImage
		}
	}
} );
