<div class="sav2-admin-wa">
<div class="row">
	<div class="col-md-12">
		<div class="btn-group" role="group">
			  <button type="button" class="btn btn-default active" id="showTab1">Новая запись</button>
			  <button type="button" class="btn btn-default" id="showTab2">Журнал</button>
			  <button type="button" class="btn btn-default" id="showTab3" [@hide]>Пользователи</button>
			  <button type="button" class="btn btn-default" id="go-to-docx">Акт обследования</button>
			  <button type="button" class="btn btn-default" id="go-to-acts" [@uhta]>Бланки Ухта</button>
			  <button type="button" class="btn btn-primary" id="logout">Выйти</button>
		</div>
	</div>
</div>

<br />

<div class="row">
	<div class="col-md-12" id="sav2-infobox-info">
				
	</div>
</div>
<!-- TAB 1 -->
<div class="row sav2-tabs sav2-tab1">
	<div class="col-md-12">
		<!-- -->
		<div class="col-md-4">
			<div class="input-group">
				<span class="input-group-addon">Сотрудник: </span>
				<input id="userinfo" type="text" class="form-control" value="[@userfio]" userid="[@userid]" disabled="">
			</div>
			<br />
		</div>
		
		<div class="col-md-8">
			<div class="input-group">
				<span class="input-group-addon">Подразделение: </span>
				<input id="departmentinfo-tab3" type="text" class="form-control" value="[@departmentname]" departmentid="[@departmentid]" disabled="">
			</div>
		</div>
		
		<div class="col-md-12">
			<hr />
		</div>
		
		<div class="col-md-6">
			<div class="form-group">
				<label for="point">Цель выхода:</label>
				<select class="form-control" id="point">
					
				</select>
				<br />
				<input id="point-description" type="text" class="form-control" style="display: none;">	
			</div>
		</div>
		
		<div class="col-md-6">
			<div class="form-group">
				<label for="time">Время:</label>
				<div class="input-group">
					<span class="input-group-addon">c: </span>
					<input id="time-exit" type="text" class="form-control" placeholder="00:00">
					<span class="input-group-addon">до: </span>
					<input id="time-return" type="text" class="form-control" placeholder="00:00">
				</div>
			</div>
		</div>
		
		<div class="col-md-12">
			<hr />
		</div>
		<!-- -->
		<!-- EXIT-OBJECT HEADER start: -->
		<div class="col-md-6">
			<div class="form-group">
				<div class="input-group">
					<input type="text" class="form-control" value="Объекты:" disabled>
					<span class="input-group-btn">
						<button class="btn btn-default add-exit-object" title="Добавить">
							<span class="glyphicon glyphicon-plus"></span>
						</button>
					</span>
				</div>
			</div>
		</div>
		<!-- EXIT-OBJECT HEADER end; -->
		<!-- EXIT-OBJECTS start: -->
		<div class="sav2-exit-object-list">
			<!-- EXIT-OBJECT start: -->
			
			<!-- EXIT-OBJECT end; -->		
		</div>
		<!-- EXIT-OBJECTS end; -->
	</div>
	<div class="col-md-12">
		<div class="col-md-12">
			<hr />
		</div>
		<div class="col-md-12">
			<button class="btn btn-lg btn-primary" data-toggle="modal" data-target="#addRecord" id="recordnew">Записаться</button>
		</div>
	</div>
	
	<!-- Modal -->
	<div id="addRecord" class="modal fade" role="dialog">
	  <div class="modal-dialog">
		<!-- Modal content-->
		<div class="modal-content">
		  <div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">&times;</button>
			<h4 class="modal-title">Добавление новой записи в журнал</h4>
		  </div>
		  <div class="modal-body">
			<p>Данные новой записи:</p>
			<hr />
			<div id="recordData">
					
			</div>
		  </div>
		  <div class="modal-footer">
			<button type="button" class="btn btn-default" data-dismiss="modal" id="addRecordYes">Добавить</button>
			<button type="button" class="btn btn-default" data-dismiss="modal" id="addRecordNo">Отмена</button>
		  </div>
		</div>

	  </div>
	</div>
</div>
<!-- TAB 2 -->
<div class="row sav2-tabs sav2-tab2">	
	<div class="col-md-12">
		<div class="row" [@hide]>
			<div class="col-md-12">
				<p>Отчет по выходам:</p>
			</div>
			
			<div class="col-md-6">
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">Период </span>
						<span class="input-group-addon">от: </span>
						<input id="excel-period-from" type="text" class="form-control">
						<span class="input-group-addon">до: </span>
						<input id="excel-period-till" type="text" class="form-control">
					</div>
				</div>
			</div>
			
			<div class="col-md-6">
				<button id="writeDataIntoXLSX" title="Выгрузить в Excel" type="button" class="btn btn-success">Выгрузить в Excel&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-th"></span></button>
			</div>	
		</div>
		<hr [@hide] />
		<p>Поиск записей:</p>
		<div class="row">
			<div class="col-md-12">
				<input type="hidden" value="[@useridsrch]" class="form-control sav2-srch-exit" id="srch-exit-userid">
			</div>
			<div class="col-md-4 col-srch">
				<div class="input-group">
					<span class="input-group-addon">Дата выхода: </span>
					<input type="text" class="form-control sav2-srch-exit" id="srch-exit-date">
					<span class="input-group-btn">
						<button class="btn btn-default clear-srch-exit" title="Очистить" id="clear-srch-exit-date">
							<span class="glyphicon glyphicon-remove"></span>
						</button>
					</span>
				</div>
			</div>
			<div class="col-md-6 col-srch">
				<div class="input-group">
					<span class="input-group-addon">Объект выхода: </span>
					<input type="text" class="form-control sav2-srch-exit" id="srch-exit-objectname">
					<span class="input-group-btn">
						<button class="btn btn-default clear-srch-exit" title="Очистить" id="clear-srch-exit-objectname">
							<span class="glyphicon glyphicon-remove"></span>
						</button>
					</span>
				</div>
			</div>
			<div class="col-md-6 col-srch" [@hide]>
				<div class="input-group">
					<span class="input-group-addon">ФИО сотрудника: </span>
					<input type="text" class="form-control sav2-srch-exit" id="srch-exit-userfio">
					<span class="input-group-btn">
						<button class="btn btn-default clear-srch-exit" title="Очистить" id="clear-srch-exit-userfio">
							<span class="glyphicon glyphicon-remove"></span>
						</button>
					</span>
				</div>
			</div>
		</div>
		<hr />
		<p>Список записей:</p>
		<div class="sav2-edit-exit-table">
		<!-- DYNAMIC start: -->
		
		<!-- DYNAMIC end; -->
		</div>	
	</div>
</div>

<!-- TAB 3 -->
<div class="row sav2-tabs sav2-tab3">	
	<div class="col-md-12">
		<div class="row">
		
			<div class="col-md-6">
				<div class="input-group">
					<span class="input-group-addon">Подразделение: </span>
					<input id="departmentinfo-tab3" type="text" class="form-control" value="[@departmentname]" departmentid="[@departmentid]" disabled="">
				</div>
			</div>
			
		</div>
		<hr />
		<p>Поиск пользователей:</p>
		<div class="row">
			<div class="col-md-6 col-srch">
				<div class="input-group">
					<span class="input-group-addon">ФИО пользователя: </span>
					<input type="text" class="form-control sav2-srch-user" id="srch-user-fio">
					<span class="input-group-btn">
						<button class="btn btn-default clear-srch-user" title="Очистить" id="clear-srch-user-fio">
							<span class="glyphicon glyphicon-remove"></span>
						</button>
					</span>
				</div>
			</div>
		</div>
		<hr />
		<p>Список записей:</p>
		<div class="sav2-edit-user-table">
		<!-- DYNAMIC start: -->
		
		<!-- DYNAMIC end; -->
		</div>
	</div>
</div>

<!-- TAB 7 -->
<div class="row sav2-tabs sav2-tab7">

</div>

<!-- Modal -->
<div id="updateElement" class="modal fade" role="dialog">
  <div class="modal-dialog">
	<!-- Modal content-->
	<div class="modal-content">
	  <div class="modal-header">
		<button type="button" class="close" data-dismiss="modal">&times;</button>
		<h4 class="modal-title"></h4>
	  </div>
	  <div class="modal-body">
		<p></p>
		<div id="elementDataUpd">
				
		</div>
	  </div>
	  <div class="modal-footer">
		<button type="button" class="btn btn-default" data-dismiss="modal" id="updElementYes">Сохранить</button>
		<button type="button" class="btn btn-default" data-dismiss="modal" id="updElementNo">Отмена</button>
	  </div>
	</div>

  </div>
</div>

<!-- Modal -->
<div id="insertElement" class="modal fade" role="dialog">
  <div class="modal-dialog">
	<!-- Modal content-->
	<div class="modal-content">
	  <div class="modal-header">
		<button type="button" class="close" data-dismiss="modal">&times;</button>
		<h4 class="modal-title"></h4>
	  </div>
	  <div class="modal-body">
		<p></p>
		<div id="elementDataIns">
				
		</div>
	  </div>
	  <div class="modal-footer">
		<button type="button" class="btn btn-default" data-dismiss="modal" id="insElementYes">Добавить</button>
		<button type="button" class="btn btn-default" data-dismiss="modal" id="insElementNo">Отмена</button>
	  </div>
	</div>

  </div>
</div>

</div>
<br />
<br />
<script>
	$('#time-exit').inputmask({ mask: "99:99", 
								greedy: false, 
								oncomplete: function(){
									$(this).val( $(this).val().replace(/_/g, '0') );
									var hoursNminutes = $(this).val().split(':');
									if(parseInt(hoursNminutes[0])>18){
										hoursNminutes[0]='18';
									}
									if(parseInt(hoursNminutes[0])<9){
										hoursNminutes[0]='09';
									}
									if(parseInt(hoursNminutes[1])>59){
										hoursNminutes[1]='59';
									}
									var hours = (parseInt(hoursNminutes[0]) < 10 ? '0'+hoursNminutes[0] : hoursNminutes[0]);
									var minutes = (parseInt(hoursNminutes[1]) < 10 ? '0'+hoursNminutes[1] : hoursNminutes[1]);
									$(this).val(hoursNminutes[0]+':'+hoursNminutes[1]);
								},
								onincomplete: function(){
									$(this).val( $(this).val().replace(/_/g, '0') );
									var hoursNminutes = $(this).val().split(':');
									if(parseInt(hoursNminutes[0])>18){
										hoursNminutes[0]='18';
									}
									if(parseInt(hoursNminutes[0])<9){
										hoursNminutes[0]='09';
									}
									if(parseInt(hoursNminutes[1])>59){
										hoursNminutes[1]='59';
									}
									var hours = (parseInt(hoursNminutes[0]) < 10 ? '0'+hoursNminutes[0] : hoursNminutes[0]);
									var minutes = (parseInt(hoursNminutes[1]) < 10 ? '0'+hoursNminutes[1] : hoursNminutes[1]);
									$(this).val(hoursNminutes[0]+':'+hoursNminutes[1]);
								}
							});
							
	$('#time-return').inputmask({ mask: "99:99", 
								greedy: false, 
								oncomplete: function(){
									$(this).val( $(this).val().replace(/_/g, '0') );
									var hoursNminutes = $(this).val().split(':');
									if(parseInt(hoursNminutes[0])>18){
										hoursNminutes[0]='18';
									}
									if(parseInt(hoursNminutes[0])<9){
										hoursNminutes[0]='09';
									}
									if(parseInt(hoursNminutes[1])>59){
										hoursNminutes[1]='59';
									}
									var hours = (parseInt(hoursNminutes[0]) < 10 ? '0'+hoursNminutes[0] : hoursNminutes[0]);
									var minutes = (parseInt(hoursNminutes[1]) < 10 ? '0'+hoursNminutes[1] : hoursNminutes[1]);
									$(this).val(hoursNminutes[0]+':'+hoursNminutes[1]);
								},
								onincomplete: function(){
									$(this).val( $(this).val().replace(/_/g, '0') );
									var hoursNminutes = $(this).val().split(':');
									if(parseInt(hoursNminutes[0])>18){
										hoursNminutes[0]='18';
									}
									if(parseInt(hoursNminutes[0])<9){
										hoursNminutes[0]='09';
									}
									if(parseInt(hoursNminutes[1])>59){
										hoursNminutes[1]='59';
									}
									var hours = (parseInt(hoursNminutes[0]) < 10 ? '0'+hoursNminutes[0] : hoursNminutes[0]);
									var minutes = (parseInt(hoursNminutes[1]) < 10 ? '0'+hoursNminutes[1] : hoursNminutes[1]);
									$(this).val(hoursNminutes[0]+':'+hoursNminutes[1]);
								}
							});
	
	$('#srch-exit-date').datepicker({
		format: "dd-mm-yyyy",
		viewMode: "months", 
		minViewMode: "days",
		language: 'ru'
	});
	
	$('#excel-period-from').datepicker({
		format: "dd-mm-yyyy",
		viewMode: "months", 
		minViewMode: "days",
		language: 'ru'
	});
	
	$('#excel-period-till').datepicker({
		format: "dd-mm-yyyy",
		viewMode: "months", 
		minViewMode: "days",
		language: 'ru'
	});
	
	$.ajax({
		type: "POST",
		url: restServiceUrl + "select_points",
		data: {
			'id': '0'
		},
		dataType: "text",
		timeout: 10000,
		success: function (message) {
			if (message == 'ERROR_ACCESS_DENIED') {
				alert('access denied : method -- select_points');
			} else if (message.indexOf('ERROR_PDO') != -1) {
				var errorInfo = message.split('|');
				alert('PDO Error: (' + errorInfo[1] + ') : method -- select_points');
			} else {
				var pointsData = $.parseJSON(message);
				var optionsString = '';
				$.each(pointsData.points, function(index, value){
					if(value.length!=0){
						optionsString += '<option value="'+value.id+'">'+value.name+'</option>';
					}
				});
				optionsString += '<option value="5">Другое:</option>';
				$('#point').empty();
				$('#point').html(optionsString);
			}
		},
		error: function () {
			alert('error occured during ajax-request to the server : ' +
				  'method -- select_points');
		},
		complete: function () {
			
		}
	});
	
	var sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7);
	$('#excel-period-from').datepicker('update', sevenDaysAgo);
	$('#excel-period-till').datepicker('update', new Date());
	
	$('[data-toggle="tooltip"]').tooltip();
</script>