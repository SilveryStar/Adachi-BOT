export function getAssetsFile( url: string ) {
// @ts-ignore
	return new URL(`../static_assets/${url}`, import.meta.url).href;
}