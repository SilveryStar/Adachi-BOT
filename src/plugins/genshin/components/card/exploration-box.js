const template = `
<div class="exploration-base">
  <p>
    <span>{{ data.area.name }}&nbsp;</span>
    <span>{{ data.explorationPercentage }}</span>
  </p>
  <div class="card-exploration-info">
    <p v-if="data.type !== 'Offering'">声望: Lv.{{ data.level || 0 }}</p>
    <template v-if="data.offerings">
      <p v-for="(offer, offerIndex) in data.offerings" :key="offerIndex">{{ offer.name }}: Lv.{{ offer.level }}</p>
    </template>
  </div>
  <img :src="'https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/area/'+data.area.code+'.png'" :alt="data.area" />
</div>`;

const { defineComponent } = Vue;

export default defineComponent({
	name: "ExplorationBox",
	template,
	props: {
		data: {
			type: Object,
			default() {
				return {
					area: {},
					offerings: [],
				};
			},
		},
	},
});
