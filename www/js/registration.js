var reg = {

     

	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	console.log("Reg Mode Back key pressed");
	 	app.renderHomeView();
	},


	renderRegView: function() 
	{	
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOn + "</div>" : "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOff + "</div>";
		
		var myHtml = 
			"<img src='img/header_reg.png' width='100%' />" +
			"<button type='button' class='back_icon' onclick='reg.handleBackKey()'><img src='img/go_back.png'/></button>"+
			myRegIcon +
            myBluetoothIcon

		$('body').html(myHtml);  

	},



};






	
