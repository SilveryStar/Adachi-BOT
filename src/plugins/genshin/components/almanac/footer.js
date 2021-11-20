const template =
`<div class="almanac-footer">
	<img class="dire-title" src="../../public/images/almanac/direction.svg" alt="ERROR"/>
	<div class="dire-content">
		<p>面朝{{ d }}玩原神<br/>稀有掉落概率up</p>
	</div>
	<p class="design">Designed by genshin.pub</p>
	<p class="author">Created by Adachi-BOT</p>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "AlmanacFooter",
	template,
	props: {
		d: String
	}
} );