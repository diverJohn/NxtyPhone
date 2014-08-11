


var TechLoopRxIntervalHandle   = null;
var TechLoopTxIntervalHandle   = null;



var tech = {

     

	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	PrintLog(1, "Tech: Tech Mode Back key pressed");
	 	app.renderHomeView();
	},


	renderTechView: function() 
	{

		var myBluetoothIcon = isBluetoothCnx ? "<div id='bt_icon_id' class='bt_icon'>" + szBtIconOn + "</div>" : "<div  id='bt_icon_id' class='bt_icon'>" + szBtIconOff + "</div>";
		var myRegIcon       = isRegistered   ? "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOn + "</div>" : "<div id='reg_icon_id' class='reg_icon'>" + szRegIconOff + "</div>";
		
		var myHtml = 
			"<img src='img/header_tech.png' width='100%' />" +
			"<button type='button' class='back_icon' onclick='tech.handleBackKey()'><img src='img/go_back.png'/></button>"+
			myRegIcon +
            myBluetoothIcon +

            "<br><br><h1>UNII Engineering Data</h1><br><br>" +
            "<table align='center'>" +
            "<tr> <th>Description</th>  <th>Value</th></tr>" +
            "<tr> <td id='d1'>5 GHz DL Freq</td>  <td id='v1'>0</td></tr>" +
            "<tr>  <td id='d2'>5 GHz UL Freq</td>  <td id='v2'>0</td></tr>" +
            "<tr>  <td id='d3'>UNII Modem State</td>  <td id='v3'>Down</td></tr>" +
            "<tr>  <td id='d4'>NU RSSI</td>  <td id='v4'>0</td></tr>" +
            "<tr>  <td id='d5'>CU RSSI</td>  <td id='v5'>0</td></tr>" +
            "<tr>  <td id='d6'>NU Tx Pwr</td>  <td id='v6'>0</td></tr>" +
            "<tr>  <td id='d7'>CU Tx Pwr</td>  <td id='v7'>0</td></tr>" +
            "<tr>  <td id='d8'>Ctrl Chan BER</td>  <td id='v8'>0</td></tr>" +
            "<tr>  <td id='d9'>Radar Detect Cnt</td>  <td id='v9'>0</td></tr>" +
            "<tr>  <td id='d10'>Distance Metric</td>  <td id='v10'>0</td></tr>" +
            "<tr>  <td id='d11'>ID</td>  <td id='v11'>0</td></tr>" +
            "</table>";
            

		$('body').html(myHtml);
		
		// Send a message to get the header information...
		nxty.SendNxtyMsg(NXTY_GET_MON_MODE_HEADINGS_REQ, null, 0);
		
		// Start the timer to process Rx data
		TechLoopRxIntervalHandle = setInterval(tech.ProcessTechDataLoop, 1000 );
		
		// Start the timer to request fresh page data. 
        TechLoopTxIntervalHandle = setInterval(tech.GetFreshPageLoop, 5000 );
		  			
	},



    GetFreshPageLoop: function() 
    {
        PrintLog(3, "Tech: Get Fresh Page loop..." );
        nxty.SendNxtyMsg(NXTY_GET_MON_MODE_PAGE_REQ, null, 0);
    },

    ProcessTechDataLoop: function() 
    {
    	var i;
    	
        if( window.nxtyRxLastCmd == NXTY_GET_MON_MODE_HEADINGS_RSP )
        {
//            PrintLog(1, "Tech: Process Headings Rsp..." );
			var outText = "Tech: Process Headings Rsp...";
            
            // Grab the JSON string from the Rx buffer...
            // u8RxBuff[0] = len  (should be 255)
            // u8RxBuff[1] = cmd  (should be headings response, 0x45)
            // u8RxBuff[2] to u8RxBuff[253] should be the JSON string data...
            
            // Find the end of the JSON string data...
            for( i = 2; i < 255; i++ )
            {
            	if( u8RxBuff[i] == 0 )
            	{
            		break;
            	}
            }
            var u8Sub  = u8RxBuff.subarray(2, i);		// u8RxBuff[2] to [i-1].
			
PrintLog(1, outText );

/*
			PrintLog(1, "Try parsing u8Sub." );			
			var myHeadings = JSON.parse(u8Sub);
			PrintLog(1, "Done parsing." );
*/
			

PrintLog(1, "Try converting u8Sub to string and parse." );
//			var myString   = bluetoothle.bytesToString(u8Sub);

			var myString = '{ "headings": ["Head 1", "Head 2"] }'; 
PrintLog(1, "Done converting u8Sub to myString: " + myString );
			var myHeadings = JSON.parse(myString);
PrintLog(1, "Done parsing." );

			
			
/*			
			// Convert to an encoded string so js can parse...
			var u64    = bluetoothle.bytesToEncodedString(u8Sub); 


			// Let the json parse do its magic...
			var myHeadings = JSON.parse(u8Sub);

*/
                    
            for( var i = 0; i < myHeadings.headings.length; i++ )
            {
            	outText = outText + "  " + myHeadings.headings[i];
            }        

			PrintLog(1, outText );
			            
            // Indicate that message has been processed...
            nxtyRxLastCmd = NXTY_WAITING_FOR_RSP;               
        }
        else if( window.nxtyRxLastCmd == NXTY_GET_MON_MODE_PAGE_RSP )
        {
            PrintLog(1, "Tech: Process Page Rsp..." );
            
            // Indicate that message has been processed...
            nxtyRxLastCmd = NXTY_WAITING_FOR_RSP;
        }

        
    },



};






	
