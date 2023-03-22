export function delay( time: number ): Promise<void> {
	return new Promise( resolve => {
		setTimeout( resolve, time );
	} );
}

export function getRandomNumber( min: number, max: number ) {
	min = Math.ceil( min );
	max = Math.floor( max );
	return Math.floor( Math.random() * ( max - min ) ) + min;
}