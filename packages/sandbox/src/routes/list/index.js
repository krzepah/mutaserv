import { h } from 'preact';
import style from './style';

import { map } from 'ramda';
import { connect } from 'unistore/preact';

const ListBase = ({ elements, elementsIds, add }) => (
	<div class={style.list}>
		<h1>Hello,</h1>
		<h4>An example to-do app with <a href="https://github.com/krzepah/mutaserv">mutaserv</a> & <a href="https://github.com/krzepah/mutasync">mutasync</a></h4>
		<input id="input" />
		<button onClick={() => {
			const val = window.document.getElementById('input').value;
			window.document.getElementById('input').value = '';
			add({ text: val, newId: new Date().getTime() });
		}}>Add</button>
		<br />
		<ul>
			{ elementsIds ? map(
				( id ) => <li class={style.element}>{ elements[id].text }</li>,
				elementsIds
			) : null }
		</ul>
	</div>
);

const List = connect(
	(state, props) => state,
	(state, props) => ({
		add: 'newElement'
	})
)(ListBase);

export default List;
