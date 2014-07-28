var tech = {

     

	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	console.log("Tech Mode Back key pressed");
	 	app.renderHomeView();
	},


	renderTechView: function() 
	{
		var myHtml = 
			"<img src='img/header_tech.png' width='100%' />" +
			"<button type='button' class='back_icon' onclick='tech.handleBackKey()'><img src='img/go_back.png'/></button>"+
			"<div class='bt_icon'><img src='img/bluetooth_off.png' /></div>" +
            "<div class='reg_icon'><img src='img/reg_no.png' /></div>"

		$('body').html(myHtml);  			
	},



};






	
