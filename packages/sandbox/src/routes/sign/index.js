import { route } from 'preact-router';
import { h, Component } from 'preact';
import linkState from 'linkstate';
import style from './style';

import { connect } from 'unistore/preact';

import worker from '../../worker';
const { sync } = worker;

class AuthBase extends Component {
	sign = e => {
		e.preventDefault();
		sync.sign(
			{ ...this.state },
			(success) => { route('/'); },
			(failure) => this.setState(failure),
			(error) => this.setState(error)
		);
	}

	render = ({}, { username, password, verification }) => (
		<form class={style.auth} onSubmit={this.sign}>
			<label for="username">Username</label>{' '}
			<input id="username" placeholder="Username" type="text" onInput={linkState(this, 'username')} />
			<br />
			<br />
			<label for="password">Password</label>{' '}
			<input id="password" placeholder="Password" type="password" onInput={linkState(this, 'password')} />
			<br />
			<br />
			<label for="verification">Verification</label>{' '}
			<input id="verification" placeholder="Verification" type="password" onInput={linkState(this, 'verification')} />
			<hr />
			<button>Submit</button>
			<br />
			<br />
			{ this.state.failure }
			{ this.state.error }
		</form>
	)
}

const Auth = connect(
	(state, props) => state,
	(state, props) => ({})
)(AuthBase);

export default Auth;
