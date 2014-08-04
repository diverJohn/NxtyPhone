
var RegLoopIntervalHandle   = null;
var	regState			    = null;

var REG_STATE_INIT				= 1;
var REG_STATE_CELL_INFO_REQ		= 2;
var REG_STATE_CELL_INFO_RSP		= 3;
var REG_STATE_OPER_REG_REQ  	= 4;
var REG_STATE_OPER_REG_RSP  	= 5;
var REG_STATE_REGISTRATION_REQ 	= 6;
var REG_STATE_REGISTRATION_RSP 	= 7;



var reg = {


	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	console.log("Reg Mode Back key pressed");
	 	app.renderHomeView();
	},

	// Handle the Register key
	handleRegKey: function()
	{
	 	console.log("Reg key pressed");
	 	regState = REG_STATE_INIT;
	    reg.RegLoop();	
	 		 	
	},

	renderRegView: function() 
	{	
		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOn + "</div>" : "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOff + "</div>";
		var myRegButton     = isRegistered   ? "<button id='reg_button_id' type='button' class='mybutton' onclick='reg.handleRegKey()'></button>" : "<button id='reg_button_id' type='button' class='mybutton' onclick='reg.handleRegKey()'><img src='img/button_Register.png' /></button>";
		
		var myHtml = 
			"<img src='img/header_reg.png' width='100%' />" +
			"<button type='button' class='back_icon' onclick='reg.handleBackKey()'><img src='img/go_back.png'/></button>"+
			myRegIcon +
            myBluetoothIcon +
            myRegButton +
            szMyStatusLine;

		$('body').html(myHtml);  

		UpdateStatusLine("Select 'Register' button to continue");
	},


	RegLoop: function() 
	{
		console.log("Reg: Reg loop..." );
		
		switch( regState )
		{
		
			case REG_STATE_INIT:
			{
				regState = REG_STATE_CELL_INFO_REQ;
	 			RegLoopIntervalHandle = setInterval(reg.RegLoop, 4000 );
	 			
	 			// Fall through to the next state.... 
			}

			case REG_STATE_CELL_INFO_REQ:
			{
				nxty.SendNxtyMsg(NXTY_CELL_INFO_REQ, null, 0);
				UpdateStatusLine("Requesting Cell Info from Cel-Fi device.");
                navigator.notification.activityStart("Registering...", "Requesting Cell Info...");
				regState = REG_STATE_CELL_INFO_RSP;
				break;
			}
			
			case REG_STATE_CELL_INFO_RSP:
			{
				if( window.nxtyRxLastCmd == NXTY_CELL_INFO_RSP )
				{
					// We have received the response from the Cel-Fi unit..
					regState = REG_STATE_OPER_REG_REQ;
					
					// jdo:  after so many waits try again?
				}
			
				break;
			}
			
			

			case REG_STATE_OPER_REG_REQ:
			{
				UpdateStatusLine("Sending Operator Registration Request.");
				navigator.notification.activityStart("Registering...", "Requesting Operator Info...");
				regState = REG_STATE_OPER_REG_RSP;
				break;
			}
			
			case REG_STATE_OPER_REG_RSP:
			{
				// jdo:  Poll the cloud...
				
				regState = REG_STATE_REGISTRATION_REQ;
				break;
			}

			
			
			
			case REG_STATE_REGISTRATION_REQ:
			{
				nxty.SendNxtyMsg(NXTY_REGISTRATION_REQ, null, 0);
				UpdateStatusLine("Authenticating...");
                navigator.notification.activityStart("Registering...", "Authenticating...");
				regState = REG_STATE_REGISTRATION_RSP;
				break;
			}
			
			case REG_STATE_REGISTRATION_RSP:
			{
				if( nxtyRxLastCmd == NXTY_REGISTRATION_RSP )
				{
					// We have received the response from the Cel-Fi unit..
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
					
					// jdo:  after so many waits try again?
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






	
