#!/usr/bin/env node

const sade = require('sade');
const process = require('process');
const pjson = require('./package.json');
const path = require('path');

const prog = sade(pjson.name);

const port = (cpjson, dest) => dest.port ? dest.port : cpjson.port ? cpjson.port : 9000;
const mutations = (cpjson, dest) => {
	if (dest.mutations || dest.m)
		return path.resolve(process.cwd(), dest.mutations || dest.m);
	else if (cpjson.mutations)
		return path.resolve(process.cwd(), cpjson.mutations);
	process.stdout.write('WARNING : loaded example mutations\n');
	return path.resolve(path.dirname(require.main.filename), './example.js');
};
 
prog
	.version(pjson.version);

prog
	.command('run')
	.describe('Serves a mutation file.')
	.option('-p, --port', 'Change the default port', undefined)
	.option('-m, --muts', 'Change the default muts', undefined)
	.option('-c, --conf', 'Provide path to custom package.json', 'package.json')
	.example('run')
	.action((dest, opts) => {
		const cpjson = require(path.resolve(process.cwd(), dest.conf)).mutaserv;
		process.stdout.write('Mutaserv ' + pjson.version + ' starting on port ' + port(cpjson, dest) + '\n');
		process.env.NODE_ENV = 'development';
		process.env.MUTATIONS = mutations(cpjson, dest);
		const app = require('./api');
		app.listen(port(cpjson, dest), err => {
			if (err) throw err;
		});
	});

prog.parse(process.argv);
