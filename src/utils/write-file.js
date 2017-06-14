import * as fs from 'fs';
import { dirname } from 'path';

export * from 'fs';

const mkdirpath = ( path ) => {
	const dir = dirname( path );
	try {
		fs.readdirSync( dir );
	} catch ( err ) {
		mkdirpath( dir );
		fs.mkdirSync( dir );
	}
}

export default ( dest, data ) => {
	return new Promise( ( resolve, reject ) => {
		mkdirpath( dest );

		fs.writeFile( dest, data, err => {
			if ( err ) {
				reject( err );
			} else {
				resolve();
			}
		});
	});
}
