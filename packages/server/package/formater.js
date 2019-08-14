const { reduce, concat, map, cond, pathEq, filter, T } = require('ramda');
const logger = require('./config/logger');
const generate = require('@babel/generator').default;
const { parse } = require('@babel/parser');
const fs = require('fs');

const getAst = (path) => {
	let contents;
	try {
		contents = fs.readFileSync(path, 'utf8');
		return parse(contents, { sourceType: 'module' }).program;
	}
	catch (err) {
		logger.error(err);
		process.exit(1);
	}
};

const createAST = (body, imports) => {
	let out = parse(
		'module.exports = ({ createStore, createSync }, { '
		+ reduce(concat, [])(map(
			e => map(a => a.local.name, e.specifiers),
			filter(pathEq(['source', 'value'], 'ramda'), imports)
		)).join(',')
		+ ' }) => { }', { sourceType: 'module' }).program;
	body.push({ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'store' } });
	out.body[0].expression.right.body.body = body;
	return out;
};

module.exports = (path) => {
	const ast = getAst(path);
	let imports = [];

	return generate(createAST(
		filter(
			e => e != undefined,
			map(
				cond([
					[pathEq(['type'], 'ImportDeclaration'), (e) => { imports.push(e); }],
					[pathEq(['type'], 'ExportDefaultDeclaration'), () => {}],
					[T, e => e]
				]),
				ast.body
			)
		),
		imports
	)).code;
};
