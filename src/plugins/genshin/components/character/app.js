const template = `
<div class="character-base">
	<img class="chara-image" :src="charImage" alt="ERROR">
	<div class="chara-name">
		<img :src="elementIconSrc" alt="ERROR">
		<h3>{{ data.name }}</h3>
		<span>lv{{ data.level }}</span>
		<span>好感度： {{ data.fetter }}</span>
	</div>
	<div class="artifact-list">
		<CharacterEquipment v-for="(a, aKey) of artifacts" :key="index" :src="a.icon" :rarity="a.rarity" :level="a.level" :emptyIcon="artifactsFontIcon[aKey]"></CharacterEquipment>
	</div>
	<InfoCard title="套装效果" class="suit-list">
		<template v-if="effectList.length">
			<div v-for="(e, eKey) of effectList" :key="eKey" class="suit-item">
			<CharacterEquipment :src="e.icon"></CharacterEquipment>
			<p class="suit-info">
				<span class="title">{{ e.name }}</span>
				<span class="suit-type">{{ e.num }}件套</span>
			</p>
		</div>
		</template>
		<p v-else>当前没有圣遗物套装效果</p>
	</InfoCard>
	<InfoCard :title="'命之座('+ data.activedConstellationNum +'/6)'" class="constellations-list">
		<div v-for="(c, cKey) of data.constellations" :key="cKey" class="constellations-item" :class="{ locked: cKey >= data.activedConstellationNum }">
			<img class="center" :src="c.icon" alt="ERROR">
			<i class="icon-lock center"></i>
		</div>
	</InfoCard>
	<InfoCard v-if="data.weapon" class="weapon-card">
		<div class="weapon-info-box">
			<CharacterEquipment :src="data.weapon.icon" emptyIcon="icon-weapon"></CharacterEquipment>
			<div class="weapon-info-content">
				<p class="weapon-info">
					<h3>{{ data.weapon.name }}</h3>
					<span class="weapon-level">Lv{{ data.weapon.level }}</span>
					<span class="weapon-affixLevel">精炼{{ data.weapon.affixLevel }}阶</span>
				</p>
				<div class="star-box">
					<img v-for="(s, sKey) of data.weapon.rarity" :key="sKey" src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/stars/Icon_1_Stars.png" alt="ERROR">
				</div>
			</div>
		</div>
		<p class="weapon-desc">{{ data.weapon.desc }}</p>
	</InfoCard>
	<p class="sign">Created by Adachi-BOT</p>
</div>
`

import { parseURL, request } from "../../public/js/src.js";
import CharacterEquipment from "./equipment.js"
import InfoCard from './infoCard.js'

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "CharacterApp",
	template,
	components: {
		CharacterEquipment,
		InfoCard
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/char?qq=${ urlParams.qq }` );
		
		console.log( data )
		
		function setStyle( colorList ) {
			document.documentElement.style.setProperty( "--baseInfoColor", colorList[0] );
			document.documentElement.style.setProperty( "--backgroundColor", colorList[1] );
		}
		
		const elementIconSrc = `https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/element/Element_${ data.element }.png`
		
		const charImage = computed( () => {
			return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/character/${ data.id }.png`;
		} );
		
		// 圣遗物默认图标
		const artifactsFontIcon = [ "icon-flower", "icon-plume", "icon-sands", "icon-goblet", "icon-circle" ]
		
		/* 整理圣遗物数组 */
		const artifacts = computed( () => {
			if ( data.artifacts.length >= 5 ) return data.artifacts
			const list = new Array( 5 )
			list.fill( {} )
			for ( const a of data.artifacts ) {
				list.splice( a.pos - 1, 1, a )
			}
			return list
		} )
		
		const effectList = computed( () => {
			return data.effects.map( effect => {
				const [ key, num ] = effect.name.split( ' ' )
				return { name: key, num, icon: effect.icon }
			} )
		} )
		
		switch ( data.element ) {
			case "Anemo":
				setStyle( [ "#1ddea7", "#f0f7f5" ] );
				break;
			case "Cryo":
				setStyle( [ "#1daade", "#f0f5f7" ] );
				break;
			case "Dendro":
				setStyle( [
					// 暂无
				] );
				break;
			case "Electro":
				setStyle( [ "#871dde", "#f4f0f7" ] );
				break;
			case "Geo":
				setStyle( [ "#de8d1d", "#f7f4f0" ] );
				break;
			case "Hydro":
				setStyle( [ "#1d8dde", "#f0f4f7" ] );
				break;
			case "Pyro":
				setStyle( [ "#de3a1d", "#f7f1f0" ] );
				break;
			case "None":
				setStyle( [ "#757575", "#f7f7f7" ] );
				break;
		}
		
		return {
			urlParams,
			data,
			charImage,
			effectList,
			elementIconSrc,
			artifactsFontIcon,
			artifacts
		}
	}
} );