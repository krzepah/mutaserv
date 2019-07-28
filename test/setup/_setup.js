
const database = require('../../config/database');
const { handler } = require('../../api');

const beforeAction = async () => {
	await database.authenticate();
	await database.drop();
	//eslint-disable-next-line
	await database.sync().then(() => console.log('Connection to DB successful'));
	return handler;
};

const afterAction = async () => {
	await database.close();
};


module.exports = { beforeAction, afterAction };
