const template = `<div class="info-base" :class="infoBackgroundClass">
	<img :class="type === '角色' ? 'character' : 'weapon'" :src="mainImage" alt="ERROR"/>
	<div class="base-content">
		<nav class="base-info-title">
        	<p class="title-and-name">「{{ title }}·{{ name }}」</p>
        	<p class="introduce">{{ introduce }}</p>
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
		
		const infoBackgroundClass = computed( () => {
			return `rarity_${ data.rarity }`;
		} );
		const mainImage = computed( () => {
			const link = data.type === "角色" ? `character/${ data.id }.png` : `weapon/${ data.name }.png`;
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/${ link }`;
		} );
		
		return {
			...toRefs( data ),
			infoBackgroundClass,
			mainImage
		}
	}
} );
