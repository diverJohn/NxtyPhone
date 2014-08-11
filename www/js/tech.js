


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


        if( window.nxtyRxLastCmd == NXTY_GET_MON_MODE_HEADINGS_RSP )
        {
            PrintLog(1, "Tech: Process Headings Rsp..." );
            
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






	
