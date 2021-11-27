const template =
`<div class="logger">
	<div class="picker">
		<el-date-picker
			v-model="date"
			type="date"
			placeholder="选择日期"
			format="MM-DD"
			:clearable="false"
			:editable="false"
			:disabled-date="disabledDate"
			@change="changeDate"
		/>
		<div class="auto-bottom-switch" v-if="today">
			<span class="content">自动置底</span>
			<el-switch
				v-model="autoBottom"
				active-color="#20a53a"
				inactive-color="#f1f1f1"
			/>
		</div>
		<div
			class="copy-button"
			@click="copyAsReportFormat"
		>去隐私复制</div>
	</div>
	<div class="log-container">
		<p v-if="date === ''" class="empty-promote">
			请选择日期以查看日志...
		</p>
		<p v-else-if="error" class="empty-promote">
			未找到{{ date.getMonth() + 1 }}月{{ date.getDate() }}日的日志...
		</p>
		<div v-else class="log-window">
			<el-scrollbar ref="scrollbarRef" class="log-scroll-container">
				<p v-for="m in list[curPage - 1]" class="content-line">
					<span :style="{ color: m.color }">[{{ m.time }}] {{ m.category }} [{{ m.level }}] - </span>
					<span style="color: #fff">{{ m.message }}</span>
				</p>
			</el-scrollbar>
			<el-pagination
				v-model:current-page="curPage"
				:page-size="numPerPage"
				:total="totalLog"
				:pager-count="7"
				layout="prev, pager, next"
				hide-on-single-page
			/>
		</div>
	</div>
</div>`;

const { defineComponent, reactive, toRefs, watch, ref, nextTick } = Vue;
const { useRoute } = VueRouter;
const { ElMessage } = ElementPlus;
const { get } = axios;

export default defineComponent( {
	name: "Log",
	template,
	setup() {
		let ws = null;
		const route = useRoute();
		const state = reactive( {
			list: [],
			date: "",
			curPage: 1,
			autoBottom: true,
			today: false,
			error: false,
			totalLog: 0,
			numPerPage: 750
		} );
		const scrollbarRef = ref( null );
		
		function isToday( date ) {
			const d = new Date();
			return d.getDate() === date.getDate() &&
				   d.getFullYear() === date.getFullYear() &&
				   d.getMonth() === date.getMonth();
		}
		
		function getDateString( date ) {
			date.setHours( 8 );
			return date.toJSON().split( "T" )[0];
		}
		
		function disabledDate( time ) {
			return time.getTime() > Date.now() ||
				   time.getTime() < new Date( "2021-11-2" ).getTime();
		}
		
		function parser( data ) {
			return data.split( "__ADACHI__" )
					   .filter( el => el.length !== 0 )
					   .map( el => JSON.parse( el ) );
		}
		
		function splitArray( arr, num ) {
			return [ arr.splice( -1 * num ), arr ].reverse();
		}

		function addMsgToList( msg ) {
			const num = state.list.length;
			const diff = state.list[num - 1].length + msg.length - state.numPerPage;
			if ( diff <= 0 ) {
				state.list[num - 1].push( ...msg );
			} else {
				const [ m1, m2 ] = splitArray( msg, diff );
				state.list[num - 1].push( ...m1 );
				state.list.push( [ ...m2 ] );
			}
		}
		
		function scrollToBottom() {
			state.curPage = state.list.length;
			setTimeout( () => scrollbarRef.value.wrap.scrollTop = scrollbarRef.value.wrap.scrollHeight, 10 );
		}
		
		function runWS() {
			ws = new WebSocket( `ws://${ document.location.host }/ws/log` );
			ws.addEventListener( "message", event => {
				const msg = parser( event.data );
				if ( msg.length === 0 ) {
					return;
				}
				state.totalLog += msg.length;
				addMsgToList( msg );
				nextTick( () => {
					if ( state.autoBottom ) {
						scrollToBottom();
					}
				} );
			} );
		}
		
		function cutArray( arr, step ) {
			let newArr = [], index = 0;
			const len = arr.length;
			while ( index < len ) {
				newArr.push( arr.slice( index, index += step ) );
			}
			return newArr;
		}
		
		function changeDate( date ) {
			state.list = [];
			state.curPage = 1;
			state.today = isToday( date );
			
			get( `/api/log?date=${ getDateString( date ) }` )
				.then( resp => {
					state.error = false;
					const msg = parser( resp.data );
					state.totalLog = msg.length;
					state.list.push( ...cutArray( msg, state.numPerPage ) );
					if ( state.today ) {
						runWS();
						setTimeout( () => scrollToBottom(), 50 );
					} else if ( ws ) {
						ws.close();
					}
				} )
				.catch( err => { state.error = true } );
		}
		
		function copyAsReportFormat() {
			const content = getSelection()
				.toString()
				.split( "\n\n" )
				.map( el => {
					el = el.replace( /\[(Android|aPad|Watch|iMac|iPad):\d+]/, "[$1:*****]" )
						   .replace( / - recv from: \[Private: \d+\((friend|group)\)] (.*)/, " [Recv] [Pri-$1] $2" )
						   .replace( / - recv from: \[Group: .*] (.*)/, " [Recv] [Group] $1" )
						   .replace( / - send to: \[(Group|Private): .*]/ , " [Send] [$1] ---" )
						   .replace( /(\[[A-Z]+]) - (.*)/, "$1 [Event] $2" )
						   .replace( /&#93;/g, "]" )
						   .replace( /&#91;/g, "[" );
					return el;
				} )
				.join( "\n" );
			if ( content.length === 0 ) {
				ElMessage( {
					message: "请先使用鼠标拖选内容",
					duration: 1500
				} );
				return;
			}
			const textarea = document.createElement( "textarea" );
			textarea.readOnly = true;
			textarea.value = content;
			textarea.style.position = "absolute";
			textarea.style.left = "-9999px";
			document.body.appendChild( textarea );
			textarea.select();
			textarea.setSelectionRange( 0, textarea.value.length );
			document.execCommand( "Copy" );
			document.body.removeChild( textarea );
			ElMessage( {
				message: "内容已复制到剪切板",
				type: "success",
				duration: 1500
			} );
		}
		
		watch( () => state.curPage, () => {
			scrollbarRef.value.wrap.scrollTop = 0;
		} );
		
		watch( () => route.path, () => {
			if ( ws ) ws.close();
		} );
		
		return {
			...toRefs( state ),
			scrollbarRef,
			changeDate,
			disabledDate,
			copyAsReportFormat
		};
	}
} );