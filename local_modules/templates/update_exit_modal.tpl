<input type="hidden" id="entity" />
<input type="hidden" id="idUpd" />

<div class="form-group">
	<div class="input-group">
		<span class="input-group-addon">Сотрудник: </span>
		<input id="fioExitUpd" type="text" class="form-control" value="" disabled="">
	</div>
</div>

<div class="form-group">
	<label for="dateExitUpd">Дата выхода:</label>
	<input type="text" class="form-control sav2-field-upd" id="dateExitUpd" placeholder="" disabled="">
</div>

<div class="form-group">
	<label for="time">Время:</label>
	<div class="input-group">
		<span class="input-group-addon">c: </span>
		<input id="timeexitExitUpd" type="text" class="form-control" placeholder="" disabled="">
		<span class="input-group-addon">до: </span>
		<input id="timereturnExitUpd" type="text" class="form-control" placeholder="" disabled="">
	</div>
</div>

<div class="form-group">
	<label for="pointExitUpd">Цель выхода:</label>
	<select class="form-control" id="pointExitUpd" disabled="">
		
	</select>
	<br />
	<input id="pointDescriptionExitUpd" type="text" class="form-control" disabled="">	
</div>

<div class="form-group">
	<div class="input-group">
		<input type="text" class="form-control" value="Объекты:" disabled>
		<span class="input-group-btn">
			<button class="btn btn-default add-exit-object-upd" title="Добавить">
				<span class="glyphicon glyphicon-plus"></span>
			</button>
		</span>
	</div>
</div>
<div class="form-group">
	<div class="sav2-exit-object-list-upd">
		<!-- EXIT-OBJECT start: -->
		
		<!-- EXIT-OBJECT end; -->		
	</div>
</div>
<div class="clear"></div>
<script>
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
				$('#pointExitUpd').empty();
				$('#pointExitUpd').html(optionsString);
			}
		},
		error: function () {
			alert('error occured during ajax-request to the server : ' +
				  'method -- select_points');
		},
		complete: function () {
			
		}
	});
</script>
