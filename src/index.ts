import logger from 'ducenlogger';
import { createPool, PoolOptions, Pool } from 'mysql2/promise';
import { createNamespace, getNamespace } from 'continuation-local-storage';

import { Query } from './query';

/**
 *
 */
export class Consulter {
	protected connection: Pool | null;
	protected query: Query;

	constructor(database?: PoolOptions) {
		if (database) {
			try {
				this.connection = createPool(database);
				logger.log(`connected to ${database.database}`, { type: 'database', color: 'system' });
			} catch (error) {
				logger.log('Error on database connection', { color: 'error', type: 'error' });
				throw new Error('Error on database connection');
			}
		} else {
			this.connection = null;
		}
		this.query = new Query();
	}

	public async endConnection(): Promise<void> {
		await this.connection?.end();
		logger.log(`connection closed`, { type: 'database', color: 'system' });
	}

	/**
	 * Return the connection to the database
	 */
	protected getConnection(): any {
		return this.connection;
	}

	/**
	 * This function get all of the elements on the table
	 * @param model  model of the table
	 * @param query paramaters to modify the consult
	 * ```
	 * query:{fields:'id', limit:50, offset:0, order:'asc', orderField:'id'}
	 * ```
	 */
	public async list(model: string, options?: any): Promise<any> {
		let sql = this.query.selectSQL(options, model);
		try {
			let data = await this.getConnection().query(sql);
			let response = JSON.parse(JSON.stringify(data[0]));
			return response;
		} catch (error) {
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			if (error.code === 'ER_NO_SUCH_TABLE') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_TABLE_ERROR');
			}
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * This function return the object especified if exist
	 * @param model model of the table
	 * @param id id of the register in the table
	 * @param query paramaters to modify the consult
	 * ```javascript
	 *- query:{
	 *-      fields:'id',
	 *-      limit:50,
	 *-      offset:0,
	 *-      order:'asc',
	 *-      orderField:'id'
	 *- }
	 * ```
	 */
	public async get(model: string, id: string | number, query?: any): Promise<any> {
		try {
			let sql = this.query.selectSQLOne(id, model, query);
			let data = await this.getConnection().query(sql);
			if (!data[0][0]) return null;
			let response = JSON.parse(JSON.stringify(data[0][0]));
			return response;
		} catch (error) {
			console.log(id);
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			throw new Error(`Error en conexion a la BD, error: ${error}`);
		}
	}

	/**
	 * This function return a collection of objects filtered by other entity on the database
	 * @param model model of the table
	 * @param id id of register in the table
	 * @param other model of the other entity
	 * @param query parameters to modify the consult
	 * ```
	 * query:{fields:'id', limit:50, offset:0, order:'asc', orderField:'id'}
	 * ```
	 */
	public async filter(model: string, id: string | number, other: string, query: any): Promise<any> {
		let sql = this.query.selectByFilter(other, model, id, query);
		try {
			let data = await this.getConnection().query(sql);
			return data[0];
		} catch (error) {
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * This function create a new register in the bd
	 * @param model model of the table
	 * @param object the new object to introduce in the db
	 */
	public async insert(model: string, object: any): Promise<any> {
		try {
			let inserted = await this.getConnection().query(`INSERT INTO ${model} set ?`, [object]);
			return inserted[0];
		} catch (error) {
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_ROW_2') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * Insert an array of objects on a table
	 * @param model the table to insert
	 * @param array the object of the data
	 */
	public async insertMany(model: string, array: any): Promise<any> {
		try {
			let arrVals: any[] = [];
			array.forEach((element: any) => {
				arrVals.push(Object.values(element));
			});
			let fields = this.query.makeInsert(array[0]);
			let inserted = await this.getConnection().query(`INSERT INTO ${model} (${fields}) VALUES ?`, [arrVals]);
			return inserted[0];
		} catch (error) {
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_ROW_2') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * This function update a register in the bd
	 * @param model model of the table
	 * @param id id of the register in the table
	 * @param object object to update in the db
	 */
	public async upsert(model: string, id: string | number, object: any): Promise<any> {
		try {
			let updated = await this.getConnection().query(`UPDATE ${model} set ? WHERE id = ?`, [object, id]);
			return updated[0];
		} catch (error) {
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_ROW_2') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * This function delete a register from de bd
	 * @param model model of the table
	 * @param id id of the register
	 */
	public async remove(model: string, id: string | number) {
		try {
			let deleted = await this.getConnection().query(`DELETE FROM ${model} WHERE id = ? `, [id]);
			return deleted;
		} catch (error) {
			logger.log(error, { type: 'error', color: 'error' });
			throw new Error(`Error on delete of the database`);
		}
	}

	/**
	 * Execute a custom SQL sentence
	 * @param {string} sql SQL sentence to execute
	 */
	public async execute(sql: string): Promise<any> {
		try {
			logger.log(sql, { type: 'database', color: 'system' });
			let data = await this.getConnection().query(sql);
			return data[0];
		} catch (error) {
			if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
				logger.log(error, { type: 'error', color: 'error' });
				throw new Error('BD_SYNTAX_ERROR');
			}
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * This function return the total count of register in a table
	 * @param model model of the table
	 */
	public async count(model: string): Promise<string> {
		try {
			let count = await this.getConnection().query(`SELECT COUNT(id) as total FROM ${model}`);
			let total = count[0][0].total;
			return total;
		} catch (error) {
			logger.log(error, { type: 'error', color: 'error' });
			throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
		}
	}

	/**
	 * This function return the count of all register related to other table
	 * @param model the model of the table
	 * @param id the id of the register
	 * @param other the other table
	 */
	public async filterCount(model: string, id: string | number, other: string): Promise<any> {
		try {
			let count = await this.getConnection().query(`SELECT COUNT(id) as total FROM ${other} WHERE ${model}_id = ${id}`);
			let total = count[0][0].total;
			return total;
		} catch (error) {
			logger.log(error, { type: 'error', color: 'error' });
			throw new Error(`Error en conexion db.connection la BD, error: ${other}`);
		}
	}
}

/**
 * Extended class that make sure your connections to diferents tenant databases
 */
export class MultiTenantConsulter extends Consulter {
	/** the pool of connections to the databases */
	private tenantPool: any = {};
	/** data to the connection to server */
	private options: PoolOptions;

	constructor(options: PoolOptions) {
		super();
		this.options = options;
	}

	/**
	 * Get the correspondent tenant to the client
	 * @param tenant ID of the tenant
	 */
	private setTenant(tenant: string): any {
		let con = this.tenantPool[tenant];
		if (con) {
			return con;
		}
		try {
			this.options.database = tenant;
			con = createPool(this.options);
			logger.log(`connected to ${this.options.database}`, { type: 'database', color: 'system' });
			this.tenantPool[tenant] = con;
		} catch (error) {
			logger.log('Error on database connection', { color: 'error', type: 'error' });
			throw new Error('Error on database connection');
		}

		return con;
	}

	public getConnection(): any {
		const nameSpace = getNamespace('unique context');
		const con = nameSpace.get('connection');
		if (!con) {
			logger.log('Connection is not defined for any tenant database', { color: 'error', type: 'error' });
			throw new Error('Connection is not defined for any tenant database');
		}
		return con;
	}

	/**
	 * Middleware to express to handle the thread tenant work
	 * @param req request
	 * @param _res response
	 * @param next next function
	 */
	public resolveTenant(req: any, _res: any, next: Function): any {
		let tenant = req.headers['tenant-id'];
		let nameSpace = createNamespace('unique context');
		nameSpace.run(() => {
			nameSpace.set('connection', this.setTenant(tenant)); // This will set the knex instance to the 'connection'
			next();
		});
	}

	public async endConnection(): Promise<void> {
		try {
			for (const key in this.tenantPool) {
				await this.tenantPool[key].end();
				logger.log(`connection closed to ${key} database`, { type: 'database', color: 'system' });
			}
		} catch (error) {
			logger.log('Error closing the connections', { color: 'error', type: 'error' });
			throw new Error('Error closing the connections');
		}
	}
}

export default (database: PoolOptions) => new Consulter(database);
