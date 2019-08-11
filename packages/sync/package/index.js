export default (defaults) => ({
	auth: (store) => ({
		login: ({ user }) => ({ user }),
		logout: () => ({ user: { } })
	}),
	listen: (action, params) => {
		console.log('--', action, params);
	},
	retrieveLocal: () => {},
	clearLocal: () => {}
});
