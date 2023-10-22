/* 随机数相关通用方法 */

import { sleep } from "@/utils/async";

/**
 * @desc 随机阻塞一段时间
 * @param min 阻塞最短时间
 * @param max 阻塞最长时间
 * @param second 是否以秒做单位（默认毫秒）
 */
export async function randomSleep( min: number, max: number, second: boolean = false ): Promise<void> {
	if ( second ) {
		min = min * 1000;
		max = max * 1000;
	}
	const randomTime = getRandomNumber( min, max );
	await sleep( randomTime );
}

/**
 * @desc 获取区间内随机值
 * @param min 最小值
 * @param max 最大值
 * @return 所得随机数
 */
export function getRandomNumber( min: number, max: number ) {
	const range: number = Math.floor( max ) - Math.ceil( min ) + 1;
	return min + Math.floor( Math.random() * range );
}

/**
 * @desc 获取指定长度的随机字符串
 * @param length 长度
 * @return 随机字符串
 */
export function getRandomString( length: number ) {
	const charSet: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return getRandomStringBySeed( length, charSet );
}

/**
 * 从目标字符串中获取指定长度的随机字符串
 * @param length 长度
 * @param seed 目标字符串
 */
export function getRandomStringBySeed( length: number, seed: string ): string {
	return Array.from( { length }, () => {
		const randNum = Math.floor( Math.random() * seed.length );
		return seed[randNum];
	} ).join( "" );
}