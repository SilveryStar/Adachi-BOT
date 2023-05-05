<template>
	<section class="material">
		<div class="container">
			<div v-for="(m, mKey) of materialList" class="material-list">
				<div v-for="type of ['character', 'weapon']" :key="type" class="material-item" :class="type">
					<template v-if="m[type]">
						<div class="title">
							<common-title :data="getTitleInfo(m[type].ascension)"/>
							<div class="title-icons">
								<img v-for="(a, aKey) of m[type].ascension" :key="aKey" :src="getIcon(a)" alt="ERROR">
							</div>
						</div>
						<div class="br"></div>
						<div class="thumb-list">
							<div v-for="(t, tKey) of m[type].list" :key="tKey" class="thumb-box"
							     :style="getThumbBg(t.rarity)">
								<img :src="getThumb(type, t.name)" alt="ERROR">
								<p>{{ t.name }}</p>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import CommonTitle from "./common-title.vue";

const props = withDefaults(defineProps<{
	data: Record<string, any>;
}>(), {
	data: () => ( {} )
});

const weapon = parse( props.data.weapon );
const character = parse( props.data.character );

/* 组合素材数据为方便渲染的格式 */
const materialList = computed( () => {
	const length = Math.max( weapon.length, character.length );
	const list: any[] = [];
	for ( let i = 0; i < length; i++ ) {
		const data: Record<string, any> = {};
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

function parse( obj ) {
	const result: { ascension: any[], list: any[] }[] = [];
	Object.keys( obj ).forEach( k => {
		const dataList = obj[k];
		const material = JSON.parse( k );
		dataList.sort( ( x, y ) => y.rarity - x.rarity );
		result.push( { ascension: material, list: dataList } );
	} );
	return result;
}
</script>

<style lang="scss" scoped>
.material {
	display: flex;
	padding: 0 12px;
	background-color: var(--primary-base);

	.container {
		display: flex;
		flex-direction: column;
		gap: 22px;
		flex: 1;
		padding: 35px 28px 59px;
		border: 4px solid var(--primary-dark);
		border-top: none;
		border-bottom: none;
	}

	.material-list {
		display: flex;
		justify-content: space-between;

		.material-item {
			display: flex;
			flex-direction: column;
			gap: 8px;

			&.character {
				width: 440px;
			}

			&.weapon {
				width: 620px;
			}

			.title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				height: 46px;

				.title-icons {
					display: flex;
					align-items: center;
					gap: 6px;
					margin-top: 8px;

					> img {
						width: 32px;
						height: 32px;
						border: 1px solid #fff;
						filter: drop-shadow(0 2px 2px var(--shadow-base));
						border-radius: 4px;
						box-sizing: border-box;
					}
				}
			}

			.br {
				height: 2px;
				background-color: #fff;
				box-shadow: 0 2px 2px var(--shadow-base);
			}

			.thumb-list {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				gap: 10px;
				min-height: 80px;

				.thumb-box {
					position: relative;
					width: 80px;
					height: 80px;
					filter: drop-shadow(1px 4px 6px rgba(0, 0, 0, 0.2));
					border-radius: 4px;
					overflow: hidden;

					> img {
						width: inherit;
						height: inherit;
					}

					> p {
						position: absolute;
						left: 0;
						right: 0;
						bottom: 0;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 16px;
						background-color: rgba(0, 0, 0, 0.5);
						font-size: 12px;
						color: #fff;
						text-align: center;
					}
				}
			}
		}
	}
}
</style>