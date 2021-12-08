export function guid() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
		.replace( /[xy]/g, el => {
			const r: number = Math.random() * 16 | 0;
			const v: number = el == "x" ? r : ( r & 0x3 | 0x8 );
			return v.toString( 16 );
		} );
}