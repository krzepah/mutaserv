export default (host, store) => {
	let authenticated = false;
	const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
	const _w = (f, b) => typeof(window) !== 'undefined' ? f() : b;
	const req = (endpoint, method, s, f, e) => (
		params, onSuccess, onFailure, onError
	) => fetch(host + endpoint, {
		headers, method, body: JSON.stringify(params)
	}).then( res => res.json() ).then( res => {
		res.failure ? onFailure ? onFailure(res) : null : onSuccess ? onSuccess(res) : null;
		res.failure ? f ? f(res) : null : s ? s(res) : null;
	}).catch( err => { e(err); onError(err); });
	return ({
		sync: (ws) => {
			let delay = 100; let applying = false; let unsynced = [];
			store = ws;
			const sync = () => {
				if (!applying && authenticated) {
					applying = true; setTimeout( () => req('/user/mutate', 'POST', (success) => {
						unsynced = []; delay = 100; applying = false;
					}, (failure) => {}, (error) => { delay += 10000; })(
						{ token: store.state.token, unsynced }), delay);
				}
			};
			ws.subscribe((state, action, update, params) => {
				if (state && typeof(action) === 'string' && params && !params.mutasync) {
					unsynced.push([action, params]);
					_w(() => localStorage.setItem('unsynced', JSON.stringify(unsynced)));
					_w(() => localStorage.setItem('saved', JSON.stringify(state)));
					sync();
				}
			});
		},
		login: req('/user/login', 'POST', (success) => store.setState({ ...success, mutasync: true })),
		sign: req('/user/sign', 'POST', (success) => store.setState({ ...success, mutasync: true })),
		logout: () => { }
	});
};
