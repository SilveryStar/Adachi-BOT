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

import Vue from "../../public/js/vue.js";
import { parseURL } from "../../public/js/src.js";
import NoteInfo from "./info.js";
import NoteExpedition from "./expedition.js";

function getTimeString( time ) {
	const hour = Math.floor( time / 60 / 60 );
	const minute = Math.floor( time / 60 ) % 60;
	return `${ hour }小时${ minute }分钟`;
}

export default Vue.defineComponent( {
	name: "NoteApp",
	template,
	components: {
		NoteInfo,
		NoteExpedition
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = JSON.parse( atob( decodeURIComponent( urlParams.data ) ) );
		
		const resin = {
			title: "原粹树脂",
			subtitle: `将于${ getTimeString( data.resinRecoveryTime ) }后全部恢复`,
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
		}
		
		const list = [ resin, commission, weekly ];
		data.expeditions.forEach( el => {
			el.remainedTime = getTimeString( el.remainedTime );
		} );

		return { data, list }
	}
} );