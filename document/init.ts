import { addPlugin } from "../src/modules/plugin";
import { AuthLevel } from "../src/modules/auth";
import { MessageScope } from "../src/modules/message";

async function init(): Promise<any> {
	return addPlugin( "test", {
		commandType: "question",
		key: "silvery-star.weather-question",
		docs: [ "天气", "周[几]的的天气" ],
		sentences: [ "周(一|二|三|四|五|六|七|日)的天气" ],
		authLimit: AuthLevel.Banned,
		scope: MessageScope.Group,
		main: "question"
	}, {
		commandType: "order",
		key: "silvery-star.weather-order",
		docs: [ "天气", "星期" ],
		headers: [ "weather", "__weather" ],
		regexps: [ " [1-7]" ],
		scope: MessageScope.Private,
		main: "order"
	});
}

export { init }