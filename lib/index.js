"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiTenantConsulter = exports.Consulter = void 0;
const ducenlogger_1 = __importDefault(require("ducenlogger"));
const promise_1 = require("mysql2/promise");
const continuation_local_storage_1 = require("continuation-local-storage");
const query_1 = require("./query");
/**
 *
 */
class Consulter {
    constructor(database) {
        if (database) {
            this.connection = promise_1.createPool(database);
            ducenlogger_1.default.log(`connected to ${database.database}`, { type: 'database', color: 'system' });
        }
        this.query = new query_1.Query();
    }
    /**
     * Return the connection to the database
     */
    getConnection() {
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
    list(model, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = this.query.selectSQL(options, model);
            try {
                let data = yield this.getConnection().query(sql);
                let response = JSON.parse(JSON.stringify(data[0]));
                return response;
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_TABLE_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
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
    get(model, id, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = this.query.selectSQLOne(id, model, query);
            try {
                let data = yield this.getConnection().query(sql);
                if (!data[0][0])
                    return null;
                let response = JSON.parse(JSON.stringify(data[0][0]));
                return response;
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
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
    filter(model, id, other, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = this.query.selectByFilter(other, model, id, query);
            try {
                let data = yield this.getConnection().query(sql);
                return data[0];
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
    }
    /**
     * This function create a new register in the bd
     * @param model model of the table
     * @param object the new object to introduce in the db
     */
    insert(model, object) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let inserted = yield this.getConnection().query(`INSERT INTO ${model} set ?`, [object]);
                return inserted[0];
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_ROW_2') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
    }
    /**
     * Insert an array of objects on a table
     * @param model the table to insert
     * @param array the object of the data
     */
    insertMany(model, array) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let arrVals = [];
                array.forEach((element) => {
                    arrVals.push(Object.values(element));
                });
                let fields = this.query.makeInsert(array[0]);
                let inserted = yield this.getConnection().query(`INSERT INTO ${model} (${fields}) VALUES ?`, [arrVals]);
                return inserted[0];
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_ROW_2') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
    }
    /**
     * This function update a register in the bd
     * @param model model of the table
     * @param id id of the register in the table
     * @param object object to update in the db
     */
    upsert(model, id, object) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let updated = yield this.getConnection().query(`UPDATE ${model} set ? WHERE id = ?`, [object, id]);
                return updated[0];
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_REFERENCED_ROW_2') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
    }
    /**
     * This function delete a register from de bd
     * @param model model of the table
     * @param id id of the register
     */
    remove(model, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleted = yield this.getConnection().query(`DELETE FROM ${model} WHERE id = ? `, [id]);
                return deleted;
            }
            catch (error) {
                ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                throw new Error(`Error on delete of the database`);
            }
        });
    }
    /**
     * Execute a custom SQL sentence
     * @param {string} sql SQL sentence to execute
     */
    execute(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                ducenlogger_1.default.log(sql, { type: 'database', color: 'system' });
                let data = yield this.getConnection().query(sql);
                return data[0];
            }
            catch (error) {
                if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR') {
                    ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                    throw new Error('BD_SYNTAX_ERROR');
                }
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
    }
    /**
     * This function return the total count of register in a table
     * @param model model of the table
     */
    count(model) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let count = yield this.getConnection().query(`SELECT COUNT(id) as total FROM ${model}`);
                let total = count[0][0].total;
                return total;
            }
            catch (error) {
                ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                throw new Error(`Error en conexion db.connection la BD, error: ${error}`);
            }
        });
    }
    /**
     * This function return the count of all register related to other table
     * @param model the model of the table
     * @param id the id of the register
     * @param other the other table
     */
    filterCount(model, id, other) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let count = yield this.getConnection().query(`SELECT COUNT(id) as total FROM ${other} WHERE ${model}_id = ${id}`);
                let total = count[0][0].total;
                return total;
            }
            catch (error) {
                ducenlogger_1.default.log(error, { type: 'error', color: 'error' });
                throw new Error(`Error en conexion db.connection la BD, error: ${other}`);
            }
        });
    }
}
exports.Consulter = Consulter;
/**
 * Extended class that make sure your connections to diferents tenant databases
 */
class MultiTenantConsulter extends Consulter {
    constructor(options) {
        super();
        /** the pool of connections to the databases */
        this.tenantPool = {};
        this.options = options;
    }
    /**
     * Get the correspondent tenant to the client
     * @param tenant ID of the tenant
     */
    setTenant(tenant) {
        let con = this.tenantPool[tenant];
        if (con) {
            return con;
        }
        this.options.database = tenant;
        con = promise_1.createPool(this.options);
        this.tenantPool[con];
        return con;
    }
    getConnection() {
        const nameSpace = continuation_local_storage_1.getNamespace('unique context');
        const con = nameSpace.get('connection');
        if (!con) {
            ducenlogger_1.default.log('Connection is not defined for any tenant database', { color: 'error', type: 'error' });
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
    resolveTenant(req, _res, next) {
        let tenant = req.headers['tenant-id'];
        let nameSpace = continuation_local_storage_1.createNamespace('unique context');
        nameSpace.run(() => {
            nameSpace.set('connection', this.setTenant(tenant)); // This will set the knex instance to the 'connection'
            next();
        });
    }
}
exports.MultiTenantConsulter = MultiTenantConsulter;
exports.default = (database) => new Consulter(database);
//# sourceMappingURL=index.js.map