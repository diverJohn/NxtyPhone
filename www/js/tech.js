


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

            "<br><br><h1 id=myH1></h1><br><br>" +
            "<table align='center'>" +
            "<tr> <th>Description</th>  <th>Value</th></tr>" +
            "<tr> <td id='d0'></td>  <td id='v0'>0</td></tr>" +
            "<tr> <td id='d1'></td>  <td id='v1'>0</td></tr>" +
            "<tr> <td id='d2'></td>  <td id='v2'>0</td></tr>" +
            "<tr> <td id='d3'></td>  <td id='v3'>0</td></tr>" +
            "<tr> <td id='d4'></td>  <td id='v4'>0</td></tr>" +
            "<tr> <td id='d5'></td>  <td id='v5'>0</td></tr>" +
            "<tr> <td id='d6'></td>  <td id='v6'>0</td></tr>" +
            "<tr> <td id='d7'></td>  <td id='v7'>0</td></tr>" +
            "<tr> <td id='d8'></td>  <td id='v8'>0</td></tr>" +
            "<tr> <td id='d9'></td>  <td id='v9'>0</td></tr>" +
            "<tr> <td id='d10'></td> <td id='v10'>0</td></tr>" +
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
    	var idTxt;
    	
        if( window.nxtyRxLastCmd == NXTY_GET_MON_MODE_HEADINGS_RSP )
        {
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
			
			var myString   = bluetoothle.bytesToString(u8Sub);
			var myHeadings = JSON.parse(myString);
			
                   
            for( var i = 0; i < myHeadings.headings.length; i++ )
            {
            	outText = outText + "  " + myHeadings.headings[i];
            }        

			PrintLog(1, outText );
			            
            // Indicate that message has been processed...
            nxtyRxLastCmd = NXTY_WAITING_FOR_RSP;
            
            // Immediately grab a page of data...
            nxty.SendNxtyMsg(NXTY_GET_MON_MODE_PAGE_REQ, null, 0);               
        }
        else if( window.nxtyRxLastCmd == NXTY_GET_MON_MODE_PAGE_RSP )
        {
			var outText = "Tech: Process Page Rsp...";
            
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

            var u8Sub    = u8RxBuff.subarray(2, i);		// u8RxBuff[2] to [i-1].
			var myString = bluetoothle.bytesToString(u8Sub);
			var myData   = JSON.parse(myString);

           	outText = outText + "  Heading: " + myData.head + " Desc: ";
           	
           	document.getElementById("myH1").innerHTML = myData.head;
                   
            for( i = 0; i < myData.dsc.length; i++ )
            {
            	idTxt = "d" + i;
                document.getElementById(idTxt).innerHTML = myData.dsc[i];
            	outText = outText + "  " + myData.dsc[i];
            }        

           	outText = outText + " Val: ";
                   
            for( i = 0; i < myData.val.length; i++ )
            {
            	idTxt = "v" + i;
                document.getElementById(idTxt).innerHTML = myData.val[i];
            	outText = outText + "  " + myData.val[i];
            }        


			PrintLog(1, outText );
			            
            
            // Indicate that message has been processed...
            nxtyRxLastCmd = NXTY_WAITING_FOR_RSP;
        }

        
    },



};






	
