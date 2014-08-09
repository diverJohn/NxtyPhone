var tech = {

     

	// Handle the Tech Mode key
	handleBackKey: function()
	{
	 	console.log("Tech Mode Back key pressed");
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
            
            
 "<h1>UNII Engineering Data</h1>" +
 "<table align='center'>" +
"<tr> <th>Description</th>  <th>Value</th></tr>" +
"<tr> <td id='v1'>5 GHz DL Freq</td>  <td id='v1'>0</td></tr>" +
"<tr>  <td id='v1'>5 GHz UL Freq</td>  <td id='v2'>0</td></tr>" +
"<tr>  <td id='v1'>UNII Modem State</td>  <td id='v3'>Down</td></tr>" +
"<tr>  <td id='v1'>NU RSSI</td>  <td id='v4'>0</td></tr>" +
"<tr>  <td id='v1'>CU RSSI</td>  <td id='v5'>0</td></tr>" +
"<tr>  <td id='v1'>NU Tx Pwr</td>  <td id='v6'>0</td></tr>" +
"<tr>  <td id='v1'>CU Tx Pwr</td>  <td id='v7'>0</td></tr>" +
"<tr>  <td id='v1'>Ctrl Chan BER</td>  <td id='v8'>0</td></tr>" +
"<tr>  <td id='v1'>Radar Detect Cnt</td>  <td id='v9'>0</td></tr>" +
"<tr>  <td id='v1'>Distance Metric</td>  <td id='v10'>0</td></tr>" +
"<tr>  <td id='v1'>ID</td>  <td id='v11'>0</td></tr>" +
"</table>";
            
            

		$('body').html(myHtml);  			
	},



};






	
