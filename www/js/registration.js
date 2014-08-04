
var RegLoopIntervalHandle   = null;
var	regState			    = null;

var REG_STATE_REQ_CELL_INFO	= 1;
var REG_STATE_OPER_REG_REQ  = 2;

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
	 	regState = REG_STATE_REQ_CELL_INFO;
	 	
	 	// Call loop processing 1 time initially and then let the interval timer handle the loop. 
	 	navigator.notification.activityStart("Registering...", "Getting Cell Info...");
	 	reg.RegLoop();	
	 	RegLoopIntervalHandle = setInterval(reg.RegLoop, 2000 ); 
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
			case REG_STATE_REQ_CELL_INFO:
			{
				if( window.nxtyRxLastCmd != NXTY_CELL_INFO_RSP )
				{
					UpdateStatusLine("Requesting Cell Info from Cel-Fi device.");
					nxty.SendNxtyMsg(NXTY_CELL_INFO_REQ, null, 0);
				}  
				else
				{
					// We have received the response from the Cel-Fi unit..
					regState = REG_STATE_OPER_REG_REQ;
				}
			
				break;
			}

			case REG_STATE_OPER_REG_REQ:
			{
				UpdateStatusLine("Sending Operator Registration Request.");
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






	
