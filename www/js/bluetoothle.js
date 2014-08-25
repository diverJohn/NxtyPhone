/*
	pulled from: https://github.com/randdusing/BluetoothLE/tree/e927fa5ebae7b6db6c192f00291b0b16b58bc808

*/

var addressKey = "address";

var bridgeServiceUuid           = "6734";
var bridgeTxCharacteristicUuid  = "6711";       // Tx from the bluetooth device profile, Rx for the phone app.
var bridgeRxCharacteristicUuid  = "6722";       // Rx from our bluetooth device profile, Tx for the phone app.



var scanTimer = null;
var connectTimer = null;
var reconnectTimer = null;

var iOSPlatform = "iOS";
var androidPlatform = "Android";


var BluetoothCnxTimer = null;

var SCAN_RESULTS_SIZE = 62;     // advertisement data can be up to 31 bytes and scan results data can be up to 31 bytes.
var u8ScanResults     = new Uint8Array(SCAN_RESULTS_SIZE);


// Use the following as a global variable, "window.isBluetoothCnx", to determine if connected.
var isBluetoothCnx          = false;
var isBluetoothSubscribed   = false;

var u8TxBuff          = new Uint8Array(255);	
var uTxBuffIdx		  = 0;

// StartBluetooth...................................................................................
function StartBluetooth()
{
	PrintLog(10, "BT: Starting bluetooth");
	bluetoothle.initialize(initializeSuccess, initializeError);
}


function initializeSuccess(obj)
{
  if (obj.status == "enabled")
  {
    // If we initialize successfully, start a loop to maintain a connection...
  	PrintLog(10, "BT: Initialization successful, starting periodic bluetooth maintenance loop...");
  	BluetoothLoop();
  }
  else
  {
    PrintLog(99, "BT: Unexpected initialize status: " + obj.status);
  }
}

function initializeError(obj)
{
  PrintLog(99, "BT: Initialize error: " + obj.error + " - " + obj.message);
}



// BluetoothLoop...................................................................................
// Check every 5 seconds if not connected and subscribed and every 15 seconds if already connected...
function BluetoothLoop()
{
	bluetoothle.isConnected( isConnectedCallback );

}

function isConnectedCallback(obj)
{
	if(obj.isConnected)
	{
		PrintLog(10, "BT: bluetooth cnx callback: Cnx" );
		UpdateBluetoothIcon( true );
		
		// Check again in 15 seconds since we are connected...
        BluetoothCnxTimer = setTimeout(BluetoothLoop, 15000);
        
		if( isBluetoothSubscribed == false )
		{
		  // Run Discover and if successful then subscribe to the Tx of our device
		  DiscoverBluetoothDevice();	
		}
	}
	else
	{
	    PrintLog(10, "BT: bluetooth cnx callback: Not Cnx" );
		UpdateBluetoothIcon( false );
		  
        // Check again in 5 seconds...
        BluetoothCnxTimer = setTimeout(BluetoothLoop, 5000);
    
	    StartBluetoothScan();
	}
}



// StartScan.....................................................................................
function StartBluetoothScan()
{
	PrintLog(10, "BT: Starting scan for Cel-Fi devices.");
    var paramsObj = {"serviceAssignedNumbers":[bridgeServiceUuid]};
    bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
}

function startScanSuccess(obj)
{
  if (obj.status == "scanResult")
  {
    PrintLog(10, "BT: Scan match: " + obj.name + " string: " + JSON.stringify(obj) );
  
    var bytes = bluetoothle.encodedStringToBytes(obj.advertisement);

        
    // The returned bytes are...
    // "2 1 6 3 2 34 67 c ff 0 1 2 11 22 33 44 55 66 25 29 7 9 43 65 6c 2d 46 69 3 2 34 67 c ff 0 11 22 33 44 55 66 77 88 25 29
    //  |    advertise data                              | |             scan results                                         |
    //                         |        SN         |                                              |         SN          |
            
    // Save the Scan Results data...
    if( bytes.length != 0 )
    {
        for( var i = 1; i < SCAN_RESULTS_SIZE; i++ )
        {
            u8ScanResults[i] = bytes[i];
        }
    }
 
    bluetoothle.stopScan(stopScanSuccess, stopScanError);
    clearScanTimeout();

    window.localStorage.setItem(addressKey, obj.address);
    
    ConnectBluetoothDevice(obj.address);
  }
  else if (obj.status == "scanStarted")
  {
    PrintLog(10, "BT: Scan was started successfully, stopping in 4 sec.");
    scanTimer = setTimeout(scanTimeout, 4000);
  }
  else
  {
    PrintLog(99, "BT: Unexpected start scan status: " + obj.status);
  }
}

function startScanError(obj)
{
  PrintLog(99, "BT: Start scan error: " + obj.error + " - " + obj.message);
}

function scanTimeout()
{
  PrintLog(10, "BT: Scanning time out, stopping");
  bluetoothle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout()
{ 
  PrintLog(10, "BT: Clearing scanning timeout");
  if (scanTimer != null)
  {
    clearTimeout(scanTimer);
  }
}

function stopScanSuccess(obj)
{
  if (obj.status == "scanStopped")
  {
    PrintLog(10, "BT: Scan was stopped successfully");
  }
  else
  {
    PrintLog(10, "BT: Unexpected stop scan status: " + obj.status);
  }
}

function stopScanError(obj)
{
  PrintLog(99, "BT: Stop scan error: " + obj.error + " - " + obj.message);
}



// UpdateBluetoothIcon....................................................................................
function UpdateBluetoothIcon(cnx)
{
	if(cnx == true)
	{
		if( document.getElementById("bt_icon_id").innerHTML != szBtIconOn )
		{
			document.getElementById("bt_icon_id").innerHTML = szBtIconOn;
		}
		isBluetoothCnx = true;
	}
	else
	{
		if( document.getElementById("bt_icon_id").innerHTML != szBtIconOff )
		{
			document.getElementById("bt_icon_id").innerHTML = szBtIconOff;
		}
		isBluetoothCnx        = false;
		isBluetoothSubscribed = false;
		u8ScanResults[0]      = 0;
	}
}



// ConnectBluetoothDevice...................................................................................
// Per plugin: Connect to a Bluetooth LE device. The Phonegap app should use a timer to limit the 
// connecting time in case connecting is never successful. Once a device is connected, it may 
// disconnect without user intervention. The original connection callback will be called again 
// and receive an object with status => disconnected. To reconnect to the device, use the reconnect method. 
// Before connecting to a new device, the current device must be disconnected and closed. 
// If a timeout occurs, the connection attempt should be canceled using disconnect().
function ConnectBluetoothDevice(address)
{
  PrintLog(10, "BT: Begin connection to: " + address + " with 5 second timeout");
  
  var paramsObj = {"address":address};
  bluetoothle.connect(connectSuccess, connectError, paramsObj);
  connectTimer = setTimeout(connectTimeout, 5000);
}

function connectSuccess(obj)
{
  if (obj.status == "connected")
  {
    PrintLog(10, "BT: Connected to : " + obj.name + " - " + obj.address);

	// Update the bluetooth icon...
	UpdateBluetoothIcon( true );

    clearConnectTimeout();
    
    // Must run Discover before subscribing...
    DiscoverBluetoothDevice();
   
  }
  else if (obj.status == "connecting")
  {
    PrintLog(10, "BT: Connecting to : " + obj.name + " - " + obj.address);
  }
  else
  {
    PrintLog(99, "BT: Unexpected connect status: " + obj.status);
    
    if( obj.status == "disconnected" )
    {
    	CloseBluetoothDevice();
    }
    clearConnectTimeout();
  }
}

function connectError(obj)
{
  PrintLog(99, "BT: Connect error: " + obj.error + " - " + obj.message);
  clearConnectTimeout();
}

function connectTimeout()
{
  PrintLog(1, "BT: Connection timed out");
  DisconnectBluetoothDevice();
}

function clearConnectTimeout()
{ 
  PrintLog(10, "BT: Clearing connect timeout");
  if (connectTimer != null)
  {
    clearTimeout(connectTimer);
  }
}



// DisconnectBluetoothDevice...................................................................................
function DisconnectBluetoothDevice()
{
  bluetoothle.disconnect(disconnectSuccess, disconnectError);
}

function disconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        PrintLog(10, "BT: Disconnect device success");
        
        // Update the bluetooth icon...
        UpdateBluetoothIcon( false );

        CloseBluetoothDevice();
    }
    else if (obj.status == "disconnecting")
    {
        PrintLog(10, "BT: Disconnecting device");
    }
    else
  	{
    	PrintLog(99, "BT: Unexpected disconnect status: " + obj.status);
  	}
}

function disconnectError(obj)
{
  PrintLog(99, "BT: Disconnect error: " + obj.error + " - " + obj.message);
}


// CloseBluetoothDevice...................................................................................
function CloseBluetoothDevice()
{
  bluetoothle.close(closeSuccess, closeError);
}

function closeSuccess(obj)
{
    if (obj.status == "closed")
    {
        PrintLog(10, "BT Closed device");
        UpdateBluetoothIcon( false );
    }
    else
  	{
      PrintLog(99, "BT: Unexpected close status: " + obj.status);
  	}
}

function closeError(obj)
{
  PrintLog(99, "BT: Close error: " + obj.error + " - " + obj.message);
}




// DiscoverBluetoothDevice........................................................................
function DiscoverBluetoothDevice()
{

/*
    if (window.device.platform == iOSPlatform)
    {
//      PrintLog(10, "Discovering heart rate service");
//      var paramsObj = {"serviceAssignedNumbers":[heartRateServiceAssignedNumber]};
//      bluetoothle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
    }
    else if (window.device.platform == androidPlatform)
*/    
    {
      PrintLog(10, "BT:  Android platform.  Beginning discovery");
      bluetoothle.discover(discoverSuccess, discoverError);
    }
}

function discoverSuccess(obj)
{
	if (obj.status == "discovered")
    {
    	PrintLog(10, "BT: Discovery completed.  Name: " + obj.name + " add: " + obj.address + "stringify: " + JSON.stringify(obj));

    	// Now subscribe to the bluetooth tx characteristic...
    	SubscribeBluetoothDevice();
	}
  	else
  	{
    	PrintLog(99, "BT: Unexpected discover status: " + obj.status);
    	DisconnectBluetoothDevice();
  	}
}

function discoverError(obj)
{
  PrintLog(99, "Discover error: " + obj.error + " - " + obj.message);
  DisconnectBluetoothDevice();
}





// SubscribeBluetoothDevice........................................................................
function SubscribeBluetoothDevice()
{
    // Version 1.0.2 of the plugin
    var paramsObj = {"serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeTxCharacteristicUuid, "isNotification":true};
	
    bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
}


function subscribeSuccess(obj)
{   
    if (obj.status == "subscribedResult")
    {
        PrintLog(10, "BT: Subscription data received");

        var bytes = bluetoothle.encodedStringToBytes(obj.value);
 
		nxty.ProcessNxtyRxMsg( bytes, bytes.length );


        
		
/*
        //Parse array of int32 into uint8
        var bytes = bluetoothle.encodedStringToBytes(obj.value);

        //Check for data
        if (bytes.length == 0)
        {
            PrintLog(10, "BT: Subscription result had zero length data");
            return;
        }

        //Get the first byte that contains flags
        var flag = bytes[0];

        //Check if u8 or u16 and get heart rate
        var hr;
        if ((flag & 0x01) == 1)
        {
            var u16bytes = bytes.buffer.slice(1, 3);
            var u16 = new Uint16Array(u16bytes)[0];
            hr = u16;
        }
        else
        {
            var u8bytes = bytes.buffer.slice(1, 2);
            var u8 = new Uint8Array(u8bytes)[0];
            hr = u8;
        }
        PrintLog(10, "Heart Rate: " + hr);
*/        
        
    }
    else if (obj.status == "subscribed")
    {
        PrintLog(10, "BT: Subscription started");
		isBluetoothSubscribed = true;
    }
    else
  	{
    	PrintLog(99, "BT: Unexpected subscribe status: " + obj.status);
    	DisconnectBluetoothDevice();
  }
}

function subscribeError(msg)
{
  	PrintLog(99, "BT: Subscribe error: " + msg.error + " - " + msg.message);
}

function unsubscribeDevice()
{
  PrintLog(10, "BT: Unsubscribing heart service");
  var paramsObj = {"serviceAssignedNumber":bridgeServiceUuid, "characteristicAssignedNumber":bridgeTxCharacteristicUuid};
  bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj)
{
    if (obj.status == "unsubscribed")
    {
        PrintLog(10, "BT: Unsubscribed device");
    	isBluetoothSubscribed = false;
    }
    else
    {
      PrintLog(99, "BT: Unexpected unsubscribe status: " + obj.status);
      DisconnectBluetoothDevice();
    }
}

function unsubscribeError(obj)
{
  PrintLog(99, "BT: Unsubscribe error: " + obj.error + " - " + obj.message);
  DisconnectBluetoothDevice();
}




// WriteBluetoothDevice........................................................................
function WriteBluetoothDevice( u8 )
{
	var i;

	// Currently the Bluetoothle plugin supports a write of 80 bytes.
	if( u8.length > u8TxBuff.length )
	{
		PrintLog(10, "Nxty Write: More than " + NXTY_BIG_MSG_SIZE + " bytes." );
	}

	if( u8.length <= 80 )
	{
    	// Convert a Unit8Array to a base64 encoded string...
    	var u64    = bluetoothle.bytesToEncodedString(u8);
    	uTxBuffIdx = 0;
    	
    	var outText = u8[0].toString(16);    // Convert to hex output...
        for( i = 1; i < u8.length; i++ )
        {
            outText = outText + " " + u8[i].toString(16);
        }
        PrintLog(2,  "Msg Tx: " + outText );
   	}
   	else
   	{
		for( i = 0; i < u8.length; i++ )
		{
			u8TxBuff[i] = u8[i];
		}
		
		uTxBuffIdx = 80;
		var u8Sub  = u8TxBuff.subarray(0,uTxBuffIdx);	// u8TxBuff[0] to [79].
		var u64    = bluetoothle.bytesToEncodedString(u8Sub); 

		
		// Send the first 80 bytes of data..
        var outText = u8Sub[0].toString(16);    // Convert to hex output...
        for( i = 1; i < uTxBuffIdx; i++ )
        {
            outText = outText + " " + u8Sub[i].toString(16);
        }
        PrintLog(2,  "Msg Tx: " + outText );
		
   	}

    // 1.0.2 of the plugin 
    var paramsObj = {"value":u64, "serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeRxCharacteristicUuid};
    
    bluetoothle.write(writeSuccess, writeError, paramsObj);
}


function writeSuccess(obj)
{   
    // {"status":"written","serviceUuid":"180F","characteristicUuid":"2A19","value":""};
    if (obj.status == "written")
    {
        PrintLog(10, "BT: Write data sent successfully");
        
        // See if we have more to output...
        if( uTxBuffIdx )
        {
        	var uTxBuffIdxEnd = uTxBuffIdx + 80;
        	if( uTxBuffIdxEnd > u8TxBuff.length )
        	{
        		uTxBuffIdxEnd = u8TxBuff.length;
        	}
        	
			var u8Sub  = u8TxBuff.subarray(uTxBuffIdx, uTxBuffIdxEnd);	
			var u64    = bluetoothle.bytesToEncodedString(u8Sub); 

	        var outText = u8Sub[0].toString(16);    // Convert to hex output...
    	    for( var i = 1; i < (uTxBuffIdxEnd - uTxBuffIdx); i++ )
        	{
            	outText = outText + " " + u8Sub[i].toString(16);
        	}
        	PrintLog(10,  "Nxty Tx: " + outText );

		    // 1.0.2 of the plugin 
    		var paramsObj = {"value":u64, "serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeRxCharacteristicUuid};
    
    		bluetoothle.write(writeSuccess, writeError, paramsObj);
    		
    		uTxBuffIdx = uTxBuffIdxEnd;
        	if( uTxBuffIdx >= u8TxBuff.length )
        	{
        		// Indicate that we have sent all data...
        		uTxBuffIdx = 0;
        	}
    		
   		}
        
    }
    else
    {
        PrintLog(99, "BT: Unexpected write status: " + obj.status);
    }
}

function writeError(msg)
{
    PrintLog(99, "BT: Write error: " + msg.error + " - " + msg.message);
}














