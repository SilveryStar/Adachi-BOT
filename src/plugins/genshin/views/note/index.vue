<script lang="ts" setup>
import moment from "moment";
import "moment/dist/locale/zh-cn";
import { ref, onMounted } from "vue";
import $https from "#/genshin/front-utils/api";
import NoteInfo from "./info.vue";
import NoteExpedition from "./expedition.vue";
import { urlParamsGet } from "@/utils/common";

const urlParams = urlParamsGet( location.href );
const data = ref<Record<string, any> | null>( null );
const version = window.ADACHI_VERSION;

/* 获取洞天宝钱时间 */
function getHomeCoinSubtitle( data ) {
	if ( data.maxHomeCoin === 0 ) return "先去璃月完成「翠石砌玉壶」任务吧";
	if ( data.homeCoinRecoveryTime === "0" ) return "洞天宝钱已满";
	return `预计将在 ${ getTimePoint( data.homeCoinRecoveryTime ) } 达到上限`;
}

/* 获取洞天宝钱显示值 */
function getHomeCoinValue( data ) {
	if ( data.maxHomeCoin === 0 ) return "尚未开启";
	return `${ data.currentHomeCoin }/${ data.maxHomeCoin }`;
}

/* 获取参量质变仪显示值 */
function getTransformerValue( data ) {
	const { recoveryTime, obtained } = data.transformer;
	if ( !obtained ) return "尚未获得";
	return recoveryTime.reached ? "可使用" : "冷却中"
}

/* 获取质量参编仪时间 */
function getTransformerSubtitle( data ) {
	const { recoveryTime, obtained } = data.transformer;
	if ( !obtained ) return "先去璃月完成「天遒宝迹」任务吧";
	let { day, hour, minute, second, reached } = recoveryTime;
	if ( reached ) return "已准备完成";
	const dayStr = day ? day + "天" : "";
	const hourStr = hour ? hour + "小时" : "";
	const minuteStr = minute ? minute + "分" : "";
	const secondStr = second ? second + "秒" : "";
	return `${ dayStr + hourStr + minuteStr + secondStr }后可再次使用`;
}

function getDataList( data ) {
	const resin = {
		icon: "/assets/genshin/resource/material/原粹树脂.png",
		title: "原粹树脂",
		subtitle: data.resinRecoveryTime !== "0" ? `预计将在 ${ getTimePoint( data.resinRecoveryTime ) } 全部恢复` : "原粹树脂已满",
		value: `${ data.currentResin }/${ data.maxResin }`
	};
	const commission = {
		icon: "/assets/genshin/resource/common/icon/Icon_Commission.png",
		title: "每日委托任务",
		subtitle: `「每日委托」奖励${ data.isExtraTaskRewardReceived ? "已" : "未" }领取`,
		value: `${ data.finishedTaskNum }/${ data.totalTaskNum }`
	};
	const weekly = {
		icon: "/assets/genshin/resource/common/icon/Emblem_Domains.png",
		title: "值得铭记的强敌",
		subtitle: "本周已使用消耗减半次数",
		value: `${ data.resinDiscountNumLimit - data.remainResinDiscountNum }/${ data.resinDiscountNumLimit }`
	};
	const homes = {
		icon: "/assets/genshin/resource/material/尘歌壶.png",
		title: "洞天财瓮 - 洞天宝钱",
		subtitle: getHomeCoinSubtitle( data ),
		value: getHomeCoinValue( data ),
		miniFontSize: data.maxHomeCoin !== 0
	};
	const transformer = {
		icon: "/assets/genshin/resource/material/参量质变仪.png",
		title: "参量质变仪",
		subtitle: getTransformerSubtitle( data ),
		value: getTransformerValue( data )
	};

	return [ resin, homes, commission, weekly, transformer ]
}

function getTrueDay( day ) {
	return day === 0 ? 7 : day;
}

function getTimePoint( time ) {
	const date = new Date();
	const sec = date.getSeconds();
	date.setSeconds( sec + parseInt( time ) );
	return moment().add( parseInt( time ), "s" ).calendar( null, {
		nextWeek: function ( now ) {
			return getTrueDay( ( <any>this._d ).getDay() ) > getTrueDay( ( <any>now )._d.getDay() ) ? 'ddddhh:mm' : '[下]ddddhh:mm';
		},
		lastWeek: function ( now ) {
			return getTrueDay( ( <any>this._d ).getDay() ) < getTrueDay( ( <any>now )._d.getDay() ) ? 'ddddhh:mm' : '[上个]ddddhh:mm';
		}
	} )
}

const getData = async () => {
	const res = await $https.NOTE.get( { uid: urlParams.uid } );
	res.expeditions.forEach( ( el ) => {
		el.remainedTime = getTimePoint( el.remainedTime );
	} );
	data.value = {
		...res,
		dataList: getDataList( res )
	}
};

onMounted( () => {
	getData();
} );
</script>

<template>
	<div v-if="data" id="app" class="note">
		<p class="uid">实时便笺 UID{{ data.uid }}</p>
		<div class="list-info">
			<NoteInfo v-for="d in data.dataList" :data="d"/>
		</div>
		<div class="expedition-box box">
			<p class="title expedition-title">
				探索派遣限制 （{{ data.currentExpeditionNum }}/{{ data.maxExpeditionNum }}）
			</p>
			<NoteExpedition v-for="e in data.expeditions" :data="e"/>
		</div>
		<p class="author">Created by Adachi-BOT v{{ version }}</p>
	</div>
</template>

<style src="../../assets/styles/reset.css"></style>

<style lang="scss" scoped>
#app {
	width: 436px;
	background-color: rgb(241, 234, 226);
}

.note {
	position: relative;
	padding: 0 18px;
	width: auto;
}

.uid {
	position: relative;
	width: 100%;
	text-align: center;
	font-size: 17px;
	padding: 12px 0;
	color: rgb(36, 36, 36);
}

.title {
	color: rgb(90, 90, 90);
}

.list-info {
	position: relative;
	width: auto;
}

.expedition-title {
	font-size: 16px;
}

.expedition-box {
	position: relative;
	width: auto;
	padding: 18px;
}

.box {
	background-color: rgb(245, 242, 235);
	border: 2px solid rgb(222, 218, 210);
}

.author {
	position: relative;
	font-size: 13px;
	padding-top: 9px;
	padding-bottom: 6px;
	color: rgb(36, 36, 36);
	text-align: center;
}
</style>
