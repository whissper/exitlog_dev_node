var mysql = require('mysql');

/**
 * QueryEngine class
 */
class QueryEngine {
    
    constructor(poolInstance) {
        this.pool = poolInstance;
    }
    
    /**
     * static method
     * create connection pool to the DB
     * @returns {object} connection pool instance
     */
    static createPool() {
        return mysql.createPool({
            timezone        : 'Z',
            host            : 'localhost',
            user            : 'yusav',
            password        : 'Whissper@9',
            database        : 'exitlog_dev',
            connectionLimit : 10
        });
    }
    
    /**
     * do QUERY
     * @param {type} sqlQuery - sql query string
     * @returns {Promise} - results (array of rows)
     */
    query(sqlQuery) {
        return new Promise((resolve, reject) => {
            this.pool.query(sqlQuery, function(error, results, fields) {
                if (error) {
                    reject(error);
                    return;
                }
                
                resolve(results);
            });
        });
    }
    
}

module.exports = QueryEngine;
