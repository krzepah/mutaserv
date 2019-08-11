#!/usr/bin/env node

const { path, reduce, concat, map } = require('ramda');
const sade = require('sade');
const process = require('process');
const pjson = require('../package.json');
const pathUtil = require('path');

const concatAll = reduce(concat, []);

const prog = sade(pjson.name);
prog.version(pjson.version);

// some utils
// Paths taken from a configuration file should be relative to it
const bindPathToConfigPath = (val) => pathUtil.resolve(process.env.CONF.replace('package.json', ''), val);

let CONFIG = { log: {}, db: {} };
let LOGGER = console;
const standardOptions = [
	['--skip', 'Skip any configuration file', false],
	// Very first option, as other options require config file to be loaded
	['-c --conf', 'Which config file should be loaded', './package.json', {
		setup: (opts) => {
			const load = (path) => {
				CONFIG = require(path).mutaserv;
				process.env.CONF = path;
			};
			if (opts.skip) return;
			try {
				if (opts.conf) load(pathUtil.resolve(process.cwd(), opts.conf));
				else if (process.env.CONF) load(process.env.CONF);
				else load(pathUtil.resolve(process.cwd(), 'package.json'));
			}
			catch (err) {
				console.error('Couldn\'t find a configuration file !');
			}
		}
	}],
	['-d --reducers', 'Which reducer should be loaded', 'example.js', {
		generic: { config: bindPathToConfigPath },
		action: (opts) => { LOGGER.info('Loading reducers from: ' + process.env.REDUCERS); }
	}]
];

const logOptions = [
	['--log.path', 'Log file path', './mutaserv.log', {
		generic: { config: bindPathToConfigPath },
		afterSetup: (val) => {
			LOGGER = require('./config/logger');
		}
	}],
	['--log.nostdout', 'If log should be displayed in stdout', false],
	['--log.config', 'Log loaded configuration', true, {
		action: () => { LOGGER.info('Loaded with configuration found at : ' + process.env.CONF); }
	}],
	['--log.args', 'Log loaded args', false, {
		action: (opts) => { LOGGER.info('Started with following args : ' + JSON.stringify(opts)); }
	}],
	['--log.env', 'Log env', false, {
		action: (opts) => { LOGGER.info('Loaded env is : ' + JSON.stringify(process.env)); }
	}],
	['--log.nocolor', 'If colors shouldn\'t be used', false],
	['--log.reducers', 'If reducers should be logged on start', false]
];

const dbOptions = [
	['--db.verbose', 'Database verbosity', false],
	['--db.dialect', 'Database dialect', 'sqlite'],
	['--db.path', 'Sqlite path', './mutaserv.db'],
	['--db.host', 'Database host', 'localhost'],
	['--db.name', 'Database name', 'mutaserv'],
	['--db.username', 'Database username'],
	['--db.password', 'Database password']
];

const serverOptions = [
	['-p --port', 'Which port should be used', 9000],
	['-s --serve', 'Serves folder', false],
	['-r --reload', 'Reload reducers on change', true]
];

const commands = {
	run: {
		key: 'run',
		description: 'Serves reducers',
		options: concatAll([
			standardOptions,
			serverOptions,
			logOptions,
			dbOptions
		]),
		action: (opts) => {
			const server = require('./server');
			server.listen(process.env.PORT, err => {
				LOGGER.info('Mutaserv ' + pjson.version + ' starting on port ' + process.env.PORT);
				if (err) throw err;
			});

		}
	},
	format: {
		key: 'format',
		description: 'Formats and displays reducer',
		options: concatAll([
			standardOptions
		]),
		action: (opts) => {
			//eslint-disable-next-line
			console.log('\n' + require('./formater')(process.env.REDUCERS));
		}
	},
	env: {
		key: 'env',
		description: 'displays how env is setup',
		options: concatAll([
			standardOptions,
			serverOptions,
			logOptions,
			dbOptions
		]),
		action: (opts) => {
			//eslint-disable-next-line
			console.log(process.env);
		}
	}
};

map(
	(command) => {
		let com = prog.command(command.key);
		com.describe(command.description);
		// loads options
		map(
			(option) => {
				// defaults are attributed manually
				com.option(
					option[0],
					option[1] + ' ' + (option.length > 2 ? '  (default: ' + option[2] + ')' : '')
				);
			},
			command.options
		);
		
		// run opts and config over specified options and command and calls command's action
		com.action((opts) => {
			// currently, there is no other way to retrieve "command" here
			let command = process.argv[2];
			if (commands[command] === undefined) {
				//eslint-disable-next-line
				console.log('Command does not exists; ./mutaserv -h for help');
				process.exit(1);
			}
			// some option can trigger actions ran after env setup
			let actors = [];
			// Sets up options in env taking params by priority : opts > conf > env
			map(
				(option) => {
					// for special cases, we can define a custom setup ! afterSetup etc... not called !
					if (option.length >= 4 && option[3].setup) option[3].setup(opts);
					else {
						// otherwhise apply the generic
						// retrieve absoluteSpecifier (eg : "-d --reducers" becomes "reducers")
						let absoluteSpecifier = option[0].split(' ').pop().replace('--', '');
						// absoluteSpecifier is transformed for env usage (eg log.path -> LOG_PATH)
						let envKey = absoluteSpecifier.toUpperCase().replace('.', '_');
						// val is scoped here to be accessible by afterSetup
						let val;
						if (opts[absoluteSpecifier]) {
							// Checks if it exists in OPTS,
							val = opts[absoluteSpecifier];
							// apply generic.opts if it exists
							if (option.length >= 4 && path('generic.opts'.split('.'), option[3]))
								val = option[3].generic.opts(val);
							process.env[envKey] = val;
						}
						else if (path(absoluteSpecifier.split('.'), CONFIG)) {
							// Checks if it exists in CONFIG,
							// dot access is resolved using path, (eg : log configuration are stored in "log" object)
							val = path(absoluteSpecifier.split('.'), CONFIG);
							// apply generic.config if it exists
							if (option.length >= 4 && path('generic.config'.split('.'), option[3]))
								val = option[3].generic.config(val);
							process.env[envKey] = val;
						}
						else
							process.env[envKey] = val = option[2]; // default
						// call .afterSetup
						if (option.length >= 4 && option[3].afterSetup)
							option[3].afterSetup(val);
						// if called option has an .action, register it
						if (option.length >= 4 && option[3].action && process.env[envKey] !== 'false')
							actors.push(option[3].action);
					}
				},
				commands[command].options
			);
			// call registered actors
			map((actor) => actor(opts), actors);
			// and finally call the action
			commands[command].action(opts);
		});
	},
	commands
);

prog.parse(process.argv);
