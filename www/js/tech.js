var tech = {

     

	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	console.log("Tech Mode Back key pressed");
	 	app.renderHomeView();
	},


	renderTechView: function() 
	{
/*
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOn + "</div>" : "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOff + "</div>";
		
		var myHtml = 
			"<img src='img/header_tech.png' width='100%' />" +
			"<button type='button' class='back_icon' onclick='tech.handleBackKey()'><img src='img/go_back.png'/></button>"+
			myRegIcon +
            myBluetoothIcon
*/


var myStyle = 
"<style>" +
"* { padding: 0; margin: 0 }" +
"body { height: 100%; white-space: nowrap }" +
"html { height: 100% }" +
".red { background: red }" +
".blue { background: blue }" +
".yellow { background: yellow }" +
".header { width: 100%; height: 10%; position: fixed }" +
".wrapper { width: 1000%; height: 100%; background: green }" +
".page { width: 10%; height: 100%; float: left; -webkit-overflow-scrolling: touch; }" +
"</style>";


var myHtml = 
"<div class='header red'></div>" +
"<div class='wrapper'>" +
    "<div class='page yellow'></div>" +
    "<div class='page blue'></div>"   +
    "<div class='page yellow'></div>" +
    "<div class='page blue'></div>"   +
            "<div class='page yellow'></div>" +
    "<div class='page blue'></div>"   +
        "<div class='page yellow'></div>" +
    "<div class='page blue'></div>"   +
        "<div class='page yellow'></div>" +
    "<div class='page blue'></div>" +
"</div>";

        $('head').html(myStyle); 
		$('body').html(myHtml);  			
	},



};






	
