import fs from "fs";
import path from "path";

/**
 * @desc 仿 .gitignore 校验规则
 * @param ignorePath 规则文件完整绝对路径
 * @param targetPath 目标完整绝对路径
 * @return 匹配结果
 */
export function isIgnorePath( ignorePath: string, targetPath: string ): boolean {
	// 格式化为 linux 路径
	ignorePath = ignorePath.replace( /\\/g, "/" );
	// 改写目标路径为相对规则文件的路径
	targetPath = targetPath
		.replace( /\\/g, "/" )
		.replace( path.dirname(ignorePath), "" );
	
	let isExec = false;
	targetPath = targetPath.replace( ignorePath, "" );
	if ( ignorePath.endsWith("/") ) {
		targetPath += "/";
	}
	const ignoreData: string = fs.readFileSync( ignorePath, "utf8" );
	for ( const item of ignoreData.split( /[\r\n]/g ) ) {
		let rule: string = item.trim();
		// 排除空行与#号开头
		if ( rule.length === 0 || rule.startsWith( "#" ) ) {
			continue;
		}
		// 此时为排除项
		let isExclude = false;
		if ( rule.startsWith( "!" ) ) {
			rule = rule.slice( 1 );
			isExclude = true;
		}
		rule = rule
			.replace( /\//g, '\\/' )
			.replace( /\./g, '\\.' )
			.replace( /\?/g, '.' )
			.replace( /(?<!\*)\*(?!\*)/g, '[^\\/]*' )
			.replace( /\*\*/g, '.*' );
		
		// 此时必须以规则文件所在目录为根目录起始
		if ( rule.startsWith( "\\/" ) ) {
			rule = rule.replace("\\/", "^(?:\\/)?")
		}
		const reg = new RegExp( rule );
		// 匹配成功
		if ( reg.test( targetPath ) ) {
			isExec = !isExclude;
		}
	}
	return isExec;
}