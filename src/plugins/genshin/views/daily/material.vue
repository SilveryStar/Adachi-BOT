<script lang="ts" setup>
import { DailyRouter, DailyMaterialInfo } from "#/genshin/types/daily";
import { computed } from "vue";
import CommonTitle from "./common-title.vue";

interface ParseMaterial {
	material: {
		name: string;
		rank: number;
	},
	units: DailyMaterialInfo["units"]
}

const props = defineProps<{
	data: DailyRouter;
}>();

const weapon: ParseMaterial[] = parse( props.data.weapon );
const character: ParseMaterial[] = parse( props.data.character );

function parse( materialList: Record<string, DailyMaterialInfo> ) {
	return Object.entries( materialList ).map( ( [ material, materialDetail ] ) => {
		const units: DailyMaterialInfo["units"] = [ ...materialDetail.units ];
		return {
			material: {
				name: material,
				rank: materialDetail.rank
			},
			units: units.sort( ( prev, cur ) => cur.rarity - prev.rarity )
		}
	} );
}

/* 组合素材数据为方便渲染的格式 */
const materialList = computed( () => {
	const length = Math.max( weapon.length, character.length );
	return Array.from( { length }, ( _, index ) => {
		const data: Partial<Record<"character" | "weapon", ParseMaterial>> = {};
		character[index] && ( data.character = character[index] );
		weapon[index] && ( data.weapon = weapon[index] );
		return data;
	} );
} )

/* 获取标题材料icon */
const getIcon = ( name: string ) => `/assets/genshin/resource/material/${ name }.png`;
/* 获取头像 */
const getThumb = ( type: string, name: string ) => {
	const baseUrl = "/assets/genshin";
	if ( type === "character" ) return `${ baseUrl }/character/${ name }/image/face.png`;
	return `${ baseUrl }/weapon/${ name }/image/thumb.png`;
}

/* 获取背景图 */
const getThumbBg = ( rarity: number ) => {
	return {
		backgroundImage: `url('/assets/genshin/resource/rarity/bg/Background_Item_${ rarity }_Star.png')`,
		backgroundSize: "cover"
	}
}

const getTitleInfo = ( { name, rank }: ParseMaterial["material"] ) => {
	const de = name.split( "的" );
	const zhi = name.split( "之" );
	return {
		icon: {
			url: getIcon( name ),
			rank: rank,
		},
		title: de.length === 1 ? zhi[0] : de[0]
	};
}
</script>

<template>
	<section class="material">
		<div class="container">
			<div v-for="(m, mKey) of materialList" class="material-list" :key="mKey">
				<div v-for="type of ['character', 'weapon']" :key="type" class="material-item" :class="type">
					<template v-if="m[type]">
						<div class="title">
							<common-title :data="getTitleInfo(m[type].material)"/>
							<!--							<div class="title-icons">-->
							<!--								<img v-for="(a, aKey) of m[type].material" :key="aKey" :src="getIcon(a)" alt="ERROR">-->
							<!--							</div>-->
						</div>
						<div class="br"></div>
						<div class="thumb-list">
							<div v-for="(t, tKey) of m[type].units" :key="tKey" class="thumb-box"
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