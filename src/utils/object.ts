/* 对象相关通用方法 */

/**
 * @desc 获取对象中指定键名的值，值为 boolean 或 string 则取默认值，反之正常取值
 * @param data 数据
 * @param key 键名
 * @param defaultValue 键名对应值不存在时的默认值
 * @return 对象键名所对应的值
 */
export function getObjectKeyValue<T extends Record<any, any>, K extends keyof T, V>( data: boolean | string | T, key: K, defaultValue: V ) {
	if ( typeof data === "string" || typeof data === "boolean") {
		return defaultValue;
	} else {
		return data[key] || defaultValue;
	}
}

/**
 * @desc 比对新旧数据并组装为新数据，添加新增数据，旧数据原有字段不做改变
 * @param oldValue 旧数据
 * @param newValue 新数据
 * @param clean 是否删除旧数据中相比新数据的多余字段
 * @return 组装后的数据
 */
export function compareAssembleObject<T extends Record<string, any>>( oldValue: Record<string, any>, newValue: T, clean?: true ): T;
export function compareAssembleObject<T extends Record<string, any>>( oldValue: Record<string, any>, newValue: T, clean?: false ): Record<string, any>;
export function compareAssembleObject<T extends Record<string, any>>( oldValue: Record<string, any>, newValue: T, clean: any = true ): T | Record<string, any> {
	const targetValue = clean ? newValue : oldValue;
	return <T>Object.fromEntries( Object.entries( targetValue ).map( ( [ k, v ] ) => {
		const curItem = oldValue[k];
		if ( typeof v === "object" && v !== null ) {
			if ( !curItem ) {
				return [ k, v ];
			}
			return [ k, compareAssembleObject( curItem, v, clean ) ];
		}
		return [ k, oldValue[k] ?? v ];
	} ) );
}