var mysql        = require('mysql');
var QueryEng     = require('./QueryEngine');
var CryptEng     = require('../utils/CryptEngine');
var Utils        = require('../utils/Utils');
var SQLException = require('./SQLException');

/**
 * DBEngine class
 */
class DBEngine {
    
    constructor(session, poolInstance) {
        this.session = session;
        this.pool    = poolInstance;
    }
    
    /**
     * select Login data
     * @param {String} login
     * @param {String} password
     * @returns {object} {id, role, fio, depid, depname} OR {error}
     */
    async selectLoginData(login, password) {
        var params = [];
        params.push(login);

        var rows = {};

        var queryString = 
        'SELECT users.id, '+
               'users.fio, '+
               'users.login, '+
               'users.pass, '+
               'users.role, '+
               'users.department_id AS depid, '+ 
               'departments.name AS depname '+
        'FROM users '+
        'LEFT JOIN departments ON departments.id = users.department_id '+ 
        'WHERE users.login = ? '+  
        'ORDER BY users.id DESC';
        
        await new QueryEng(this.pool).query(mysql.format(queryString, params))
            .then(
                (result) => {
                    if (result.length > 0) {
                        if (CryptEng.passVerify(password ,result[0].pass)) {
                            rows.id             = result[0].id;
                            rows.role           = result[0].role;
                            rows.fio            = result[0].fio;
                            rows.departmentId   = result[0].depid;
                            rows.departmentName = result[0].depname;
                        }
                    }
                }, 
                (error) => {
                    rows.error = 'ERROR_PDO|' + 'SQL Exception: ' + error.message;
                }
            );

        return rows;
    }
    
    /**
     * Select Points to form select-list component in HTML
     * @returns {array}
     */
    async selectPoints() {
        var points = {};
        var queryString = 'SELECT * FROM points WHERE points.id <> 5';
        
        await new QueryEng(this.pool).query(queryString)
            .then(
                (result) => {
                    points.points = result;
                },
                (error) => {
                    points = 'ERROR_PDO|' + 'SQL Exception: ' + error.message;
                }
            );
        /*
        try {
            points.points = await new QueryEng(this.pool).query(queryString);
        } catch (e) {
            points = 'ERROR_PDO|' + 'SQL Exception: ' + e.message;
        }
        */
        return points;
    }
    
    /**
     * SELECT some data
     * @param {String} queryName - query string
     * @param {object} postData - post Data
     * @returns {String} JSON
     */
    async selectData(queryName, postData) {
        var resultString     = {};
        
        var queryStringCount = '';
        var queryString      = '';
        var params           = [];
        var dataColumns      = [];
        
        var resultSet        = null;
        
        switch (queryName) {
            case 'select_exits':
                var emptyObjectName =  '^.*$';
                queryStringCount = 
                    'SELECT COUNT(exits.id) AS "countrows" '+
                    'FROM exits '+
                    'LEFT JOIN users ON users.id=exits.user_id '+
                    'WHERE exits.deleted = ? AND '+
                          'exits.date REGEXP ? AND '+
                          'users.department_id = ? AND '+
                          'users.fio REGEXP ? AND '+
                          'users.id REGEXP ? ';
                //if objectname !== '^.*$'
                if (postData.objectname !== emptyObjectName) {
                    queryStringCount +=
                          'AND exits.id IN (SELECT DISTINCT objects.exit_id '+
                                            'FROM objects '+
                                            'WHERE objects.name REGEXP ? OR '+
                                            'objects.name IS NULL)';
                }
                //
                
                queryString = 
                    'SELECT exits.id, '+
                            'DAYOFWEEK(exits.date) AS "dayofweek", '+
                            'exits.date, '+
                            'users.fio, '+
                            'points.name AS "point", '+
                            'exits.point_description, '+
                            'exits.time_exit, '+
                            'exits.time_return, '+
                            'TIMEDIFF(exits.time_return, exits.time_exit) AS "hours" '+
                    'FROM exits '+
                    'LEFT JOIN users ON users.id=exits.user_id '+
                    'LEFT JOIN points ON points.id = exits.point_id '+
                    'WHERE exits.deleted = ? AND '+
                          'exits.date REGEXP ? AND '+
                          'users.department_id = ? AND '+
                          'users.fio REGEXP ? AND '+
                          'users.id REGEXP ? ';
                          //if objectname !== '^.*$'
                          if (postData.objectname !== emptyObjectName) {
                            queryString += 
                            'AND exits.id IN (SELECT DISTINCT objects.exit_id '+
                                             'FROM objects '+
                                             'WHERE objects.name REGEXP ? OR '+
                                             'objects.name IS NULL) ';
                           }
                           //
                    queryString += 
                    'ORDER BY exits.id DESC '+
                    'LIMIT ' + postData.startPosition + ', ' + postData.perPage;
            
                params.push(0);
                params.push(postData.date);
                params.push(this.session.credentials.exitUsrDepid);
                params.push(postData.userfio);
                params.push(postData.userid);
                //if objectname !== '^.*$'
                if (postData.objectname !== emptyObjectName) {
                    params.push(postData.objectname);
                }
                //
                
                dataColumns.push(
                    'id',
                    'dayofweek',
                    'date',
                    'fio',
                    'name',
                    'point',
                    'point_description',
                    'time_exit',
                    'time_return',
                    'hours'
                );
                break;
            case 'select_users':
                queryStringCount = 
                    'SELECT COUNT(users.id) AS "countrows" '+
                    'FROM users '+
                    'WHERE users.department_id = ? AND '+
                          'users.fio REGEXP ?';
            
                queryString = 
                    'SELECT users.id, users.fio, users.locked '+
                    'FROM users '+
                    'WHERE users.department_id = ? AND '+
                          'users.fio REGEXP ? '+
                    'ORDER BY users.fio ASC '+
                    'LIMIT ' + postData.startPosition + ', ' + postData.perPage;
            
                params.push(this.session.credentials.exitUsrDepid);
                params.push(postData.userfio);
                
                dataColumns.push(
                    'id',
                    'locked',
                    'fio'
                );
                break;
        }
        
        try {
            await new QueryEng(this.pool).query(mysql.format(queryStringCount, params))
                .then(
                    (result) => {
                        resultString.countrows = result[0].countrows;
                        resultString.page      = postData.page;
                        resultString.perpage   = postData.perPage;
                        resultString.rowitems  = [];
                    },
                    (error) => {
                        throw new SQLException('SQL Exception', error.message);
                    }
                );
            
            await new QueryEng(this.pool).query(mysql.format(queryString, params))
                .then(
                    (result) => {
                        resultSet = result;
                    },
                    (error) => {
                        throw new SQLException('SQL Exception', error.message);
                    }
                );
            
            for (var item of resultSet) {
                var itemToPlace = [];
                for (var prop of dataColumns) {
                    if (prop === 'name') {
                        var queryObjects = 
                            'SELECT objects.name, '+
                                   'objects.note, '+
                                   'objects.postal_index, '+
                                   'objects.region, '+
                                   'objects.town, '+
                                   'objects.street, '+
                                   'objects.building, '+
                                   'objects.apartment, '+
                                   'objects.geo_lat, '+
                                   'objects.geo_lon, '+
                                   'objects.old_format '+
                            'FROM objects '+
                            'WHERE objects.exit_id = ?';

                        var paramsObjects = [];
                        paramsObjects.push(item['id']);

                        await new QueryEng(this.pool).query(mysql.format(queryObjects, paramsObjects))
                            .then(
                                (result) => {
                                    var objects = [];
                                    var objectNameStr;

                                    for (var item of result) {
                                        if (item['old_format'] === 1) {
                                            objectNameStr = item['name'].replace('г Сыктывкар, ', '');
                                            objectNameStr = '- ' + objectNameStr.replace('г. Сыктывкар, ', '');
                                        } else {
                                            objectNameStr = '- ' + item['street'] + ', ' + item['building'];
                                            if (item['apartment']) {
                                                objectNameStr += ', ' + item['apartment'];
                                            }
                                        }
                                        objects.push([Utils.nullToStr(objectNameStr), Utils.nullToStr(item['note'])]);
                                    }

                                    itemToPlace.push(objects);
                                },
                                (error) => {
                                    throw new SQLException('SQL Exception', error.message);
                                }
                            );   
                    } else if (prop === 'dayofweek') {
                        itemToPlace.push(Utils.nullToStr( Utils.getWeekDay(item[prop]) ));
                    } else if (prop === 'date') {
                        itemToPlace.push(Utils.nullToStr( Utils.dateConvert(item[prop].toISOString(),'FRONT_END') ));
                    } else if (prop === 'time_exit' || prop === 'time_return' || prop === 'hours') {
                        itemToPlace.push(Utils.nullToStr( item[prop].slice(0,-3) ));
                    } else {
                        itemToPlace.push(Utils.nullToStr( item[prop] ));
                    }
                }

                resultString.rowitems.push(itemToPlace);
            }
        } catch (e) {
            resultString = 'ERROR_PDO|' + e.message +': '+ e.error;
        }

        return resultString;    
    }
    
    /**
     * SELECT some data BY ID
     * @param {type} queryName
     * @param {type} id
     * @returns {String} JSON
     */
    async selectDataByID(queryName, id) {
        var resultString  = {};
        
        var queryString   = '';
        var params        = [];
        var entityName    = '';
        var mapping       = null;
        
        var resultSet     = null;
        
        params.push(id);
        
        switch (queryName) {
            case 'select_exit_by_id':
                queryString = 
                    'SELECT exits.id, '+
                           'exits.date, '+
                           'users.fio, '+
                           'points.id AS "point", '+
                           'exits.point_description, '+
                           'exits.time_exit, '+
                           'exits.time_return, '+
                           'objects.name AS "objectname", '+
                           'objects.note AS "objectnote", '+
                           'objects.postal_index AS "objectpostalindex", '+
                           'objects.region AS "objectregion", '+
                           'objects.town AS "objecttown", '+
                           'objects.street AS "objectstreet", '+
                           'objects.building AS "objectbuilding", '+
                           'objects.apartment AS "objectapartment", '+
                           'objects.geo_lat AS "objectgeolat", '+
                           'objects.geo_lon AS "objectgeolon", '+
                           'objects.old_format AS "objectoldformat" '+
                    'FROM exits '+
                    'LEFT JOIN users ON users.id = exits.user_id '+
                    'LEFT JOIN points ON points.id = exits.point_id '+
                    'LEFT JOIN objects ON objects.exit_id = exits.id '+
                    'WHERE exits.id = ?';
            
                entityName = 'exit';
                
                mapping = {
                    idUpd:                   'id',
                    fioExitUpd:              'fio',
                    dateExitUpd:             'date',
                    timeexitExitUpd:         'time_exit',
                    timereturnExitUpd:       'time_return',
                    pointExitUpd:            'point',
                    pointDescriptionExitUpd: 'point_description',
                    objectsExitUpd:          ''
                };
                break;
            case 'select_user_by_id':
                queryString = 
                    'SELECT users.id, '+
                           'users.fio, '+
                           'users.login, '+
                           'users.locked, '+
                           'users.first_login AS "firstlogin", '+
                           'departments.name AS "departmentname" '+
                    'FROM users '+
                    'LEFT JOIN departments ON departments.id=users.department_id '+
                    'WHERE users.id = ?';
            
                entityName = 'user';
                
                mapping = {
                    idUpd:                 'id',
                    fioUserUpd:            'fio',
                    loginUserUpd:          'login',
                    lockedUserUpd:         'locked',
                    firstloginUserUpd:     'firstlogin',
                    departmentnameUserUpd: 'departmentname'
                };
                break;
        }
        
        try {
            await new QueryEng(this.pool).query(mysql.format(queryString, params))
                .then(
                    (result) => {
                        resultSet = result;
                    },
                    (error) => {
                        throw new SQLException('SQL Exception', error.message);
                    }
                );

            resultString.entity = entityName;
            resultString.fields = {};

            switch (entityName) {
                case 'exit':
                    for (var prop in mapping) {
                        if (prop === 'objectsExitUpd') {
                            resultString.fields[prop] = [];

                            for (var item of resultSet) {
                                resultString.fields[prop].push(
                                    [
                                        Utils.nullToStr( item.objectname ),
                                        Utils.nullToStr( item.objectnote ),
                                        Utils.nullToStr( item.objectpostalindex ),
                                        Utils.nullToStr( item.objectregion ),
                                        Utils.nullToStr( item.objecttown ),
                                        Utils.nullToStr( item.objectstreet ),
                                        Utils.nullToStr( item.objectbuilding ),
                                        Utils.nullToStr( item.objectapartment ),
                                        Utils.nullToStr( item.objectgeolat ),
                                        Utils.nullToStr( item.objectgeolon ),
                                        Utils.nullToStr( item.objectoldformat )
                                    ]
                                );
                            }
                        } else if (prop === 'dateExitUpd') {
                            resultString.fields[prop] = Utils.nullToStr( Utils.dateConvert(resultSet[0][mapping[prop]].toISOString(),'FRONT_END') );
                        } else if (prop === 'timeexitExitUpd' || prop === 'timereturnExitUpd') {
                            resultString.fields[prop] = Utils.nullToStr( resultSet[0][mapping[prop]].slice(0,-3) );
                        } else {
                            resultString.fields[prop] = Utils.nullToStr( resultSet[0][mapping[prop]] );
                        }
                    }
                    break;
                default:
                    for (var prop in mapping) {
                        resultString.fields[prop] = Utils.nullToStr( resultSet[0][mapping[prop]] );
                    }
                    break;
            }
        } catch (e) {
            resultString = 'ERROR_PDO|' + e.message +': '+ e.error;
        }

        return resultString;
    }
    
    /**
     * INSERT new record (exit->exit_objects)
     * @param {object} newrecordData
     * @returns {String} info string
     */
    async insertNewRecord(newrecordData) {
        var resultString = '';
        
        // if (time_return - time_exit) <= 0
        if (Utils.getMills(newrecordData['time_return']) - Utils.getMills(newrecordData['time_exit']) <= 0) {
            return 'ERROR_TIME|Время возвращения должно быть позднее времени выхода';
        }
        
        try {
            /** EXIT **/
            var queryString = 
                'INSERT INTO exits (date, user_id, point_id, point_description, time_exit, time_return) '+ 
                'VALUES (?, ?, ?, ?, ?, ?)';

            var params = [];
            params.push( new Date().toISOString().split('T')[0] );
            params.push(Utils.formatValue(newrecordData['userid']));
            params.push(Utils.formatValue(newrecordData['pointid']));
            params.push(Utils.formatValue(newrecordData['point_description']));
            params.push(Utils.formatValue(newrecordData['time_exit']));
            params.push(Utils.formatValue(newrecordData['time_return']));

            var exitID;

            await new QueryEng(this.pool).query(mysql.format(queryString, params))
                .then(
                    (result) => {
                        exitID = result.insertId;
                    },
                    (error) => {
                        throw new SQLException('SQL Exception', error.message);
                    }
                );

            /** EXIT OBJECTS **/
            var queryString =
                'INSERT INTO objects (name, '+
                                     'exit_id, '+
                                     'note, '+
                                     'postal_index, '+
                                     'region, '+
                                     'town, '+
                                     'street, '+
                                     'building, '+
                                     'apartment, '+
                                     'geo_lat, '+
                                     'geo_lon, '+
                                     'old_format)';

            for (var [index, item] of newrecordData['objects'].entries()) {                    
                queryString += index === 0 ? 
                    ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' : ', (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

                var params = [];
                params.push(Utils.formatValue(item[0]));
                params.push(exitID);
                params.push(Utils.formatValue(item[1]));
                params.push(Utils.formatValue(item[2]));
                params.push(Utils.formatValue(item[3]));
                params.push(Utils.formatValue(item[4]));
                params.push(Utils.formatValue(item[5]));
                params.push(Utils.formatValue(item[6]));
                params.push(Utils.formatValue(item[7]));
                params.push(Utils.formatValue(item[8]));
                params.push(Utils.formatValue(item[9]));
                params.push(item[10]);

                queryString = mysql.format(queryString, params);  
            }

            if (newrecordData['objects'].length > 0) {
                await new QueryEng(this.pool).query(queryString)
                    .then(
                        (result) => {
                            resultString = 'Запись успешно занесена в журнал.';
                        },
                        (error) => {
                            throw new SQLException('SQL Exception', error.message);
                        }
                    );
            }
        } catch (e) {
            resultString = 'ERROR_PDO|' + e.message +': '+ e.error;
        }

        return resultString;
    }
    
    /**
     * INSERT objects (array of objects)
     * @param {object} postData
     * @returns {String} info string
     */
    async insertObjects(postData) {
        var resultString = '';

        if (await this.changeIsPossible(postData['id'])) {
            try {
                var objectsJSON = JSON.parse(postData['objects']);

                var queryString =
                    'INSERT INTO objects (name, '+
                                         'exit_id, '+
                                         'note, '+
                                         'postal_index, '+
                                         'region, '+
                                         'town, '+
                                         'street, '+
                                         'building, '+
                                         'apartment, '+
                                         'geo_lat, '+
                                         'geo_lon, '+
                                         'old_format)';

                for (var [index, item] of objectsJSON['objects'].entries()) {
                    queryString += index === 0 ? 
                        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' : ', (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

                    var params = [];
                    params.push(Utils.formatValue(item[0]));
                    params.push(postData['id']);
                    params.push(Utils.formatValue(item[1]));
                    params.push(Utils.formatValue(item[2]));
                    params.push(Utils.formatValue(item[3]));
                    params.push(Utils.formatValue(item[4]));
                    params.push(Utils.formatValue(item[5]));
                    params.push(Utils.formatValue(item[6]));
                    params.push(Utils.formatValue(item[7]));
                    params.push(Utils.formatValue(item[8]));
                    params.push(Utils.formatValue(item[9]));
                    params.push(item[10]);

                    queryString = mysql.format(queryString, params);
                }

                if (objectsJSON['objects'].length > 0) {
                    await new QueryEng(this.pool).query(queryString)
                        .then(
                            (result) => {
                                resultString = 'Данные по выходу: ' + postData['id'] + ' успешно изменены';
                            },
                            (error) => {
                                throw new SQLException('SQL Exception', error.message);
                            }
                        );
                }
            } catch (e) {
                resultString = 'ERROR_PDO|' + e.message +': '+ e.error;
            }
        } else {
            resultString = 'CHANGE_IMPOSSIBLE';
        }

        return resultString;
    }
    
    /**
     * INSERT
     * @param {type} queryName
     * @param {type} postData
     * @returns {undefined}
     */
    async insertData(queryName, postData) {
        //Standart INSERT 
    }
    
    /**
     * UPDATE or DELETE
     * @param {String} queryName
     * @param {object} postData
     * @returns {String} info string
     */
    async changeData(queryName, postData) {
        var resultString = '';
        
        var queryString  = '';
        var params       = [];
        
        switch (queryName) {
            case 'delete_exit':
                queryString = 
                    'UPDATE exits '+
                    'SET deleted = 1 '+ 
                    'WHERE exits.id = ?';
            
                params.push(postData['id']);
                resultString = 'Запись под номером id: ' + postData['id'] + ' успешно удалена.';
                break;
            case 'delete_objects_by_exitid':
                queryString = 
                    'DELETE objects '+
                    'FROM objects '+
                    'LEFT JOIN exits ON exits.id = objects.exit_id '+
                    'WHERE exits.id = ?';
            
                params.push(postData['id']);
                resultString = 'Объекты выхода под номером id: ' + postData['id'] + ' успешно удалены.';
                break;
            case 'update_exit':
                queryString = 
                    'UPDATE exits '+
                    'SET time_exit = ?, time_return = ? '+ 
                    'WHERE exits.id = ?';
            
                params.push(postData['timeexit']);
                params.push(postData['timereturn']);
                params.push(postData['id']);
                resultString = 'Данные по выходу: ' + postData['id'] + ' успешно изменены';
                break;
        }

        if (await this.changeIsPossible(postData['id'])) {
            try {
                await new QueryEng(this.pool).query(mysql.format(queryString, params))
                    .then(
                        (result) => {

                        },
                        (error) => {
                            throw new SQLException('SQL Exception', error.message);
                        }
                    );
            } catch (e) {
                resultString = 'ERROR_PDO|' + e.message +': '+ e.error;
            }
        } else {
            resultString = 'CHANGE_IMPOSSIBLE';
        }

        return resultString;
    }
    
    /**
     * UPDATE or DELETE
     * w\o checking current timestamp
     * @param {String} queryName
     * @param {object} postData
     * @returns {String} info string
     */
    async uncontrolledChangeData(queryName, postData) {
        var resultString = '';

        var queryString  = '';
        var params       = [];
        
        switch (queryName) {
            case 'lock_user':
                queryString = 
                    'UPDATE users '+
                    'SET locked = 1 '+
                    'WHERE users.id = ?';
            
                params.push(postData['id']);
                resultString = 'Пользователь с id: ' + postData['id'] + ' заблокирован.';
                break;
            case 'unlock_user':
                queryString = 
                    'UPDATE users '+
                    'SET locked = 0 '+
                    'WHERE users.id = ?';
            
                params.push(postData['id']);
                resultString = 'Пользователь с id: ' + postData['id'] + ' разблокирован.';
                break;
            case 'update_user':
                //if pass field is empty then don't change the password
                if (!postData['pass']) {
                    queryString = 
                        'UPDATE users '+
                        'SET fio = ?, first_login = ? '+
                        'WHERE users.id = ?';
                
                    params.push(postData['fio']);
                    params.push(postData['firstlogin']);
                    params.push(postData['id']);
                //otherwise change the password as well
                } else {
                    queryString = 
                        'UPDATE users '+
                        'SET fio = ?, pass = ?, first_login = ? '+
                        'WHERE users.id = ?';
                
                    params.push(postData['fio']);
                    params.push(CryptEng.hashPass(postData['pass']));
                    params.push(postData['firstlogin']);
                    params.push(postData['id']);
                }
                
                resultString = 'Данные пользователя с id: ' + postData['id'] + ' успешно изменены.';
                break;
        }
        
        try {
            //special control for locking\unlocking users
            if (queryName === "lock_user" || queryName === "unlock_user") {
                //checking for possibility to change lock state
                if (await this.changeLockedStateIsPossible(postData['id'])) {
                    await new QueryEng(this.pool).query(mysql.format(queryString, params))
                        .then(
                            (result) => {

                            },
                            (error) => {
                                throw new SQLException('SQL Exception', error.message);
                            }
                        );
                } else {
                    resultString = 'CHANGE_IMPOSSIBLE';
                }
            //for other "uncontrolled" changes
            } else {
                await new QueryEng(this.pool).query(mysql.format(queryString, params))
                    .then(
                        (result) => {

                        },
                        (error) => {
                            throw new SQLException('SQL Exception', error.message);
                        }
                    );
            }
        } catch (e) {
            resultString = 'ERROR_PDO|' + e.message +': '+ e.error;
        }

        return resultString;
    }
    
    /**
     * private method
     * Check for possibility of incoming change
     * @param {ind} exitID
     * @returns {Boolean}
     */
    async changeIsPossible(exitID) {
        var isPossible = false;

        var queryString = 
            'SELECT * '+
            'FROM exits '+
            'WHERE exits.id = ?';

        var params = [];
        params.push(exitID);
                
        try {
            await new QueryEng(this.pool).query(mysql.format(queryString, params))
                .then(
                    (result) => {
                        if (result.length > 0) {
                            if ( result[0]['user_id'] === this.session.credentials.exitUsrId && 
                                new Date().getTime() <= Date.parse(result[0]['date']) + (3600*32*1000)) {
                                //if user is trying to change his own recorded data
                                //AND if 32+(time_zone +3 hrs) have not passed yet
                                //p.s. webserver currently got GMT+0 timezone thus 11:00AM = 08:00AM
                                isPossible = true;
                            }
                        }
                    },
                    (error) => {
                        throw new SQLException('SQL Exception', error.message);
                    }
                );
        } catch (e) {

        }

        return isPossible;
    }
    
    /**
     * private method
     * Check if user is trying to lock yourself OR user is trying to lock user from other department
     * @param {int} userID
     * @returns {Boolean}
     */
    async changeLockedStateIsPossible(userID) {
        var isPossible = false;
        
        var queryString = 
            'SELECT * '+
            'FROM users '+
            'WHERE users.id = ?';
    
        var params = [];
        params.push(userID);
         
        try {
            await new QueryEng(this.pool).query(mysql.format(queryString, params))
                .then(
                    (result) => {
                        if (result.length > 0) {
                            if( result[0]['id'] === this.session.credentials.exitUsrId || 
                                result[0]['department_id'] !== this.session.credentials.exitUsrDepid ) {
                                //if user is trying to lock yourself OR user is trying to lock user from other department
                                isPossible = false;
                            } else {
                                isPossible = true;
                            }
                        }
                    },
                    (error) => {
                        throw new SQLException('SQL Exception', error.message);
                    }
                );
        } catch(e) {

        }
        
        return isPossible;
    }
    
}

module.exports = DBEngine;
