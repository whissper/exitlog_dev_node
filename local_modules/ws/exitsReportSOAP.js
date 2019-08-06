var soap  = require('soap');
var Utils = require('../utils/Utils'); 

/**
 * exitsReportSOAP class
 */
class exitsReportSOAP {
    
    constructor(session) {
        this.session = session;
    }
    
    /**
     * get formed XLSX document
     * @param {object} postData
     * <postData.startDate> - start date
     * <postData.endDate> - end date
     * @returns {Promise} reference to file
     */
    writeDataIntoXLSX(postData) {
        var wsResponse;
        
        var startDate = new Date().toISOString();
        var endDate   = new Date().toISOString();
        
        if (postData['startDate']) {
            startDate = Utils.dateConvert(postData['startDate'], 'BACK_END');
        }

        if (postData['endDate']) {
            endDate = Utils.dateConvert(postData['endDate'], 'BACK_END');
        }
        
        var url  = 'http://kom-es01-dev01:8080/ExitsReportWS/ExitsReportWS?wsdl';
        var args = {
            startDate : startDate,
            endDate   : endDate,
            depID     : this.session.credentials.exitUsrDepid
        };
        
        return new Promise((resolve, reject) => {
            soap.createClient(url, (err, client) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                client.loadXLSX(args, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.reference);
                });
                
            });
        });
    }
}

module.exports = exitsReportSOAP;
