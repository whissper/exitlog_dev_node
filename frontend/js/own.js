/**
 -- EXIT LOG --
 --- front-end ---
 @author: SAV2
 @version 0.5.4
 @since: 12.12.2018
 **/

var currentPageExit = 0;
var currentPageUser = 0;

//reference to timer(timeout) ID value of the timer that is set
var delayTimer;
//delay time (ms)
var searchLatency = 1000;
//url to the back-end (main enrance)
var restServiceUrl = '/exitlog_dev/';

//join strings with separators
function join(arr /*, separator */) {
    var separator = arguments.length > 1 ? arguments[1] : ', ';
    return arr.filter(function(n){return n;}).join(separator);
}

/**
 * fill hidden inputs for additional object data
 * @param {Object} suggestion
 * @param {Object} element - $('.exit-object') OR $('.exit-object-upd')
 * @returns {undefined}
 */
function fillObjectDataFields(suggestion, element) {
    var ItemStr        = '[class*="sav2-exit-object-item"]';
    var postalindexStr = '[class*="exit-object-postalindex"]';
    var regionStr      = '[class*="exit-object-region"]';
    var townStr        = '[class*="exit-object-town"]';
    var streetStr      = '[class*="exit-object-street"]';
    var buildingStr    = '[class*="exit-object-building"]';
    var apartmentStr   = '[class*="exit-object-apartment"]';
    var geolatStr      = '[class*="exit-object-geolat"]';
    var geolonStr      = '[class*="exit-object-geolon"]';
    
    $(postalindexStr, element.parents(ItemStr)).val( suggestion.data.postal_code );
    $(regionStr, element.parents(ItemStr)).val( join([
        join([suggestion.data.region_type, suggestion.data.region], ' '),
        join([suggestion.data.area_type, suggestion.data.area], ' ')
    ]) );
    $(townStr, element.parents(ItemStr)).val( join([
        join([suggestion.data.city_type, suggestion.data.city], ' '),
        join([suggestion.data.settlement_type, suggestion.data.settlement], ' ')
    ]) );
    $(streetStr, element.parents(ItemStr)).val( join([suggestion.data.street_type, suggestion.data.street], ' ') );
    $(buildingStr, element.parents(ItemStr)).val( join([
        join([suggestion.data.house_type, suggestion.data.house], ' '),
        join([suggestion.data.block_type, suggestion.data.block], ' ')
    ]) );
    $(apartmentStr, element.parents(ItemStr)).val( join([suggestion.data.flat_type, suggestion.data.flat], ' ') );
    if(suggestion.data.qc_geo != '5'){
        $(geolatStr, element.parents(ItemStr)).val( suggestion.data.geo_lat );
        $(geolonStr, element.parents(ItemStr)).val( suggestion.data.geo_lon );
    }
}
/* @since 23.04.2018
//g-recaptcha on load
function onloadCallback() {
    grecaptcha.render('grelem', {
        'sitekey' : '6LfFHhEUAAAAAIHSvYBhfCvQHgtz9qhiaHOfkS43',
        'callback' : 'recaptchaIsChecked',
        'expired-callback' : 'recaptchaExpired'
    });
};

//g-recaptcha is checked
function recaptchaIsChecked() {
    $('#send').attr('active', 'true');
    $('#send').removeClass('disabled');
};

//g-recaptcha expired
function recaptchaExpired() {
    $('#send').attr('active', 'false');
    $('#send').addClass('disabled');
}

//reset login form
function resetLoginForm() {
    grecaptcha.reset();
    $('#send').attr('active', 'false');
    $('#send').addClass('disabled');
}
*/
//compare #userpass and #userrepeat
function newpassIsLegit() {
    return ( $('#userpass').val() === $('#userrepeat').val() 
        && $('#userpass').val().length !== 0 
        && $('#userrepeat').val().length !== 0 );
}

//lock panel 
function lockPanel() {
    //$('body').css({'overflow': 'hidden'});
    $('#light_cover')
        .css({'display' : 'flex'})
        .hide()
        .stop(true, true).fadeIn(200);
}

//unlock panel
function unlockPanel() {
    //$('body').css({'overflow': 'auto'});
    $('#light_cover').stop(true, true).fadeOut(200);
}

//reset new record form
function resetNewRecordForm() {
    $('#point').val('1');
    $('#point-description').val('');
    $('#point-description').hide();
    $('#time-exit').val('');
    $('#time-return').val('');
    $('.sav2-exit-object-item').remove();
}

/**
 * SHOW INFO BOX
 * @param {String} messageVal
 * @param {String} messageType
 * @returns {undefined}
 */
function showInfoBox(messageVal, messageType) {
    $('#sav2-infobox-info').empty();
    var infoBoxHTML = '';
    
    var infoBoxType = {
        'INFOBOX_SUCCESS': function(){
            infoBoxHTML += '<div class="alert alert-success fade in alert-dismissable">' +
                           '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';
            infoBoxHTML += '<span class="glyphicon glyphicon-ok-circle"></span> ' + messageVal;
            infoBoxHTML += '</div>';
        },
        'INFOBOX_ERROR': function(){
            infoBoxHTML += '<div class="alert alert-danger fade in alert-dismissable">' +
                           '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';
            infoBoxHTML += '<span class="glyphicon glyphicon-remove-circle"></span> ' + messageVal;
            infoBoxHTML += '</div>';
        },
        'INFOBOX_INFO': function(){
            infoBoxHTML += '<div class="alert alert-info fade in alert-dismissable">' +
                           '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';
            infoBoxHTML += '<span class="glyphicon glyphicon-info-sign"></span> ' + messageVal;
            infoBoxHTML += '</div>';
        },
        'DEFAULT': function(){
            infoBoxHTML += '<div class="alert alert-info fade in alert-dismissable">' +
                           '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';
            infoBoxHTML += '<span class="glyphicon glyphicon-info-sign"></span> ' + messageVal;
            infoBoxHTML += '</div>';
        }
    };
    
    (infoBoxType[messageType] || infoBoxType['DEFAULT'])();
    
    $('#sav2-infobox-info').html(infoBoxHTML);
}

/**
 * Represent Error Info
 * @param {String} representTypeInfo -- through INFOBOX or ALERT 
 * @param {String} errorInfo -- error description
 * @returns {undefined}
 */
function representError(representTypeInfo, errorInfo) {
    var representType = {
        'INFOBOX': function(){
            showInfoBox(errorInfo, 'INFOBOX_ERROR');
        },
        'ALERT': function(){
            alert(errorInfo);
        },
        'DEFAULT': function(){
            alert(errorInfo);
        }
    };
    
    (representType[representTypeInfo] || representType['DEFAULT'])();
}

/**
 * Process Error
 * @param {Object} dataObject
 * <dataObject.message> - special error message for identification of error type
 * <dataObject.methodName> - name of method where error has occurred
 * <dataObject.representType> - through INFOBOX or ALERT
 * @returns {Boolean} Error occurred (true) or didn't (false)
 */
function processException(dataObject) { 
    var errorOccured = false;
    
    var data = dataObject || {};
    data.message = (typeof data.message === 'undefined') ? 'DEFAULT_MESSAGE' : data.message;
    data.methodName = (typeof data.methodName === 'undefined') ? 'DEFAULT_METHOD' : data.methodName;
    data.representType = (typeof data.representType === 'undefined') ? 'INFOBOX' : data.representType;
    
    if (data.message === 'ERROR_ACCESS_DENIED') {
        errorOccured = true;
        representError(data.representType, 'access denied : method -- ' + data.methodName);
    } else if (data.message.indexOf('ERROR_PDO') !== -1) {
        errorOccured = true;
        var errorInfo = data.message.split('|');
        representError(data.representType, 'PDO Error: (' + errorInfo[1] + ') : method -- ' + data.methodName);
    } else if (data.message === 'CHANGE_IMPOSSIBLE') {
        errorOccured = true;
        representError(data.representType, 'Изменение\\Удаление невозможно');
    } else if (data.message === 'ERROR_POSTDATA_INCORRECT') {
        errorOccured = true;
        representError(data.representType, 'postdata is incorrect : method -- ' + data.methodName);
    } else if (data.message.indexOf('ERROR_TIME') !== -1) {
        errorOccured = true;
        var errorInfo = data.message.split('|');
        representError(data.representType, errorInfo[1]);
    } else if (data.message.indexOf('ERROR_WS') !== -1) {
        errorOccured = true;
        var errorInfo = data.message.split('|');
        representError(data.representType, 'Web service call error: ' + errorInfo[1]);
    } else if (data.message.indexOf('ERROR_JAVA') !== -1) {//ERROR
        errorOccured = true;
        var errorInfo = data.message.split('|');
        representError(data.representType, 'Java runtime error: ' + errorInfo[1]);
    }
    
    return errorOccured;
}

/**
 * prepare and execute AJAX-request
 * @param {Object} dataObject
 * <dataObject.method> - HTTP-method (GET, POST, PUT...)
 * <dataObject.url> - URL to which the request is sent
 * <dataObject.data> - Data to be sent to the server
 * <dataObject.dataType> - The type of data that you're expecting back from the server
 * <dataObject.timeout> - timeout (in milliseconds) for the request (0 means there will be no timeout)
 * -
 * <dataObject.success> - a function to be called if the request succeeds
 * <dataObject.error> - a function to be called if the request fails
 * <dataObject.complete> - a function to be called when the request finishes (after success and error callbacks are executed)
 * @returns {undefined}
 */
function doAJAX(dataObject) {
    var emptyFunc = function(){};
    var params = dataObject || {};
    
    params.method = (typeof params.method === 'undefined') ? 'POST' : params.method;
    params.url = (typeof params.url === 'undefined') ? '' : params.url;
    params.data = (typeof params.data === 'undefined') ? {} : params.data;
    params.dataType = (typeof params.dataType === 'undefined') ? 'text' : params.dataType;
    params.timeout = (typeof params.timeout === 'undefined') ? 10000 : params.timeout;
    
    params.success = (typeof params.success === 'undefined') ? emptyFunc : params.success;
    params.error = (typeof params.error === 'undefined') ? emptyFunc : params.error;
    params.complete = (typeof params.complete === 'undefined') ? emptyFunc : params.complete;
    
    lockPanel();
    
    $.ajax({
        method: params.method,
        url: params.url,
        data: params.data,
        dataType: params.dataType,
        timeout: params.timeout
    })
    .done(function(message) {
        unlockPanel();
        params.success(message);
    })
    .fail(function(){
        unlockPanel();
        params.error();
    })
    .always(function(){
        params.complete();
    });
}

/**
 * CHOOSE PANEL
 * @param {String} panelId
 * @returns {undefined}
 */
function choosePanel(panelId) {
    window.___grecaptcha_cfg = undefined;//unset ___grecaptcha_cfg var
    
    var panelType = {
        '0'       : function(){ drawArea('login_page'); },
        '1'       : function(){ drawArea('admin_panel'); },
        '2'       : function(){ drawArea('another_panel'); },
        '3'       : function(){ drawArea('admin_panel'); },
        '-1'      : function(){ drawArea('login_page_lockeduser'); },
        '-2'      : function(){ drawArea('create_pass_page'); },
        'default' : function(){ drawArea('login_page'); }
    };
    
    (panelType[panelId] || panelType['default'])();
}

/**
 * LOAD WORKSPACE
 * @param {JSON} message
 * <message.isvalid> - true\false
 * <message.userid> - user ID
 * <message.userrole> - user role
 * @returns {undefined}
 */
function loadUserWorkspace(message) {
    var userData = $.parseJSON(message);

    if (userData.isvalid) {   
        doAJAX({
            url: restServiceUrl + 'load_workspace',
            data: {
                userid: userData.userid,
                userrole: userData.userrole
            },
            success: function(message) {
                choosePanel(message);
            },
            error: function(){
                alert('error occured during ajax-request to the server : ' +
                    'method -- loadUserWorkspace (load_workspace)');
            }
        });
    } else {
        alert('Wrong Login data');
    }
}

/** SHOW WORKSPACE based on user's privileges **/
function keepUserWorkspace() {    
    doAJAX({
        url: restServiceUrl + 'keep_workspace',
        data: {
            id: '0'
        },
        success: function(message) {
            choosePanel(message);
        },
        error: function(){
            alert('error occured during ajax-request to the server : ' +
                'method -- keepUserWorkspace (keep_workspace)');
        }
    });
}

/**
 * DRAW AREA TMPL
 * @param {String} areaTmpl
 * @returns {undefined}
 */
function drawArea(areaTmpl) {    
    doAJAX({
        url: restServiceUrl + 'draw_panel',
        data: {
            tmplname: areaTmpl
        },
        success: function(message) {
            $('.sav2-workspace').empty();
            $('.sav2-workspace').html(message);
            
            //@since 23.04.2018
            if (areaTmpl === 'login_page' || areaTmpl === 'login_page_lockeduser') {
                $('#send').attr('active', 'true');
                $('#send').removeClass('disabled');
            }
            //@since 23.04.2018
        },
        error: function(){
            alert('error occured during ajax-request to the server : ' +
                'method -- drawArea (tmpl: ' + areaTmpl + ')');
        }
    });
}

/**
 * FILL TABLE with data
 * @param {Object} tableData - object that contains table data
 * <tableData.prefix> - prefix for current table instance
 * <tableData.content> - table content selector
 * <tableData.header> - items(columns names) of table header
 * @param {Object} dataVal - data object
 * <dataVal.countrows> - amount of rows
 * <dataVal.page> - page id
 * <dataVal.perpage> - rows per page
 * <dataVal.rowitems> - array of columns of each row
 * @returns {undefined}
 */
function fillTable(tableData, dataVal) {
    var numberOfPages = Math.ceil(dataVal.countrows / dataVal.perpage);
    numberOfPages = (numberOfPages < 1 ? 1 : numberOfPages);
    
    var tableString = '';
    //current page
    var currentPageSwitch = {
        'exit': function(){
            currentPageExit = numberOfPages - 1;
            selectExits(numberOfPages - 1);
        },
        'user': function(){
            currentPageUser = numberOfPages - 1;
            selectUsers(numberOfPages - 1);
        },
        'default': function(){}
    };
    //header
    var headerSwitch = {
        'exit': function(indexVal, valueVal) {
            if (indexVal === 0) {
                //do nothing
            } else {
                tableString += '<td>' + valueVal + '</td>';
            }
        },
        'user': function(indexVal, valueVal) {
            if (indexVal === 0) {
                //do nothing
            } else if(indexVal === 2) {
                tableString += '<td style="text-align: right;">' + valueVal + '</td>';
            } else {
                tableString += '<td>' + valueVal + '</td>';
            }
        },
        'default': function(indexVal, valueVal) {
            tableString += '<td>' + valueVal + '</td>';
        }
    };
    //columns
    var columnsSwitch = {
        'exit': function(indexVal, valueVal) {
            if (indexVal === 0) {
                //do nothing
            } else if (indexVal === 3) {
                tableString += '<td style="white-space:nowrap;">' + valueVal + '</td>';
            } else if (indexVal === 4) {
                tableString += '<td>';
                $.each(valueVal, function(index, objectname) {
                    tableString += '<div class="sav2-object-li">';
                    tableString += objectname[0];
                    if (objectname[1].trim() !== '') {
                        tableString += ' <span class="label label-info" title="" data-toggle="tooltip" ';
                        tableString += 'data-placement="right" data-original-title="'+ objectname[1].replace(/"/g, '&quot;') +'">';
                        tableString += '<i class="fas fa-comment" aria-hidden="true"></i> ' + objectname[1];
                        tableString += '</span>';
                    }
                    tableString += '</div>';
                });
                tableString += '</td>';
            } else if (indexVal === 5) {
                tableString += '<td>';
                tableString += valueVal + ' ';
            } else if (indexVal === 6) {
                tableString += valueVal;
                tableString += '</td>';
            } else {
                tableString += '<td>' + valueVal + '</td>';
            }
        },
        'user': function(indexVal, valueVal) {
            if (indexVal === 0 || indexVal === 1) {
                //do nothing
            } else {
               tableString += '<td>' + valueVal + '</td>'; 
            }
        },
        'default': function(indexVal, valueVal) {
            tableString += '<td>' + valueVal + '</td>';
        }
    };
    //action columns
    var actionColumnsSwitch = {
        //arrVal[0] is supposed to be 'id' of current row(element)
        'exit': function(arrVal) {
            tableString += 
            '<td style="min-width: 100px;">' +
            '<button title="Изменить" type="button" ' +
            'class="btn btn-success btn-sm sav2-opt-btn sav2-upd-' + 'exit' + '" ' +
            'data-toggle="modal" data-target="#updateElement" id="' + arrVal[0] + '">' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
            '</button>' +
            '<button title="Удалить" type="button" ' +
            'class="btn btn-danger btn-sm sav2-opt-btn sav2-del-' + 'exit' + '" id="' + arrVal[0] + '">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
            '</button>';
        },
        'user': function(arrVal) {
            tableString += 
            '<td style="min-width: 200px; text-align: right;">' +
            '<button title="Изменить данные учетной записи" type="button" ' +
            'class="btn btn-success btn-sm sav2-opt-btn sav2-upd-' + 'user' + '" ' +
            'data-toggle="modal" data-target="#updateElement" id="' + arrVal[0] + '">' +
                '<i class="fas fa-id-card" aria-hidden="true"></i>' +
            '</button>';
            //lock or unlock button (regarding of current users's state)
            if (arrVal[1]===0) {
                tableString += 
                '<button title="" type="button" ' +
                'class="btn btn-info btn-sm sav2-opt-btn sav2-lock-' + 'user' + '" id="' + arrVal[0] + '" ' +
                'data-toggle="tooltip" data-placement="top" data-original-title="Разблокирован. Нажмите чтобы заблокировать">' +
                    '<i class="fas fa-lock-open" aria-hidden="true"></i>' +
                '</button>';
            } else {
                tableString +=  
                '<button title="" type="button" ' +
                'class="btn btn-warning btn-sm sav2-opt-btn sav2-unlock-' + 'user' + '" id="' + arrVal[0] + '" ' + 
                'data-toggle="tooltip" data-placement="top" data-original-title="Заблокирован. Нажмите чтобы разблокировать">' +
                    '<i class="fas fa-lock" aria-hidden="true"></i>' +
                '</button>';
            }
        },
        'default': function(arrVal) {
            tableString += 
            '<td>' +
            '<button title="Изменить" type="button" ' +
            'class="btn btn-success btn-sm sav2-opt-btn sav2-upd-' + 'default' + '" ' +
            'data-toggle="modal" data-target="#updateElement" id="' + arrVal[0] + '">' +
                '<span class="glyphicon glyphicon-pencil"></span>' +
            '</button>' +
            '<button title="Удалить" type="button" ' +
            'class="btn btn-danger btn-sm sav2-opt-btn sav2-del-' + 'default' + '" id="' + arrVal[0] + '">' +
                '<span class="glyphicon glyphicon-trash"></span>' +
            '</button>';
        }
    };
    //onPageClick
    var onPageClickSwitch = {
        'exit': function(curPageVal) {
            currentPageExit = curPageVal;
            selectExits(currentPageExit);
        },
        'user': function(curPageVal) {
            currentPageUser = curPageVal;
            selectUsers(currentPageUser);
        },
        'default': function(curPageVal){}
    };
    
    var curPage = parseInt(dataVal.page) + 1;// id + 1, i.e. page starts from 0, but in pagination plugin page starts from 1

    if (curPage > numberOfPages) {
        (currentPageSwitch[tableData.prefix] || currentPageSwitch['default'])();
        return;//"exit" fillTable method
    }

    //amount of selected rows info
    tableString +=
    '<div class="input-group">' +
        '<span class="input-group-addon">Всего найдено записей: </span>' +
        '<input id="rowsCount" type="text" class="form-control" ' +
        'disabled="" style="max-width: 200px;" value="' + dataVal.countrows + '">' +
    '</div>' +
    '<hr />';

    tableString += '<ul class="pagination sav2-pages-' + tableData.prefix + '"></ul>';

    //table body start:	
    tableString +=
        '<div class="table-responsive">' +
            '<table class="table table-striped">';

    //header start:
    tableString += '<tr class="info">';

    $.each(tableData.header, function(index, value) { 
        (headerSwitch[tableData.prefix] || headerSwitch['default'])(index, value);
    });

    tableString += '</tr>';
    //header end;

    //rows start:
    $.each(dataVal.rowitems, function(index, value) {
        if (value.length !== 0) {
            tableString += '<tr>';

            //columns start:
            $.each(value, function(index, value) {
                (columnsSwitch[tableData.prefix] || columnsSwitch['default'])(index, value);
            });
            //columns end;

            /** 
             single column with options
             value[0] is supposed to be 'id' of current row(element)	
             */
            (actionColumnsSwitch[tableData.prefix] || actionColumnsSwitch['default'])(value);

            tableString +=     '</td>' + //closing tag for action column
                           '</tr>';
        }
    });
    //rows end;

    tableString +=
            '</table>' +
        '</div>';
    //table body end;

    tableString += '<ul class="pagination sav2-pages-' + tableData.prefix + '"></ul>';

    //fill table content
    $(tableData.content).empty();
    $(tableData.content).html(tableString);
    //pagination start:
    $('.sav2-pages-' + tableData.prefix).twbsPagination({
        totalPages: numberOfPages,
        visiblePages: 7,
        initiateStartPageClick: false,
        startPage: curPage,
        first: '<span class="glyphicon glyphicon-backward" title="В начало"></span>',
        prev: '<span class="glyphicon glyphicon-step-backward" title="Предыдущая"></span>',
        next: '<span class="glyphicon glyphicon-step-forward" title="Следующая"></span>',
        last: '<span class="glyphicon glyphicon-forward" title="В конец"></span>',
        onPageClick: function(event, page) {            
            (onPageClickSwitch[tableData.prefix] || onPageClickSwitch['default'])(page - 1);
        }
    });
    //pagination end;
}

/**
 * SELECT <some_elements>
 * @param {String} queryName - call special method from backend
 * @param {Object} searchParams - object of search paramateres with its values
 * @param {Object} tableData - prefix | content - i.e. element(tag) selector | header
 * @returns {undefined}
 */
function doSelect(queryName, searchParams, tableData) {    
    doAJAX({
        url: restServiceUrl + queryName,
        data: searchParams,
        success: function(message) {
            if ( !processException({message: message, methodName: queryName}) ) {//if exception hasn't occurred  
                var selectedData = $.parseJSON(message);
                fillTable(tableData, selectedData);
                if (queryName === 'select_exits') {
                    $('[data-toggle="tooltip"]').tooltip();
                } else if (queryName === 'select_users') {
                    $('[data-toggle="tooltip"]').tooltip();
                }
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- doSelect (' + queryName + ')', 'INFOBOX_ERROR');
        }
    });
}

/**
 * DELETE <some_elements>
 * @param {String} queryName - call special method from backend
 * @param {Object} searchParams - usually 'id' of manipulated element
 * @param {String} elementDescription - 'EXIT', 'USER'
 * @param {int} curPageId - current page
 * @returns {undefined}
 */
function doDelete(queryName, searchParams, elementDescription, curPageId) {    
    doAJAX({
        url: restServiceUrl + queryName,
        data: searchParams,
        success: function(message) {
            if ( !processException({message: message, methodName: queryName}) ) {//if exception hasn't occurred
                showInfoBox(message, 'INFOBOX_SUCCESS');
                switch (elementDescription) {
                    case 'EXIT':
                        selectExits(curPageId);
                        break;
                    case 'USER':
                        selectUsers(curPageId);
                        break;
                }
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- doDelete (' + queryName + ')', 'INFOBOX_ERROR');
        }
    });
}

/**
 * build input form for called "UpdateModal"-window
 * @param {int} element_id - element's ID
 * @param {String} tmpl_name - template's name
 * @returns {undefined}
 */
function loadUpdateForm(element_id, tmpl_name) {    
    doAJAX({
        url: restServiceUrl + 'draw_panel',
        data: {
            tmplname: tmpl_name
        },
        success: function(message) {
            $('#elementDataUpd').empty();
            $('#elementDataUpd').html(message);
        },
        complete: function(){
            switch (tmpl_name) {
                case 'update_exit_modal':
                    setEditFieldsForUpdateModal(element_id,
                        'select_exit_by_id',
                        { 
                            mainTitle: 'Изменение данных записи по выходу', 
                            paragraph: 'Данные по выходу:' 
                        }
                    );
                    break;
                case 'update_user_modal':
                    setEditFieldsForUpdateModal(element_id,
                        'select_user_by_id',
                        {
                            mainTitle: 'Изменение данных пользователя', 
                            paragraph: 'Данные пользователя:' 
                        }
                    );
                    break;
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- loadUpdateForm (' + tmpl_name + ')', 'INFOBOX_ERROR');
        }
    });
}

/**
 * fill input fields with current(actual) values of "UpdateModal"-window
 * @param {int} element_id - element's ID 
 * @param {String} queryName - call special method from backend
 * @param {Object} modalTitles - text titles for 'mainTitle' | 'paragraph'
 * @returns {undefined}
 */
function setEditFieldsForUpdateModal(element_id, queryName, modalTitles) {    
    doAJAX({
        url: restServiceUrl + queryName,
        data: {
            id: element_id
        },
        success: function(message) {
            if ( !processException({message: message, methodName: queryName}) ) {//if exception hasn't occurred
                $('#updateElement .modal-title').empty();
                $('#updateElement .modal-body p').empty();
                $('#updateElement .modal-title').html(modalTitles.mainTitle);
                $('#updateElement .modal-body p').html(modalTitles.paragraph);

                var elementDataObj = $.parseJSON(message);
                $('#entity').val(elementDataObj.entity);
                $.each(elementDataObj.fields, function(key, value) {
                    //special fields start:
                    if (key.indexOf('calcperiodDevicevalsUpd') !== -1) {
                        $('#' + key).datepicker('update', value);
                    } else if (key.indexOf('isNormativeUpd') !== -1) {
                        if (value === '1') {
                            $('#' + key).prop('checked', true);
                        } else {
                            $('#' + key).prop('checked', false);
                        }
                    } else if (key.indexOf('pointExitUpd') !== -1) {
                        $('#' + key).val(value).change();
                    } else if (key.indexOf('objectsExitUpd') !== -1) {
                        var factoryString = '';
                        
                        $.each(value, function(objStr) {
                            factoryString +=
                            '<div class="col-md-12 sav2-exit-object-item-upd">' +
                            '	<div class="form-group">' +
                            '       <label for="exit-object-name-upd">Объект выхода:</label>' +
                            '       <div class="input-group">' +
                            '           <input type="text" class="form-control exit-object-name-upd" placeholder="Адрес">' +
                            '           <span class="input-group-btn">' +
                            '               <button class="btn btn-default remove-exit-object-upd" title="Удалить">' +
                            '                   <span class="glyphicon glyphicon-minus"></span>' +
                            '               </button>' +
                            '           </span>' +
                            '       </div>' +
                            '	</div>' +
                            '	<div class="form-group">' +
                            '       <input type="text" class="form-control exit-object-note-upd" placeholder="Примечание">' +
                            '       <input type="hidden" class="exit-object-postalindex-upd" />' +
                            '       <input type="hidden" class="exit-object-region-upd" />' +
                            '       <input type="hidden" class="exit-object-town-upd" />' +
                            '       <input type="hidden" class="exit-object-street-upd" />' +
                            '       <input type="hidden" class="exit-object-building-upd" />' +
                            '       <input type="hidden" class="exit-object-apartment-upd" />' +
                            '       <input type="hidden" class="exit-object-geolat-upd" />' +
                            '       <input type="hidden" class="exit-object-geolon-upd" />' +
                            '	</div>' +
                            '</div>'; 
                        });
                        
                        $('.sav2-exit-object-list-upd').append(factoryString);
                        
                        $('.exit-object-name-upd', document).suggestions({
                            token: 'aa87679e3bfbbdaca05a44aa93ad6af10d54045a',
                            type: 'ADDRESS',
                            count: 7,
                            onSelect: function(suggestion) {
                                fillObjectDataFields(suggestion, $(this));
                            }
                        });
                        
                        $('.sav2-exit-object-item-upd').each(function(index, element) {
                            $(element).find('.exit-object-name-upd').val(value[index][0]);
                            $(element).find('.exit-object-note-upd').val(value[index][1]);
                            $(element).find('.exit-object-postalindex-upd').val(value[index][2]);
                            $(element).find('.exit-object-region-upd').val(value[index][3]);
                            $(element).find('.exit-object-town-upd').val(value[index][4]);
                            $(element).find('.exit-object-street-upd').val(value[index][5]);
                            $(element).find('.exit-object-building-upd').val(value[index][6]);
                            $(element).find('.exit-object-apartment-upd').val(value[index][7]);
                            $(element).find('.exit-object-geolat-upd').val(value[index][8]);
                            $(element).find('.exit-object-geolon-upd').val(value[index][9]);
                        });
                    }
                    //special fields end;
                    else {
                        $('#' + key).val(value);
                    }
                });
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- setEditFieldsForUpdateModal (' + queryName + ')', 'INFOBOX_ERROR');
        }
    });
}

/**
 * UPDATE <some_elements>
 * @param {String} queryName - call special method from backend
 * @param {Object} dataObject - POST-parameters
 * @param {function} refreshCallback - callback function to refresh the content afterwards
 * @returns {undefined}
 */
function doUpdate(queryName, dataObject, refreshCallback) {    
    doAJAX({
        url: restServiceUrl + queryName,
        data: dataObject,
        success: function(message) {
            if ( !processException({message: message, methodName: queryName}) ) {//if exception hasn't occurred
                showInfoBox(message, 'INFOBOX_INFO');
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- doUpdate (' + queryName + ')', 'INFOBOX_ERROR');
        },
        complete: function() {
            refreshCallback();
        }
    });
}

/**
 * build input form for called "InsertModal"-window
 * (actually isn't used yet)
 * @param {int} element_id - ?
 * @param {int} additional_id - ?
 * @param {String} tmpl_name - template's name
 * @returns {undefined}
 */
function loadInsertForm(element_id, additional_id, tmpl_name) {    
    doAJAX({
        url: restServiceUrl + 'draw_panel',
        data: {
            tmplname: tmpl_name
        },
        success: function(message) {
            $('#elementDataIns').empty();
            $('#elementDataIns').html(message);
        },
        complete: function(){
            $('#insertElement .modal-title').empty();
            $('#insertElement .modal-body p').empty();
            switch (tmpl_name) {
                case 'insert_exit_modal':

                    break;
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- loadInsertForm (' + tmpl_name + ')', 'INFOBOX_ERROR');
        }
    });
}

/**
 * INSERT <some_elements>
 * (actually isn't used yet)
 * @param {String} queryName - call special method from backend
 * @param {Object} dataObject - POST-parameters
 * @returns {undefined}
 */
function doInsert(queryName, dataObject) {    
    doAJAX({
        url: restServiceUrl + queryName,
        data: dataObject,
        success: function(message) {
            if ( !processException({message: message, methodName: queryName}) ) {//if exception hasn't occurred
                showInfoBox(message, 'INFOBOX_INFO');
            }
        },
        error: function(){
            showInfoBox('error occured during ajax-request to the server : ' +
                'method -- doInsert (' + queryName + ')', 'INFOBOX_ERROR');
        }
    });
}

//tab-2 exits
function selectExits(pageId) {
    doSelect('select_exits',
        {
            page: pageId,
            date: $('#srch-exit-date').val().trim(),
            userfio: $('#srch-exit-userfio').val().trim(),
            userid: $('#srch-exit-userid').val().trim(),
            objectname: $('#srch-exit-objectname').val().trim()
        },
        {
            prefix: 'exit',
            content: '.sav2-edit-exit-table',
            header: ['id', 'День', 'Дата', 'Сотрудник', 'Объекты', 'Цель выхода', 'С', 'До', 'Часы', 'Действие']
        }
    );
}

function updateExit() {
    var objectsJSON = '';
    
    if ($('.sav2-exit-object-item-upd').length === 0) {
        objectsJSON += '{ "objects" : [] }';
    } else {
        objectsJSON += '{ "objects" : [ ';
        $('.sav2-exit-object-item-upd').each(function(index, element) {
            if( $(element).find('.exit-object-name-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() === '' ) {
                return;//skip
            }

            objectsJSON += '[';
            objectsJSON += '"' + $(element).find('.exit-object-name-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-note-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-postalindex-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-region-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-town-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-street-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-building-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-apartment-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-geolat-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            objectsJSON += '"' + $(element).find('.exit-object-geolon-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
            //if street data or building data are empty
            if( $(element).find('.exit-object-street-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() === '' || 
                    $(element).find('.exit-object-building-upd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() === '') {
                objectsJSON += '"1"';
            } else {
                objectsJSON += '"0"';
            }
            //if object item is the last one then "close" array without comma
            if (index === $('.sav2-exit-object-item-upd').length - 1) {
                objectsJSON += ']';
            } else {
                objectsJSON += '],';
            }
        });
        objectsJSON += ' ] }';
    }
    
    doUpdate('update_exit',
        {
            id: $('#updateElement #elementDataUpd #idUpd').val(),
            objects: objectsJSON,
            timeexit: $('#timeexitExitUpd').val().trim(),
            timereturn: $('#timereturnExitUpd').val().trim()
        },
        function() {selectExits(currentPageExit);}
    );
}

//tab-3 users
function selectUsers(pageId) {
    doSelect('select_users',
        {
            page: pageId,
            userfio: $('#srch-user-fio').val().trim()
        },
        {
            prefix: 'user',
            content: '.sav2-edit-user-table',
            header: ['id', 'ФИО сотрудника', 'Действие']
        }
    );
}

function updateUser() {    
    doUpdate('update_user',
        {
            id: $('#updateElement #elementDataUpd #idUpd').val(),
            fio: $('#updateElement #elementDataUpd #fioUserUpd').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim(),
            pass: $('#updateElement #elementDataUpd #passwordUserUpd').val(),
            firstlogin: 1
        },
	function() {selectUsers(currentPageUser);}
    );
}

//initialization: kinda -- "public static void main(String[] args){ ... }"
/**
 *  public static void (String[] args){ ... }
 */
$(document).ready(function(){
    //globals
    currentPageExit = 0;
    currentPageUser = 0;

    var newRecordJSON = '';

    keepUserWorkspace();
    
    //login button
    $(document).on('click', '#send', function(){

        var usr = $('#usr').val().trim();
        var pwd = $('#pwd').val();

        if ($(this).attr('active') === 'true' && usr.length !== 0 && pwd.length !== 0) { 
            doAJAX({
                url: restServiceUrl + 'login',
                data: {
                    id: 'isuservalid',
                    usr: usr,
                    pwd: pwd,
                    grr: ''//grecaptcha.getResponse() @since 23.04.2018
                },
                success: function(message) {
                    //resetLoginForm();//g-recaptcha reset @since 23.04.2018
                    if ( !processException({message: message, methodName: 'login', representType: 'ALERT'}) ) {//if exception hasn't occurred
                        loadUserWorkspace(message);
                    }
                },
                error: function(){
                    //resetLoginForm();//g-recaptcha reset @since 23.04.2018
                    alert('error occured during ajax-request to the server : ' +
                        'method -- login');
                }
            });
        }
    });
    
    //change password button
    $(document).on('click', '#changepass', function(){
        var pwd = $('#userpass').val();
        
        if ($(this).attr('active') === 'true' && pwd.length !== 0) {
            doUpdate('update_user',
                {
                    id: $('#userfio').attr('userid'),
                    fio: $('#userfio').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim(),
                    pass: pwd,
                    firstlogin: 0 
                },
                function() { keepUserWorkspace(); }
            );
        }
        
        //keepUserWorkspace();
    });
    
    //handle 'ENTER' keypress event
    $(document).on('keypress', '#usr', function(e) {
        if (e.which === 13) {
            $('#send').trigger('click');
            return false;
        }
    });

    //handle 'ENTER' keypress event
    $(document).on('keypress', '#pwd', function(e) {
        if (e.which === 13) {
            $('#send').trigger('click');
            return false;
        }
    });
    
    //handle 'INPUT' event -- sign in for the first time --
    $(document).on('input', '#userpass', function(e) {
        if ( newpassIsLegit() ) {
            $('#changepass').attr('active', 'true');
            $('#changepass').removeClass('disabled');
        } else {
            $('#changepass').attr('active', 'false');
            $('#changepass').addClass('disabled');
        }
    });
    
    //handle 'INPUT' event -- sign in for the first time --
    $(document).on('input', '#userrepeat', function(e) {
        if ( newpassIsLegit() ) {
            $('#changepass').attr('active', 'true');
            $('#changepass').removeClass('disabled');
        } else {
            $('#changepass').attr('active', 'false');
            $('#changepass').addClass('disabled');
        }
    });

    //logout button
    $(document).on('click', '#logout', function(){        
        doAJAX({
            url: restServiceUrl + 'logout',
            data: {
                id: '0'
            },
            success: function(message) {
                
            },
            error: function(){
                alert('error occured during ajax-request to the server : ' +
                    'method -- logout');
            },
            complete: function(){
                keepUserWorkspace();
            }
        });
    });

    //Admin workarea options (tabs)
    $(document).on('click', '.sav2-admin-wa .btn-group .btn', function(){
        $('.sav2-admin-wa .btn-group .btn').removeClass('active');
        $(this).addClass('active');

        var tabToShow = '.sav2-tab1';
        
        var showTabSwitch = {
            'showTab2': function(){tabToShow = '.sav2-tab2';},
            'showTab3': function(){tabToShow = '.sav2-tab3';},
            'showTab4': function(){tabToShow = '.sav2-tab4';},
            'showTab5': function(){tabToShow = '.sav2-tab5';},
            'showTab6': function(){tabToShow = '.sav2-tab6';},
            'showTab7': function(){tabToShow = '.sav2-tab7';},
            'default' : function(){tabToShow = '.sav2-tab1';}
        };
        
        (showTabSwitch[$(this).attr('id')] || showTabSwitch['default'])();
        
        $('.sav2-tabs').hide(0, function(){
            $(tabToShow).show(0);
        });
    });

    //modal window for update element -- button "updElementYes"
    $(document).on('click', '#updElementYes', function(){
        switch ($('#updateElement #elementDataUpd #entity').val()) {
            case 'exit':
                updateExit();
				//selectExits(currentPageExit);
                break;
            case 'user':
                updateUser();
                //selectUsers(currentPageUser);
                break;
        }
    });

    //modal window for insert element -- button "insElementYes"
    $(document).on('click', '#insElementYes', function(){
        switch ($('#insertElement #elementDataIns #entity').val()) {
            case 'exit':

                break;
            case 'user':
                
                break;
        }
    });

    /** -- TAB 1 -- **/
    //Admin workarea Tab-1 (button .add-exit-object)
    $(document).on('click', '.add-exit-object', function(){
        var factoryString =
        '<div class="col-md-12 sav2-exit-object-item">' +
        '   <div class="form-group">' +
        '       <label for="exit-object-name">Объект выхода:</label>' +
        '       <div class="input-group">' +
        '           <input type="text" class="form-control exit-object-name" placeholder="Адрес">' +
        '           <span class="input-group-btn">' +
        '               <button class="btn btn-default remove-exit-object" title="Удалить">' +
        '                   <span class="glyphicon glyphicon-minus"></span>' +
        '               </button>' +
        '           </span>' +
        '       </div>' +
        '   </div>' +
        '   <div class="form-group">' +
        '       <input type="text" class="form-control exit-object-note" placeholder="Примечание">' +
        '       <input type="hidden" class="exit-object-postalindex" />' +
        '       <input type="hidden" class="exit-object-region" />' +
        '       <input type="hidden" class="exit-object-town" />' +
        '       <input type="hidden" class="exit-object-street" />' +
        '       <input type="hidden" class="exit-object-building" />' +
        '       <input type="hidden" class="exit-object-apartment" />' +
        '       <input type="hidden" class="exit-object-geolat" />' +
        '       <input type="hidden" class="exit-object-geolon" />' +
        '   </div>' +
        '</div>';

        $('.sav2-exit-object-list').append(factoryString);

        $('.exit-object-name', document).suggestions({
            token: 'aa87679e3bfbbdaca05a44aa93ad6af10d54045a',
            type: 'ADDRESS',
            count: 7,
            onSelect: function(suggestion) {
                fillObjectDataFields(suggestion, $(this));
            }
        });

    });

    //Admin workarea Tab-1 (button .remove-exit-object)
    $(document).on('click', '.remove-exit-object', function(){
        $(this).parents('.sav2-exit-object-item').remove();
    });

    //Admin workarea Tab-1 (select #point)
    $(document).on('change', '#point', function(){
        if ($(this).val() === '5') {
            $('#point-description').removeAttr('style');
        } else {
            $('#point-description').val('');
            $('#point-description').hide();
        }
    });

    /**
     JSON array of objects builders
     -- START --
     */
    //objects
    function buildExitObjects() {
        if ($('.sav2-exit-object-item').length === 0) {
            newRecordJSON += '"objects" : []';
        } else {
            newRecordJSON += '"objects" : [ ';
            $('.sav2-exit-object-item').each(function(index, element) {
                if( $(element).find('.exit-object-name').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() === '' ) {
                    return;//skip
                }
                
                newRecordJSON += '[';
                newRecordJSON += '"' + $(element).find('.exit-object-name').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-note').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-postalindex').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-region').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-town').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-street').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-building').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-apartment').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-geolat').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                newRecordJSON += '"' + $(element).find('.exit-object-geolon').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() + '",';
                //if street data or building data are empty
                if( $(element).find('.exit-object-street').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() === '' || 
                        $(element).find('.exit-object-building').val().replace(/\\/g, "/").replace(/"/g, '\\"').trim() === '') {
                    newRecordJSON += '"1"';
                } else {
                    newRecordJSON += '"0"';
                }
                //if object item is the last one then "close" array without comma
                if (index === $('.sav2-exit-object-item').length - 1) {
                    newRecordJSON += ']';
                } else {
                    newRecordJSON += '],';
                }
            });
            newRecordJSON += ' ]';
        }
    }
    /**
     JSON array of objects builders
     -- END --
     */

    //Admin workarea Tab-1 (button #recordnew -- send record)
    $(document).on('click', '#recordnew', function(){
        $('#recordData').empty();
        var htmlString = '';
        htmlString += '<b>Сотрудник: </b>' + $('#userinfo').val() + '<br />';
        htmlString += '<b>Цель выхода: </b>' + $('#point option:selected').text() + ' ' + $('#point-description').val() + '<br />';
        htmlString += '<b>Время выхода: </b>' + $('#time-exit').val() + '<br />';
        htmlString += '<b>Время возврата: </b>' + $('#time-return').val() + '<br />';
        htmlString += '<b>Объекты: </b>' + '<br />';
        htmlString += '<ul>';
        $('.sav2-exit-object-item').each(function(index, element) {
            htmlString += '<li>';
            htmlString += $(element).find('.exit-object-name').val();
            if ($(element).find('.exit-object-note').val().length > 0) {
                htmlString += ' <span class="label label-info" title="" data-toggle="tooltip" ';
                htmlString += 'data-placement="top" data-original-title="'+ $(element).find('.exit-object-note').val().replace(/"/g, '&quot;') +'">';
                htmlString += ($(element).find('.exit-object-note').val().trim()==='' ? '' : '<i class="fas fa-comment" aria-hidden="true"></i> '+ $(element).find('.exit-object-note').val());
            }
            htmlString += '</span>';
            htmlString += '</li>';
        });
        htmlString += '</ul>';

        $('#recordData').html(htmlString);
        
        $('[data-toggle="tooltip"]').tooltip();
    });

    //Admin workarea Tab-1 (button #addRecordYes -- send record MODAL)
    $(document).on('click', '#addRecordYes', function(){
        newRecordJSON = '';
        newRecordJSON += '{ ';

        newRecordJSON += '"userid" : "' + $('#userinfo').attr('userid') + '", ';
        newRecordJSON += '"pointid" : "' + $('#point').val().trim() + '", ';
        newRecordJSON += '"point_description" : "' + $('#point-description').val().trim() + '", ';
        newRecordJSON += '"time_exit" : "' + $('#time-exit').val().trim() + '", ';
        newRecordJSON += '"time_return" : "' + $('#time-return').val().trim() + '", ';

        //exit-objects
        buildExitObjects();

        newRecordJSON += ' }';

        //alert(newRecordJSON);
        
        doAJAX({
            url: restServiceUrl + 'insert_newrecord',
            data: {
                newRecordJSON: newRecordJSON
            },
            success: function(message) {
                if ( !processException({message: message, methodName: 'insert_newrecord'}) ) {//if exception hasn't occurred
                    resetNewRecordForm();
                    showInfoBox(message, 'INFOBOX_SUCCESS');
                }
            },
            error: function(){
                showInfoBox('error occured during ajax-request to the server : ' +
                    'method -- insert_newrecord', 'INFOBOX_ERROR');
            },
            complete: function(){
                $('html, body').animate({scrollTop: 0}, 500);
            }
        });
    });

    /** -- TAB 2 -- **/
    //Admin workarea Tab-2
    //show up
    $(document).on('click', '#showTab2', function(){
        selectExits(currentPageExit);
    });

    //Admin workarea Tab-2 (datepicker search)
    $(document).on('change', '#srch-exit-date', function(){
        selectExits(currentPageExit);
    });

    //Admin workarea Tab-2 (search)
    $(document).on('input', '.sav2-srch-exit', function(){
        clearTimeout(delayTimer);
        delayTimer = setTimeout(function() {
           selectExits(currentPageExit);
        }, searchLatency);
    });

    //Admin workarea Tab-2 (clear search input)
    $(document).on('click', '.clear-srch-exit', function(){
        $(this).parents('.input-group').find('.sav2-srch-exit').val('');
        selectExits(currentPageExit);
    });

    //Admin workarea Tab-2 (delete exit)
    $(document).on('click', '.sav2-del-exit', function(){
        var delConfirm = confirm('Удалить данную запись (и все связанные с ней объекты) под id: ' + $(this).attr('id'));
        if (delConfirm) {
            doDelete('delete_exit', {id: $(this).attr('id')}, 'EXIT', currentPageExit);
        }
    });
    
    //Admin workarea Tab-2 (update exit)
    $(document).on('click', '.sav2-upd-exit', function(){
        loadUpdateForm($(this).attr('id'), 'update_exit_modal');
    });
    
    //Admin workarea Tab-2 (modal update window)
    //(button .add-exit-object-upd)
    $(document).on('click', '.add-exit-object-upd', function(){
        var factoryString =
        '<div class="col-md-12 sav2-exit-object-item-upd">' +
        '   <div class="form-group">' +
        '       <label for="exit-object-name-upd">Объект выхода:</label>' +
        '	<div class="input-group">' +
        '           <input type="text" class="form-control exit-object-name-upd" placeholder="Адрес">' +
        '           <span class="input-group-btn">' +
        '               <button class="btn btn-default remove-exit-object-upd" title="Удалить">' +
        '                   <span class="glyphicon glyphicon-minus"></span>' +
        '               </button>' +
        '           </span>' +
        '	</div>' +
        '   </div>' +
        '   <div class="form-group">' +
        '       <input type="text" class="form-control exit-object-note-upd" placeholder="Примечание">' +
        '       <input type="hidden" class="exit-object-postalindex-upd" />' +
        '       <input type="hidden" class="exit-object-region-upd" />' +
        '       <input type="hidden" class="exit-object-town-upd" />' +
        '       <input type="hidden" class="exit-object-street-upd" />' +
        '       <input type="hidden" class="exit-object-building-upd" />' +
        '       <input type="hidden" class="exit-object-apartment-upd" />' +
        '       <input type="hidden" class="exit-object-geolat-upd" />' +
        '       <input type="hidden" class="exit-object-geolon-upd" />' +
        '   </div>' +
        '</div>';

        $('.sav2-exit-object-list-upd').append(factoryString);

        $('.exit-object-name-upd', document).suggestions({
            token: 'aa87679e3bfbbdaca05a44aa93ad6af10d54045a',
            type: 'ADDRESS',
            count: 7,
            onSelect: function(suggestion) {
                fillObjectDataFields(suggestion, $(this));
            }
        });

    });
    
    //Admin workarea Tab-2
    //(button .remove-exit-object-upd)
    $(document).on('click', '.remove-exit-object-upd', function(){
        $(this).parents('.sav2-exit-object-item-upd').remove();
    });
    
    //Admin workarea Tab-2 (datepicker: #excel-period-from)
    $(document).on('change', '#excel-period-from', function(){
        var periodFrom = $(this).datepicker('getDate');
        var periodTill = $('#excel-period-till').datepicker('getDate');
        if(periodFrom > periodTill){
            $('#excel-period-till').datepicker('update', $(this).datepicker('getDate'));
        }
    });
    
    //Admin workarea Tab-2 (datepicker: #excel-period-till)
    $(document).on('change', '#excel-period-till', function(){
        var periodFrom = $('#excel-period-from').datepicker('getDate');
        var periodTill = $(this).datepicker('getDate');
        if(periodFrom > periodTill){
            $('#excel-period-from').datepicker('update', $(this).datepicker('getDate'));
        }
    });
    
    //Admin workarea Tab-2 (button writeDataIntoXLSX)
    $(document).on('click', '#writeDataIntoXLSX', function(){        
        doAJAX({
            url: restServiceUrl + 'exitsReportSOAP',
            data: {
                startDate: $('#excel-period-from').val().trim(),
                endDate: $('#excel-period-till').val().trim()
            },
            timeout: 300000,
            success: function(message) {
                if ( !processException({message: message, methodName: 'Tab-2 click->#writeDataIntoXLSX'}) ) {//if exception hasn't occurred
                    window.location = window.location.href + message;
                    showInfoBox("Данные успешно выгрузились", 'INFOBOX_INFO');
                }
            },
            error: function(){
                showInfoBox('error occured during ajax-request to the server : ' + 
                    'method -- Tab-2 click->#writeDataIntoXLSX', 'INFOBOX_ERROR');
            }
        });
    });
    
    /** -- TAB 3 -- **/
    //Admin workarea Tab-3
    //show up
    $(document).on('click', '#showTab3', function(){
        selectUsers(currentPageUser);
    });
    
    //Admin workarea Tab-3 (search)
    $(document).on('input', '.sav2-srch-user', function(){
        clearTimeout(delayTimer);
        delayTimer = setTimeout(function() {
           selectUsers(currentPageUser);
        }, searchLatency);
    });

    //Admin workarea Tab-3 (clear search input)
    $(document).on('click', '.clear-srch-user', function(){
        $(this).parents('.input-group').find('.sav2-srch-user').val('');
        selectUsers(currentPageUser);
    });
    
    //Admin workarea Tab-3 unlock user
    $(document).on('click', '.sav2-unlock-user', function(){
        doUpdate('unlock_user',
            {
                id: $(this).attr('id')  
            },
            function() {selectUsers(currentPageUser);}
        );
    });
    
    //Admin workarea Tab-3 lock user
    $(document).on('click', '.sav2-lock-user', function(){
        doUpdate('lock_user',
            {
                id: $(this).attr('id')  
            },
            function() {selectUsers(currentPageUser);}
        );
    });
    
    //Admin workarea Tab-3 (update user)
    $(document).on('click', '.sav2-upd-user', function(){
        loadUpdateForm($(this).attr('id'), 'update_user_modal');
    });
	
	//tab button #go-to-docx
	$(document).on('click', '#go-to-docx', function(){
        window.location = "http://kom-es01-dev01:8888/docx/";
    });
	
	//tab button #go-to-acts
	$(document).on('click', '#go-to-acts', function(){
        window.location = "http://kom-es01-app25:8888/acts/";
    });
});
