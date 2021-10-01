const template =
`<div class="home-box">
    <img class="home-background" :src="backgroundImage" alt="ERROR"/>
    <div class="unlock" v-if="data.level !== -1">
        <div class="box-block unlock-block"></div>
        <div class="box-block unlock-content-block">
            <p class="box-content name">{{ data.name }}</p>
            <p class="box-content level">洞天等级</p>
            <p class="box-content comfort">{{ data.comfortLevelName }}</p>
        </div>
    </div>
    <div class="locked" v-else>
        <div class="box-block locked-block"></div>
        <img class="lock-icon" :src="lockIcon" alt="ERROR"/>
    </div>
</div>`;

import Vue from "../../public/js/vue.js";

export default Vue.defineComponent( {
	name: "HomeBox",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const backgroundImage = Vue.computed( () => {
			return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/item/${ props.data.name }.png`;
		} );
		const lockIcon = Vue.computed( () => {
			return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/item/lock.png";
		} );
		
		return {
			backgroundImage,
			lockIcon
		}
	}
} );