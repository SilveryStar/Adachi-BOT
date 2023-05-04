export function getAssetsFile( url: string ) {
// @ts-ignore
	return new URL(`../assets/image/${url}`, import.meta.url).href;
}