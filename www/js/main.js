
// Use window.isPhone to show global var or just use without "window." ...
var isPhone      = false;
var isRegistered = true;



var szBtIconOn     = "<img src='img/bluetooth_on.png' />";
var szBtIconOff    = "<img src='img/bluetooth_off.png' />";
var szRegIconOn    = "<img src='img/reg_yes.png' />";
var szRegIconOff   = "<img src='img/reg_no.png' />";
var szMyStatusLine = "<p id='status_line_id' class='status_line'></p>";
var myModel        = "590NABC-DE-F";
var mySn           = "12345678";
//var myModel        = "modelTest";
//var mySn           = "12345";
var myUrl          = "https://nextivity-sandbox-connect.axeda.com:443/ammp/";


var MainLoopIntervalHandle = null;

// Determine which messages get sent to the console.  1 normal, 10 verbose.
// Level  1: Flow and errors.
// Level  2: Raw data
// Level  3: Timing loops
// Level 10: Bluetooth processing.
// Level 99: Error, print in red.
var PrintLogLevel = 1;

// PrintLog............................................................................................
function PrintLog(level, txt)
{
    if( level == 99 )
    {
        console.error(txt);
    }
    else if( level <= PrintLogLevel )
    { 
        console.log(txt);
    }
}

// UpdateStatusLine....................................................................................
function UpdateStatusLine(statusText)
{
	document.getElementById("status_line_id").innerHTML = statusText;
}

// HandleButtonDown............................................................................................
function HandleButtonDown()
{
	// No transparency when pressed...
	$(this).css("opacity","1.0");
}

// HandleButtonUp............................................................................................
function HandleButtonUp()
{
	$(this).css("opacity","0.5");
	$(this).css("outline", "none" );       // Used to remove orange box for android 4+
}

// SendCloudData............................................................................................
function SendCloudData(dataText)
{
    var myData    = "{'data':[{'dataItems': {" + dataText + "}}]}";
    var myDataUrl = myUrl + "data/1/" + myModel + "!" + mySn;
    
    PrintLog( 1, "SendCloudData: " + myData );
    PrintLog( 2, "SendCloudDataUrl: " + myDataUrl );
    
    $.ajax({
        type       : "POST",
        url        : myDataUrl,
        contentType: "application/json;charset=utf-8",
        data       : myData,
        dataType   : 'json',    // response format
        success    : function(response) 
                    {
                        PrintLog( 10, "SendCloudData success..." );;
                    },
        error      : function(response) 
                    {
                        PrintLog( 99, JSON.stringify(response) );
                    }
    });
}

// SendCloudAsset............................................................................................
function SendCloudAsset()
{
    var myAsset    = "{'id': {'mn':'" + myModel + "', 'sn':'" + mySn + "', 'tn': '0' }, 'pingRate': 3600 }";
    
    var myAssetUrl = myUrl + "assets/1";
    
    PrintLog( 1, "SendCloudAsset: " + myAsset );
    PrintLog( 1, "SendCloudAssetUrl: " + myAssetUrl );
    
    $.ajax({
        type       : "POST",
        url        : myAssetUrl,
        contentType: "application/json;charset=utf-8",
        data       : myAsset,
        dataType   : 'json',    // response format
        success    : function(response) 
                    {
                        PrintLog( 1, "SendCloudAsset success..." );;
                    },
        error      : function(response) 
                    {
                        PrintLog( 99, JSON.stringify(response) );
                    }
    });
}



var app = {
     
    // deviceready Event Handler
    //
  	// PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {
    	PrintLog(10,  "device ready" );
    	
    	// Only start bluetooth if on a phone...
    	if( window.isPhone )
    	{
            StartBluetooth();
        }
        
        // Start the handler to be called every second...
		MainLoopIntervalHandle = setInterval(app.MainLoop, 1000 ); 
		
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
	handleSwUpdateKey: function(id)
	{
	 	PrintLog(1, "SW Update key pressed");
 	
 	
	 	if( isBluetoothCnx )
	 	{
//	 		swupdate.renderSwUpdateView();
//SendCloudData( "'5_GHz_UL_Freq':" + 109 );
SendCloudAsset();
//nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);  	 		
	 	}
	 	else
	 	{
SendCloudData( "'5_GHz_UL_Freq':" + 209 ); 	
SendCloudAsset();
//nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);  	
		 	this.showAlert("SW Update mode not allowed...", "Bluetooth not connected.");
		 	
	 	}

	},

	// Handle the Teck Mode key
	handleTechModeKey: function()
	{
	 	PrintLog(1, "Tech Mode key pressed");
	 	
	 	if( isBluetoothCnx )
	 	{
	 		tech.renderTechView();
	 	}
	 	else
	 	{
tech.renderTechView();	 	
	//	 	this.showAlert("Tech mode not allowed...", "Bluetooth not connected.");
	 	}
	},


	// Handle the Register key
	handleRegKey: function()
	{
	 	PrintLog(1, "Reg key pressed");
	 	
	 	
	 	if( isBluetoothCnx )
	 	{
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
   			"<button id='sw_button_id' type='button' class='mybutton' onclick='app.handleSwUpdateKey()'><img src='img/button_SwUpdate.png' /></button>" +
			"<button id='tk_button_id' type='button' class='mybutton' onclick='app.handleTechModeKey()'><img src='img/button_TechMode.png'/></button>" +
  			myRegButton +
  			szMyStatusLine;
  			
		$('body').html(myHtml); 
		
	    
	    // Make the buttons change when touched...    
 		document.getElementById("sw_button_id").addEventListener('touchstart', HandleButtonDown );
 		document.getElementById("sw_button_id").addEventListener('touchend',   HandleButtonUp );
 		
 		document.getElementById("tk_button_id").addEventListener('touchstart', HandleButtonDown );
 		document.getElementById("tk_button_id").addEventListener('touchend',   HandleButtonUp );
 		
 		document.getElementById("reg_button_id").addEventListener('touchstart', HandleButtonDown );
 		document.getElementById("reg_button_id").addEventListener('touchend',   HandleButtonUp );

			
	},


	initialize: function() {
	
		if( ImRunningOnBrowser )
		{
			PrintLog(10, "running on browser");
	
	        // Browser...
	        window.isPhone = false;
	        this.onDeviceReady();
	    }
	    else
	    {
		 	PrintLog(10, "running on phone");
		 	
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
		PrintLog(3, "App: Main loop..." );
		
		// See if status command received yet...
		if( msgRxLastCmd == NXTY_STATUS_RSP )
		{
			// See if we need to allow the registration button...
			if( isRegistered == false )
			{
				document.getElementById("reg_button_id").innerHTML = "<img src='img/button_Register.png' />";
			}
		    clearInterval(MainLoopIntervalHandle);
		}
		else
		{
		    if( isBluetoothCnx )
            {
                // Get the status so we can see if we need to register or not...
                nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);
            }  
        }
		
		
	},



};






	
