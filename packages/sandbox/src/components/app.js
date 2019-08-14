import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for routes
import List from '../routes/list';
import Login from '../routes/login';
import Sign from '../routes/sign';

import { Provider } from 'unistore/preact';

import store from '../store';

// eslint-disable-next-line
export default class App extends Component {
	
	/** Gets fired when the route changes.
	 *	@param {Object} event	"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<Provider store={store}>
				<div id="app">
					<Header />
					<Router onChange={this.handleRoute}>
						<List path="/" />
						<Login path="/login" />
						<Sign path="/sign" />
					</Router>
				</div>
			</Provider>
		);
	}
}
