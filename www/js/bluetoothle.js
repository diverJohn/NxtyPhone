/*
	pulled from: https://github.com/randdusing/BluetoothLE/tree/e927fa5ebae7b6db6c192f00291b0b16b58bc808

*/

var addressKey = "address";

var bridgeServiceAssignedNumber = "6734";
var bridgeMeasurementCharacteristicAssignedNumber = "6711";

var clientCharacteristicConfigDescriptorAssignedNumber = "2902";
var batteryServiceAssignedNumber = "180f";
var batteryLevelCharacteristicAssignedNumber = "2a19";


var scanTimer = null;
var connectTimer = null;
var reconnectTimer = null;

var iOSPlatform = "iOS";
var androidPlatform = "Android";


var BluetoothCnxTimer = null;


// Use the following as a global variable, "window.isBluetoothCnx", to determine if connected.
var isBluetoothCnx          = false;
var LastBluetoothIconStatus = false;

// StartBluetooth...................................................................................
function StartBluetooth()
{
	console.log("BT: Starting bluetooth");
	bluetoothle.initialize(initializeSuccess, initializeError);
}


function initializeSuccess(obj)
{
  if (obj.status == "initialized")
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
// Check every 30 seconds for a connection...
function BluetoothLoop()
{
	bluetoothle.isConnected( isConnectedCallback );
	
	// Check again in 30 seconds...
	BluetoothCnxTimer = setTimeout(BluetoothLoop, 30000);
}

function isConnectedCallback(obj)
{
	if(obj.isConnected)
	{
		console.log("BT: bluetooth cnx callback: Cnx" );
		UpdateBluetoothIcon( true );
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
    var paramsObj = {"serviceAssignedNumbers":[bridgeServiceAssignedNumber]};
    bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
}

function startScanSuccess(obj)
{
  if (obj.status == "scanResult")
  {
    console.log("BT: Scan match: " + obj.name + "string: " + JSON.stringify(obj) );
  
//var bytes = bluetoothle.getBytes(obj.advertisement);
//console.log("BT: Scan advertisment: " + obj.advertisement);
  
  
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
		isBluetoothCnx = false;
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
  DissconnectBluetoothDevice();
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
//    SubscribeBluetoothDevice();
    

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
  disconnectDevice();
}





// SubscribeBluetoothDevice........................................................................
function SubscribeBluetoothDevice()
{
	var paramsObj = {"serviceAssignedNumber":bridgeServiceAssignedNumber, "characteristicAssignedNumber":bridgeMeasurementCharacteristicAssignedNumber, "isNotification":true};
    bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
}


function subscribeSuccess(obj)
{   
    if (obj.status == "subscribedResult")
    {
        console.log("BT: Subscription data received");

		console.log("BT: data: " + obj.value );
		
		
		var bytes = bluetoothle.getBytes(obj.value);

        //Check for data
        if (bytes.length == 0)
        {
            for( var i = 0; i < bytes.length; i++ )
            {
            	console.log( bytes[i] );
            }
        }
        
		
/*
        //Parse array of int32 into uint8
        var bytes = bluetoothle.getBytes(obj.value);

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
//  DisconnectBluetoothDevice();
}

function unsubscribeDevice()
{
  console.log("BT: Unsubscribing heart service");
  var paramsObj = {"serviceAssignedNumber":bridgeServiceAssignedNumber, "characteristicAssignedNumber":bridgeMeasurementCharacteristicAssignedNumber};
  bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj)
{
    if (obj.status == "unsubscribed")
    {
        console.log("BT: Unsubscribed device");

//        console.log("BT: Reading client configuration descriptor");
//        var paramsObj = {"serviceAssignedNumber":bridgeServiceAssignedNumber, "characteristicAssignedNumber":bridgeMeasurementCharacteristicAssignedNumber, "descriptorAssignedNumber":clientCharacteristicConfigDescriptorAssignedNumber};
//        bluetoothle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
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










/*

jdo unused functions...



function servicesHeartSuccess(obj)
{
  if (obj.status == "discoveredServices")
  {
    var serviceAssignedNumbers = obj.serviceAssignedNumbers;
    for (var i = 0; i < serviceAssignedNumbers.length; i++)
    {
      var serviceAssignedNumber = serviceAssignedNumbers[i];

      if (serviceAssignedNumber == heartRateServiceAssignedNumber)
      {
        console.log("Finding heart rate characteristics");
        var paramsObj = {"serviceAssignedNumber":heartRateServiceAssignedNumber, "characteristicAssignedNumbers":[heartRateMeasurementCharacteristicAssignedNumber]};
        bluetoothle.characteristics(characteristicsHeartSuccess, characteristicsHeartError, paramsObj);
        return;
      }
    }
    console.log("Error: heart rate service not found");
  }
  else
  {
    console.log("Unexpected services heart status: " + obj.status);
  }
  disconnectDevice();
}

function servicesHeartError(obj)
{
  console.log("Services heart error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function characteristicsHeartSuccess(obj)
{
  if (obj.status == "discoveredCharacteristics")
  {
    var characteristicAssignedNumbers = obj.characteristicAssignedNumbers;
    for (var i = 0; i < characteristicAssignedNumbers.length; i++)
    {
      console.log("Heart characteristics found, now discovering descriptor");
      var characteristicAssignedNumber = characteristicAssignedNumbers[i];

      if (characteristicAssignedNumber == heartRateMeasurementCharacteristicAssignedNumber)
      {
        var paramsObj = {"serviceAssignedNumber":heartRateServiceAssignedNumber, "characteristicAssignedNumber":heartRateMeasurementCharacteristicAssignedNumber};
        bluetoothle.descriptors(descriptorsHeartSuccess, descriptorsHeartError, paramsObj);
        return;
      }
    }
    console.log("Error: Heart rate measurement characteristic not found.");
  }
  else
  {
    console.log("Unexpected characteristics heart status: " + obj.status);
  }
  disconnectDevice();
}

function characteristicsHeartError(obj)
{
  console.log("Characteristics heart error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function descriptorsHeartSuccess(obj)
{
  if (obj.status == "discoveredDescriptors")
  {
    console.log("Discovered heart descriptors, now discovering battery service");
    var paramsObj = {"serviceAssignedNumbers":[batteryServiceAssignedNumber]};
    bluetoothle.services(servicesBatterySuccess, servicesBatteryError, paramsObj);
  }
    else
  {
    console.log("Unexpected descriptors heart status: " + obj.status);
    disconnectDevice();
  }
}

function descriptorsHeartError(obj)
{
  console.log("Descriptors heart error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function servicesBatterySuccess(obj)
{
  if (obj.status == "discoveredServices")
  {
    var serviceAssignedNumbers = obj.serviceAssignedNumbers;
    for (var i = 0; i < serviceAssignedNumbers.length; i++)
    {
      var serviceAssignedNumber = serviceAssignedNumbers[i];

      if (serviceAssignedNumber == batteryServiceAssignedNumber)
      {
        console.log("Found battery service, now finding characteristic");
        var paramsObj = {"serviceAssignedNumber":batteryServiceAssignedNumber, "characteristicAssignedNumbers":[batteryLevelCharacteristicAssignedNumber]};
        bluetoothle.characteristics(characteristicsBatterySuccess, characteristicsBatteryError, paramsObj);
        return;
      }
    }
    console.log("Error: battery service not found");
  }
    else
  {
    console.log("Unexpected services battery status: " + obj.status);
  }
  disconnectDevice();
}

function servicesBatteryError(obj)
{
  console.log("Services battery error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function characteristicsBatterySuccess(obj)
{
  if (obj.status == "discoveredCharacteristics")
  {
    var characteristicAssignedNumbers = obj.characteristicAssignedNumbers;
    for (var i = 0; i < characteristicAssignedNumbers.length; i++)
    {
      var characteristicAssignedNumber = characteristicAssignedNumbers[i];

      if (characteristicAssignedNumber == batteryLevelCharacteristicAssignedNumber)
      {
        readBatteryLevel();
        return;
      }
    }
    console.log("Error: Battery characteristic not found.");
  }
    else
  {
    console.log("Unexpected characteristics battery status: " + obj.status);
  }
  disconnectDevice();
}

function characteristicsBatteryError(obj)
{
  console.log("Characteristics battery error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}


function readBatteryLevel()
{
  console.log("Reading battery level");
  var paramsObj = {"serviceAssignedNumber":batteryServiceAssignedNumber, "characteristicAssignedNumber":batteryLevelCharacteristicAssignedNumber};
  bluetoothle.read(readSuccess, readError, paramsObj);
}

function readSuccess(obj)
{
    if (obj.status == "read")
    {
        var bytes = bluetoothle.getBytes(obj.value);
        console.log("Battery level: " + bytes[0]);

        console.log("Subscribing to heart rate for 5 seconds");
        var paramsObj = {"serviceAssignedNumber":heartRateServiceAssignedNumber, "characteristicAssignedNumber":heartRateMeasurementCharacteristicAssignedNumber};
        bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
        setTimeout(unsubscribeDevice, 5000);
    }
    else
  {
    console.log("Unexpected read status: " + obj.status);
    disconnectDevice();
  }
}

function readError(obj)
{
  console.log("Read error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}


function readDescriptorSuccess(obj)
{
    if (obj.status == "readDescriptor")
    {
        var bytes = bluetoothle.getBytes(obj.value);
        var u16Bytes = new Uint16Array(bytes.buffer);
        console.log("Read descriptor value: " + u16Bytes[0]);
        disconnectDevice();
    }
    else
  {
    console.log("Unexpected read descriptor status: " + obj.status);
    disconnectDevice();
  }
}

function readDescriptorError(obj)
{
  console.log("Read Descriptor error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}


*/








/*

jdo unused functions...


function tempDisconnectDevice()
{
  console.log("Disconnecting from device to test reconnect");
    bluetoothle.disconnect(tempDisconnectSuccess, tempDisconnectError);
}

function tempDisconnectSuccess(obj)
{
    if (obj.status == "disconnected")
    {
        console.log("Temp disconnect device and reconnecting in 1 second. Instantly reconnecting can cause issues");
        setTimeout(reconnect, 1000);
    }
    else if (obj.status == "disconnecting")
    {
        console.log("Temp disconnecting device");
    }
    else
  {
    console.log("Unexpected temp disconnect status: " + obj.status);
  }
}

function tempDisconnectError(obj)
{
  console.log("Temp disconnect error: " + obj.error + " - " + obj.message);
}

function reconnect()
{
  console.log("Reconnecting with 5 second timeout");
  bluetoothle.reconnect(reconnectSuccess, reconnectError);
  reconnectTimer = setTimeout(reconnectTimeout, 5000);
}

function reconnectSuccess(obj)
{
  if (obj.status == "connected")
  {
    console.log("Reconnected to : " + obj.name + " - " + obj.address);

    clearReconnectTimeout();

    console.log("jdo: Should be connected at this point");


    if (window.device.platform == iOSPlatform)
    {
      console.log("Discovering heart rate service");
      var paramsObj = {"serviceAssignedNumbers":[heartRateServiceAssignedNumber]};
      bluetoothle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
    }
    else if (window.device.platform == androidPlatform)
    {
      console.log("Beginning discovery");
      bluetoothle.discover(discoverSuccess, discoverError);
    }
    
  }
  else if (obj.status == "connecting")
  {
    console.log("Reconnecting to : " + obj.name + " - " + obj.address);
  }
  else
  {
    console.log("Unexpected reconnect status: " + obj.status);
    disconnectDevice();
  }
}

function reconnectError(obj)
{
  console.log("Reconnect error: " + obj.error + " - " + obj.message);
  disconnectDevice();
}

function reconnectTimeout()
{
  console.log("Reconnection timed out");
}

function clearReconnectTimeout()
{ 
    console.log("Clearing reconnect timeout");
  if (reconnectTimer != null)
  {
    clearTimeout(reconnectTimer);
  }
}
*/ 