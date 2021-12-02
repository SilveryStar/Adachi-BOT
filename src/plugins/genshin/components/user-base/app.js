const template =
`<div class="user-base-page">
	<img class="background" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/user-base.png" alt="ERROR"/>
	<div class="left">
		<div class="top">
			<p class="uid">UID {{ data.uid }}</p>
			<img class="name-card" :src="nameCard" alt="ERROR"/>
			<div class="profile">
				<img class="character" :src="character" alt="ERROR"/>
			</div>
		</div>
		<div class="middle">
			<div class="_left">
				<div class="data-name">
					<p>活跃天数</p>
					<p>成就达成</p>
					<p>普通宝箱</p>
					<p>珍贵宝箱</p>
					<p>奇馈宝箱</p>
					<p>岩神瞳数</p>
				</div>
				<div class="data-value">
					<p>{{ stats.activeDayNumber }}</p>
		            <p>{{ stats.achievementNumber }}</p>
		            <p>{{ stats.commonChestNumber }}</p>
					<p>{{ stats.preciousChestNumber }}</p>
					<p>{{ stats.magicChestNumber }}</p>
		            <p>{{ stats.geoculusNumber }}</p>
				</div>
			</div>
			<div class="_right">
				<div class="data-name">
					<p>获得角色</p>
					<p>深境螺旋</p>
					<p>精致宝箱</p>
					<p>华丽宝箱</p>
					<p>风神瞳数</p>
					<p>雷神瞳数</p>
				</div>
				<div class="data-value">
					<p>{{ stats.avatarNumber }}</p>
					<p>{{ stats.spiralAbyss }}</p>
		            <p>{{ stats.exquisiteChestNumber }}</p>
		            <p>{{ stats.luxuriousChestNumber }}</p>
		            <p>{{ stats.anemoculusNumber }}</p>
		            <p>{{ stats.electroculusNumber }}</p>
				</div>
			</div>
		</div>
		<SectionTitle class="bottom-split" title="尘歌洞天"/>
		<div class="bottom">
			<HomeBox :data="homes.hole"/>
			<HomeBox :data="homes.mountain"/>
			<HomeBox :data="homes.island"/>
			<HomeBox :data="homes.hall"/>
		</div>
		
	</div>
	<div class="right">
		<div class="world">
			<SectionTitle title="世界探索"/>
			<div class="explorations">
				<Exploration v-for="e in explorations" :data="e"/>
			</div>
		</div>
		<div class="character">
			<SectionTitle title="角色展柜"/>
			<div class="box">
				<CharacterBox v-for="a in data.avatars" :data="a"/>
			</div>
		</div>
	</div>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import SectionTitle from "./section-title.js";
import Exploration from "./exploration.js";
import CharacterBox from "./character-box.js";
import HomeBox from "../card/home-box.js";
const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "WishApp",
	template,
	components: {
		SectionTitle,
		Exploration,
		CharacterBox,
		HomeBox
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/card?qq=${ urlParams.qq }` );
		
		data.avatars = data.avatars.slice( 0, 8 )
		const charNum = data.avatars.length;
		const target = data.avatars[ Math.floor( Math.random() * charNum ) ];
		
		const nameCard = computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/namecard/${ target.id }.png`;
		} );
		const character = computed( () => {
			return `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/character/${ target.name }.png`;
		} );
		
		function findArea( id ) {
			return data.explorations.find( el => el.id === id );
		}
		const level = l => "Lv." + l;
		const percentage = p => p / 10 + "%";
		const explorations = [ {
			name: "mondstadt",
			prop: {
				"探索": percentage( findArea( 1 ).explorationPercentage ),
				"声望": level( findArea( 1 ).level )
			}
		}, {
			name: "liyue",
			prop: {
				"探索": percentage( findArea( 2 ).explorationPercentage ),
				"声望": level( findArea( 2 ).level )
			}
		}, {
			name: "inazuma",
			prop: {
				"探索": percentage( findArea( 4 ).explorationPercentage ),
				"声望": level( findArea( 4 ).level ),
				"神樱": level( findArea( 4 ).offerings.find( el => el.name === "神樱眷顾" ).level )
			}
		}, {
			name: "dragonspine",
			prop: {
				"探索": percentage( findArea( 3 ).explorationPercentage ),
				"供奉": level( findArea( 3 ).offerings.find( el => el.name === "忍冬之树" ).level )
			}
		} ];
		
		function homeData( name ) {
			const d = data.homes.find( el => el.name === name );
			return d ? d : { name, level: -1 };
		}
		const homes = {
			hole: homeData( "罗浮洞" ),
			mountain: homeData( "翠黛峰" ),
			island: homeData( "清琼岛" ),
			hall: homeData( "绘绮庭" )
		};
		
		console.log( data );
		return {
			data, nameCard,
			character,
			explorations,
			stats: data.stats,
			homes
		}
	}
} );