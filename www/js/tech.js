var tech = {

     

	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	console.log("Tech Mode Back key pressed");
	 	app.renderHomeView();
	},


	renderTechView: function() 
	{	
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div class='reg_icon'><img src='img/reg_yes.png' /></div>"     : "<div class='reg_icon'><img src='img/reg_no.png' /></div>";
		
		var myHtml = 
			"<img src='img/header_tech.png' width='100%' />" +
			"<button type='button' class='back_icon' onclick='tech.handleBackKey()'><img src='img/go_back.png'/></button>"+
			myRegIcon +
            myBluetoothIcon

		$('body').html(myHtml);  			
	},



};






	
