
// Use window.isPhone to show global var or just use without "window." ...
var isPhone      = false;
var isRegistered = true;



var szBtIconOn     = "<img src='img/bluetooth_on.png' />";
var szBtIconOff    = "<img src='img/bluetooth_off.png' />";
var szRegIconOn    = "<img src='img/reg_yes.png' />";
var szRegIconOff   = "<img src='img/reg_no.png' />";
var szMyStatusLine = "<p id='status_line_id' class='status_line'></p>";
var myModel        = "MN8";
var mySn           = "12345678";
//var myModel        = "modelTest";
//var mySn           = "12345";
var myUrl          = "https://nextivity-sandbox-connect.axeda.com:443/ammp/";
var myOperatorCode = "0000";
var myLat          = 32.987838;             // Nextivity lat
var myLong         = -117.074195;           // Nextivity long
var myPollResponse = null;


var MainLoopIntervalHandle = null; 

// Determine which messages get sent to the console.  1 normal, 10 verbose.
// Level  1: Flow and errors.
// Level  2: Raw bluetooth Tx data
// Level  3: Raw bluetooth Rx Data
// Level  4: Timing loops
// Level 10: Bluetooth processing.
// Level 99: Error, print in red.
var PrintLogLevel = 2;

// PrintLog............................................................................................
function PrintLog(level, txt)
{
    var d = new Date();
    if( level == 99 )
    {
        console.log("**** Error: (" + d.getSeconds() + "." + d.getMilliseconds() + ") " + txt);
//jdo        console.error(txt);            // console.error does not work on phonegap
    }
    else if( level <= PrintLogLevel )
    { 
        console.log("(" + d.getSeconds() + "." + d.getMilliseconds() + ") " + txt);
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


// HandleButtonUp............................................................................................
function U8ToHexText(u8)
{
    if( u8 < 0x10 )
    {
        return( "0" + u8.toString(16) );     // Add a leading 0....
    }
    else
    {
        return( u8.toString(16) );     // Add a leading 0....
    }
}

// SendCloudAsset............................................................................................
function SendCloudAsset()
{
    if( isNxtyStatusCurrent && isNxtySnCurrent )
    {
        myModel = "MN" + nxtyRxStatusBuildConfig;
        mySn = nxtySn[0].toString(16);
        for( var i = 1; i < nxtySn.length; i++ )
        {
            if( nxtySn[i] < 0x10 )
            {
                mySn = mySn + "0";  // Add a leading 0.
            }
            
            mySn = mySn + nxtySn[i].toString(16);
        }


        var myAsset    = "{'id': {'mn':'" + myModel + "', 'sn':'" + mySn + "', 'tn': '0' }, 'pingRate': 3600 }";
        var myAssetUrl = myUrl + "assets/1";
        
        PrintLog( 1, "SendCloudAsset: " + myAssetUrl + "  " + myAsset );
        
        
        $.ajax({
            type       : "POST",
            url        : myAssetUrl,
            contentType: "application/json;charset=utf-8",
            data       : myAsset,
            dataType   : 'json',    // response format
            success    : function(response) 
                        {
                            PrintLog( 1, "SendCloudAsset success..." + JSON.stringify(response) );
                        },
            error      : function(response) 
                        {
                            PrintLog( 99, JSON.stringify(response) );
                        }
        });
        
        
    }
    else
    {
        PrintLog( 99, "SendCloudAsset: Model and SN not available yet" );
    }
}

// SendCloudData............................................................................................
function SendCloudData(dataText)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'data':[{'di': {" + dataText + "}}]}";
        var myDataUrl = myUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudData: " + myDataUrl + "  " + myData );
        
        
        $.ajax({
            type       : "POST",
            url        : myDataUrl,
            contentType: "application/json;charset=utf-8",
            data       : myData,
            dataType   : 'json',    // response format
            success    : function(response) 
                        {
                            PrintLog( 10, "SendCloudData success..." + JSON.stringify(response)  );
                        },
            error      : function(response) 
                        {
                            PrintLog( 99, JSON.stringify(response) );
                        }
        });


        
    }
    else
    {
        PrintLog( 99, "SendCloudData: Model and SN not available yet" );
    }
    
}

// SendCloudLocation............................................................................................
function SendCloudLocation(lat, long)
{
    if( (myModel != null) && (mySn != null) )
    {
        var myData    = "{'locations':[{'latitude':" + lat + ", 'longitude':" + long + "}]}";
        var myDataUrl = myUrl + "data/1/" + myModel + "!" + mySn;
        
        PrintLog( 1, "SendCloudLocation: " + myDataUrl + "  " + myData );
        
        
        $.ajax({
            type       : "POST",
            url        : myDataUrl,
            contentType: "application/json;charset=utf-8",
            data       : myData,
            dataType   : 'json',    // response format
            success    : function(response) 
                        {
                            PrintLog( 10, "SendCloudLocation success..." + JSON.stringify(response) );
                        },
            error      : function(response) 
                        {
                            PrintLog( 99, JSON.stringify(response) );
                        }
        });
        
        
    }
    else
    {
        PrintLog( 99, "SendCloudLocation: Model and SN not available yet" );
    }

    
}

// SendCloudPoll............................................................................................
function SendCloudPoll()
{
    if( isNxtyStatusCurrent && isNxtySnCurrent )
    {
        myModel = "MN" + nxtyRxStatusBuildConfig;
        mySn = nxtySn[0].toString(16);
        for( var i = 1; i < nxtySn.length; i++ )
        {
            if( nxtySn[i] < 0x10 )
            {
                mySn = mySn + "0";  // Add a leading 0.
            }
            
            mySn = mySn + nxtySn[i].toString(16);
        }


        var myAssetUrl = myUrl + "assets/1/" + myModel + "!" + mySn;
//        var myAssetUrl = myUrl + "assets/1/modelTest!12345";
        PrintLog( 1, "SendCloudPoll: " + myAssetUrl );
        
        
        $.ajax({
            type       : "POST",
            url        : myAssetUrl,
//            contentType: "application/json;charset=utf-8",
//            data       : myAsset,
            dataType   : 'json',    // response format
            success    : function(response) 
                        {
                            myPollResponse = response;
                            PrintLog( 1, "SendCloudPoll success..." + JSON.stringify(response) );
                        },
            error      : function(response) 
                        {
                            PrintLog( 99, JSON.stringify(response) );
                        }
        });
        
        
    }
    else
    {
        PrintLog( 99, "SendCloudPoll: Model and SN not available yet" );
    }
}




// Geolocation Callbacks
// This method accepts a Position object, which contains the
// current GPS coordinates
//
function geoSuccess(position) 
{
    SendCloudLocation( position.coords.latitude, position.coords.longitude );
/*    
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
*/          
}

// geoError Callback receives a PositionError object
//
function geoError(error) 
{
    // Send in the default...
    SendCloudLocation( myLat, myLong );
/* 
silent...

    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
*/          
}

function showAlert(message, title) 
{
  if(window.isPhone) 
  {
    navigator.notification.alert(message, null, title, 'ok');
  } 
  else 
  {
    alert(title ? (title + ": " + message) : message);
  }
}


// ..................................................................................
var app = {
     
    // deviceready Event Handler
    //
  	// PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {
    	PrintLog(10,  "device ready" );
    	
    	isNxtyStatusCurrent = false;
    	isNxtySnCurrent     = false;
    	
    	
    	// Only start bluetooth if on a phone...
    	if( window.isPhone )
    	{
            StartBluetooth();
        }
        

        
        // Start the handler to be called every second...
		MainLoopIntervalHandle = setInterval(app.mainLoop, 1000 ); 
		
        app.renderHomeView();
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
	 	
                	 	
            
		 	
	 	}

	},


	// Handle the Tech Mode key
	handleTechModeKey: function()
	{
	 	PrintLog(1, "Tech Mode key pressed");
	 	
	 	if( isBluetoothCnx )
	 	{
	 		tech.renderTechView();
	 	}
	 	else
	 	{
            if( ImRunningOnBrowser )
            {
                // Allow the browser to go into Tech mode
                tech.renderTechView();
            }
            else
            {	 	
	            showAlert("Tech mode not allowed...", "Bluetooth not connected.");
	        }
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
            if( ImRunningOnBrowser )
            {
                reg.renderRegView();
            }
            else
            {
                showAlert("Registration mode not allowed...", "Bluetooth not connected.");
            }
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


	initialize: function() 
	{
	
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




	mainLoop: function() 
	{
        var u8TempBuff = new Uint8Array(5);  
		PrintLog(4, "App: Main loop..." );
		
        if( isBluetoothCnx )
        {
            if( isNxtyStatusCurrent == false )
            {
                // Get the status so we can see if we need to register or not...
                nxty.SendNxtyMsg(NXTY_STATUS_REQ, null, 0);
            } 
            else if( isNxtySnCurrent == false )
            {
                // If we can't get the Sn then the reg button will be updated every
                // time thru the loop.  We could add a flag and only update it once
                // but if we get the Status msg from above then we are almost 
                // guaranteed to get the Sn and other msgs below.
                
                // Since we received the status message, lets crank it up to get the other messages...
                clearInterval(MainLoopIntervalHandle);
                MainLoopIntervalHandle = setInterval(app.mainLoop, 500 ); 
                
                // We now have the status message response so look at the registered bit...
                if( isRegistered == false )
                {
                    document.getElementById("reg_button_id").innerHTML = "<img src='img/button_Register.png' />";
                }
            
                // Get the serial number.   
                // Although it was already passed in the advertising message, get it again...
                nxty.SendNxtyMsg(NXTY_SYS_SN_REQ, null, 0);
            }
            else if( nxtySwVerCuCf == null )
            {
                // We now have both the status and SN so notify the cloud that we are here...
                SendCloudAsset();
                
                // Request location...should ask before....
                navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {timeout:10000});
        
                // Update the registered status...
                if( isRegistered )
                {
                    SendCloudData( "'Registered':" + 1 );
                }
                else
                {
                    SendCloudData( "'Registered':" + 0 );
                }

            
                // Get the Cell Fi software version...
                nxtyCurrentVerReq = NXTY_SW_CF_CU_TYPE;
                u8TempBuff[0]     = nxtyCurrentVerReq;
                nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);
            }
            else if( nxtySwVerNuPic == null )
            {
                // We now have the Cel-Fi SW version so send the data to the cloud
                SendCloudData( "'SwVer_CF':'" + nxtySwVerCuCf + "', 'BuildId_CF':'"  + nxtySwBuildIdCu + "'" );
            
                // Get the NU PIC software version...
                nxtyCurrentVerReq = NXTY_SW_NU_PIC_TYPE;
                u8TempBuff[0]     = nxtyCurrentVerReq;
                nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);                
            }
            else if( nxtySwVerCuPic == null )
            {
                // We now have the NU PIC SW version so send the data to the cloud
                SendCloudData( "'SwVerNU_PIC':'" + nxtySwVerNuPic + "'" );

                // Get the CU PIC software version...
                nxtyCurrentVerReq = NXTY_SW_CU_PIC_TYPE;
                u8TempBuff[0]     = nxtyCurrentVerReq;
                nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);                
            }
            else if( nxtySwVerBt == null )
            {
                // We now have the CU PIC SW version so send the data to the cloud
                SendCloudData( "'SwVerCU_PIC':'" + nxtySwVerCuPic + "'" );
            
                // Get the BT software version...
                nxtyCurrentVerReq = NXTY_SW_BT_TYPE;
                u8TempBuff[0]     = nxtyCurrentVerReq;
                nxty.SendNxtyMsg(NXTY_SW_VERSION_REQ, u8TempBuff, 1);                
            }
            else
            {
                // We now have the BT SW version so send the data to the cloud
                SendCloudData( "'SwVer_BT':'" + nxtySwVerBt + "', 'OperatorCode':'" + myOperatorCode + "'"  );
                
            
                // End the main loop...
                clearInterval(MainLoopIntervalHandle);
            }

        }   // End if( isBluetoothCnx )
		
		
	}, // End of MainLoop()



};






	
