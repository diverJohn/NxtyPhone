var tech = {

     

	// Handle the Teck Mode key
	handleTechModeKey: function()
	{
	 	console.log("Tech Mode key pressed");
	 	app.renderHomeView();
	},


	renderTechView: function() 
	{
		var myHtml = 
			"<img src='img/header_tech.png' width='100%' />" +
			"<div class='bt_icon'><img src='img/bluetooth_off.png' /></div>" +
            "<div class='reg_icon'><img src='img/reg_no.png' /></div>" +
			"<button type='button' class='mybutton' onclick='tech.handleTechModeKey()'><img src='img/button_TechMode.png'/></button>"

		$('body').html(myHtml);  			
	},



};






	
