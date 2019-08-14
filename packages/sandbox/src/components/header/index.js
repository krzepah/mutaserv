import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

const Header = () => (
	<header class={style.header}>
		<h1>Mutaserv</h1>
		<nav>
			<Link activeClassName={style.active} href="/">Home</Link>
			<Link activeClassName={style.active} href="/login">Login</Link>
			<Link activeClassName={style.active} href="/sign">Sign</Link>
		</nav>
	</header>
);

export default Header;
