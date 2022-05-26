export function infoDataParser( data ) {
	/* 星级 icon */
	const rarityIcon = `https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/icon/BaseStar${ data.rarity }.png`;
	
	const getMainImage = () => {
		const baseURL = "https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/";
		switch ( data.type ) {
			case "角色":
				return baseURL + `character/${ data.id }.png`;
			case "武器":
				return baseURL + `weapon/${ data.name }.png`;
			case "圣遗物":
				return baseURL + `artifact/${ data.id }/${ data.icon }.png`;
		}
	};
	
	const mainImage = getMainImage();
	
	return {
		rarityIcon,
		mainImage
	};
}

function setStyle( colorList ) {
	document.body.style.setProperty( "--base-color", colorList[0] );
	document.body.style.setProperty( "--shadow-color", colorList[1] );
	document.body.style.setProperty( "--light-color", colorList[2] );
	document.body.style.setProperty( "--hue-rotate", colorList[3] );
}

export function initBaseColor( data ) {
	switch ( data.rarity ) {
		case 5:
			setStyle( [ "rgba(115, 90, 44, 1)", "rgba(198, 156, 80, 0.4)", "rgba(198, 156, 80, 1)", "0deg" ] );
			break;
		case 4:
			setStyle( [ "rgba(94, 44, 115, 1)", "rgba(157, 80, 199, 0.4)", "rgba(153, 80, 199, 1)", "235deg" ] );
			break;
		case 3:
			setStyle( [ "rgba(44, 69, 115, 1)", "rgba(80, 121, 199, 0.4)", "rgba(80, 121, 199, 1)", "190deg" ] );
	}
}