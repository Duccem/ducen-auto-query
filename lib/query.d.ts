export declare class Query {
    /**
     * Generic consult data from a table
     * @param query modifier of the consult
     * @param tabla model of the table
     */
    selectSQL(tabla: string, query?: any): string;
    /**
     * Generic consult to get one register
     * @param id id of the register
     * @param query modifier of the consult
     * @param tabla model of the table
     */
    selectSQLOne(id: string | number, tabla: string, query?: any): string;
    /**
     * Generic consult to get register of a table using a key
     * @param query modifier of the consult
     * @param tabla the model  table
     * @param filter the model of the key
     * @param id the key to filter
     */
    selectByFilter(tabla: string, filter: string, id: string | number, query?: any): string;
    makeWhere(tabla: string, ind: number, query?: any): string;
    makeInsert(object: any): string;
}
