# ducen-auto-query

Wrapper to make predefined consults and querys with mysql2 driver to MySQL

```js
const autoQuery = requiere('ducen-auto-query');

//database data to connect
databaseConfig = {
	host: 'localhost',
	user: 'me',
	password: 'secret',
	database: 'my_db',
};

// this function return a Consulter class object with the methods to consult
const consulter = autoQuery(databaseConfig);
async function main() {
	// get a list of objects with the data of the table
	// (model of the table, config options)
	let users = await consulter.list('users', {
		fields: 'id,name',
		limit: '15',
		offset: '20',
		oder: 'asc',
		orderField: 'id',
	});

	//get one row
	// (model of the table, id of the object)
	let user = await consulter.get('users', '3');

	//get a list of objects filterd by a regist of one table used as foreign key
	// (model of the table, id of the key, model of the table to consult, config options)
	let post = await consulter.filter('users', '3', 'posts', {
		fields: 'id,name',
		limit: '15',
		oder: 'asc',
		orderField: 'id',
	});

	//insert a new regist on the database
	// (model of the table, the newData)
	let newUser = {
		name: 'Ryan',
		nickname: 'Dark',
		age: '22',
	};
	let createData = await consulter.insert('users', newUser);

	//insert an array of elements
	// (model of the table, array of elements)
	let newPosts = [{ content: 'this is an post' }, { content: 'this is an post' }, { content: 'this is an post' }];
	let insertData = await consulter.insertMany('post', newPosts);

	// update the data of one regist
	// (model of the table, id of the regist, data to update)
	let updateUser = {
		name: 'Alan',
		age: '23',
	};
	let upsertedData = await consulter.upsert('users', createData.insertId, updateUser);

	//delete an especific elemet
	//(model of the table, id of the object)
	let deleteData = await consulter.remove('users', '6');

	//execute
}
```

## Config object

On the consults of data can pass an object with some params to modificate the consult, the params are the followers:

-   **fields**: Those are the fields that you want recive (default \* all), is an string with the fields separates by a comma
-   **limit**: The total records that you want (default 50), useless on get consult
-   **order**: The way to order the array of data (default asc), usless on get consult
-   **orderField**: The field that work as order key (default id), useless on get consult
-   **offset**: The number of regist that start to select (default 0), useless on get consult
-   (**field**): You can also pass a property with the name of one field on the table to filter by that field
-   (**before-field**): You can also pass a property with the name of one field on the table prefixed to "before" to filter al values above that field
-   (**after-field**): You can also pass a property with the name of one field on the table prefixed to "before" to filter al values below that field

## List

The function to list on one array the data of one table

-   **model**: The model of the table
-   **options**: The options object to config the consult

```js
let users = await consulter.list('users', {
	fields: 'id,name',
	limit: '15',
	offset: '20',
	oder: 'asc',
	orderField: 'id',
});
```
