import { stdout as slog } from "single-line-log";
import { getLogger, Logger } from "log4js";


export default class Progress {
	private logger: Logger = getLogger( "[progress]" );
	
	constructor(
		private description: string,
		private total: number,
		private length: number = 50
	) {
	}
	
	public setTotal( val: number ) {
		this.total = val;
	}
	
	public renderer( completed: number, extra: string = "", tcp: boolean = false ) {
		const cellNum: number = Math.floor( completed / this.total * this.length );
		
		const processStr: string = Array.from( { length: this.length }, ( _, index ) => {
			return index < cellNum ? "█" : "░";
		} ).join( "" );
		
		const cmdText = `${ this.description }: ${ processStr }  ${ completed }/${ this.total } ${ extra }`;
		
		if ( tcp ) {
			this.logger.info( cmdText );
		} else {
			// 在单行输出文本
			slog( cmdText );
			// 终止后打印换行符
			if ( processStr.length === cellNum ) {
				console.log( "" );
			}
		}
	}
}