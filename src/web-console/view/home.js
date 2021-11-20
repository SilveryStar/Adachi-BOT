const template =
`<div class="home-content">
	<p>欢迎使用 Adachi-BOT 的网页控制台</p>
	<p>这是一个正在进行初步测试的功能模块</p>
	<p>本功能旨在简化指令式繁琐的管理模式</p>
	<p>为用户提供更直观更简便的管理体验</p>
	<br>
	<p>本项目目前只提供了如下功能</p>
	<p>实时日志监看</p>
	<p>历史日志查询</p>
	<p>用户权限设置</p>
	<p>指令使用统计</p>
	<p>未来还会陆续推出更多的管理设置</p>
	<br>
	<p>在使用时遇到任何 BUG</p>
	<p>都可以点击左上角进入项目首页提出 issue</p>
	<br>
	<p>尽管我们为移动端进行了适配</p>
	<p>但还是更建议你在 PC 上使用本功能</p>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "Home",
	template
} );