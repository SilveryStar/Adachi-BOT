<script lang="ts" setup>
import InfoLine from "./info-line.vue";
import InfoCard from "./info-card.vue";
import MaterialsList from "./materials-list.vue"
import { computed } from "vue";
import { CharacterInfo, InfoMaterial } from "#/genshin/types";

const props = defineProps<{
	data: CharacterInfo;
}>();

const numCN = [ "壹", "贰", "肆", "陆" ];

const weekMap = [ "一", "二", "三", "四", "五", "六", "日" ];

const materialsTitle = computed( () => `材料消耗【周${ props.data.time.map( t => weekMap[t - 1] ).join( "/" ) }】` );

const baseInfo = computed( () => [
	{
		生日: `${ props.data.birthday[0] }月${ props.data.birthday[1] }日`,
		神之眼: props.data.element.label
	},
	{
		声优: `${ props.data.cv.CHS } | ${ props.data.cv.JP }`
	},
	{
		命之座: props.data.fetter.constellation
	}
] );

const dataBlockInfo = computed( () => {
	const maxProp = Object.values( props.data.props ).slice( -1 )[0];
	return [
		{
			生命: maxProp.baseHP,
			防御: maxProp.baseDEF
		},
		{
			攻击: maxProp.baseATK,
			[maxProp.extraProp?.name]: maxProp.extraProp?.value
		}
	]
} );

const materialsInfo = computed( () => {
	const tempObj: Record<string, InfoMaterial> = {};
	for ( const material of [ ...props.data.updateCost.ascensionMaterials, ...props.data.updateCost.talentMaterials ] ) {
		if ( tempObj[material.name] ) {
			tempObj[material.name].count += material.count;
		} else {
			tempObj[material.name] = material;
		}
	}
	tempObj["摩拉"] = {
		name: "摩拉",
		rank: 1,
		count: props.data.updateCost.coins
	}
	return [ {
		label: "",
		value: Object.values( tempObj ),
		showTitle: true
	} ]
} );
</script>

<template>
	<div class="character-normal">
		<div class="info-top">
			<div class="info-top-base">
				<info-line title="基本信息" :data="baseInfo"></info-line>
				<info-line title="基本属性" :data="dataBlockInfo"></info-line>
			</div>
			<info-card class="materials-card" :title="materialsTitle">
				<materials-list v-for="(d, dKey) of materialsInfo" :key="dKey" :data="d"></materials-list>
			</info-card>
		</div>
		<div class="info-bottom">
			<info-card class="talents-card" title="天赋信息" direction="row">
				<p class="talents-item" v-for="(t, tKey) of data.talents" :key="tKey">{{ t.desc }}</p>
			</info-card>
			<info-card class="constellations-card" title="命座信息" direction="row">
				<div class="constellations-item" v-for="i in 4" :key="i">
					<p class="level">{{ numCN[i - 1] }}</p>
					<p class="content">{{ data.constellations[i - 1].desc }}</p>
				</div>
			</info-card>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.character-normal {
	.info-top {
		display: flex;
		justify-content: space-between;

		.info-top-base {
			.info-line {
				margin-bottom: 48px;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}

		.materials-card {
			.materials-list {
				&:last-child {
					::v-deep(.list-data) {
						&::after {
							display: none;
						}
					}
				}
			}
		}
	}

	.info-bottom {
		display: flex;
		margin-top: 54px;

		.info-card {
			flex: 1;
			margin-right: 54px;

			&:last-child {
				margin-right: 0;
			}

			:deep(.card-content) {
				display: flex;
				flex-direction: column;
				justify-content: space-around;
			}
		}

		.talents-card {
			.talents-item {
				padding: 10px 20px;
				font-size: 16px;
				line-height: 19px;
				color: #666;
			}
		}

		.constellations-card {
			.constellations-item {
				position: relative;
				padding: 10px 20px 10px 50px;

				.level {
					position: absolute;
					top: 6px;
					left: 10px;
					font-size: 38px;
					color: #666;
				}

				.content {
					position: relative;
					padding-left: 5px;
					min-height: 48px;
					vertical-align: middle;
					font-size: 16px;
					color: #666;
					line-height: 19px;
				}
			}
		}
	}
}

@font-face {
	font-family: HuaWen;
	src: url("../../assets/fonts/HWXingKai.ttf");
}
</style>