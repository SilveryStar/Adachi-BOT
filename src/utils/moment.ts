import moment from "moment";

export function getHourID(): string {
	return moment().format( "yy/MM/DD/HH" );
}

export function getWeekID(): string {
	const Mon: string = moment().weekday( 1 ).format( "yy/MM/DD" );
	const Sun: string = moment().weekday( 7 ).format( "yy/MM/DD" );
	
	return `${ Mon }-${ Sun }`;
}