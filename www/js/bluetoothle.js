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


// StartBluetooth...................................................................................
function StartBluetooth()
{
	console.log("BT: Starting bluetooth");
	bluetoothle.initialize(initializeSuccess, initializeError);
}


function initializeSuccess(obj)
{
  if (obj.status == "enabled")
  {
    // If we initialize successfully, start a loop to maintain a connection...
  	console.log("BT: Initialization successful, starting periodic loop...");
  	BluetoothLoop();
  }
  else
  {
    console.log("BT: Unexpected initialize status: " + obj.status);
  }
}

function initializeError(obj)
{
  console.log("BT: Initialize error: " + obj.error + " - " + obj.message);
}



// BluetoothLoop...................................................................................
// Check every 15 seconds for a connection and subscription...
function BluetoothLoop()
{
	bluetoothle.isConnected( isConnectedCallback );
	
	// Check again in 15 seconds...
	BluetoothCnxTimer = setTimeout(BluetoothLoop, 15000);
}

function isConnectedCallback(obj)
{
	if(obj.isConnected)
	{
		console.log("BT: bluetooth cnx callback: Cnx" );
		UpdateBluetoothIcon( true );
		
		if( isBluetoothSubscribed == false )
		{
		  // Run Discover and if successful then subscribe to the Tx of our device
		  DiscoverBluetoothDevice();	
		}
	}
	else
	{
	    console.log("BT: bluetooth cnx callback: Not Cnx" );
		UpdateBluetoothIcon( false );
	    StartBluetoothScan();
	}
}



// StartScan.....................................................................................
function StartBluetoothScan()
{
	console.log("BT: Starting scan for Cel-Fi devices.");
    var paramsObj = {"serviceAssignedNumbers":[bridgeServiceUuid]};
    bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
}

function startScanSuccess(obj)
{
  if (obj.status == "scanResult")
  {
    console.log("BT: Scan match: " + obj.name + " string: " + JSON.stringify(obj) );
  
    var bytes = bluetoothle.encodedStringToBytes(obj.advertisement);

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
    console.log("BT: Scan was started successfully, stopping in 5 sec.");
    scanTimer = setTimeout(scanTimeout, 5000);
  }
  else
  {
    console.log("BT: Unexpected start scan status: " + obj.status);
  }
}

function startScanError(obj)
{
  console.log("BT: Start scan error: " + obj.error + " - " + obj.message);
}

function scanTimeout()
{
  console.log("BT: Scanning time out, stopping");
  bluetoothle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout()
{ 
  console.log("BT: Clearing scanning timeout");
  if (scanTimer != null)
  {
    clearTimeout(scanTimer);
  }
}

function stopScanSuccess(obj)
{
  if (obj.status == "scanStopped")
  {
    console.log("BT: Scan was stopped successfully");
  }
  else
  {
    console.log("BT: Unexpected stop scan status: " + obj.status);
  }
}

function stopScanError(obj)
{
  console.log("BT: Stop scan error: " + obj.error + " - " + obj.message);
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
  console.log("BT: Begining connection to: " + address + " with 5 second timeout");
  
  var paramsObj = {"address":address};
  bluetoothle.connect(connectSuccess, connectError, paramsObj);
  connectTimer = setTimeout(connectTimeout, 5000);
}

function connectSuccess(obj)
{
  if (obj.status == "connected")
  {
    console.log("BT: Connected to : " + obj.name + " - " + obj.address);

	// Update the bluetooth icon...
	UpdateBluetoothIcon( true );

    clearConnectTimeout();
    
    // Must run Discover before subscribing...
    DiscoverBluetoothDevice();
   
  }
  else if (obj.status == "connecting")
  {
    console.log("BT: Connecting to : " + obj.name + " - " + obj.address);
  }
  else
  {
    console.log("BT: Unexpected connect status: " + obj.status);
    
    if( obj.status == "disconnected" )
    {
    	CloseBluetoothDevice();
    }
    clearConnectTimeout();
  }
}

function connectError(obj)
{
  console.log("BT: Connect error: " + obj.error + " - " + obj.message);
  clearConnectTimeout();
}

function connectTimeout()
{
  console.log("BT: Connection timed out");
  DisconnectBluetoothDevice();
}

function clearConnectTimeout()
{ 
  console.log("BT: Clearing connect timeout");
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
        console.log("BT: Disconnect device success");
        
        // Update the bluetooth icon...
        UpdateBluetoothIcon( false );

        CloseBluetoothDevice();
    }
    else if (obj.status == "disconnecting")
    {
        console.log("BT: Disconnecting device");
    }
    else
  	{
    	console.log("BT: Unexpected disconnect status: " + obj.status);
  	}
}

function disconnectError(obj)
{
  console.log("BT: Disconnect error: " + obj.error + " - " + obj.message);
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
        console.log("BT Closed device");
        UpdateBluetoothIcon( false );
    }
    else
  	{
      console.log("BT: Unexpected close status: " + obj.status);
  	}
}

function closeError(obj)
{
  console.log("BT: Close error: " + obj.error + " - " + obj.message);
}




// DiscoverBluetoothDevice........................................................................
function DiscoverBluetoothDevice()
{

/*
    if (window.device.platform == iOSPlatform)
    {
//      console.log("Discovering heart rate service");
//      var paramsObj = {"serviceAssignedNumbers":[heartRateServiceAssignedNumber]};
//      bluetoothle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
    }
    else if (window.device.platform == androidPlatform)
*/    
    {
      console.log("BT:  Android platform.  Beginning discovery");
      bluetoothle.discover(discoverSuccess, discoverError);
    }
}

function discoverSuccess(obj)
{
	if (obj.status == "discovered")
    {
    	console.log("BT: Discovery completed.  Name: " + obj.name + " add: " + obj.address + "stringify: " + JSON.stringify(obj));

    	// Now subscribe to the bluetooth tx characteristic...
    	SubscribeBluetoothDevice();
	}
  	else
  	{
    	console.log("BT: Unexpected discover status: " + obj.status);
    	DisconnectBluetoothDevice();
  	}
}

function discoverError(obj)
{
  console.log("Discover error: " + obj.error + " - " + obj.message);
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
        console.log("BT: Subscription data received");

        var bytes = bluetoothle.encodedStringToBytes(obj.value);
		
		// The returned bytes are...
		// "2 1 6 3 2 34 67 c ff 0 1 2 11 22 33 44 55 66 25 29 7 9 43 65 6c 2d 46 69 3 2 34 67 c ff 0 11 22 33 44 55 66 77 88 25 29 

        //Check for data
        if (bytes.length != 0)
        {
        	var outText = bytes[0].toString(16);
            for( var i = 1; i < bytes.length; i++ )
            {
            	outText = outText + " " + bytes[i].toString(16);
            }
            console.log( outText );
        }
        
		
/*
        //Parse array of int32 into uint8
        var bytes = bluetoothle.encodedStringToBytes(obj.value);

        //Check for data
        if (bytes.length == 0)
        {
            console.log("BT: Subscription result had zero length data");
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
        console.log("Heart Rate: " + hr);
*/        
        
    }
    else if (obj.status == "subscribed")
    {
        console.log("BT: Subscription started");
		isBluetoothSubscribed = true;
    }
    else
  	{
    	console.log("BT: Unexpected subscribe status: " + obj.status);
    	DisconnectBluetoothDevice();
  }
}

function subscribeError(msg)
{
  	console.log("BT: Subscribe error: " + msg.error + " - " + msg.message);
}

function unsubscribeDevice()
{
  console.log("BT: Unsubscribing heart service");
  var paramsObj = {"serviceAssignedNumber":bridgeServiceUuid, "characteristicAssignedNumber":bridgeTxCharacteristicUuid};
  bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj)
{
    if (obj.status == "unsubscribed")
    {
        console.log("BT: Unsubscribed device");
    	isBluetoothSubscribed = false;
    }
    else
    {
      console.log("BT: Unexpected unsubscribe status: " + obj.status);
      DisconnectBluetoothDevice();
    }
}

function unsubscribeError(obj)
{
  console.log("BT: Unsubscribe error: " + obj.error + " - " + obj.message);
  DisconnectBluetoothDevice();
}




// WriteBluetoothDevice........................................................................
function WriteBluetoothDevice( u8 )
{
    // Convert a Unit8Array to a base64 encoded string...
    var u64 = bluetoothle.bytesToEncodedString(u8);

    // 1.0.2 of the plugin 
    var paramsObj = {"value":u64, "serviceUuid":bridgeServiceUuid, "characteristicUuid":bridgeRxCharacteristicUuid};
    
    bluetoothle.write(writeSuccess, writeError, paramsObj);
}


function writeSuccess(obj)
{   
    // {"status":"written","serviceUuid":"180F","characteristicUuid":"2A19","value":""};
    if (obj.status == "written")
    {
        console.log("BT: Write data sent successfully");
    }
    else
    {
        console.log("BT: Unexpected write status: " + obj.status);
    }
}

function writeError(msg)
{
    console.log("BT: Write error: " + msg.error + " - " + msg.message);
}














