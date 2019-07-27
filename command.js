#!/usr/bin/env node

const sade = require('sade');
const process = require('process');
const pjson = require('./package.json');

const prog = sade(pjson.name);

prog
	.version(pjson.version)
	.option('-c, --config', 'Provide path to custom package.json', 'package.json');

prog
	.command('run <src>')
	.describe('Serves a mutation file.')
	.option('-p, --port', 'Change the default port', '9000')
	.example('run src')
	.action((src, dest, opts) => {
		process.stdout.write('Starting mutaserv ' + pjson.version + ' on port ' + dest.port + '\n');
		process.env.NODE_ENV = 'development';
		process.env.MUTATIONS = src;
		const app = require('./api');
		app.listen(dest.port, err => {
			if (err) throw err;
		});
	});

prog.parse(process.argv);
