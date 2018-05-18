<div class="row">
	<div class="col-md-12">
		<div class="alert alert-success" role="alert">
			<i class="fas fa-user-circle" aria-hidden="true" style="font-size:25px;"></i> Первичный вход в систему. Пожалуйста, измените пароль на новый (уникальный) для своей учетной записи.
		</div>
	</div>
	<div class="col-md-12">
		<div class="form-group">
			<label for="userfio">Пользователь:</label>
			<input type="text" class="form-control" id="userfio" value="[@userfio]" userid="[@userid]" disabled="">
		</div>
		<div class="form-group">
			<label for="userpass">Новый пароль:</label>
			<input type="password" class="form-control" id="userpass">
		</div>
		<div class="form-group">
			<label for="userrepeat">Новый пароль (повторно):</label>
			<input type="password" class="form-control" id="userrepeat">
		</div>
	</div>
	<div class="col-md-12">
		<button class="btn btn-lg btn-primary btn-block disabled" type="submit" id="changepass" active="false">Изменить</button>
	</div>
</div>