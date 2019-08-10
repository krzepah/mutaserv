const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const ramda = require('ramda');
const fs = require('fs');
const requireFromString = require('require-from-string');
const process = require('process');
const logger = require('./config/logger');
const watcher = require('@parcel/watcher');

const formater = (mem) => ({
	ImportDeclaration: (node) => {
		mem.imports.push(node);
	},
	VariableDeclaration: (node) => {
		mem.variables.push(node);
		if (node.declarations[0].id.name === 'store')
			mem.store = node.declarations[0].init.arguments[0];
	},
	ExpressionStatement: (node) => {
		if (node.expression.callee.property.loc.identifierName === 'registerActions')
			mem.actions.push(node.expression.arguments[0].body);
	},
	ExportDefaultDeclaration: (node) => {}
});

const format = (path) => {
	let contents;
	try {
		contents = fs.readFileSync(path, 'utf8');
	}
	catch (err) {
		logger.error(err);
		process.exit(1);
	}
	const ast = parse(contents, { sourceType: 'module' });
	const out = Object.assign(ast);
	const mem = { imports: [], variables: [], actions: [] };

	out.program.body = ramda.map(
		(node) => {
			try {
				return formater(mem)[node.type](node);
			}
			catch (err) {
				//eslint-disable-next-line
				console.log(err, node.type);
			}
		}, out.program.body
	);

	let imports = [];
	ramda.map(
		(node) => {
			if (node.source.value === 'ramda') {
				let identifiers = [];
				if (node.specifiers.length) {
					identifiers = ramda.filter(
						(e) => e !== undefined,
						ramda.map(
							(ident) => {
								if (ident.imported)
									return ident.imported.loc.identifierName;
							},
							node.specifiers
						)
					);
					if (identifiers.length)
						imports.push([
							'{ ' + identifiers.join(', ') + ' }',
							node.source.value
						]);
				}
				if (!identifiers.length) {
					imports.pushd([
						node.source.value,
						node.source.value
					]);
				}
			}
		},
		mem.imports
	);

	// let output = generate(out, { shouldPrintComment: () => false }).code;
	return (
		'module.exports = (' + ramda.map((e) => e[0], imports).join(', ') + ') => ({\n' +
		'  defaults: ' + generate(mem.store)
			.code.split('\n')
			.join('\n  ') +
			',\n' +
			'  mutations: {' +
		ramda.map(
			(action) => generate(action)
				.code.split('\n')
				.join('\n  ')
				.substr(1)
				.slice(0, -1),
			mem.actions
		).join(',') +
		'}\n});'
	);
};

let mod = null;
const doLoad = (path) => {
	let stringMod = '';
	try {
		stringMod = format(path);
		mod = requireFromString(stringMod)(ramda);
	}
	catch (err) {
		//eslint-disable-next-line
		console.log(err);
	}
	logger.info('Loading reducers from ' + process.env.REDUCERS);
	if (process.env.LOGS_REDUCERS)
		logger.info(
			'Loaded mutations : \n' +
			stringMod
		);
	if (process.env.DISPLAY_REDUCERS) {
		//eslint-disable-next-line
		console.log('Loaded mutations : \n' + stringMod);
	}
};

/**
 * Watches path for changes
 *  - Loads the new module internally
 *  - Calls listener with the new module
 */
const load = (path, listener) => {
	let mutationFolder;
	if (path.substr(-3) === '.js') {
		mutationFolder = path.split('/');
		mutationFolder.pop();
		mutationFolder = mutationFolder.join('/');
	}
	if (process.env.RELOAD) {
		logger.info('Watching : ' + mutationFolder);
		watcher.subscribe(mutationFolder, (err, events) => {
			if (process.env.RELOAD) {
				logger.info('Mutation folder got updated');
				doLoad(process.env.REDUCERS);
				listener(mod);
			}
		});
	}
	doLoad(path);
	return mod;
};

module.exports = {
	load,
	format
};
