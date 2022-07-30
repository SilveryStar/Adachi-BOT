const template = `<section class="material">
	<div class="container">
		<div v-for="(m, mKey) of materialList" class="material-list">
			<div v-for="type of ['character', 'weapon']" :key="type" class="material-item" :class="type">
				<template v-if="m[type]">
					<div class="title">
						<common-title :data="getTitleInfo(m[type].ascension)" />
						<div class="title-icons">
							<img v-for="(a, aKey) of m[type].ascension" :key="aKey" :src="getIcon(a)" alt="ERROR">
						</div>
					</div>
					<div class="br"></div>
					<div class="thumb-list">
						<div v-for="(t, tKey) of m[type].list" :key="tKey" class="thumb-box" :style="getThumbBg(t.rarity)">
							<img :src="getThumb(type, t.name)" alt="ERROR">
							<p>{{ t.name }}</p>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</section>
`

import CommonTitle from "./common-title.js";

const { defineComponent, computed } = Vue;

function parse( obj ) {
	const result = [];
	Object.keys( obj ).forEach( k => {
		const dataList = obj[k];
		const material = JSON.parse( k );
		dataList.sort( ( x, y ) => y.rarity - x.rarity );
		result.push( { ascension: material, list: dataList } );
	} );
	return result;
}

export default defineComponent( {
	name: "DailyMaterial",
	template,
	components: {
		CommonTitle
	},
	props: {
		data: {
			type: Object,
			default: () => ( {} )
		}
	},
	setup( props ) {
		const weapon = parse( props.data.weapon );
		const character = parse( props.data.character );
		
		/* 组合素材数据为方便渲染的格式 */
		const materialList = computed( () => {
			const length = Math.max( weapon.length, character.length );
			const list = [];
			for ( let i = 0; i < length; i++ ) {
				const data = {};
				character[i] && ( data.character = character[i] );
				weapon[i] && ( data.weapon = weapon[i] );
				list.push( data );
			}
			return list;
		} )
		
		/* 获取标题材料icon */
		const getIcon = name => `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/image/${ name }.png`;
		/* 获取头像 */
		const getThumb = ( type, name ) => `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/thumb/${ type }/${ name }.png`;
		
		/* 获取背景图 */
		const getThumbBg = rarity => {
			return {
				background: `url('../../public/images/rarity/${ rarity }-Star.png')`, "background-size": "100% 100%"
			}
		}
		
		const getTitleInfo = ( list ) => {
			const de = list[0].split( "的" );
			const zhi = list[0].split( "之" );
			return {
				icon: getIcon( list[list.length - 1] ),
				title: de.length === 1 ? zhi[0] : de[0]
			};
		}
		
		return {
			materialList,
			getIcon,
			getThumb,
			getThumbBg,
			getTitleInfo
		}
	}
} )