const database = require('../config/database');
const logger = require('../config/logger');

const dbService = () => {
	const authenticateDB = () => database.authenticate();

	const drop = () => database.drop();

	const sync = () => database.sync();
	const migrate = async () => {
		try {
			await drop();
			await sync();
			logger.info('Migrate has been established successfully');
		}
		catch (err) {
			return logger.err('Unable to connect to the database : ' + err);
		}
	};

	const start = async () => {
		try {
			await authenticateDB();
			await sync();
			logger.info('Connection to the database has been established successfully');
		}
		catch (err) {
			return logger.err('Unable to connect to the database : ' + err);
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
