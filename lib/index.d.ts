import { PoolOptions } from 'mysql2/promise';
import { Query } from './query';
/**
 *
 */
export declare class Consulter {
    protected connection: any;
    protected query: Query;
    constructor(database?: PoolOptions);
    /**
     * Return the connection to the database
     */
    protected getConnection(): any;
    /**
     * This function get all of the elements on the table
     * @param model  model of the table
     * @param query paramaters to modify the consult
     * ```
     * query:{fields:'id', limit:50, offset:0, order:'asc', orderField:'id'}
     * ```
     */
    list(model: string, options?: any): Promise<any>;
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
    get(model: string, id: string | number, query: any): Promise<any>;
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
    filter(model: string, id: string | number, other: string, query: any): Promise<any>;
    /**
     * This function create a new register in the bd
     * @param model model of the table
     * @param object the new object to introduce in the db
     */
    insert(model: string, object: any): Promise<any>;
    /**
     * Insert an array of objects on a table
     * @param model the table to insert
     * @param array the object of the data
     */
    insertMany(model: string, array: any): Promise<any>;
    /**
     * This function update a register in the bd
     * @param model model of the table
     * @param id id of the register in the table
     * @param object object to update in the db
     */
    upsert(model: string, id: string | number, object: any): Promise<any>;
    /**
     * This function delete a register from de bd
     * @param model model of the table
     * @param id id of the register
     */
    remove(model: string, id: string | number): Promise<any>;
    /**
     * Execute a custom SQL sentence
     * @param {string} sql SQL sentence to execute
     */
    execute(sql: string): Promise<any>;
    /**
     * This function return the total count of register in a table
     * @param model model of the table
     */
    count(model: string): Promise<string>;
    /**
     * This function return the count of all register related to other table
     * @param model the model of the table
     * @param id the id of the register
     * @param other the other table
     */
    filterCount(model: string, id: string | number, other: string): Promise<any>;
}
/**
 * Extended class that make sure your connections to diferents tenant databases
 */
export declare class MultiTenantConsulter extends Consulter {
    /** the pool of connections to the databases */
    private tenantPool;
    /** data to the connection to server */
    private options;
    constructor(options: PoolOptions);
    /**
     * Get the correspondent tenant to the client
     * @param tenant ID of the tenant
     */
    private setTenant;
    getConnection(): any;
    /**
     * Middleware to express to handle the thread tenant work
     * @param req request
     * @param _res response
     * @param next next function
     */
    resolveTenant(req: any, _res: any, next: any): any;
}
declare const _default: (database: PoolOptions) => Consulter;
export default _default;
