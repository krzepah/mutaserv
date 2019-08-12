const Sequelize = require('sequelize');
const process = require('process');
const logger = require('./logger');

const logging = process.env.DB_VERBOSE !== 'true' ? false : (msg) => logger.info(msg);

const database = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD, {
		logging,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT ? process.env.DB_DIALECT : 'sqlite',
		pool: {
			max: 5,
			min: 0,
			idle: 10000
		},
		storage: process.env.DB_PAH
	}
);

module.exports = database;
