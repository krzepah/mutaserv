#!/usr/bin/env node

const ramda = require('ramda');
const fs = require('fs');
const sade = require('sade');
const process = require('process');
const pjson = require('./package.json');
const path = require('path');

const prog = sade(pjson.name);

const port = (config, opts) => opts.port ? opts.port : config ? config.port ? config.port : 9000 : 9000;
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

prog
	.command('run')
	.describe('Serves a mutation file.')
	.option('-p, --port', 'Change the default port	(default 9000)', undefined)
	.option('-m, --muts', 'Change the default muts	(default example.js)', undefined)
	.option('-c, --conf', 'Provide path to custom package.json', 'package.json')
	.option('-e, --env', 'Logs used environement before starting the server', false)
	.option('-l, --logs', 'Change the default logging file	(default ./mutaserver.log)', undefined)
	.option('--nocolor', 'if logs shouldn\'t use colors', false)
	.option('--db.verbose', 'Database query verbosity	 (default false)', undefined)
	.option('--db.dialect', 'Database dialect	 (default sqlite)', undefined)
	.option('--db.host', 'Database host	 (default localhost)', undefined)
	.option('--db.path', 'Sqlite database path	(default ./mutaserv.db)', undefined)
	.option('--db.username', 'Database username	 (default mutaserv)', undefined)
	.option('--db.password', 'Database password	 (default mutaserv)', undefined)
	.example('run')
	.action((opts) => {
		let config = { database: { } };
		if (fs.existsSync(path.resolve(process.cwd(), opts.conf)))
			config = require(path.resolve(process.cwd(), opts.conf)).mutaserv;
		process.env.LOGS_COLOR = !(opts.nocolor);
		process.env.LOGS = opts.logs ?
			path.resolve(process.cwd(), opts.logs)
			: config && config.logs ?
				path.resolve(path.dirname(opts.c), config.logs)
				: path.resolve(process.cwd(), 'mutaserv.log');
		const logger = require('./config/logger');
		logger.info('Mutaserv ' + pjson.version + ' starting on port ' + port(config, opts));
		if (config === undefined)
			logger.warn('no configuration found in ' + opts.conf);

		const mutations = (config, opts) => {
			if (opts.mutations || opts.m) {
				return path.resolve(process.cwd(), opts.mutations || opts.m);
			}
			else if (config && config.mutations) {
				return path.resolve(path.dirname(opts.c), config.mutations);
			}
			logger.warn('loaded with example mutations (mutaserv run -h for help)');
			return path.resolve(path.dirname(require.main.filename), './example.js');
		};
		process.env.MUTATIONS = mutations(config, opts);

		ramda.map(([key, def]) => process.env['DB_' + key.toUpperCase()] = dbval(config, opts, key, def, 'db.'), [
			['verbose', false],
			['dialect', 'sqlite'],
			['host', 'mutaserv.db'],
			['username', 'mutaserv'],
			['password', 'mutaserv']
		]);
		process.env.DB_PATH = adbval(config, opts, 'path', path.resolve(process.cwd(), 'mutaserv.db'), 'db.');
		if (opts.e || opts.env) {
			// eslint-disable-next-line
			logger.info('env : ' + JSON.stringify(process.env, null, 4));
		}
		const app = require('./api');
		app.listen(port(config, opts), err => {
			if (err) throw err;
		});
	});

prog.parse(process.argv);
