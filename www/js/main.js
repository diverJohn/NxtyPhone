
// Use window.isPhone to show global var or just use without "window." ...
var isPhone      = false;
var isRegistered = true;



var szBtIconOn     = "<img src='img/bluetooth_on.png' />";
var szBtIconOff    = "<img src='img/bluetooth_off.png' />";
var szRegIconOn    = "<img src='img/reg_yes.png' />";
var szRegIconOff   = "<img src='img/reg_no.png' />";
var szMyStatusLine = "<p id='status_line_id' class='status_line'></p>";


var MainLoopIntervalHandle = null;


// UpdateStatusLine....................................................................................
function UpdateStatusLine(statusText)
{
	document.getElementById("status_line_id").innerHTML = statusText;
}


var app = {
     
    // deviceready Event Handler
    //
  	// PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {
    	console.log( "device ready" );
    	
    	// Only start bluetooth if on a phone...
    	if( window.isPhone )
    	{
            StartBluetooth();
        }
        
        app.renderHomeView();
        

    },   
       
       
    showAlert: function (message, title) {
      if(window.isPhone) {
        navigator.notification.alert(message, null, title, 'ok');
      } else {
        alert(title ? (title + ": " + message) : message);
      }
    },




	// Handle the Check for SW Update key
	handleSwUpdateKey: function()
	{
	 	console.log("SW Update key pressed");
	 	
	 	if( isBluetoothCnx )
	 	{
//	 		swupdate.renderSwUpdateView();
nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);  	 		
	 	}
	 	else
	 	{
nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);  	
		 	this.showAlert("SW Update mode not allowed...", "Bluetooth not connected.");
		 	
	 	}

	},

	// Handle the Teck Mode key
	handleTechModeKey: function()
	{
	 	console.log("Tech Mode key pressed");
	 	
	 	if( isBluetoothCnx )
	 	{
	 		tech.renderTechView();
	 	}
	 	else
	 	{
		 	this.showAlert("Tech mode not allowed...", "Bluetooth not connected.");
	 	}
	},


	// Handle the Register key
	handleRegKey: function()
	{
	 	console.log("Reg key pressed");
	 	
	 	if( isBluetoothCnx )
	 	{

var u8 = new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]);			
nxty.SendNxtyMsg(NXTY_REGISTRATION_REQ, u8, u8.length ); 			
			reg.renderRegView();
	 	}
	 	else
	 	{
reg.renderRegView();
//		 	this.showAlert("Registration mode not allowed...", "Bluetooth not connected.");
	 	}
	},
	
	


	renderHomeView: function() 
	{
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOn + "</div>" : "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOff + "</div>";
		var myRegButton     = isRegistered   ? "<button id='reg_button_id' type='button' class='mybutton' onclick='app.handleRegKey()'></button>" : "<button id='reg_button_id' type='button' class='mybutton' onclick='app.handleRegKey()'><img src='img/button_Register.png' /></button>";
		
		var myHtml = 
			"<img src='img/header_main.png' width='100%' />" +
			myBluetoothIcon +
            myRegIcon +
   			"<button type='button' class='mybutton' onclick='app.handleSwUpdateKey()'><img src='img/button_SwUpdate.png' /></button>" +
			"<button type='button' class='mybutton' onclick='app.handleTechModeKey()'><img src='img/button_TechMode.png'/></button>" +
  			myRegButton +
  			szMyStatusLine;
  			
		$('body').html(myHtml); 
		
		// Start the handler to be called every second...
		MainLoopIntervalHandle = setInterval(app.MainLoop, 1000 ); 			
	},


	initialize: function() {
	
		if( ImRunningOnBrowser )
		{
			console.log("running on browser");
	
	        // Browser...
	        window.isPhone = false;
	        this.onDeviceReady();
	    }
	    else
	    {
		 	console.log("running on phone");
		 	
	        // On a phone....
	        window.isPhone = true;
		 		        
	        // Call onDeviceReady when PhoneGap is loaded.
	        //
	        // At this point, the document has loaded but phonegap-1.0.0.js has not.
	        // When PhoneGap is loaded and talking with the native device,
	        // it will call the event `deviceready`.
	        // 
	        document.addEventListener('deviceready', this.onDeviceReady, false);
        }

	},


	MainLoop: function() 
	{
		console.log("App: Main loop..." );
		
		// See if status command received yet...
		if( window.nxtyRxLastCmd == 0 )
		{
			// Get the status so we can see if we need to register or not...
			nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);  
		}
		else if( window.nxtyRxLastCmd == window.NXTY_STATUS_RSP )
		{
			// See if we need to allow the registration button...
			if( isRegistered == false )
			{
				document.getElementById("reg_button_id").innerHTML = "<img src='img/button_Register.png' />";
			}
		    clearInterval(MainLoopIntervalHandle);
		}
		
	},



};






	
