export function getAssetsFile( url: string ) {
// @ts-ignore
	return new URL(`../${url}`, import.meta.url).href;
}