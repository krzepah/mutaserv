const database = require('../../config/database');

const dbService = () => {
	const authenticateDB = () => database.authenticate();

	const drop = () => database.drop();

	const sync = () => database.sync();
	const migrate = async () => {
		try {
			await drop();
			await sync();
			console.info('migrate has been established successfully');
		}
		catch (err) {
			return console.info('Error : unable to connect to the database:', err);
		}
	};

	const start = async () => {
		try {
			await authenticateDB();
			await sync();
			console.info(' - connection to the database has been established successfully');
		}
		catch (err) {
			return console.info('Error : unable to connect to the database:', err);
		}
	};

	return {
		migrate,
		start,
		drop,
		sync
	};
};

module.exports = dbService;
