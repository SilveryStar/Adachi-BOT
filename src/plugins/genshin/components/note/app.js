const template =
`<div class="note">
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

function getTimePoint( time ) {
	const date = new Date();
	const sec = date.getSeconds();
	date.setSeconds( sec + parseInt( time ) );
	return moment()
		.locale( "zh-cn" )
		.add( parseInt( time ), "s" )
		.calendar();
}
const { defineComponent } = Vue;

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
		
		const resin = {
			title: "原粹树脂",
			subtitle: `预计将在 ${ getTimePoint( data.resinRecoveryTime ) } 全部恢复`,
			numerator: data.currentResin,
			denominator: data.maxResin
		};
		const commission = {
			title: "每日委托任务",
			subtitle: `「每日委托」奖励${ data.isExtraTaskRewardReceived ? "已" : "未" }领取`,
			numerator: data.finishedTaskNum,
			denominator: data.totalTaskNum
		};
		const weekly = {
			title: "值得铭记的强敌",
			subtitle: "本周剩余消耗减半次数",
			numerator: data.remainResinDiscountNum,
			denominator: data.resinDiscountNumLimit
		};
		const homes = {
			title: "洞天财瓮 - 洞天宝钱",
			subtitle: `预计将在 ${ getTimePoint( data.homeCoinRecoveryTime ) } 达到上限`,
			numerator: data.currentHomeCoin,
			denominator: data.maxHomeCoin,
			miniFontSize: true
		};
		console.log( data )
		const list = [ resin, homes, commission, weekly ];
		data.expeditions.forEach( el => {
			el.remainedTime = getTimePoint( el.remainedTime );
		} );

		return { data, list }
	}
} );