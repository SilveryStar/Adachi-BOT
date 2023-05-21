<script lang="ts" setup>
import InfoLine from "./info-line.vue";
import InfoCard from "./info-card.vue";
import MaterialsList from "./materials-list.vue"
import { computed } from "vue";
import { WeaponInfo } from "#/genshin/types";

const props = defineProps<{
	data: WeaponInfo;
}>();

const weekMap = [ "一", "二", "三", "四", "五", "六", "日" ];

const materialsTitle = computed( () => `材料消耗【周${ props.data.time.map( t => weekMap[t - 1] ).join( "/" ) }】` );

const materialsInfo = computed( () => ( {
	label: "",
	value: [
		...props.data.updateCost.ascensionMaterials, {
			name: "摩拉",
			rank: 1,
			count: props.data.updateCost.coins
		}
	],
	showTitle: false,
} ) );

const dataBlockInfo = computed( () => {
	const maxProp = Object.values( props.data.props ).slice( -1 )[0];
	return [
		{
			基础攻击力: maxProp.baseATK,
			[maxProp.extraProp?.name]: maxProp.extraProp?.value
		},
		{
			来源: props.data.fetter.access
		}
	]
} );
</script>

<template>
	<div class="weapon">
		<div class="info-top-base">
			<info-line title="基本属性" :data="dataBlockInfo"></info-line>
			<info-card class="skill-card">
				<h3 class="skill-title">{{ data.skill.name }}</h3>
				<div class="skill-content" v-html="data.skill?.content"></div>
			</info-card>
		</div>
		<info-card class="materials-card" :title="materialsTitle">
			<materials-list :data="materialsInfo"></materials-list>
		</info-card>
	</div>
</template>

<style lang="scss" scoped>
.weapon {
	display: flex;
	justify-content: space-between;
	padding-bottom: 30px;

	.info-top-base {
		.info-line {
			margin-bottom: 48px;
		}

		.info-line {
			&:last-child {
				margin-bottom: 0;
			}
		}

		.skill-card {
			::v-deep(.card-content) {
				padding: 20px;
				min-height: 250px;
			}

			.skill-title {
				margin-bottom: 10px;
				font-size: 24px;
				font-weight: 500;
				color: var(--light-color);
			}

			.skill-content {
				word-break: break-all;
				font-size: 18px;
				color: #666;
			}
		}
	}

	.materials-card {
		::v-deep(.card-content) {
			height: 100%;
		}

		::v-deep(.materials-list) {
			&:last-child {
				.list-data {
					&::after {
						display: none;
					}
				}
			}
		}
	}
}
</style>