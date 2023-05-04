export function getFullDate() {
	const date = new Date();
	let hour: string | number = date.getHours();
	let minute: string | number = date.getMinutes();
	let second: string | number = date.getSeconds();
	second = second < 10 ? "0" + second : second;
	minute = minute < 10 ? "0" + minute : minute;
	hour = hour < 10 ? "0" + hour : hour;
	
	return `${ date.getMonth() + 1 }月${ date.getDate() }日 ${ hour }:${ minute }:${ second }`;
}