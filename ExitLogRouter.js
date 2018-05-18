var path          = require('path');
var express       = require('express');
var session       = require('express-session');
var bodyParser    = require('body-parser');

var QueryEng      = require('./local_modules/dbcengine/QueryEngine');
var DBEng         = require('./local_modules/dbcengine/DBEngine');
var Utils         = require('./local_modules/utils/Utils');
var WorkspaceKeep = require('./local_modules/utils/WorkspaceKeeper');
var TemplateProv  = require('./local_modules/utils/TemplateProvider');
var ExitsReport   = require('./local_modules/ws/exitsReportSOAP');

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
    function(req, res, next){
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

//force loading index.hmlt from frontend directory
exitlogRouter.get('/', async function(req, res, next) {
    //res.send('EXIT-LOG backend node version: 0.1.0');
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});
//after GET '/'
//backend.use(express.static('frontend'));

//post answer at the url-base kind of "greetings"
exitlogRouter.post('/', function(req, res, next) {
    res.send('EXIT-LOG backend node version: 0.1.0');
});

//
//login
exitlogRouter.post('/login', async function(req, res, next) {
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
});
//logout
exitlogRouter.post('/logout', async function(req, res, next){
    var workspace = new WorkspaceKeep(req.session, connectionPool);
    workspace.doLogout();
    res.send('Logged out');
});
//load workspace
exitlogRouter.post('/load_workspace', async function(req, res, next){
    if (req.body.userid && req.body.userrole) {
        var workspace = new WorkspaceKeep(req.session, connectionPool);
        res.send(await workspace.loadWorkspace(parseInt(req.body.userid), parseInt(req.body.userrole)));
    } else {
        res.send('0');
    }
});
//keep workspace
exitlogRouter.post('/keep_workspace', async function(req, res, next){
    var workspace = new WorkspaceKeep(req.session, connectionPool);
    res.send(await workspace.keepWorkspace());
});
//draw panel
exitlogRouter.post('/draw_panel', async function(req, res, next){
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
    
    res.send(await tmplProvider.loadTemplate('./local_modules/templates/', req.body.tmplname));
});
//insert new record
exitlogRouter.post('/insert_newrecord', async function(req, res, next){
    //1 -- for main-inspector usage | 3 -- for inspector usage
    if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
        var newrecordData = JSON.parse(req.body.newRecordJSON);
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.insertNewRecord(newrecordData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//select points
exitlogRouter.post('/select_points', async function(req, res, next){
    var dbEngine = new DBEng(req.session, connectionPool);
    res.send(await dbEngine.selectPoints());
});
//select exits
exitlogRouter.post('/select_exits', async function(req, res, next){
    //1 -- for main-inspector usage | 3 -- for inspector usage
    if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
        var postData = {};
        postData.page = parseInt(req.body.page);
        postData.perPage = 25;
        postData.startPosition = postData.perPage * postData.page;
        
        postData.date       = Utils.createRegExp(Utils.dateConvert(req.body.date,'BACK_END'),'EQUALS');
        postData.userfio    = Utils.createRegExp(req.body.userfio,'STARTS_FROM');
        postData.userid     = Utils.createRegExp(req.body.userid,'EQUALS');
        postData.objectname = Utils.createRegExp(req.body.objectname,'CONTAINS');
        
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.selectData('select_exits', postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//select users
exitlogRouter.post('/select_users', async function(req, res, next){
    //1 -- for main-inspector usage
    if (Utils.checkPermission(req.session, 1)) {
        var postData = {};
        postData.page = parseInt(req.body.page);
        postData.perPage = 25;
        postData.startPosition = postData.perPage * postData.page;
        
        postData.userfio = Utils.createRegExp(req.body.userfio,'STARTS_FROM');
        
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.selectData('select_users', postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//lock user
exitlogRouter.post('/lock_user', async function(req, res, next){
    //1 -- for main-inspector usage
    if (Utils.checkPermission(req.session, 1)) {
        var postData = {};
        postData.id = parseInt(req.body.id);
        
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.uncontrolledChangeData('lock_user', postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//unlock user
exitlogRouter.post('/unlock_user', async function(req, res, next){
    //1 -- for main-inspector usage
    if (Utils.checkPermission(req.session, 1)) {
        var postData = {};
        postData.id = parseInt(req.body.id);
        
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.uncontrolledChangeData('unlock_user', postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//delete exit
exitlogRouter.post('/delete_exit', async function(req, res, next){
    //1 -- for main-inspector usage | 3 -- for inspector usage
    if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
        var postData = {};
        postData.id = parseInt(req.body.id);
        
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.changeData('delete_exit', postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//update exit
exitlogRouter.post('/update_exit', async function(req, res, next){
    //1 -- for main-inspector usage | 3 -- for inspector usage
    if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
        var postData = {};
        postData.id      = parseInt(req.body.id);
        postData.objects = req.body.objects;
        
        var dbEngine = new DBEng(req.session, connectionPool);
        await dbEngine.changeData('delete_objects_by_exitid', postData);
        res.send(await dbEngine.insertObjects(postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//select exit by ID
exitlogRouter.post('/select_exit_by_id', async function(req, res, next){
    //1 -- for main-inspector usage | 3 -- for inspector usage
    if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.selectDataByID('select_exit_by_id', parseInt(req.body.id)));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//update user
exitlogRouter.post('/update_user', async function(req, res, next){
    //1 -- for main-inspector usage | 3 -- for inspector usage
    if (Utils.checkPermission(req.session, 1) || Utils.checkPermission(req.session, 3)) {
        var postData = {};
        postData.id         = parseInt(req.body.id);
        postData.fio        = req.body.fio;
        postData.pass       = req.body.pass;
        postData.firstlogin = parseInt(req.body.firstlogin);
        
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.uncontrolledChangeData('update_user', postData));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//select user by ID
exitlogRouter.post('/select_user_by_id', async function(req, res, next){
    //1 -- for main-inspector usage
    if (Utils.checkPermission(req.session, 1)) {
        var dbEngine = new DBEng(req.session, connectionPool);
        res.send(await dbEngine.selectDataByID('select_user_by_id', parseInt(req.body.id)));
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//create xlsx report about "users'" exits
exitlogRouter.post('/exitsReportSOAP', async function(req, res, next){
    //1 -- for main-inspector usage
    if (Utils.checkPermission(req.session, 1)) {
        var postData = {};
        postData.startDate = req.body.startDate;
        postData.endDate   = req.body.endDate;

        var reference = '';
        try {
            reference = await new ExitsReport(req.session).writeDataIntoXLSX(postData);
        } catch (e) {
            reference = 'ERROR_WS|' + e;
        }
        
        res.send(reference);
    } else {
        res.send('ERROR_ACCESS_DENIED');
    }
});
//

module.exports = exitlogRouter;
