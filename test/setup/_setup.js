
const database = require('../../package/config/database');
const { handler } = require('../../package/server');

const beforeAction = async () => {
	await database.authenticate();
	await database.drop();
	//eslint-disable-next-line
	await database.sync();
	return handler;
};

const afterAction = async () => {
	await database.close();
};


module.exports = { beforeAction, afterAction };
