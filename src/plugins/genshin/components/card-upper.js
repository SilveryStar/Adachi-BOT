const template =
`<div class="card-upper">
    <img class="background" :src="backgroundImage" alt="ERROR"/>
    <img class="profile" :src="profileImage" alt="ERROR"/>
    <div class="base-info">
        <p class="nickname">{{ nickname }}</p>
        <p class="user-uid">UID: {{ uid }}</p>
    </div>
    <div v-if="level !== '0'" class="levels">
        <p class="adventure">{{ level }}级</p>
        <p class="world">世界等级{{ worldLevel }}</p>
    </div>
    <div class="detail">
        <div class="left">
            <p class="stats">{{ stats.active_day_number }}</p>
            <p class="stats">{{ stats.achievement_number }}</p>
            <p class="stats">{{ stats.avatar_number }}</p>
            <p class="stats">{{ stats.spiral_abyss }}</p>
        </div>
        <div class="middle">
            <p class="stats">{{ stats.common_chest_number }}</p>
            <p class="stats">{{ stats.exquisite_chest_number }}</p>
            <p class="stats">{{ stats.precious_chest_number }}</p>
            <p class="stats">{{ stats.luxurious_chest_number }}</p>
        </div>
        <div class="right">
            <p class="stats">{{ stats.anemoculus_number }}</p>
            <p class="stats">{{ stats.geoculus_number }}</p>
            <p class="stats">{{ stats.electroculus_number }}</p>
        </div>
    </div>
    <div class="exploration">
        <div class="mondstadt">
            <div class="exp">{{ percentage(1) }}</div>
            <div class="level">{{ expLevel(1) }}</div>
        </div>
        <div class="liyue">
            <div class="exp">{{ percentage(2) }}</div>
            <div class="level">{{ expLevel(2) }}</div>
        </div>
        <div class="dragonspine">
            <div class="exp">{{ percentage(0) }}</div>
            <div class="level">{{ expLevel(0) }}</div>
        </div>
    </div>
    <div class="homes">
        <p class="title-and-level">尘歌壶 Lv.{{ homesLevel }}</p>
        <div class="homes-list">
            <HomeBox :data="hole"></HomeBox>
            <HomeBox :data="mountain"></HomeBox>
            <HomeBox :data="island"></HomeBox>
        </div>
        <p class="comfort-num">仙力: {{ maxComfort }}</p>
    </div>
    <img class="package" :src="packageTop" alt="ERROR"/>
</div>`;

import Vue from  "../public/js/vue.js";
import HomeBox from "./home-box.js";

export default Vue.defineComponent( {
	name: "CardUpper",
	template,
	components: {
		HomeBox
	},
	props: {
		uid: String,
		profile: Number,
		level: String,
		nickname: String,
		exploration: Object,
		stats: Object,
		homes: Array
	},
	setup( props ) {
		const backgroundImage = Vue.computed( () => {
			return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/module/${ parseInt( props.level ) === 0 ? "info" : "card" }-new-upper.png`;
		} );
		const profileImage = Vue.computed( () => {
			return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/characters/profile/${ props.profile }.png`;
		} );
		const worldLevel = Vue.computed( () => {
			return Math.floor( ( props.level - 15 ) / 5 );
		} );
		const packageTop = Vue.computed( () => {
			return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/module/card-new-package.png";
		} );

		function percentage( id ) {
			return `${ props.exploration[id].exploration_percentage / 10 }%`;
		}
		function expLevel( id ) {
			return `Lv.${ props.exploration[id].level }`;
		}
		function homeData( name ) {
			let data = props.homes.find( el => el.name === name );
			return data ? data : { name, level: -1 };
		}
		
		let homesLevel = 0, maxComfort = 0;
		if ( props.homes.length !== 0 ) {
			homesLevel = props.homes[0].level;
			maxComfort = props.homes[0].comfort_num;
		}
		if ( !props.stats.electroculus_number ) {
			props.stats.electroculus_number = "--";
		}
		
		const hole = homeData( "罗浮洞" );
		const mountain = homeData( "翠黛峰" );
		const island = homeData( "清琼岛" );

		return {
			backgroundImage,
			profileImage,
			worldLevel,
			packageTop,
			percentage,
			expLevel,
			homesLevel,
			maxComfort,
			hole,
			mountain,
			island
		}
	}
} );