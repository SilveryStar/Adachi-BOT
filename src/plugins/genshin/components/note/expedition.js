const template =
`<div class="expedition" :class="{ finish: data.status === 'Finished' }">
	<div class="profile">
		<div class="circle1"/>
		<div class="circle2"/>
		<img class="icon" :src="data.avatarSideIcon" alt="ERROR"/>
	</div>
	<p class="time">{{ time }}</p>
</div>`;

const { defineComponent, computed } = Vue;

export default defineComponent( {
	name: "NoteExpedition",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const time = computed( () => {
			return props.data.status === "Ongoing"
				 ? `预计将在 ${ props.data.remainedTime } 完成探索`
				 : "探险完成";
		} );
		
		return { time };
	}
} );