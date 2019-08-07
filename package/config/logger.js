const winston = require('winston');
const process = require('process');

const { combine, timestamp, label, printf, colorize } = winston.format;

//eslint-disable-next-line
const format = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

let transports = [];

if (process.env.LOGS_NOSTDOUT !== 'true')
	transports.push(new winston.transports.Console());
if (process.env.LOGS_PATH)
	transports.push(
		new winston.transports.File({ filename: process.env.LOGS_PATH })
	);

module.exports = winston.createLogger({
	format: combine(
		process.env.LOGS_COLOR === 'true' ? colorize() : label({ }),
		label({ }),
		timestamp(),
		format
	),
	transports
});
