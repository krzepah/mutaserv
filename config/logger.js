const winston = require('winston');
const process = require('process');

const { combine, timestamp, label, printf, colorize } = winston.format;

//eslint-disable-next-line
const format = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

module.exports = winston.createLogger({
	format: combine(
		process.env.LOGS_COLOR !== 'false' ? colorize() : label({ }),
		label({ }),
		timestamp(),
		format
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: process.env.LOGS })
	]
});
