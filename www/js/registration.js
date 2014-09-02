
var RegLoopIntervalHandle   = null;
var	regState			    = null;

var REG_STATE_INIT				= 1;
var REG_STATE_CELL_INFO_REQ		= 2;
var REG_STATE_CELL_INFO_RSP		= 3;
var REG_STATE_OPER_REG_RSP  	= 4;
var REG_STATE_REGISTRATION_RSP 	= 5;

var myPlmnid                    = "no plmind";
var myRegDataToOp               = "registration data to operator";
var regTimeoutCount             = 0;

var reg = {

	// Handle the Back key
	handleBackKey: function()
	{
	 	PrintLog(1, "Reg: Reg Mode Back key pressed");
	 	app.renderHomeView();
	},

	// Handle the Register key
	handleRegKey: function()
	{
	 	PrintLog(1, "Reg: Reg key pressed");
	 	
	 	if( isRegistered == false )
	 	{
	 		regState = REG_STATE_INIT;
	    	reg.RegLoop();
	   	}
	   	else
	   	{
	   		showAlert("No need to re-register.", "Already Registered.");
	   	}	
	 		 	
	},

	renderRegView: function() 
	{	
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOn + "</div>" : "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOff + "</div>";
		var myRegButton     = isRegistered   ? "<button id='reg_button_id' type='button' class='mybutton' onclick='reg.handleRegKey()'></button>" : "<button id='reg_button_id' type='button' class='mybutton' onclick='reg.handleRegKey()'><img src='img/button_Register.png' /></button>";
		
		var myHtml = 
			"<img src='img/header_reg.png' width='100%' />" +
			"<button id='back_button_id' type='button' class='back_icon' onclick='reg.handleBackKey()'><img src='img/go_back.png'/></button>"+
			myRegIcon +
            myBluetoothIcon +
            myRegButton +
            szMyStatusLine;

		$('body').html(myHtml);  

		UpdateStatusLine("Select 'Register' button to continue");
		
		document.getElementById("reg_button_id").addEventListener('touchstart', HandleButtonDown );
 		document.getElementById("reg_button_id").addEventListener('touchend',   HandleButtonUp );
 		
 		document.getElementById("back_button_id").addEventListener('touchstart', HandleButtonDown );
        document.getElementById("back_button_id").addEventListener('touchend',   HandleButtonUp );
	},


	RegLoop: function() 
	{
		PrintLog(4, "Reg: Reg loop..." );
		
		switch( regState )
		{
		
			case REG_STATE_INIT:
			{
				regState              = REG_STATE_CELL_INFO_REQ;
	 			RegLoopIntervalHandle = setInterval(reg.RegLoop, 1000 );
                regTimeoutCount       = 0;

	 			
	 			// Make sure that the action is false so the watching event will see a false to true transition.
	 			SendCloudData(  "'regAction':'false'" );
	 			
	 			// Fall through to the next state.... 
			}

			case REG_STATE_CELL_INFO_REQ:
			{
                // Send a message to the Cel-Fi unit to gather Cell Info...			
				nxty.SendNxtyMsg(NXTY_CELL_INFO_REQ, null, 0);
				UpdateStatusLine("Requesting Cell Info from Cel-Fi device.");
                navigator.notification.activityStart("Registering...", "Requesting Cell Info...");
				regState = REG_STATE_CELL_INFO_RSP;
				break;
			}
			
			case REG_STATE_CELL_INFO_RSP:
			{
                // Wait in this state until the Cel-Fi unit responds...
				if( window.msgRxLastCmd == NXTY_CELL_INFO_RSP )
				{
                    // We have received the response from the Cel-Fi unit..
                    // Send the data from the Cel-Fi unit to the cloud...
                    var myText = "'plmnid':'"        + myPlmnid      + "', " +
                                 "'regDataToOp':'"   + myRegDataToOp + "', " +
                                 "'regDataFromOp':'0', "                   +        // Fill return with 0
                                 "'regAction':'true'";                              // Fire the event.
                    
                    SendCloudData( myText );
                        
                    UpdateStatusLine("Sending Operator Registration Request.");
                    navigator.notification.activityStart("Registering...", "Requesting Operator Info...");
                    regState        = REG_STATE_OPER_REG_RSP;
                    regTimeoutCount = 0;
                    myPollResponse  = null;
				}
				else
				{   
				    regTimeoutCount += 1;
				    
				    if( regTimeoutCount >= 10 )
				    {
                        // after 10 times exit stage left...
                        clearInterval(RegLoopIntervalHandle);
                        navigator.notification.activityStop();
                        UpdateStatusLine("Failed to receive Cell Info from Cel-Fi device.");
                        showAlert("No Cell Info response from Cel-Fi device.", "Timeout.");
				    }
				}
				break;
			}
			
			
			
			case REG_STATE_OPER_REG_RSP:
			{
				// Poll the cloud...
				SendCloudPoll();
				
				if( myPollResponse != null )
				{
                    // Grab the data from the operator...
                    PrintLog(1, "myPollResponse.set[0].items.regDataFromOp = " + myPollResponse.set[0].items.regDataFromOp );      
                    var u8rsp = bluetoothle.stringToBytes(myPollResponse.set[0].items.regDataFromOp); 

				    // Received a response from the cloud... 
                    nxty.SendNxtyMsg(NXTY_REGISTRATION_REQ, u8rsp, u8rsp.length);
                    
                    
                    SendCloudData(  "'regAction':'false'" );
                    UpdateStatusLine("Authenticating...");
                    navigator.notification.activityStart("Registering...", "Authenticating...");
                    regState        = REG_STATE_REGISTRATION_RSP;
                    regTimeoutCount = 0;
				}
				else
				{
	                regTimeoutCount += 1;

// jdo dummy response since no operator response
        if( regTimeoutCount >= 5 )
        {
            // Received a response from the cloud... 
            nxty.SendNxtyMsg(NXTY_REGISTRATION_REQ, "Hello", 5 );
            
            
            SendCloudData(  "'regAction':'false'" );
            UpdateStatusLine("Authenticating...");
            navigator.notification.activityStart("Registering...", "Authenticating...");
            regState        = REG_STATE_REGISTRATION_RSP;
    }



                    
                    if( regTimeoutCount >= 10 )
                    {
                        // after 10 times exit stage left...
                        clearInterval(RegLoopIntervalHandle);
                        navigator.notification.activityStop();
                        UpdateStatusLine("Failed to receive response from Operator.");
                        showAlert("No response from Operator.", "Timeout.");
                    }
				}

				break;
			}

			
			case REG_STATE_REGISTRATION_RSP:
			{
				if( msgRxLastCmd == NXTY_REGISTRATION_RSP )
				{
					// We have received the response from the Cel-Fi unit..
					
					// Stop the rotating wheel...
                	navigator.notification.activityStop();
					
					if( isRegistered )
					{
						UpdateStatusLine("Registration successful...");
					}
					else
					{
						UpdateStatusLine("Registration not successful...");
					}
					clearInterval(RegLoopIntervalHandle);
					
				}
				else
				{
                    regTimeoutCount += 1;
                    
                    if( regTimeoutCount >= 10 )
                    {
                        // after 10 times exit stage left...
                        clearInterval(RegLoopIntervalHandle);
                        navigator.notification.activityStop();
                        UpdateStatusLine("Failed to receive Authentication response from Cel-Fi device.");
                        showAlert("No Authentication response from Cel-Fi device.", "Timeout.");
                    }
				}
			
				break;
			}
			
			
			
			default:
			{
//  		    	clearInterval(RegLoopIntervalHandle);
				break;
			}
		}
		
		

		
	},
};






	
