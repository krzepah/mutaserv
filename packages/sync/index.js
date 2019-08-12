const headers = {
	Accept: 'application/json',
	'Content-Type': 'application/json'
};

export default (host, defaults) => {
	let unsynced = [];
	let applying = false;
	let delay = 100;

	const auth = store => ({
		login: ({ user }) => ({ user }),
		logout: () => ({ user: { } })
	});

	const errorHandler = err => { delay += 10000; };

	/**
	 * Should be set in a store.subscribe.
	 * Saves state using storage and batch update
	 */
	const listen = (state, action, params) => {
		if (state && typeof(action) === 'string' && params) {
			unsynced.push([action, params]);
			if (!applying) {
				applying = true;
				setTimeout( () => {
					console.log('fetching...');
					fetch(host + '/user/mutate', {
						headers,
						method: 'POST',
						body: JSON.stringify({ token: state.token, actions: unsynced })
					})
						.then( (res) => res.json() ).then( (res) => {
							unsynced = [];
							delay = 100;
							applying = false;
						})
						.catch( (err) => errorHandler );
				}, delay);
			}
		}
	};

	return {
		retrieveLocal: () => {},
		clearLocal: () => {},
		auth,
		listen
	};
};
