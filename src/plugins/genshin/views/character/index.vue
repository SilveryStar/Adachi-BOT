<script lang="ts" setup>
import { onMounted, computed, ref } from "vue";
import $https from "#/genshin/front-utils/api";
import CharacterEquipment from "./equipment.vue";
import InfoCard from "./info-card.vue";
import ScoreChart from "./score-chart.vue";
import { urlParamsGet } from "@/utils/common";
import { CharacterRouter } from "#/genshin/types";

const urlParams = urlParamsGet( location.href );
const data = ref<CharacterRouter | null>( null );

const getData = async () => {
	const res = await $https.CHAR.get( { qq: urlParams.qq } )
	setCommonStyle( res.element );
	data.value = res;
}

onMounted( () => {
	getData();
} );

/* 是否显示评分 */
const showScore = computed( () => {
	return urlParams.showScore === "true";
} )

/* echart图表颜色 */
const chartColor = ref<{ graphic: string, text: string } | null>( null );

function setStyle( colorList ) {
	document.documentElement.style.setProperty( "--baseInfoColor", colorList[0] );
	chartColor.value = {
		graphic: colorList[0],
		text: colorList[1]
	};
	document.documentElement.style.setProperty( "--hue-rotate", colorList[2] )
}

const elementIconSrc = computed( () => {
	if ( !data.value ) return "";
	return `/assets/genshin/resource/element/${ data.value!.element.toLowerCase() }.png`;
} );
const portrait = computed( () => {
	if ( !data.value ) return "";
	return `/assets/genshin/character/${ data.value!.name }/image/gacha_splash.png`;
} );

/* 武器描述处理 */
const weaponDesc = computed( () => {
	const desc = data.value?.weapon?.desc;
	if ( !desc ) return "";
	return desc.replace( /[\\r\\n]/g, "" );
} )

// 圣遗物默认图标
const artifactsFontIcon = [ "icon-flower", "icon-plume", "icon-sands", "icon-goblet", "icon-circle" ]

/* 整理圣遗物数组 */
const artifacts = computed( () => {
	const d = data.value;
	if ( !d ) return [];
	if ( d.artifacts.length >= 5 ) return d.artifacts
	const list = Array.from( { length: 5 }, () => ( {} ) );
	for ( const a of d.artifacts ) {
		list.splice( a.pos - 1, 1, a )
	}
	return list;
} )

function setCommonStyle( element: string ) {
	switch ( element ) {
		case "Anemo":
			setStyle( [ "#1ddea7", "#006746", "120deg" ] );
			break;
		case "Cryo":
			setStyle( [ "#1daade", "#004b66", "165deg" ] );
			break;
		case "Dendro":
			setStyle( [ "#5dde1d", "#226600", "85deg" ] );
			break;
		case "Electro":
			setStyle( [ "#871dde", "#380066", "240deg" ] );
			break;
		case "Geo":
			setStyle( [ "#de8d1d", "#663c00", "0deg" ] );
			break;
		case "Hydro":
			setStyle( [ "#1d8dde", "#003c66", "180deg" ] );
			break;
		case "Pyro":
			setStyle( [ "#de3a1d", "#660f00", "315deg" ] );
			break;
		case "None":
			setStyle( [ "#757575", "#666666", "0deg" ] );
			break;
	}
}
</script>

<template>
	<div id="app" class="character-base">
		<main>
			<div class="portrait-box">
				<img class="portrait" :src="portrait" alt="ERROR">
			</div>
			<span class="uid-box">UID {{ data?.uid }}</span>
			<div class="chara-name">
				<img :src="elementIconSrc" alt="ERROR">
				<h3>{{ data?.name }}</h3>
				<span>lv{{ data?.level }}</span>
				<span>好感度： {{ data?.fetter }}</span>
			</div>
			<score-chart
				v-if="showScore && chartColor && data?.score"
				:data="data.score"
				:color="chartColor"></score-chart>
			<div class="artifact-list">
				<character-equipment
					v-for="(a, aKey) of artifacts"
					:key="aKey"
					:src="a.icon"
					:rarity="a.rarity"
					:level="a.level"
					:emptyIcon="artifactsFontIcon[aKey]"
				/>
			</div>
			<info-card title="套装效果" class="suit-list">
				<template v-if="data?.effects.length">
					<div v-for="(e, eKey) of data.effects" :key="eKey" class="suit-item">
						<character-equipment :src="`/assets/genshin/artifact/${e.name}/image/${e.icon}.png`"/>
						<p class="suit-info">
							<span class="title">{{ e.name }}</span>
							<span class="suit-type">{{ e.num }}件套</span>
						</p>
					</div>
				</template>
				<p v-else>当前没有圣遗物套装效果</p>
			</info-card>
			<info-card v-if="data?.skills" title="天赋" class="suit-list">
				<div v-for="(s, sKey) of data.skills" :key="sKey" class="suit-item">
					<div class="circle-image-icon">
						<img class="center" :src="s.icon" alt="ERROR">
					</div>
					<p class="suit-info">
						<span class="title">{{ s.name }}</span>
						<span class="suit-type">Lv.{{ s.levelCurrent }}</span>
					</p>
				</div>
			</info-card>
			<info-card
				v-if="data?.constellations.detail"
				:title="'命之座('+ data.activedConstellationNum +'/6)'"
				class="constellations-list">
				<div v-for="(c, cKey) of data.constellations.detail" :key="cKey" class="circle-image-icon"
				     :class="{ locked: cKey >= data.activedConstellationNum }">
					<img class="center" :src="c.icon" alt="ERROR">
					<i class="icon-lock center"></i>
				</div>
			</info-card>
			<info-card v-if="data?.weapon" class="weapon-card">
				<div class="weapon-info-box">
					<character-equipment :src="data.weapon.image" emptyIcon="icon-weapon"/>
					<div class="weapon-info-content">
						<div class="weapon-info">
							<h3>{{ data!.weapon.name }}</h3>
							<span class="weapon-level">Lv{{ data!.weapon.level }}</span>
							<span class="weapon-affixLevel">精炼{{ data!.weapon.affixLevel }}阶</span>
						</div>
						<div class="star-box">
							<img v-for="s of data.weapon.rarity" :key="s"
							     src="/assets/genshin/resource/rarity/icon/Icon_1_Stars.png"
							     alt="ERROR">
						</div>
					</div>
				</div>
				<p class="weapon-desc">{{ weaponDesc }}</p>
			</info-card>
		</main>
		<footer>
			<p class="sign">Created by Adachi-BOT</p>
		</footer>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>
<style src="../../assets/styles/icon.css"></style>

<style lang="scss" scoped>
#app {
	width: 645px;
}

.character-base {
	position: relative;
	display: flex;
	flex-direction: column;
	padding: 40px;
	color: #333;
	overflow: hidden;
	box-sizing: border-box;

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		border: 40px solid;
		border-image: url("/assets/genshin/resource/common/base-border.png") 55 fill;
		background: url('/assets/genshin/resource/common/stand-bg.png') center 105px no-repeat,
		url("/assets/genshin/resource/common/base-bg.png");
		background-size: 523px 518px, auto;
		filter: hue-rotate(var(--hue-rotate));
	}

	> main {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		/* uid */
		.uid-box {
			position: absolute;
			left: -4px;
			top: -8px;
			font-size: 16px;
			color: #555;
		}

		/* 评分 */
		.score-chart {
			position: absolute;
			right: -45px;
			top: 115px;
		}

		/* 背景立绘 */
		.portrait-box {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			width: 100%;
			left: 50%;
			top: 152px;
			transform: translateX(-50%);
			text-align: center;
			opacity: 0.8;

			.portrait {
				height: 850px;
			}
		}

		/* 角色名称部分（标题） */
		.chara-name {
			display: flex;
			align-items: center;
			margin-top: 29px;
			height: 76px;
			border-style: solid;
			border-width: 12px 140px 12px 150px;
			border-image: url("/assets/genshin/resource/card/chara-title-bg..png") 12 140 12 150 fill;
			box-sizing: border-box;
			color: #fff;

			> img {
				width: 48px;
				height: 48px;
			}

			> h3 {
				margin-left: 8px;
				white-space: nowrap;
				font-size: 30px;
				font-weight: 300;
			}

			> span {
				margin-left: 8px;
				margin-top: 8px;
				white-space: nowrap;
				font-size: 18px;
			}
		}

		/* 圣遗物列表 */
		.artifact-list {
			margin: 289px auto 16px;
			display: flex;
			align-items: center;

			.equipment-box {
				margin: 0 10px;
			}
		}

		/* 套装属性卡片 */
		:deep(.suit-list) {
			display: flex;
			align-items: center;
			padding: 0 18px;
		}

		.suit-list {
			display: flex;
			align-items: center;
			padding: 0 18px;

			.suit-item {
				flex: 1;
				display: flex;
				align-items: center;

				.suit-info {
					flex: 1;
					height: 44px;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					margin-left: 12px;

					> span {
						display: block;
						font-size: 14px;
						line-height: 14px;
					}
				}
			}
		}

		/* 命座卡片 */
		:deep(.constellations-list) {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 18px;
		}

		/* 圆形图标 */
		.circle-image-icon {
			width: 58px;
			height: 58px;
			position: relative;

			.center {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			&::before {
				content: '';
				width: inherit;
				height: inherit;
				position: absolute;
				left: 0;
				top: 0;
				border-radius: 50%;
				border: 1px solid var(--baseInfoColor);
				background-color: #333;
				box-shadow: 0 0 0 1px #333;
				box-sizing: border-box;
				opacity: 0.7;
			}

			&.locked {
				&::before {
					opacity: 0.45;
				}

				> img {
					opacity: 0.5;
				}

				> i {
					display: block;
				}
			}

			> img {
				width: 58px;
				height: 58px;
			}

			> i {
				display: none;
				font-size: 24px;
				line-height: 26px;
				color: #fff;
			}
		}

		/* 武器 */
		:deep(.weapon-card) {
			padding: 20px 22px;
			box-sizing: border-box;
		}

		.weapon-card {
			.weapon-info-box {
				display: flex;
				align-items: center;

				.equipment-icon {
					width: 56px;
					height: 56px;
				}

				.weapon-info-content {
					margin-left: 14px;

					.weapon-info {
						display: flex;
						align-items: center;

						> h3 {
							font-size: 18px;
							font-weight: 300;
						}

						.weapon-level {
							height: 20px;
							margin-left: 10px;
							padding: 0 5px;
							border-radius: 2px;
							background-color: #666;
							font-size: 14px;
							line-height: 20px;
							color: #fff;
						}

						.weapon-affixLevel {
							margin-left: 5px;
							font-size: 16px;
							color: var(--baseInfoColor);
						}
					}

					.star-box {
						margin-top: 2px;

						> img {
							display: inline-block;
							width: 24px;
							height: 24px;
						}
					}
				}
			}

			.weapon-desc {
				margin-top: 14px;
				font-size: 16px;
			}
		}

		.info-card {
			margin-bottom: 22px;

			&:last-of-type {
				margin-bottom: 0;
			}
		}
	}

	/* 作者信息 */
	footer {
		position: relative;
		margin-top: 30px;
		margin-bottom: -14px;
		padding-top: 6px;
		border-top: 1px solid #dec8a9;
		font-size: 16px;
		color: #666;
		text-align: center;
		filter: hue-rotate(var(--hue-rotate));
	}
}
</style>