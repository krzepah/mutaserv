import { h } from 'preact';
import style from './style';

import { connect } from 'unistore/preact';

const AuthBase = ({ elements, elementsIds, add }) => (
	<form class={style.auth}>
		<label for="username">Username</label>{' '}
		<input id="username" placeholder="Username" type="text" />
		<br />
		<br />
		<label for="password">Password</label>{' '}
		<input id="password" placeholder="Password" type="password" />
		<hr />
		<button>Submit</button>
	</form>
);

const Auth = connect(
	(state, props) => state,
	(state, props) => ({ })
)(AuthBase);

export default Auth;
