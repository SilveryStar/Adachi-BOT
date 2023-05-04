// 获取日期对象
function getDate( time: Date | string | number ): Date {
	let date;
	// 当是日期对象时直接赋值
	if ( typeof time === "object" ) {
		date = time;
	} else {
		if ( typeof time === "string" ) {
			// 当为时间戳时
			if ( /^\d+$/.test( time ) ) {
				time = parseInt( time );
			} else {
				time = time.replace( new RegExp( /-/gm ), '/' );
			}
		}
		
		// 当为秒时间戳时
		if ( typeof time === "number" && time.toString().length === 10 ) {
			time = time * 1000;
		}
		// 生成日期对象
		date = new Date( time );
	}
	return date;
}

export function parseTime( timeValue: Date | string | number, format: string = "{y}-{m}-{d} {h}:{i}:{s}" ): string {
	const date = getDate( timeValue );
	
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	}
	// result: 匹配的子串，如{a}，key: 分组即括号内匹配的字符串，如a
	const time_str: string = format.replace( /{([ymdhisa])+}/g, ( result, key ) => {
		// 依次根据分组中匹配到的字符串去formatObj中拿数据
		const value = formatObj[key];
		// getDay() 返回 0 时是星期天
		if ( key === 'a' ) {
			return [ "日", "一", "二", "三", "四", "五", "六" ][value];
		}
		// 一位数用前面加 0 补齐为两位数
		return value.toString().padStart( 2, "0" )
	} )
	return time_str;
}

/* 格式化群身份 */
export function formatRole( str: "owner" | "admin" | "member" ) {
	const map = {
		owner: {
			label: "群主",
			color: "#FFCA36"
		},
		admin: {
			label: "管理员",
			color: "#30D9CA"
		},
		member: {
			label: "群员",
			color: "#A3ADC2"
		}
	};
	return map[str];
}
