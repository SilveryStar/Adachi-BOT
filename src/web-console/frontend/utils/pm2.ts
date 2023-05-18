import {restart} from "pm2";

export function restartPm2() {
	restart( "adachi-bot", () => {
	} );
}