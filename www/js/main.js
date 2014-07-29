
// Use window.isPhone to show global var or just use without "window." ...
var isPhone = false;
var isRegistered   = false;


var BluetoothCnxTimer = null;

// Use the following as a global variable, "window.isBluetoothCnx", to determine if connected.
var isBluetoothCnx          = false;
var LastBluetoothIconStatus = false;

// StartBluetooth...................................................................................
function StartBluetooth()
{
	console.log("starting bluetooth");
	bluetoothle.initialize(initializeSuccess, initializeError);
}


function initializeSuccess(obj)
{
  if (obj.status == "initialized")
  {
    // jdo: If we initialize successfully, start a loop to maintain a connection...
  	console.log("Initialization successful, started Cnx Status Timer with 30 sec freq...");
  	BluetoothLoop();
  }
  else
  {
    console.log("Unexpected initialize status: " + obj.status);
  }
}

function initializeError(obj)
{
  console.log("Initialize error: " + obj.error + " - " + obj.message);
}



// BluetoothLoop...................................................................................
// Check every 30 seconds for a connection...
function BluetoothLoop()
{
	bluetoothle.isConnected( isConnectedCallback );
	
	// Check again in 30 seconds...
	BluetoothCnxTimer = setTimeout(BluetoothLoop, 30000);
}

function isConnectedCallback(obj)
{
	if(obj.isConnected)
	{
		isBluetoothCnx = true;
		console.log("bluetooth cnx callback: Cnx" );
	}
	else
	{
		isBluetoothCnx = false;
	    console.log("bluetooth cnx callback: Not Cnx" );
	    StartBluetoothScan();
	}

	// Now see if the icon needs to be updated...	
	if( LastBluetoothIconStatus != isBluetoothCnx )
	{
		// update the bluetooth icon...
		if( isBluetoothCnx )
		{
			document.getElementById("bt_icon_id").innerHTML = "<img src='img/bluetooth_on.png' />";
		}
		else
		{
			document.getElementById("bt_icon_id").innerHTML = "<img src='img/bluetooth_off.png' />";
		}
		LastBluetoothIconStatus = isBluetoothCnx;
	}
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


	// Handle the Register key
	handleRegKey: function()
	{
	 	console.log("Reg key pressed");
	 	this.showAlert("Reg key pressed!", "Info");
	},

	// Handle the Check for SW Update key
	handleSwUpdateKey: function()
	{
	 	console.log("SW Update key pressed");
//	 	this.showAlert("Check for SW Update Key pressed!", "Info");
	},

	// Handle the Teck Mode key
	handleTechModeKey: function()
	{
	 	console.log("Tech Mode key pressed");
	 	tech.renderTechView();
	},


	renderHomeView: function() 
	{
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'><img src='img/bluetooth_on.png' /></div>" : "<div  id='bt_icon_id' class='bt_icon'><img src='img/bluetooth_off.png' /></div>";
		var myRegIcon       = isRegistered   ? "<div class='reg_icon'><img src='img/reg_yes.png' /></div>"     : "<div class='reg_icon'><img src='img/reg_no.png' /></div>";
		var myRegButton     = isRegistered   ? "" : "<button type='button' class='mybutton' onclick='app.handleRegKey()'><img src='img/button_Register.png' /></button>";
		
		var myHtml = 
			"<img src='img/header_main.png' width='100%' />" +
			myBluetoothIcon +
            myRegIcon +
   			"<button type='button' class='mybutton' onclick='app.handleSwUpdateKey()'><img src='img/button_SwUpdate.png' /></button>" +
			"<button type='button' class='mybutton' onclick='app.handleTechModeKey()'><img src='img/button_TechMode.png'/></button>" +
  			myRegButton;
  			
		$('body').html(myHtml);  			
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


};






	
