const template = `
<div class="card-base">
  <CardHeader :data="data" :url-params="urlParams" :info-list="statsList.base"></CardHeader>
  <main>
	<section class="card-user">
	  <article class="card-user-info">
		<SectionTitle>数据总览</SectionTitle>
		<div class="card-status-box">
		  <StatusBox v-for="(status, index) in statsList.chest.concat(statsList.culus)" class="card-status-item" :key="index" :data="status"></StatusBox>
		</div>
	  </article>
	  <article class="card-exploration">
		<SectionTitle>世界探索</SectionTitle>
		<div class="card-exploration-box">
		  <ExplorationBox v-for="(exploration, index) in explorationsList" :key="index" class="card-exploration-item" :data="exploration"></ExplorationBox>
		</div>
	  </article>
	</section>
	<section class="card-character">
	  <SectionTitle showSubTitle>
		<template #default>角色展示</template>
		<template #sub>角色数量: {{ data.stats.avatarNumber }}</template>
	  </SectionTitle>
	  <div class="character-line">
		<CharacterBox v-for="(char, charIndex) in data.avatars" :key="charIndex" :char="char" type="weaponA" class="character-item"></CharacterBox>
	  </div>
	</section>
	<section class="card-home">
	  <SectionTitle showSubTitle>
		<template #default>尘歌壶</template>
		<template #sub>等级: Lv.{{ homesLevel }} 仙力: {{ maxComfort }}</template>
	  </SectionTitle>
	  <div class="card-home-box">
		<HomeBox v-for="(home, index) of formatHomes" :key="index" class="card-home-item" :class="sizeClass(formatHomes, index)" :data="home" />
	  </div>
	</section>
	<p class="sign">Created by Adachi-BOT</p>
  </main>
</div>`;

import { parseURL, request } from "../../public/js/src.js";
import CardHeader from "./card-header.js";
import SectionTitle from "./section-title.js";
import HomeBox from "../card/home-box.js";
import CharacterBox from "../card/character-box.js";
import ExplorationBox from "../card/exploration-box.js";
import StatusBox from "../card/status-box.js";
const { defineComponent } = Vue;

export default defineComponent({
	name: "CardApp",
	template,
	components: {
		CardHeader,
		SectionTitle,
		HomeBox,
		CharacterBox,
		ExplorationBox,
		StatusBox,
	},
	setup() {
		const urlParams = parseURL(location.search);
		const data = request(`/api/card?qq=${urlParams.qq}`);

		const { avatars, stats, explorations, homes } = data;

		/* 角色根据等级好感度排序 */
		avatars.sort((x, y) => {
			return x.level === y.level ? y.fetter - x.fetter : y.level - x.level;
		});
		// 切割，仅保留前8位人物
		avatars.splice(8);

		const statsList = {
			base: [
				{
					label: "活跃天数",
					value: stats.activeDayNumber,
				},
				{
					label: "成就达成",
					value: stats.achievementNumber,
				},
				{
					label: "深境螺旋",
					value: stats.spiralAbyss,
				},
				{
					label: "秘境解锁",
					value: stats.domainNumber,
				},
			],
			chest: [
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_1.png",
					label: "普通宝箱",
					value: stats.commonChestNumber,
				},
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_2.png",
					label: "精致宝箱",
					value: stats.exquisiteChestNumber,
				},
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_3.png",
					label: "珍贵宝箱",
					value: stats.preciousChestNumber,
				},
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_4.png",
					label: "华丽宝箱",
					value: stats.luxuriousChestNumber,
				},
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/chest/treasure_chest_5.png",
					label: "奇馈宝箱",
					value: stats.magicChestNumber,
				},
			],
			culus: [
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/culus/Anemoculus.png",
					label: "风神瞳数",
					value: stats.anemoculusNumber,
				},
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/culus/Geoculus.png",
					label: "岩神瞳数",
					value: stats.geoculusNumber,
				},
				{
					icon: "https://adachi-bot.oss-cn-beijing.aliyuncs.com/images/culus/Electroculus.png",
					label: "雷神瞳数",
					value: stats.electroculusNumber,
				},
			],
		};

		const areaList = [
			{ name: "蒙德", code: "mondstadt" },
			{ name: "璃月", code: "liyue" },
			{ name: "龙脊雪山", code: "dragonspine" },
			{ name: "稻妻", code: "inazuma" },
			{ name: "渊下宫", code: "enkanomiya" },
		];
		const explorationsList = [];

		for (const el of explorations) {
			if (areaList[el.id - 1]) {
				explorationsList.push({
					...el,
					area: areaList[el.id - 1],
					explorationPercentage: `${el.explorationPercentage / 10}%`,
				});
			}
		}

		// 按id排序防乱序
		explorationsList.sort((firstEl, secondEl) => firstEl.id - secondEl.id);

		/* 判断当前元素大小样式 */
		const sizeClass = (dataList, index) => {
			index++;
			if (
				(dataList.length % 3 === 1 && index > dataList.length - 4) ||
				(dataList.length % 3 === 2 && index > dataList.length - 2)
			) {
				return "large";
			}
			return "medium";
		};

		let [homesLevel, maxComfort] = [0, 0];
		if (homes.length !== 0) {
			homesLevel = homes[0].level;
			maxComfort = homes[0].comfortNum;
		}

		const homeList = ["罗浮洞", "翠黛峰", "清琼岛", "绘绮庭"];

		const formatHomes = homeList.map((name) => {
			const homeData = homes.find((el) => el.name === name);
			return homeData ? homeData : { name, level: -1 };
		});

		return {
			data,
			urlParams,
			explorationsList,
			homesLevel,
			maxComfort,
			sizeClass,
			formatHomes,
			statsList,
		};
	},
});
