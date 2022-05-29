const template = `<div class="info-base">
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
		<div class="avatar-box" :class="{ weapon: data.type !== '角色' }">
			<img :src="mainImage" alt="ERROR"/>
        	<p class="introduce">{{ introduce || '暂无介绍' }}</p>
		</div>
		<div class="main-content">
			<slot></slot>
		</div>
	</main>
	<footer class="author">Created by Adachi-BOT</footer>
</div>`;

import { infoDataParser } from "../../public/js/info-data-parser.js";

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
		
		const parsed = infoDataParser( data );
		
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
		
		return {
			...toRefs( data ),
			...parsed,
			elementIcon,
		}
	}
} );
