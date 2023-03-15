export function isValidUrl( url ) {
	try {
		new URL( url );
		return true;
	} catch {
		return false;
	}
}