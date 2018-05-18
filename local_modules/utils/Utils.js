var dateFormat = require('dateformat');

/**
 * Utils class
 */
class Utils {

    constructor() {

    }
    
    /**
     * escape string
     * @param {String} regexpStr
     * @returns {String} string with escaped chars
     */
    static escape(regexpStr) {
        return regexpStr.replace(/[.+?[\](){}=!<>|:-]/g, '\\$&');
    }
    
    /**
     * Check for empty string value
     * @param {type} val - current value
     * @returns {unresolved} null OR current value
     */
    static formatValue(val) {
        return (val.trim() === '') ? null : val.trim();
    }
    
    /**
     * Check permission
     * @param {object} session - session object
     * @param {String} userRole - user role '0', '1', etc...
     * @returns {Boolean} true\false
     */
    static checkPermission(session, userRole) {
        if (!session.credentials || session.credentials.exitUsrRole !== userRole) {
            return false;
        } else {
            return true;
        }
    }
    
    /**
     * Create regular expression
     * @param {type} str - substring to search
     * @param {type} searchType - 'CONTAINS', 'STARTS_FROM', 'EQUALS'
     * @returns {String} - reg exp string
     */
    static createRegExp(str, searchType) {
        var regExp = '';

        var regExpType = {
            'CONTAINS': function () {
                regExp = '^.*' + Utils.escape(str) + '.*$';
                if (regExp === '^.*.*$') {
                    regExp = '^.*$';
                }
            },
            'STARTS_FROM': function () {
                regExp = '^' + Utils.escape(str) + '.*$';
            },
            'EQUALS': function () {
                regExp = '^' + Utils.escape(str) + '$';
                if (regExp === '^$') {
                    regExp = '^.*$';
                }
            },
            'DEFAULT': function () {
                regExp = '^.*' + Utils.escape(str) + '.*$';
                if (regExp === '^.*.*$') {
                    regExp = '^.*$';
                }
            }
        };

        (regExpType[searchType] || regExpType['DEFAULT'])();

        return regExp;
    }
    
    /**
     * get week day by its number
     * @param {int} number - number value
     * @returns {String} string representation
     */
    static getWeekDay(number) {
        var weekDay = {
            2: 'Пн',
            3: 'Вт',
            4: 'Ср',
            5: 'Чт',
            6: 'Пт',
            7: 'Сб',
            1: 'Вс',
            'default': 'Вс'
        };

        return (weekDay[number] || weekDay['default']);
    }
    
    /**
     * Convert date string to special format
     * @param {String} stringVal - string value as date
     * @param {String} direction - 'FRONT_END', 'BACK_END'
     * @returns {String} - formated data string
     */
    static dateConvert(stringVal, direction) {
        if (stringVal === '') {
            return '';
        }
        
        var dateStr = {
            //2017-12-21 --> 21-12-2017
            'FRONT_END': () => {
               return dateFormat(Date.parse(stringVal), 'dd-mm-yyyy');
            },
            //21-12-2017 --> 12-21-2017 --> 2017-12-21
            'BACK_END': () => {
                return dateFormat(Date.parse(stringVal.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")), 'yyyy-mm-dd');
            },
            'DEFAULT': () => {
                return dateFormat(Date.parse(stringVal.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")), 'yyyy-mm-dd');
            }
        };
        
        return (dateStr[direction] || dateStr['DEFAULT'])();
    }
    
    /**
     * get milliseconds from time string like HH:mm
     * @param {String} timeStr - time string HH:mm
     * @returns {int} amount of milliseconds
     */ 
    static getMills(timeStr) {
        var timeParts = timeStr.split(':');
        
        return ((timeParts[0] * 3600 * 1000) + (timeParts[1] * 60 * 1000));
    }
    
    /**
     * return '' if value is null
     * @param {type} val - value 
     * @returns {String} - '' kinds empty string
     */
    static nullToStr(val) {
        if (val === null) {
            return '';
        } else {
            return val;
        }
    }
}

module.exports = Utils;
