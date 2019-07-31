const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const ramda = require('ramda');
const fs = require('fs');
const requireFromString = require('require-from-string');
const process = require('process');
const logger = require('./config/logger');
const watcher = require('@parcel/watcher');

const load = (path) => {
	let contents = fs.readFileSync(path, 'utf8');
	const ast = parse(contents, { sourceType: 'module' });

	const imports = ramda.map(
		(el) => el.imported.loc.identifierName,
		ast.program.body[0].specifiers
	);
	ast.program.body.shift();
	ast.program.body.pop();

	let out = Object.assign(ast);
	const output = generate(out, { shouldPrintComment: () => false });
	let result = output.code;
	result = result.replace(/ = /g, ': ');
	result = result.replace(';', ',');
	result = result.replace(';', '');
	result = result.replace(/const /g, '');
	result = (ramda.map((e) => '	' + e, result.split('\n'))).join('\n');
	return 'module.exports = ({ ' + imports.join(', ') + ' }) => ({\n' + result + '});\n';
};

let mod = null;

const doLoad = (path) => {
	mod = requireFromString(load(path));
	logger.info('Loading mutations from ' + process.env.MUTATIONS);
	if (process.env.LOGS_MUTATIONS)
		logger.info('Loaded mutations are ' + mod);
	if (process.env.DISPLAY_MUTATIONS) {
		//eslint-disable-next-line
		console.log(mod.toString());
	}
};
// path is passed as paramether for load command
module.exports = (path, listener) => {
	if (mod === null) {
		let mutationFolder = process.env.MUTATIONS;
		if (process.env.MUTATIONS.substr(-3) === '.js') {
			mutationFolder = process.env.MUTATIONS.split('/');
			mutationFolder.pop();
			mutationFolder = mutationFolder.join('/');
		}
		logger.info('Watching : ' + mutationFolder);
		watcher.subscribe(mutationFolder, (err, events) => {
			logger.info('Mutation folder got updated' + events);
			doLoad(process.env.MUTATIONS);
			listener(mod);
		});
		doLoad(path);
	}
	return mod;
};
