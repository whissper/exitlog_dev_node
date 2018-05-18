var fs = require('fs');

/**
 * TemplateProvider class
 */
class TemplateProvider {

    constructor() {
        this.values = {};
    }
    
    /**
     * set text string for keyed parameter in template
     * @param {String} key
     * @param {String} val
     * @returns {undefined}
     */
    set(key, val) {
        this.values[key] = val;
    }
    
    /**
     * load template
     * @param {String} tmplDir - directory path (templates storage)
     * @param {String} name - template name
     * @returns {Promise} - html-string
     */
    loadTemplate(tmplDir, name) {
        return new Promise((resolve, reject) => {
            fs.readFile(tmplDir + name + '.tpl', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                data = data.toString('utf8');

                for (var prop in this.values) {
                    var tagToReplace = `[@${prop}]`;
                    //data = data.replace(tagToReplace, this.values[prop]);
                    data = this.replaceAll(data, tagToReplace, this.values[prop]);
                }

                resolve(data);
            });
        });
    }
    
    /**
     * private method
     * replace ALL
     * @param {String} currStr - current string
     * @param {String} searchStr - substring to replace
     * @param {String} replaceStr - string for replacement
     * @returns {TemplateProvider@call;replaceAll} - recursive call till every substring will be replaced
     */
    replaceAll(currStr, searchStr, replaceStr) {
        if(currStr.indexOf(searchStr) === -1) {
            return currStr;
        }
        
        return this.replaceAll(currStr.replace(searchStr, replaceStr), searchStr, replaceStr);
    }
}

module.exports = TemplateProvider;
