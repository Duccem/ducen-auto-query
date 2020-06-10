"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const ducenlogger_1 = __importDefault(require("ducenlogger"));
class Query {
    /**
     * Generic consult data from a table
     * @param query modifier of the consult
     * @param tabla model of the table
     */
    selectSQL(tabla, query) {
        var sql = '';
        let { fields } = query;
        var inner = '';
        for (const prop in query) {
            if (prop.includes('ext') && fields) {
                inner += ` LEFT JOIN ${prop.split('-')[1]} ON ${tabla}.${prop.split('-')[1]}_id = ${prop.split('-')[1]}.id`;
                fields = fields.split(',');
                for (let index = 0; index < fields.length; index++) {
                    if (fields[index].includes(prop.split('-')[1])) {
                        if (fields[index].split('_id')[0] == prop.split('-')[1]) {
                            fields[index] = `${prop.split('-')[1]}.nombre as ${prop.split('-')[1]}`;
                        }
                    }
                    else if (!fields[index].includes('as') && !fields[index].includes(`${tabla}`) && !query.hasOwnProperty(`ext-${fields[index].split('_id')[0]}`)) {
                        fields[index] = `${tabla}.${fields[index]}`;
                    }
                }
            }
        }
        let field = fields || '*';
        sql += 'SELECT ' + field + ' FROM ' + tabla + ' ' + inner;
        var where = this.makeWhere(tabla, 0, query);
        sql += where;
        var meta = '';
        let limit = query.limit || '50';
        let order = query.order || 'asc';
        let orderField = query.orderField || 'id';
        let offset = query.offset || '0';
        let groupField = query.groupField || '';
        meta = `${groupField ? ' group by ' + groupField : ''} order by ${orderField} ${order} limit ${limit} offset ${offset}`;
        sql += meta;
        ducenlogger_1.default.log(sql, { color: 'system', type: 'database' });
        return sql;
    }
    /**
     * Generic consult to get one register
     * @param id id of the register
     * @param query modifier of the consult
     * @param tabla model of the table
     */
    selectSQLOne(id, tabla, query) {
        var sql = '';
        let { fields } = query;
        var inner = '';
        for (const prop in query) {
            if (prop.includes('ext') && fields) {
                inner += ` LEFT JOIN ${prop.split('-')[1]} ON ${tabla}.${prop.split('-')[1]}_id = ${prop.split('-')[1]}.id`;
                fields = fields.split(',');
                for (let index = 0; index < fields.length; index++) {
                    if (fields[index].includes(prop.split('-')[1])) {
                        if (fields[index].split('_id')[0] == prop.split('-')[1]) {
                            fields[index] = `${prop.split('-')[1]}.nombre as ${prop.split('-')[1]}`;
                        }
                    }
                    else if (!fields[index].includes('as') && !fields[index].includes(`${tabla}`) && !query.hasOwnProperty(`ext-${fields[index].split('_id')[0]}`)) {
                        fields[index] = `${tabla}.${fields[index]}`;
                    }
                }
            }
        }
        let field = fields || '*';
        sql = `SELECT ${field} FROM ${tabla} ${inner} WHERE ${tabla}.id = '${id}'`;
        ducenlogger_1.default.log(sql, { color: 'system', type: 'database' });
        return sql;
    }
    /**
     * Generic consult to get register of a table using a key
     * @param query modifier of the consult
     * @param tabla the model  table
     * @param filter the model of the key
     * @param id the key to filter
     */
    selectByFilter(tabla, filter, id, query) {
        var sql = '';
        let { fields } = query;
        var inner = '';
        for (const prop in query) {
            if (prop.includes('ext') && fields) {
                inner += ` LEFT JOIN ${prop.split('-')[1]} ON ${tabla}.${prop.split('-')[1]}_id = ${prop.split('-')[1]}.id`;
                fields = fields.split(',');
                for (let index = 0; index < fields.length; index++) {
                    if (fields[index].includes(prop.split('-')[1])) {
                        if (fields[index].split('_id')[0] == prop.split('-')[1]) {
                            fields[index] = `${prop.split('-')[1]}.nombre as ${prop.split('-')[1]}`;
                        }
                    }
                    else if (!fields[index].includes('as') && !fields[index].includes(`${tabla}`) && !query.hasOwnProperty(`ext-${fields[index].split('_id')[0]}`)) {
                        fields[index] = `${tabla}.${fields[index]}`;
                    }
                }
            }
        }
        let field = fields || '*';
        sql += `SELECT ${field} FROM ${tabla} ${inner} WHERE ${filter}_id = ${id}`;
        var where = this.makeWhere(tabla, 1, query);
        sql += where;
        var meta = '';
        let limit = query.limit || '50';
        let order = query.order || 'asc';
        let orderField = query.orderField || 'id';
        let offset = query.offset || '0';
        meta = ` order by ${orderField} ${order} limit ${limit} offset ${offset}`;
        sql += meta;
        ducenlogger_1.default.log(sql, { color: 'system', type: 'database' });
        return sql;
    }
    makeWhere(tabla, ind, query) {
        let where = '';
        var index = ind || 0;
        for (const prop in query) {
            if (prop !== 'fields' && prop !== 'limit' && prop !== 'order' && prop !== 'orderField' && prop !== 'offset' && !prop.includes('ext')) {
                if (prop.includes('after') || prop.includes('before')) {
                    if (prop.split('-').length > 1) {
                        where += index == 0 ? ' WHERE ' : ' AND ';
                        where += `${tabla}.${prop.split('-')[1]} ${prop.split('-')[0] === 'before' ? '<=' : '>='} '${query[prop]}'`;
                        index++;
                    }
                }
                else if (Array.isArray(query[prop])) {
                    where += index == 0 ? ' WHERE ' : ' AND ';
                    where += `${tabla}.${prop} in(${query[prop].join(',')}) `;
                    index++;
                }
                else {
                    where += index == 0 ? ' WHERE ' : ' AND ';
                    where += `${tabla}.${prop} like '%${query[prop]}%'`;
                    index++;
                }
            }
        }
        return where;
    }
    makeInsert(object) {
        let insert = '';
        let arrKeys = Object.keys(object);
        insert += arrKeys.join(',');
        return insert;
    }
}
exports.Query = Query;
//# sourceMappingURL=query.js.map