#!/usr/bin/env node

const sade = require('sade');
const process = require('process');
const pjson = require('./package.json');
const path = require('path');

const prog = sade(pjson.name);

const port = (pjson, dest) => dest.port ? dest.port : pjson.mutaserv.port ? pjson.mutaserv.port : 9000;
const mutations = (pjson, dest) => {
	if (dest.mutations || dest.m)
		return dest.mutations || dest.m;
	else if (pjson.mutaserv.mutations)
		return pjson.mutaserv.mutations;
	process.stdout.write('WARNING : loaded example mutations\n');
	return path.dirname(require.main.filename) + '/example.js';
};
 
prog
	.version(pjson.version);

prog
	.command('run')
	.describe('Serves a mutation file.')
	.option('-p, --port', 'Change the default port', undefined)
	.option('-m, --muts', 'Change the default muts', undefined)
	.option('-c, --config', 'Provide path to custom package.json', 'package.json')
	.example('run')
	.action((dest, opts) => {
		process.stdout.write(
			'Mutaserv ' +
			pjson.version +
			' starting on port ' +
			port(pjson, dest) +
			'\n'
		);
		process.env.NODE_ENV = 'development';
		process.env.MUTATIONS = mutations(pjson, dest);
		const app = require('./api');
		app.listen(port(pjson, dest), err => {
			if (err) throw err;
		});
	});

prog.parse(process.argv);
