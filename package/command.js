#!/usr/bin/env node

const ramda = require('ramda');
const fs = require('fs');
const sade = require('sade');
const process = require('process');
const pjson = require('../package.json');
const path = require('path');

const prog = sade(pjson.name);

const dbval = (config, opts, key, def, prefix) => opts[prefix + key] ?
	opts[prefix + key]
	: config && config.database && config.database[key] ?
		config.database[key] : def;

const adbval = (config, opts, key, def, prefix) => opts[prefix + key] ?
	opts[prefix + key]
	: config && config.database && config.database[key] ?
		path.resolve(path.dirname(opts.c), config.database[key])
		: def;

prog
	.version(pjson.version);


const loadEnv = (opts) => {
	let config = { database: { }, log: { } };
	if (!opts.skip && fs.existsSync(path.resolve(process.cwd(), opts.conf)))
		config = require(path.resolve(process.cwd(), opts.conf)).mutaserv;
	else if (!opts.skip)
		config = require(process.env.MUTA_CONFIG);

	if (opts['log.mutations'])
		process.env.LOGS_MUTATIONS = opts['log.mutations'] !== true;
	else if (config && config.log && config.log.mutations != undefined)
		process.env.LOGS_MUTATIONS = config.log.mutations !== 'true' && !(config.log.mutations);
	else
		process.env.LOGS_MUTATIONS = false;

	if (opts['log.nocolor'])
		process.env.LOGS_COLOR = opts['log.nocolor'] !== true;
	else if (config && config.log && config.log.nocolor != undefined)
		process.env.LOGS_COLOR = config.log.nocolor !== 'true' && !(config.log.nocolor);
	else
		process.env.LOGS_COLOR = true;

	if (opts['log.nostdout'])
		process.env.LOGS_NOSTDOUT = opts['log.nostdout'];
	else if (config && config.log && config.log.nostdout != undefined)
		process.env.LOGS_NOSTDOUT = config.log.nostdout;
	else
		process.env.LOGS_NOSTDOUT = false;

	if (opts['log.path'])
		process.env.LOGS_PATH = path.resolve(process.cwd(), opts['log.path']);
	else if (config && config.log && config.log.path)
		process.env.LOGS_PATH = path.resolve(path.dirname(opts.c), config.log.path);
	else
		process.env.LOGS_PATH = path.resolve(process.cwd(), 'mutaserv.log');

	const logger = require('./config/logger');
	const port = (config, opts) => opts.port ?
		opts.port
		: config ?
			config.port ?
				config.port
				: 9000
			: 9000;
	logger.info(
		'Mutaserv ' + pjson.version + ' starting on port ' + port(config, opts)
	);
	logger.info('Logging into ' + process.env.LOGS_PATH);
	if (!opts.skip && config === undefined)
		logger.warn('No configuration found in ' + opts.conf);
	else if (opts.skip)
		logger.info('No configuration loaded');
	else if (opts['log.config'])
		logger.info('Loaded config : ' + JSON.stringify(config, null, 4));
	if (opts['log.args'])
		logger.info('Loaded with following args : ' + JSON.stringify(opts, null, 4));

	const mutations = (config, opts) => {
		if (opts.mutations || opts.m) {
			return path.resolve(process.cwd(), opts.mutations || opts.m);
		}
		else if (config && config.mutations) {
			return path.resolve(path.dirname(opts.c), config.mutations);
		}
		logger.warn('Loaded with test mutations (mutaserv run -h for help)');
		return path.resolve(path.dirname(require.main.filename), '../test/mutations.js');
	};
	process.env.MUTATIONS = mutations(config, opts);

	ramda.map(([key, def]) => process.env['DB_' + key.toUpperCase()] = dbval(
		config, opts, key, def, 'db.'
	), [
		['verbose', false],
		['dialect', 'sqlite'],
		['host', 'mutaserv.db'],
		['username', 'mutaserv'],
		['password', 'mutaserv']
	]);
	process.env.DB_PATH = adbval(config, opts, 'path', path.resolve(process.cwd(), 'mutaserv.db'), 'db.');
	if (opts.e || opts['log.env']) {
		// eslint-disable-next-line
		logger.info('env : ' + JSON.stringify(process.env, null, 4));
	}
	const app = require('./index');
	app.listen(port(config, opts), err => {
		if (err) throw err;
	});
};

prog
	.command('run')
	.describe('Serves a mutation file.')
	.option('-p, --port', 'Change the default port	(default 9000)')
	.option('-m, --muts', 'Change the default muts	(default example.js)')
	.option('-c, --conf', 'Provide path to custom package.json', 'package.json')
	.option('-s, --skip', 'Skip any config file')
	.option('-e --log.env', 'Logs used environement before starting the server', false)
	.option('--log.args', 'Log loaded args')
	.option('--log.config', 'Log loaded configuration on start')
	.option('--log.mutations', 'Logs the loaded mutations  (default false)')
	.option('--log.nostdout', 'If logs should\'t be displayed in stdout	 (default false)')
	.option('--log.nocolor', 'If logs shouldn\'t use colors	(default false)')
	.option('--log.path', 'Change the default logging file (default ./mutaserver.log)')
	.option('--db.verbose', 'Database verbosity	 (default false)')
	.option('--db.dialect', 'Database dialect	 (default sqlite)')
	.option('--db.host', 'Database host	 (default localhost)')
	.option('--db.path', 'Sqlite database path	(default ./mutaserv.db)')
	.option('--db.username', 'Database username	 (default mutaserv)')
	.option('--db.password', 'Database password	 (default mutaserv)')
	.example('run')
	.action((opts) => loadEnv(opts));

prog
	.command('load <src>')
	.describe('Shows how a mutation file is loaded')
	.option('--log.mutations', 'Logs the loaded mutations', false)
	.action((src, opts) => {
		process.env.DISPLAY_MUTATIONS = true;
		//eslint-disable-next-line
		const format = require('./mutations')(src)(ramda);
	});

prog.parse(process.argv);

module.exports = loadEnv;
