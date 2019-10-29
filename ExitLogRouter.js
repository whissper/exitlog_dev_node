/**
 -- EXIT LOG --
 --- back-end ---
 @author: SAV2
 @version 0.8.0
 @since: 29.10.2019
 **/

var path = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var cors = require('cors');

var QueryEng = require('./local_modules/dbcengine/QueryEngine');
var DBEng = require('./local_modules/dbcengine/DBEngine');
var Utils = require('./local_modules/utils/Utils');
var WorkspaceKeep = require('./local_modules/utils/WorkspaceKeeper');
var TemplateProv = require('./local_modules/utils/TemplateProvider');
var ExitsReport = require('./local_modules/ws/exitsReportSOAP');

//router
var exitlogRouter = express.Router();
//connection pool instance
var connectionPool = QueryEng.createPool();
//init session
exitlogRouter.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true
    }),
    function (req, res, next) {
        //...
        next();
    }
);
//support json encoded bodies
exitlogRouter.use(bodyParser.json());
//support encoded bodies
exitlogRouter.use(bodyParser.urlencoded({ extended: true }));
//create session credentials if they don't exist yet
exitlogRouter.use(function (req, res, next) {
    if (!req.session.credentials) {
        req.session.credentials = {};
    }
    next();
});

//CORS functionality headers
/*
exitlogRouter.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
*/
exitlogRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//force loading index.hmlt from frontend directory
exitlogRouter.get('/', async function (req, res, next) {
    //res.send('EXIT-LOG backend version: 0.8.0');
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});
//after GET '/'
//backend.use(express.static('frontend'));

//post answer at the url-base kind of "greetings"
exitlogRouter.post('/', function (req, res, next) {
    try {
        res.send('EXIT-LOG backend version: 0.8.0');
    } catch (e) {
        res.send('ERROR_WS|' + e.name + ': ' + e.message);
    }
});

//
//login
exitlogRouter.post('/login', async function (req, res, next) {
    try {
        if (req.body.id &&
            req.body.usr &&
            req.body.pwd &&
            req.body.id === 'isuservalid') {

            var workspace = new WorkspaceKeep(req.session, connectionPool);
            /*workspace.doLogin(req.body.usr, req.body.pwd)
                .then((result) => {
                    res.send(result);
                });*/
            res.send(await workspace.doLogin(req.body.usr, req.body.pwd));
        } else {
            res.send('ERROR_POSTDATA_INCORRECT');
        }
    } catch (e) {
        res.send('ERROR_WS|' + e.name + ': ' + e.message);
    }
});
//logout
exitlogRouter.post('/logout', async function (req, res, next) {
    try {
        var workspace = new WorkspaceKeep(req.session, connectionPool);
        workspace.doLogout();
        res.send('Logged out');
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//load workspace
exitlogRouter.post('/load_workspace', async function (req, res, next) {
    try {
        if (req.body.userid && req.body.userrole) {
            var workspace = new WorkspaceKeep(req.session, connectionPool);
            var panelID = await workspace.loadWorkspace(parseInt(req.body.userid), parseInt(req.body.userrole));
            res.send({
                panelID: panelID,
                userFIO: (req.session !== undefined ? req.session.credentials.exitUsrFio : ''),
                userID: (req.session !== undefined ? req.session.credentials.exitUsrId : '')
            });
            //res.send(await workspace.loadWorkspace(parseInt(req.body.userid), parseInt(req.body.userrole)));
        } else {
            res.send('0');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//keep workspace
exitlogRouter.post('/keep_workspace', async function (req, res, next) {
    try {
        var workspace = new WorkspaceKeep(req.session, connectionPool);
        var panelID = await workspace.keepWorkspace();
        res.send({
            panelID: panelID,
            userFIO: (req.session !== undefined ? req.session.credentials.exitUsrFio : ''),
            userID: (req.session !== undefined ? req.session.credentials.exitUsrId : '')
        });
        //res.send(await workspace.keepWorkspace());
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//draw panel
exitlogRouter.post('/draw_panel', async function (req, res, next) {
    try {
        var tmplProvider = new TemplateProv();
        tmplProvider.set('userfio', req.session.credentials.exitUsrFio || '');
        tmplProvider.set('userid', req.session.credentials.exitUsrId || '');
        tmplProvider.set('departmentid', req.session.credentials.exitUsrDepid || '');
        tmplProvider.set('departmentname', req.session.credentials.exitUsrDepname || '');

        if (Utils.checkPermission(req.session, 1)) {//1 -- for main-inspector usage
            tmplProvider.set('useridsrch', '');
            tmplProvider.set('hide', '');
        } else if (Utils.checkPermission(req.session, 3)) {//3 -- for inspector usage
            tmplProvider.set('useridsrch', req.session.credentials.exitUsrId || '');
            tmplProvider.set('hide', 'style="display:none;"');
        }

        if (parseInt(req.session.credentials.exitUsrDepid) === 2 || parseInt(req.session.credentials.exitUsrDepid) === 3) {
            tmplProvider.set('uhta', '');
        } else {
            tmplProvider.set('uhta', 'style="display:none;"');
        }

        res.send(await tmplProvider.loadTemplate('./local_modules/templates/', req.body.tmplname));
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//insert new record
exitlogRouter.post('/insert_newrecord', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage | 3 -- for inspector usage
        if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
            var newrecordData = JSON.parse(req.body.newRecordJSON);
            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.insertNewRecord(newrecordData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//select points
exitlogRouter.post('/select_points', async function (req, res, next) {
    try {
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.selectPoints());
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//select exits
exitlogRouter.post('/select_exits', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage | 3 -- for inspector usage
        if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
            var postData = {};
            postData.page = parseInt(req.body.page);
            postData.perPage = 25;
            postData.startPosition = postData.perPage * postData.page;

            postData.date = Utils.createRegExp(Utils.dateConvert(req.body.date, 'BACK_END'), 'EQUALS');
            postData.userfio = Utils.createRegExp(req.body.userfio, 'STARTS_FROM');
            postData.userid = Utils.createRegExp(req.body.userid, 'EQUALS');
            postData.objectname = Utils.createRegExp(req.body.objectname, 'CONTAINS');

            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.selectData('select_exits', postData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//select users
exitlogRouter.post('/select_users', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage
        if (Utils.checkPermission(req.session, 1)) {
            var postData = {};
            postData.page = parseInt(req.body.page);
            postData.perPage = 25;
            postData.startPosition = postData.perPage * postData.page;

            postData.userfio = Utils.createRegExp(req.body.userfio, 'STARTS_FROM');

            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.selectData('select_users', postData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//lock user
exitlogRouter.post('/lock_user', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage
        if (Utils.checkPermission(req.session, 1)) {
            var postData = {};
            postData.id = parseInt(req.body.id);

            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.uncontrolledChangeData('lock_user', postData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//unlock user
exitlogRouter.post('/unlock_user', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage
        if (Utils.checkPermission(req.session, 1)) {
            var postData = {};
            postData.id = parseInt(req.body.id);

            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.uncontrolledChangeData('unlock_user', postData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//delete exit
exitlogRouter.post('/delete_exit', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage | 3 -- for inspector usage
        if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
            var postData = {};
            postData.id = parseInt(req.body.id);

            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.changeData('delete_exit', postData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//update exit
exitlogRouter.post('/update_exit', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage | 3 -- for inspector usage
        if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
            var postData = {};
            postData.id = parseInt(req.body.id);
            postData.objects = req.body.objects;
            postData.timeexit = req.body.timeexit;
            postData.timereturn = req.body.timereturn;

            // if (time_return - time_exit) <= 0
            if (Utils.getMills(postData.timereturn) - Utils.getMills(postData.timeexit) <= 0) {
                res.send('ERROR_TIME|Время возвращения должно быть позднее времени выхода');
            } else {
                var dbEngine = new DBEng(req.session, connectionPool);
                await dbEngine.changeData('delete_objects_by_exitid', postData);
                await dbEngine.insertObjects(postData)
                res.send(await dbEngine.changeData('update_exit', postData));
            }
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//select exit by ID
exitlogRouter.post('/select_exit_by_id', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage | 3 -- for inspector usage
        if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.selectDataByID('select_exit_by_id', parseInt(req.body.id)));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//update user
exitlogRouter.post('/update_user', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage | 3 -- for inspector usage
        if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
            var postData = {};
            postData.id = parseInt(req.body.id);
            postData.fio = req.body.fio;
            postData.pass = req.body.pass;
            postData.firstlogin = parseInt(req.body.firstlogin);

            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.uncontrolledChangeData('update_user', postData));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//select user by ID
exitlogRouter.post('/select_user_by_id', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage
        if (Utils.checkPermission(req.session, 1)) {
            var dbEngine = new DBEng(req.session, connectionPool);
            res.send(await dbEngine.selectDataByID('select_user_by_id', parseInt(req.body.id)));
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//create xlsx report about "users'" exits
exitlogRouter.post('/exitsReportSOAP', async function (req, res, next) {
    try {
        //1 -- for main-inspector usage
        if (Utils.checkPermission(req.session, 1)) {
            var postData = {};
            postData.startDate = req.body.startDate;
            postData.endDate = req.body.endDate;

            var reference = '';
            try {
                reference = await new ExitsReport(req.session).writeDataIntoXLSX(postData);
            } catch (e) {
                reference = 'ERROR_SOAP|' + e.name + ': ' + e.message;
            }

            res.send(reference);
        } else {
            res.send('ERROR_ACCESS_DENIED');
        }
    } catch (e) {
        res.send('ERROR_WS|'+ e.name +': '+ e.message);
    }
});
//

module.exports = exitlogRouter;
