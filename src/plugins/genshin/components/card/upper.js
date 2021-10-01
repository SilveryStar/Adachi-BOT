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
            <p class="stats">{{ stats.activeDayNumber }}</p>
            <p class="stats">{{ stats.achievementNumber }}</p>
            <p class="stats">{{ stats.avatarNumber }}</p>
            <p class="stats">{{ stats.spiralAbyss }}</p>
        </div>
        <div class="middle">
            <p class="stats">{{ stats.commonChestNumber }}</p>
            <p class="stats">{{ stats.exquisiteChestNumber }}</p>
            <p class="stats">{{ stats.preciousChestNumber }}</p>
            <p class="stats">{{ stats.luxuriousChestNumber }}</p>
        </div>
        <div class="right">
            <p class="stats">{{ stats.anemoculusNumber }}</p>
            <p class="stats">{{ stats.geoculusNumber }}</p>
            <p class="stats">{{ stats.electroculusNumber }}</p>
        </div>
    </div>
    <div class="exploration">
        <div class="mondstadt">
            <div class="exp">{{ percentage(1) }}</div>
            <div class="level">{{ expLevel(1) }}</div>
        </div>
        <div class="dragonspine">
            <div class="exp">{{ percentage(3) }}</div>
            <div class="level">{{ expLevel(3) }}</div>
        </div>
        <div class="liyue">
            <div class="exp">{{ percentage(2) }}</div>
            <div class="level">{{ expLevel(2) }}</div>
        </div>
        <div class="inazuma">
            <div class="exp">{{ percentage(4) }}</div>
            <div class="level">{{ expLevel(4) }}</div>
            <div class="sakura">{{ sakura() }}</div>
		</div>
    </div>
    <div class="homes">
        <p class="title-and-level">尘歌壶 Lv.{{ homesLevel }}</p>
        <div class="homes-list">
            <HomeBox :data="hole" />
            <HomeBox :data="mountain" />
            <HomeBox :data="island" />
        </div>
        <p class="comfort-num">仙力: {{ maxComfort }}</p>
    </div>
    <img class="package" :src="packageTop" alt="ERROR"/>
</div>`;

import Vue from "../../public/js/vue.js";
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
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/${ parseInt( props.level ) === 0 ? "uid" : "mys" }-upper.png`;
		} );
		const profileImage = Vue.computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/characters/profile/${ props.profile }.png`;
		} );
		const worldLevel = Vue.computed( () => {
			if ( props.level < 20 ) {
				return 0;
			}
			return Math.floor( ( props.level - 15 ) / 5 );
		} );
		const packageTop = Vue.computed( () => {
			return "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/card-package.png";
		} );

		function percentage( id ) {
			const data = props.exploration.find( el => el.id === id );
			return `${ data.explorationPercentage / 10 }%`;
		}
		function expLevel( id ) {
			const data = props.exploration.find( el => el.id === id );
			return `Lv.${ data.level }`;
		}
		function sakura() {
			const data = props.exploration.find( el => el.id === 4 );
			return `Lv.${ data.offerings.find( el => el.name === "神樱眷顾" ).level }`;
		}
		function homeData( name ) {
			let data = props.homes.find( el => el.name === name );
			return data ? data : { name, level: -1 };
		}
		
		let homesLevel = 0, maxComfort = 0;
		if ( props.homes.length !== 0 ) {
			homesLevel = props.homes[0].level;
			maxComfort = props.homes[0].comfortNum;
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
			sakura,
			homesLevel,
			maxComfort,
			hole,
			mountain,
			island
		}
	}
} );