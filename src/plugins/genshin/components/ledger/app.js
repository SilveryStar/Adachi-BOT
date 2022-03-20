const template = `<div class="ledger-base">
	<header>
		<article class="user-info">
			<p>UID {{ data.uid }}</p>
			<p>{{ data.nickname }}</p>
		</article>
		<article class="ledger-header">
			<p>旅行者{{ data.dataMonth }}月札记</p>
			<p>*仅统计充值途径以外获取的资源</p>
		</article>
	</header>
	<main>
		<article>
			<SectionTitle>
				<template #default>每日数据</template>
			</SectionTitle>
			<div class="ledger-data-content">
				<DataPiece :data="pieceData.dayPrimogems" type="primogem" dateType="day"></DataPiece>
				<DataPiece :data="pieceData.dayMora" type="mora" dateType="day"></DataPiece>
			</div>
		</article>
		<article>
			<SectionTitle>
				<template #default>每月数据</template>
			</SectionTitle>
			<div class="ledger-data-content">
				<DataPiece :data="pieceData.monthPrimogems" type="primogem" dateType="month"></DataPiece>
				<DataPiece :data="pieceData.monthMora" type="mora" dateType="month"></DataPiece>
			</div>
		</article>
		<article>
			<SectionTitle>
				<template #default>原石来源统计</template>
			</SectionTitle>
			<div class="ledger-data-content">
				<DataChart :data="data.monthData.groupBy"></DataChart>
			</div>
		</article>
		<p class="time">记录日期 {{ data.date }}</p>
	</main>
	<footer>
		<p>Created by Adachi-BOT</p>
	</footer>
</div>`;

import { parseURL, request } from "../../public/js/src.js"
import SectionTitle from "../abyss/section-title.js"
import DataPiece from "./data-piece.js"
import DataChart from "./data-chart.js"

const { defineComponent } = Vue;

export default defineComponent( {
	name: "LedgerApp",
	template,
	components: {
		SectionTitle,
		DataPiece,
		DataChart
	},
	setup() {
		const urlParams = parseURL( location.search );
		const data = request( `/api/ledger?uid=${ urlParams.uid }` );
		
		const pieceData = {
			dayMora: {
				prev: data.dayData.lastMora,
				next: data.dayData.currentMora
			},
			dayPrimogems: {
				prev: data.dayData.lastPrimogems,
				next: data.dayData.currentPrimogems
			},
			monthMora: {
				prev: data.monthData.lastMora,
				next: data.monthData.currentMora
			},
			monthPrimogems: {
				prev: data.monthData.lastPrimogems,
				next: data.monthData.currentPrimogems
			}
		}
		
		return {
			data,
			pieceData
		}
	}
} )