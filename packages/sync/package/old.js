const JSON_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json'
};

/**
 * Constructs a sync object which contains all the API methods.
 * @param destination is an object in the form {
 *	'host': 'host-endpoint',
 * }
 * @param v is a function that should check wether the user is authenticated.
 *
 * @example
 * const SYNC = sync({
 *   host: 'your-server-endpoint'
 * })
 */
const sync = (destination, v=(state) => state.token) => {
	let unsynced = [];
	let applying = false;
	let delay = 100;

	const errorHandler = (err) => {
		// TODO : invalid token
		delay += 10000;
	};

	/**
	 * Retrieve state from localStorage (Should be used when your master <app> has loaded)
	 * @example
	 * SYNC.retrieveLocal()
	 */
	const retrieveLocal = () => {
		if (typeof window !== 'undefined')
			return JSON.parse(localStorage.getItem(
				destination.app ? destination.app : 'saved'
			));
	};

	/**
	 * Clears state from localStorage (For your logout button)
	 * @param dflt is how the default state should like
	 * @example
	 * SYNC.clearLocal({})
	 */
	const clearLocal = (dflt) => {
		if (typeof window !== 'undefined')
			localStorage.setItem(
				destination.app ? destination.app : 'saved',
				JSON.stringify(dflt)
			);
	};
	
	/**
	 * Sends state update, saves it in localeStorage
	 * @param state is the new current state
	 * @param action is the action that triggered the update
	 * @example
	 * store.suscribe(SYNC.apply)
	 */
	const apply = (state, action) => {
		if (action !== undefined && action.sync != false)
			unsynced.push(action);
		if (typeof window !== 'undefined')
			localStorage.setItem('saved', JSON.stringify(state));
		if (v(state) && (action && action.sync != false)) {
			if (!applying) {
				applying = true;
				setTimeout( () => {
					fetch(destination.host + '/user/mutate', {
						headers: JSON_HEADERS,
						method: 'POST',
						body: JSON.stringify({
							token: state.token,
							actions: unsynced,
							...(destination.app ? {
								...{ app: destination.app }
							} : null)
						})
					})
						.then( (res) => res.json() )
						.then( (res) => {
							unsynced = [];
							delay = 100;
							applying = false;
						})
						.catch( (err) => errorHandler );
				}, delay);
			}
		}
	};

	/**
	 *  Authenticate function, still need to .then and .catch it
	 *  @param username
	 *  @param password
	 */
	const auth = (username, password) => fetch(
		destination.host + '/user/login', {
			headers: JSON_HEADERS,
			method: 'POST',
			body: JSON.stringify({
				email: username,
				...password,
				...(destination.app ? {
					...{ app: destination.app }
				} : null)
			})
		});

	return {
		apply,
		auth,
		retrieveLocal,
		clearLocal
	};
};

export default sync;
