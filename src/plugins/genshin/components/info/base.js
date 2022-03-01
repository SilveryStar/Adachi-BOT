const template = `<div class="info-base" :class="infoBackgroundClass">
	<img :class="infoType" :src="mainImage" alt="ERROR"/>
	<div class="base-content">
		<nav class="base-info-title">
        	<p class="title-and-name">
        		「<span v-show="infoType !== 'artifact'">{{ title }}·</span>{{ name }}」
        	</p>
        	<p class="introduce" v-html="introduce"></p>
		</nav>
		<main class="base-info-content">
			<slot></slot>
		</main>
		<footer class="author">Created by Adachi-BOT</footer>
    </div>
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
		
		if ( data.type === "圣遗物" ) {
			data.introduce =
				'<span class="access-info title">获取途径:</span>' +
				`<span class="access-info content">${ data.access }</span>`;
		}
		
		const infoBackgroundClass = computed( () => {
			return `rarity_${ data.rarity }`;
		} );
		const infoType = computed( () => {
			switch ( data.type ) {
				case "角色": return "character";
				case "武器": return "weapon";
				case "圣遗物": return "artifact";
			}
		} );
		const mainImage = computed( () => {
			const baseURL = "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/";
			switch ( data.type ) {
				case "角色": return baseURL + `character/${ data.id }.png`;
				case "武器": return baseURL + `weapon/${ data.name }.png`;
				case "圣遗物": return baseURL + `artifact/${ data.id }/${ data.icon }.png`;
			}
		} );
		
		return {
			...toRefs( data ),
			infoBackgroundClass,
			mainImage,
			infoType
		}
	}
} );
