const template = `<div class="note">
	<p class="uid">实时便笺 UID{{ data.uid }}</p>
	<div class="list-info">
		<NoteInfo v-for="d in list" :data="d"/>
	</div>
	<div class="expedition-box box">
		<p class="title expedition-title">
			探索派遣限制 （{{ data.currentExpeditionNum }}/{{ data.maxExpeditionNum }}）
		</p>
		<NoteExpedition v-for="e in data.expeditions" :data="e"/>
	</div>
	<p class="author">Created by Adachi-BOT</p>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import NoteInfo from "./info.js";
import NoteExpedition from "./expedition.js";

function getTrueDay( day ) {
	return day === 0 ? 7 : day
}

function getTimePoint( time ) {
	const date = new Date();
	const sec = date.getSeconds();
	date.setSeconds( sec + parseInt( time ) );
	return moment().locale( "zh-cn" ).add( parseInt( time ), "s" ).calendar( null, {
		nextWeek: function ( now ) {
			return getTrueDay( this._d.getDay() ) > getTrueDay( now._d.getDay() ) ? 'ddddhh:mm' : '[下]ddddhh:mm';
		},
		lastWeek: function ( now ) {
			return getTrueDay( this._d.getDay() ) < getTrueDay( now._d.getDay() ) ? 'ddddhh:mm' : '[上个]ddddhh:mm';
		}
	} )
}

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "NoteApp",
	template,
	components: {
		NoteInfo,
		NoteExpedition
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/note?uid=${ urlParams.uid }` );
		
		/* 获取洞天宝钱时间 */
		const getHomeCoinSubtitle = computed( () => {
			if ( data.maxHomeCoin === 0 ) return "先去璃月完成「翠石砌玉壶」任务吧";
			if ( data.homeCoinRecoveryTime === "0" ) return "洞天宝钱已满";
			return `预计将在 ${ getTimePoint( data.homeCoinRecoveryTime ) } 达到上限`;
		} )
		/* 获取洞天宝钱显示值 */
		const getHomeCoinValue = computed( () => {
			if ( data.maxHomeCoin === 0 ) return "尚未开启";
			return `${ data.currentHomeCoin }/${ data.maxHomeCoin }`;
		} )
		
		/* 获取质量参变仪显示值 */
		const getTransformerValue = computed( () => {
			const { recoveryTime, obtained } = data.transformer;
			if ( !obtained ) return "尚未获得";
			return recoveryTime.reached ? "可使用" : "冷却中"
		} );
		
		/* 获取质量参编仪时间 */
		const getTransformerSubtitle = computed( () => {
			const { recoveryTime, obtained } = data.transformer;
			if ( !obtained ) return "先去璃月完成「天遒宝迹」任务吧";
			let { day, hour, minute, second, reached } = recoveryTime;
			if ( reached ) return "已准备完成";
			day = day ? day + "天" : "";
			hour = hour ? hour + "小时" : "";
			minute = minute ? minute + "分" : "";
			second = second ? second + "秒" : "";
			return `${ day + hour + minute + second }后可再次使用`;
		} );
		
		const resin = {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Item_Fragile_Resin.png",
			title: "原粹树脂",
			subtitle: data.resinRecoveryTime !== "0" ? `预计将在 ${ getTimePoint( data.resinRecoveryTime ) } 全部恢复` : "原粹树脂已满",
			value: `${ data.currentResin }/${ data.maxResin }`
		};
		const commission = {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Icon_Commission.png",
			title: "每日委托任务",
			subtitle: `「每日委托」奖励${ data.isExtraTaskRewardReceived ? "已" : "未" }领取`,
			value: `${ data.finishedTaskNum }/${ data.totalTaskNum }`
		};
		const weekly = {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Emblem_Domains.png",
			title: "值得铭记的强敌",
			subtitle: "本周已使用消耗减半次数",
			value: `${ data.resinDiscountNumLimit - data.remainResinDiscountNum }/${ data.resinDiscountNumLimit }`
		};
		const homes = {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Item_Serenitea_Pot.png",
			title: "洞天财瓮 - 洞天宝钱",
			subtitle: getHomeCoinSubtitle.value,
			value: getHomeCoinValue.value,
			miniFontSize: data.maxHomeCoin !== 0
		};
		const transformer = {
			icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/common/Item_Parametric_Transformer.png",
			title: "参量质变仪",
			subtitle: getTransformerSubtitle.value,
			value: getTransformerValue.value
		};
		
		const list = [ resin, homes, commission, weekly, transformer ];
		data.expeditions.forEach( ( el ) => {
			el.remainedTime = getTimePoint( el.remainedTime );
		} );
		
		return { data, list }
	}
} );
