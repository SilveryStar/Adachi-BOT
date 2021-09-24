function getRegion( first: string ): string {
	switch ( first ) {
		case "1": return "cn_gf01";
		case "2": return "cn_gf01";
		case "5": return "cn_qd01";
		default:  return "unknown";
	}
}

export {
	getRegion
}