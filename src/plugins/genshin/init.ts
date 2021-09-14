import { addPlugin } from "../../modules/plugin";
import { createServer } from "./server";
import { createYAML, loadYAML, writeYAML } from "../../utils/config";
import { getArtifact, getSlip } from "./utils/api";
import { Cookies } from "./module/cookies";
import { Order, Question } from "../../modules/command";
import { TypeData } from "./module/type";
import { ArtClass } from "./module/artifact";
import { WishClass } from "./module/wish";
import { SlipClass } from "./module/slip";
import { createBrowser } from "./utils/render";
import { AliasClass } from "./module/alias";
import { AuthLevel } from "../../modules/auth";

let cookies: Cookies;
let artClass: ArtClass;
let wishClass: WishClass;
let slipClass: SlipClass;
let aliasClass: AliasClass;
let typeData: TypeData;
let config: any;

const defaultCommandList: ( Order | Question )[] = [ {
	commandType: "order",
	key: "silvery-star.bind",
	docs: [ "绑定", "<通行证>" ],
	headers: [ "bind" ],
	regexps: [ " [0-9]+" ],
	main: "achieves/bind"
}, {
	commandType: "order",
	key: "silvery-star.mys-query",
	docs: [ "查询", "[通行证|@]" ],
	headers: [ "mys" ],
	regexps: [ " *[0-9]*", " \\[CQ:at,qq=[0-9]+.*\\]" ],
	main: "achieves/mys-query"
}, {
	commandType: "order",
	key: "silvery-star.uid-query",
	docs: [ "查询", "<UID>" ],
	headers: [ "uid" ],
	regexps: [ " *[0-9]{9}" ],
	main: "achieves/uid-query"
}, {
	commandType: "order",
	key: "silvery-star.art",
	docs: [ "抽圣遗物", "[秘境ID]" ],
	headers: [ "art" ],
	regexps: [ " *[0-9]*" ],
	main: "achieves/artifact"
}, {
	commandType: "order",
	key: "silvery-star.improve",
	docs: [ "强化", "" ],
	headers: [ "imp" ],
	regexps: [ "" ],
	main: "achieves/improve"
}, {
	commandType: "order",
	key: "silvery-star.dom",
	docs: [ "秘境查询", "" ],
	headers: [ "dom" ],
	regexps: [ "" ],
	main: "achieves/domain"
}, {
	commandType: "order",
	key: "silvery-star.wish",
	docs: [ "抽卡", "" ],
	headers: [ "wish", "w" ],
	regexps: [ "" ],
	main: "achieves/wish"
}, {
	commandType: "order",
	key: "silvery-star.choose",
	docs: [ "切换卡池", "<角色|武器|常驻>" ],
	headers: [ "choose", "t" ],
	regexps: [ " *(角色|武器|常驻)" ],
	main: "achieves/choose"
}, {
	commandType: "order",
	key: "silvery-star.character",
	docs: [ "角色信息", "<角色名>" ],
	headers: [ "char" ],
	regexps: [ " *[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/character"
}, {
	commandType: "order",
	key: "silvery-star.information",
	docs: [ "信息", "<角色|武器名>" ],
	headers: [ "info" ],
	regexps: [ " *[0-9a-z\\u4e00-\\u9fa5]+" ],
	main: "achieves/info"
}, {
	commandType: "order",
	key: "by-ha.slip",
	docs: [ "御神签", "" ],
	headers: [ "s", "slip" ],
	regexps: [ "" ],
	main: "achieves/slip"
}, {
	commandType: "order",
	key: "silvery-star.alias-customize",
	docs: [ "修改别名", "<remove|add> <本名> <别名>" ],
	headers: [ "alias" ],
	regexps: [ " (remove|add) [\\u4e00-\\u9fa5]+ [0-9a-z\\u4e00-\\u9fa5]+$" ],
	main: "achieves/alias",
	authLimit: AuthLevel.Manager
} ];

function getKeys(): any {
	let res: any = {};
	for ( let c of defaultCommandList ) {
		res[c.key] = true;
	}
	return res;
}

function elementNum( o: object ) {
	return Object.getOwnPropertyNames( o ).length;
}

function loadConfig(): any {
	const load: any = loadYAML( "genshin" );
	if ( elementNum( load ) - 1 !== defaultCommandList.length ) {
		const newConfig: any = {
			...getKeys(),
			serverPort: 58612
		}
		writeYAML( "genshin", newConfig );
		
		return newConfig;
	}
	return load;
}

function initCommandList( config: any ): ( Order | Question )[] {
	let commandList: ( Order | Question )[] = [];
	
	for ( let key in config ) {
		if ( config.hasOwnProperty( key ) && config[key] === true ) {
			const comm: any = defaultCommandList.find( el => el.key === key );
			commandList.push( comm );
		}
	}
	
	return commandList;
}

async function init(): Promise<any> {
	createYAML( "genshin", {
		...getKeys(),
		serverPort: 58612
	} );
	
	config = loadConfig();
	artClass = new ArtClass( await getArtifact() );
	cookies = new Cookies();
	wishClass = new WishClass();
	slipClass = new SlipClass( await getSlip() );
	typeData = new TypeData();
	aliasClass = new AliasClass();
	createServer();
	await createBrowser();
	
	return addPlugin( "genshin", ...initCommandList( config ) );
}

export {
	init,
	cookies,
	config,
	artClass,
	wishClass,
	slipClass,
	aliasClass,
	typeData
}