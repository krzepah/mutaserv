const Sequelize = require('sequelize');
const bcryptService = require('./services/bcrypt');
const sequelize = require('./config/database');

const hooks = {
	beforeCreate(user) {
		user.password = bcryptService().password(user); // eslint-disable-line no-param-reassign
	}
};

const User = sequelize.define('User', {
	email: { type: Sequelize.STRING, unique: true },
	password: { type: Sequelize.STRING },
	data: { type: Sequelize.STRING }
}, { hooks, tableName: 'users' });

// eslint-disable-next-line
User.prototype.toJSON = function () {
	const values = Object.assign({}, this.get());

	delete values.password;
	delete values.data;

	return values;
};

module.exports = User;
