const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const ramda = require('ramda');
const fs = require('fs');
const requireFromString = require('require-from-string');
const process = require('process');
const logger = require('./config/logger');

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
module.exports = () => {
	if (mod === null) {
		mod = requireFromString(load(process.env.MUTATIONS));
		logger.info('Loading mutations from ' + process.env.MUTATIONS);
		if (process.env.LOGS_MUTATIONS)
			logger.info('Loaded mutations are ' + mod);
	}
	return mod;
};
