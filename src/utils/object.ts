/* 对象相关通用方法 */

/**
 * @desc 获取对象中指定键名的值，值为 boolean 或 string 则取默认值，反之正常取值
 * @param data 数据
 * @param key 键名
 * @param defaultValue 键名对应值不存在时的默认值
 * @return 对象键名所对应的值
 */
export function getObjectKeyValue<T extends Record<any, any>, K extends keyof T, V>( data: boolean | string | T, key: K, defaultValue: V ) {
	if ( typeof data === "string" || typeof data === "boolean" ) {
		return defaultValue;
	} else {
		return data[key] || defaultValue;
	}
}

/**
 * @desc 校验两个对象是否相等，对数组进行校验时只专注于内容，不关心顺序
 * @param a 对象一
 * @param b 对象二
 * @param checkArray 是否对数组进行判断
 * @return 是否相等
 */
export function isEqualObject( a: any, b: any, checkArray = true ) {
	if ( !( a instanceof Object && b instanceof Object ) ) {
		return a === b;
	}
	// 引用地址相同时，直接返回true（此时包含两者为null的情况）
	if ( a === b ) {
		return true
	}
	// 有一个为null时
	if ( a === null || b === null ) {
		return false
	}
	
	// 获取a和b的全部键值
	const aProps = Object.keys( a );
	const bProps = Object.keys( b );
	// 属性数量不同时
	if ( aProps.length !== bProps.length ) {
		return false;
	}
	const isArray = a instanceof Array && b instanceof Array;
	// 校验数组
	if ( isArray ) {
		// 不校验数组时遇到数组直接放行
		if ( !checkArray ) {
			return true;
		}
		const bClone = [ ...b ];
		for ( const aItem of a ) {
			const index = bClone.findIndex( bItem => isEqualObject( aItem, bItem, checkArray ) );
			if ( index === -1 ) return false;
			bClone.splice( index, 1 );
		}
	} else {
		// 遍历查看属性值是否相等（校验对象）
		for ( let i = 0; i < aProps.length; i++ ) {
			const propName = aProps[i]
			// 判断b是否存在a的这个属性
			if ( !Object.prototype.hasOwnProperty.call( b, propName ) ) {
				return false;
			}
			const propA = a[propName];
			const propB = b[propName];
			
			// 当属性值为对象时，递归判断
			if ( propA instanceof Object && propB instanceof Object ) {
				if ( !isEqualObject( propA, propB, checkArray ) ) {
					return false;
				}
			} else if ( propA !== propB ) {
				return false;
			}
		}
	}
	return true;
}

/**
 * @desc 检查数组中是否已存在指定项（包括对象类型判重）
 * @param list 待查找数组
 * @param value 目标值
 * @param checkArray 是否对数组进行判断
 * @return 是否存在该值
 */
export function includesValue( list, value, checkArray = true ) {
	return list.findIndex(el => isEqualObject( el, value, checkArray )) !== -1;
}

/**
 * @desc 比对新旧数据并组装为新数据，添加新增数据，旧数据原有字段不做改变
 * @param oldValue 旧数据
 * @param newValue 新数据
 * @param clean 是否删除旧数据中相比新数据的多余字段
 * @param arrayType 遇到数组属性的行为：ignore 跳过 merge 合并
 * @return 组装后的数据
 */
export function compareAssembleObject<T extends Record<string, any>>( oldValue: Record<string, any>, newValue: T, clean?: true, arrayType?: "ignore" | "merge" ): T;
export function compareAssembleObject<T extends Record<string, any>>( oldValue: Record<string, any>, newValue: T, clean?: false, arrayType?: "ignore" | "merge" ): Record<string, any>;
export function compareAssembleObject<T extends Record<string, any>>( oldValue: Record<string, any>, newValue: T, clean: any = true, arrayType: "ignore" | "merge" = "ignore" ): T | Record<string, any> {
	const getArrayValue = ( newValue: any[], oldValue: any ) => {
		if ( oldValue instanceof Array ) {
			// 新增项中的不重复数组
			const noRepeatItem = newValue.filter( el => !includesValue( oldValue, el, false ) );
			return [ ...oldValue, ...noRepeatItem ]
		}
		return newValue;
	}
	if ( newValue instanceof Array ) {
		if ( arrayType === "ignore" ) {
			return oldValue;
		}
		return getArrayValue( newValue, oldValue );
	}
	const targetValue = clean ? newValue : oldValue;
	return <T>Object.fromEntries( Object.keys( targetValue ).map( k => {
		const cOldItem = oldValue[k];
		const cNewItem = newValue[k];
		if ( typeof cNewItem === "object" && cNewItem !== null ) {
			if ( cNewItem instanceof Array ) {
				if ( arrayType === "ignore" ) {
					return [ k, cOldItem ];
				}
				return [ k, getArrayValue( cNewItem, cOldItem ) ]
			}
			if ( !cOldItem ) {
				return [ k, cNewItem ];
			}
			const a = compareAssembleObject( cOldItem, cNewItem, clean )
			return [ k, a ];
		}
		return [ k, oldValue[k] ?? cNewItem ];
	} ) );
}