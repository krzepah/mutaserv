const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt');
const sequelize = require('../../config/database');
const ramda = require('ramda');
const { defaults } = require(process.env.MUTATIONS)(ramda);

const hooks = {
	beforeCreate(user) {
		user.password = bcryptService().password(user); // eslint-disable-line no-param-reassign
	}
};

const tableName = 'users';

const User = sequelize.define('User', {
	email: {
		type: Sequelize.STRING,
		unique: true
	},
	password: {
		type: Sequelize.STRING
	},
	data: {
		type: Sequelize.STRING,
		defaultValue: JSON.stringify(defaults)
	}
}, { hooks, tableName });

// eslint-disable-next-line
User.prototype.toJSON = function () {
	const values = Object.assign({}, this.get());

	delete values.password;

	return values;
};

module.exports = User;
