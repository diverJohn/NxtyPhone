

var  NXTY_STD_MSG_SIZE 				   = 12;
var  NXTY_BIG_MSG_SIZE 				   = 255;

var  NXTY_INIT                         = -1;
var  NXTY_WAITING_FOR_RSP              = 0x00;
var  NXTY_SYS_SN_REQ                   = 0x01;
var  NXTY_SYS_SN_RSP                   = 0x41;
var  NXTY_SET_BLUETOOTH_CNX_STATUS_RSP = 0x42;
var  NXTY_CELL_INFO_REQ                = 0x03;
var  NXTY_CELL_INFO_RSP                = 0x43;
var  NXTY_REGISTRATION_REQ             = 0x04;
var  NXTY_REGISTRATION_RSP             = 0x44;
var  NXTY_GET_MON_MODE_HEADINGS_REQ    = 0x05;
var  NXTY_GET_MON_MODE_HEADINGS_RSP    = 0x45;
var  NXTY_GET_MON_MODE_PAGE_REQ        = 0x06;
var  NXTY_GET_MON_MODE_PAGE_RSP        = 0x46;
var  NXTY_SW_VERSION_REQ               = 0x07;
var  NXTY_SW_VERSION_RSP               = 0x47;
var    NXTY_SW_CF_NU_TYPE              = 0x01;
var    NXTY_SW_CF_CU_TYPE              = 0x02;
var    NXTY_SW_NU_PIC_TYPE             = 0x03;
var    NXTY_SW_CU_PIC_TYPE             = 0x04;
var    NXTY_SW_BT_TYPE                 = 0x05;
var  NXTY_DOWNLOAD_START_REQ           = 0x08;
var  NXTY_DOWNLOAD_START_RSP           = 0x48;
var  NXTY_DOWNLOAD_TRANSFER_REQ        = 0x09;
var  NXTY_DOWNLOAD_TRANSFER_RSP        = 0x49;
var  NXTY_DOWNLOAD_END_REQ             = 0x0A;
var  NXTY_DOWNLOAD_END_RSP             = 0x4A;
var  NXTY_STATUS_REQ                   = 0x0B;
var  NXTY_STATUS_RSP                   = 0x4B;



var	msgRxLastCmd      = NXTY_INIT;
var u8RxBuff          = new Uint8Array(NXTY_BIG_MSG_SIZE);	

 

var uRxBuffIdx		  = 0;
var uTxMsgNotReadyCnt = 0;


        
// Serial Number response data...        
var nxtySn                  = new Uint8Array(6);
var isNxtySnCurrent         = false;
        
// Status message response data...
var isNxtyStatusCurrent     = false;
var nxtyRxStatusHw          = null;
var nxtyRxStatusHwRev       = null;
var nxtyRxStatusUnii        = null;
var nxtyRxStatusReg         = null;
var nxtyRxStatusBuildConfig = null;


// Software Version response data...
var nxtyCurrentVerReq       = null;
var nxtySwVerCuCf           = null;  // NU Sw ver same as CU so just use CU.
var nxtySwBuildIdCu         = null;
var nxtySwVerNuPic          = null;
var nxtySwVerCuPic          = null;
var nxtySwVerBt             = null;




var crc8_table = new Uint8Array([ 

    0, 94,188,226, 97, 63,221,131,194,156,126, 32,163,253, 31, 65,
    157,195, 33,127,252,162, 64, 30, 95,  1,227,189, 62, 96,130,220,
     35,125,159,193, 66, 28,254,160,225,191, 93,  3,128,222, 60, 98,
    190,224,  2, 92,223,129, 99, 61,124, 34,192,158, 29, 67,161,255,
     70, 24,250,164, 39,121,155,197,132,218, 56,102,229,187, 89,  7,
    219,133,103, 57,186,228,  6, 88, 25, 71,165,251,120, 38,196,154,
    101, 59,217,135,  4, 90,184,230,167,249, 27, 69,198,152,122, 36,
    248,166, 68, 26,153,199, 37,123, 58,100,134,216, 91,  5,231,185,
    140,210, 48,110,237,179, 81, 15, 78, 16,242,172, 47,113,147,205,
     17, 79,173,243,112, 46,204,146,211,141,111, 49,178,236, 14, 80,
    175,241, 19, 77,206,144,114, 44,109, 51,209,143, 12, 82,176,238,
     50,108,142,208, 83, 13,239,177,240,174, 76, 18,145,207, 45,115,
    202,148,118, 40,171,245, 23, 73,  8, 86,180,234,105, 55,213,139,
     87,  9,235,181, 54,104,138,212,149,203, 41,119,244,170, 72, 22,
    233,183, 85, 11,136,214, 52,106, 43,117,151,201, 74, 20,246,168,
    116, 42,200,150, 21, 75,169,247,182,232, 10, 84,215,137,107, 53
]);
  




var nxty = {

     
    SendNxtyMsg: function( uCmdByte, pMsgData, uLenByte )
    {
      var i;
      var uCrc     = new Uint8Array(1);

        
      if( isBluetoothCnx == false )
      {
        PrintLog(99,  "Msg: Bluetooth not connected. Can not send message." );
        return;
      }        
        
       
      if( msgRxLastCmd == NXTY_WAITING_FOR_RSP )
      {
        uTxMsgNotReadyCnt++;
        
        if( uTxMsgNotReadyCnt < 5 )
        {
            var outText = uCmdByte.toString(16);    // Convert to hex output...
            for( i = 0; i < pMsgData.length; i++ )
            {
                outText = outText + " " + pMsgData[i].toString(16);
            }
            PrintLog(99,  "Msg: Tx requested before Rx received. TxNotReadyCnt = " + uTxMsgNotReadyCnt + " abort msg: " + outText );
            return;
        }
        else
        {
            PrintLog(99,  "Msg: Tx requested before Rx received. TxNotReadyCnt = " + uTxMsgNotReadyCnt + " send Tx and clear count." );
        }
      }


      uTxMsgNotReadyCnt = 0;
      
      if( uLenByte > (NXTY_BIG_MSG_SIZE-3) )
      {
        // Msg len too big...
        PrintLog(99,  "Msg: Msg too long" );
        return;
      }
        
    
      
      // Check for STD message size...
      if( (uLenByte + 3) <= NXTY_STD_MSG_SIZE )
      {
        // Create a new array that is initialized to all zeros...              
        var uStdBuff = new Uint8Array(NXTY_STD_MSG_SIZE);
        uStdBuff[0] = NXTY_STD_MSG_SIZE;
        uStdBuff[1] = uCmdByte;
      
     
        if( uLenByte && (pMsgData != null) )
        {
          for( i = 0; i < uLenByte; i++ )
          {
            uStdBuff[2+i] = pMsgData[i];
          }
        }
    
        // Calculate the CRC...
        uCrc = 0;
        uCrc = nxty.CalcCrc8( uStdBuff, NXTY_STD_MSG_SIZE-1, uCrc );
        uStdBuff[NXTY_STD_MSG_SIZE-1] = uCrc;
    
        // Send the data..
        WriteBluetoothDevice(uStdBuff);
        
      }
      else
      {
        // Create a new array that is initialized to all zeros...              
        var uBigBuff = new Uint8Array(NXTY_BIG_MSG_SIZE);
        uBigBuff[0] = NXTY_BIG_MSG_SIZE;   
        uBigBuff[1] = uCmdByte;
    
        if( uLenByte && (pMsgData != null) )
        {
          for( i = 0; i < uLenByte; i++ )
          {
            uBigBuff[2+i] = pMsgData[i];
          }
        }
    
        // Calculate the CRC...
        uCrc = 0;
        uCrc = nxty.CalcCrc8( uBigBuff, NXTY_BIG_MSG_SIZE-1, uCrc );
        uBigBuff[NXTY_BIG_MSG_SIZE-1] = uCrc;
    
        WriteBluetoothDevice(uBigBuff);
      }
    
      // Get ready to receive...
      uRxBuffIdx   = 0;
      msgRxLastCmd = NXTY_WAITING_FOR_RSP;
    },
     
     
     
    ProcessNxtyRxMsg: function( pRxMsgData, uLenByte )
    {
        var i;
        var	bOk = false;
        
        // Perform some sanity checks before copying incoming data to u8RxBuff.
		if( (uRxBuffIdx + uLenByte) > u8RxBuff.length )
		{
			uRxBuffIdx = 0;
			PrintLog(99, "Msg: Rx buffer overflow, data tossed.");
			return;
		}
		
		if( uRxBuffIdx == 0 )
		{
			if( !((pRxMsgData[0] == NXTY_STD_MSG_SIZE) || (pRxMsgData[0] == NXTY_BIG_MSG_SIZE)) )
			{
				uRxBuffIdx = 0;
				PrintLog(99,  "Msg: Message len, 1st byte should be 12 or 255, len = " + pRxMsgData[0] + ", data tossed." );
				return;
			}
		}
		
        
        // Copy over the incoming data...
        var outText = pRxMsgData[0].toString(16);
		for( i = 0; i < uLenByte; i++ )
		{
			u8RxBuff[uRxBuffIdx] = pRxMsgData[i];
			uRxBuffIdx = uRxBuffIdx + 1;
			
			if( i )
			{
				outText = outText + " " + pRxMsgData[i].toString(16);
			}
		}

        

		// See if our buffer has a complete message...
		if( uRxBuffIdx != u8RxBuff[0] )
		{
            outText = outText + " [Cnt(" + uRxBuffIdx  + ") != len(" + u8RxBuff[0] + ") exit]";
		    PrintLog(3,  "Msg Rx: " + outText );
			return;
		}

        outText = outText + " [Cnt(" + uRxBuffIdx  + ") == len(" + u8RxBuff[0] + ") process]";
        PrintLog(3,  "Msg Rx: " + outText );


		// Process message................................
        var uCrc     = new Uint8Array(1);
        var uCmd     = new Uint8Array(1);
  
	      
	    uCrc = 0;
	    uCrc = nxty.CalcCrc8( u8RxBuff, u8RxBuff[0]-1, uCrc );
	      
	    if( u8RxBuff[u8RxBuff[0]-1] != uCrc )
	    {
	        PrintLog(99,  "Msg: Invalid CRC: expected: 0x" + u8RxBuff[u8RxBuff[0]-1].toString(16) + " calc: 0x" + uCrc.toString(16) );
	        return;
	    }
	    
	    uCmd 		  = u8RxBuff[1];
	    msgRxLastCmd = uCmd;
	    
	    switch( uCmd )
	    {
	        case NXTY_SYS_SN_RSP: 
	        {
	           PrintLog(1,  "Msg: System SN Rsp" );
	           for( i = 0; i < nxtySn.length; i++ )
	           {
	               nxtySn[i] = u8RxBuff[2+i];
	           }
	           
               isNxtySnCurrent = true;
	           break;
	        }
	        
	        
	        case NXTY_CELL_INFO_RSP:
	        {
	           PrintLog(1,  "Msg: Cell Info Rsp" );
	           
                // JSON data from device looks like...
                //     { 
                //       “plmnid”:'0x310-0x240',
                //       "regDataToOp": "cell info response data",
                //     }
                
                // Grab the JSON string from the Rx buffer...
                // u8RxBuff[0] = len  (should be 255)
                // u8RxBuff[1] = cmd  (should be cell info response, 0x44)
                // u8RxBuff[2] to u8RxBuff[253] should be the JSON string data...
                
                // Find the end of the JSON string data...
                for( i = 2; i < 255; i++ )
                {
                    if( u8RxBuff[i] == 0 )
                    {
                        break;
                    }
                }
    
                var u8Sub    = u8RxBuff.subarray(2, i);     // u8RxBuff[2] to [i-1].
                var myString = bluetoothle.bytesToString(u8Sub);
                var myData   = JSON.parse(myString);
	           
	            // Fill in the global variables...
	            myPlmnid       = myData.plmnid;
                myRegDataToOp  = myData.regDataToOp;
	           break;
	        }
	        
	        
	        case NXTY_SW_VERSION_RSP:
	        {
	           PrintLog(1,  "Msg: SW Version Rsp" );
	           if( nxtyCurrentVerReq == NXTY_SW_CF_CU_TYPE )
	           {
	               nxtySwVerCuCf   = U8ToHexText(u8RxBuff[3]) + "." + U8ToHexText(u8RxBuff[4]) + "." + U8ToHexText(u8RxBuff[5]);  
	               nxtySwBuildIdCu = "0x" + U8ToHexText(u8RxBuff[6]) + U8ToHexText(u8RxBuff[7]) + U8ToHexText(u8RxBuff[8]) + U8ToHexText(u8RxBuff[9]);
	           }
               else if( nxtyCurrentVerReq == NXTY_SW_NU_PIC_TYPE )
               {
                   nxtySwVerNuPic  = U8ToHexText(u8RxBuff[3]) + "." + U8ToHexText(u8RxBuff[4]) + "." + U8ToHexText(u8RxBuff[5]); 
               }
               else if( nxtyCurrentVerReq == NXTY_SW_CU_PIC_TYPE )
               {
                   nxtySwVerCuPic  = U8ToHexText(u8RxBuff[3]) + "." + U8ToHexText(u8RxBuff[4]) + "." + U8ToHexText(u8RxBuff[5]); 
               }
               else if( nxtyCurrentVerReq == NXTY_SW_BT_TYPE )
               {
                    nxtySwVerBt    = U8ToHexText(u8RxBuff[3]) + "." + U8ToHexText(u8RxBuff[4]) + "." + U8ToHexText(u8RxBuff[5]); 
               }
	           
	           break;
	        }
	        
	        
	        case NXTY_DOWNLOAD_START_RSP:             PrintLog(1,  "Msg: Download Start Rsp" );           break;
	        case NXTY_DOWNLOAD_TRANSFER_RSP:          PrintLog(1,  "Msg: Download Transfer Rsp" );        break;
	        case NXTY_DOWNLOAD_END_RSP:               PrintLog(1,  "Msg: Download End Rsp" );             break;
	        
	        
	        
	        case NXTY_GET_MON_MODE_HEADINGS_RSP:
            case NXTY_GET_MON_MODE_PAGE_RSP:
            {
                // Do nothing, processed in ProcessTechDataLoop().
                break;
            }
            
	        case NXTY_REGISTRATION_RSP:
	        {
	        	PrintLog(1,  "Msg: Registration Rsp" );
	            nxty.UpdateRegIcon(u8RxBuff[2]);
	        	break;
	        }
	        
	        case NXTY_STATUS_RSP:
	        {
	        	PrintLog(1,  "Msg: Status Rsp" );
	        	nxtyRxStatusHw    = u8RxBuff[2];
	        	nxtyRxStatusHwRev = u8RxBuff[3];
	        	nxtyRxStatusUnii  = u8RxBuff[4];
	        	nxtyRxStatusReg   = u8RxBuff[5];
	        	
	        	nxty.UpdateRegIcon(nxtyRxStatusReg);

                // Swap BuildConfig bytes...
                var uTemp   = u8RxBuff[6];
                u8RxBuff[6] = u8RxBuff[7];
                u8RxBuff[7] = uTemp;
                
                // Create a 16 bit view	        	
                var u16 = new Uint16Array(u8RxBuff.buffer.slice(0, 12));   // Grab bytes 0 to 11.	        	
	        	
	        	// u8RxBuff[0] and [1] = u16[0]
	        	// u8RxBuff[2] and [3] = u16[1]
                // u8RxBuff[4] and [5] = u16[2]
                // u8RxBuff[6] and [7] = u16[3]  --> BuildConfig
                nxtyRxStatusBuildConfig = u16[3];
	        	
	        	isNxtyStatusCurrent = true;
	        	break;
	       	}
	    
	    	case NXTY_SET_BLUETOOTH_CNX_STATUS_RSP:
	    	{   
	    	    PrintLog(1,  "Msg: Set Bluetooth Cnx Status Rsp" );
	    	    
	    	    // Do not count this command since this may have been initiated by the BT device. 
//                msgRxLastCmd = NXTY_WAITING_FOR_RSP;
	    	    break;
	    	}
	        
	        default:
	        {
	           PrintLog(99,  "Msg: Undefined command: " + uCmd.toString(16) );
	           break;
	        }
	    }


	      
	    return;
	},
	     
     
     
     

    CalcCrc8: function( dataBytes, uLen, crcByte )
    {
  
      for( var i = 0; i < uLen; i++ )
      {
        crcByte = crc8_table[crcByte ^ dataBytes[i]];
      }

      return( crcByte );
    },
    

	// UpdateRegIcon....................................................................................
	UpdateRegIcon: function(reg)
	{
		if(reg == 1)
		{
			if( document.getElementById("reg_icon_id").innerHTML != szRegIconOn )
			{
				document.getElementById("reg_icon_id").innerHTML = szRegIconOn;
                $('body').css("background","white url('../www/img/background_reg.png') no-repeat fixed center bottom");
			}
			isRegistered = true;
		}
		else
		{
			if( document.getElementById("reg_icon_id").innerHTML != szRegIconOff )
			{
				document.getElementById("reg_icon_id").innerHTML = szRegIconOff;
                $('body').css("background","white url('../www/img/background.png') no-repeat fixed center bottom");
			}
			isRegistered = false;
		}
	},



};
