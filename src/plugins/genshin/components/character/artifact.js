const template =
`<div class="character-art">
	<div class="box" v-for="i in 5">
	    <EmptyBox v-if="artifactList[i] === 'empty'"
	        :pos="i"
	    ></EmptyBox>
        <ArtifactBox v-else
            :info="artifactList[i]"
        ></ArtifactBox>
    </div>
</div>`;

const EmptyBoxTemplate =
`<div class="empty-box">
    <img class="icon" :src="emptyIcon" alt="ERROR"/>
    <p class="content">暂未装备</p>
</div>`;

const ArtifactBoxTemplate =
`<div class="artifact-box">
    <img class="icon" :src="info.icon" alt="ERROR"/>
    <div class="content">
        <p class="name">{{ info.name }}</p>
        <p class="rarity">{{ stars }}</p>
        <p class="level">+{{ info.level }}</p>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";

const EmptyBox = Vue.defineComponent( {
	name: "EmptyBox",
	template: EmptyBoxTemplate,
	props: {
		pos: Number
	},
	setup( props ) {
		const emptyIcon = Vue.computed( () => {
			return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/artifact/other/${ props.pos }.png`;
		} );
		
		return {
			emptyIcon
		}
	}
} );

const ArtifactBox = Vue.defineComponent( {
	name: "ArtifactBox",
	template: ArtifactBoxTemplate,
	props: {
		info: Object
	},
	setup( props ) {
		const stars = Vue.computed( () => {
			const star = "★";
			return star.repeat( props.info.rarity );
		} );
		
		return {
			stars
		}
	}
} );

export default Vue.defineComponent( {
	name: "CharacterArtifact",
	template,
	components: {
		EmptyBox,
		ArtifactBox
	},
	props: {
		artifactList: Array
	}
} );