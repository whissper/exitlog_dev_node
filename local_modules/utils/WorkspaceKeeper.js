var DBEng = require('../dbcengine/DBEngine');

/**
 * WorkspaceKeeper class
 */
class WorkspaceKeeper {
    
    constructor(session, poolInstance) {
        this.session = session;
        this.pool    = poolInstance;
    }
    
    /**
     * private method
     * check for user's locked state
     * @returns {Boolean}
     */
    async isUserLocked() {
        var userData = await new DBEng(this.session, this.pool)
                            .selectDataByID('select_user_by_id', this.session.credentials.exitUsrId);

        if( userData.fields.lockedUserUpd === 1) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * private method
     * check if user signs in for the first time
     * @returns {Boolean}
     */
    async hasUserGotFirstlogin() {
        var userData = await new DBEng(this.session, this.pool)
                            .selectDataByID('select_user_by_id', this.session.credentials.exitUsrId);

        if( userData.fields.firstloginUserUpd === 1) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * do Login
     * @param {String} login
     * @param {String} password
     * @returns {object} {isvalid, userid, userrole}
     */
    async doLogin(login, password) {
        var userData = await new DBEng(this.session, this.pool)
                            .selectLoginData(login, password);

        if (userData.error) {
            this.session.destroy();
            return userData.error;
        }

        if (userData.id && userData.role) {
            this.session.credentials.exitUsrId      = userData.id;
            this.session.credentials.exitUsrRole    = userData.role;
            this.session.credentials.exitUsrFio     = userData.fio;
            this.session.credentials.exitUsrDepid   = userData.departmentId;
            this.session.credentials.exitUsrDepname = userData.departmentName;
            
            return {
                isvalid: true,
                userid: this.session.credentials.exitUsrId,
                userrole: this.session.credentials.exitUsrRole
            };
        } else {
            this.session.destroy();
            return {
                isvalid: false,
                userid: '',
                userrole: ''
            };
        }
    }
    
    /**
     * do logout
     * @returns {undefined}
     */
    doLogout() {
        this.session.destroy();
    }
    
    /**
     * get type of loading workspace (session values check with passed parameters)
     * @param {type} userID
     * @param {type} userRole
     * @returns {String} string ID of workspace to be loaded
     */
    async loadWorkspace(userID, userRole) {
        if (this.session.credentials.exitUsrId &&
            this.session.credentials.exitUsrRole &&
            this.session.credentials.exitUsrId === userID &&
            this.session.credentials.exitUsrRole === userRole) {
            
            //is user locked
            if( await this.isUserLocked() ){
                this.session.destroy();
                return '-1';
            }

            //does user sign in for the first time
            if (await this.hasUserGotFirstlogin()) {
                return '-2';
            }

            if (this.session.credentials.exitUsrRole === 1) { //main-inspector
                return '1';
            } else if (this.session.credentials.exitUsrRole === 2) { //not used yet	
                return '2';
            } else if (this.session.credentials.exitUsrRole === 3) { //inspector
                return '3';
            }
        } else {
            this.session.destroy();
            return '0';
        }           
    }
    
    /**
     * get type of loading workspace according current session values (userID and userRole)
     * @returns {String} string ID of workspace to be loaded
     */
    async keepWorkspace() {
        if (this.session.credentials.exitUsrId &&
            this.session.credentials.exitUsrRole) {

            //is user locked
            if( await this.isUserLocked() ){
                this.session.destroy();
                return '-1';
            }

            //does user sign in for the first time
            if (await this.hasUserGotFirstlogin()) {
                return '-2';
            }

            if (this.session.credentials.exitUsrRole === 1) { //main-inspector
                return '1';
            } else if (this.session.credentials.exitUsrRole === 2) { //not used yet	
                return '2';
            } else if (this.session.credentials.exitUsrRole === 3) { //inspector
                return '3';
            }
        } else {
            this.session.destroy();
            return '0';
        }
    }
    
}

module.exports = WorkspaceKeeper;
