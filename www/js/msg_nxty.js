



/*
#include "stdafx.h"
#include <windows.h>
#include "msg_nxty.h"
#include "SerialIO.h"
#include <string.h>  
   


S_NXTY_MSG_INFO nxty;
unsigned char g_uRxMsgBuff[NXTY_MAX_RX_MSG_LEN];


extern void PrintBuffer( char * pHead, unsigned char * pData, int iLen );

static void CalcCrc8( unsigned char * pData, unsigned short uLen, unsigned char *pCrc );

// Data for PicSim to keep track of commands...
static BOOL  s_bBlueToothCnx;


unsigned char ProcessNxtyRxMsg( unsigned char * pRxMsgData, unsigned char uLen )
{
  unsigned char   uRtn;
  unsigned char   uCrc;
  unsigned char   uCmd;

  
  uRtn = 0;

  // Error processing...
  if( !((pRxMsgData[0] == NXTY_STD_MSG_SIZE) || (pRxMsgData[0] == NXTY_BIG_MSG_SIZE)) )
  {
    printf( "**** Err: Message len, 1st byte should be 12 or 255, len = %d\r\n", pRxMsgData[0] );
    return( NXTY_INVALID_LEN_ERR );
  }
  else if( pRxMsgData == NULL )
  {
    printf( "**** Err: Null pointer buffer\r\n" );
    return( NXTY_INVALID_BUFFER_ERR );
  }
  else if( uLen == 0 )
  {
    printf( "**** Err: 0 len\r\n" );
    return( NXTY_INVALID_LEN_ERR );
  }
  
  uCrc = 0;
  CalcCrc8( pRxMsgData, pRxMsgData[0]-1, &uCrc );
  
  if( pRxMsgData[pRxMsgData[0]-1] != uCrc )
  {
    printf( "**** Err: Invalid CRC: expected: 0x%02X  calc: 0x%02X\r\n", pRxMsgData[pRxMsgData[0]-1], uCrc );
    return( NXTY_INVALID_LEN_ERR );
  }

  uCmd = ((S_NXTY_HEADING *)pRxMsgData)->uCmd;
  uRtn = uCmd;

  switch( uCmd )
  {
    case NXTY_SYS_SN_RSP:                     printf( "System SN Rsp" );                break;
    case NXTY_SET_BLUETOOTH_CNX_STATUS_RSP:   printf( "Set Bluetooth Cnx Status Rsp" ); break;
    case NXTY_CELL_INFO_RSP:                  printf( "Cell Info Rsp" );                break;
    case NXTY_REGISTRATION_RSP:               printf( "Registration Rsp" );             break;
    case NXTY_GET_MON_MODE_HEADINGS_RSP:      printf( "Get Mon Mode Headings Rsp" );    break;
    case NXTY_GET_MON_MODE_PAGE_RSP:          printf( "Get Mon Mode Page Rsp" );        break;
    case NXTY_SW_VERSION_RSP:                 printf( "SW Version Rsp" );               break;
    case NXTY_DOWNLOAD_START_RSP:             printf( "Download Start Rsp" );           break;
    case NXTY_DOWNLOAD_TRANSFER_RSP:          printf( "Download Transfer Rsp" );        break;
    case NXTY_DOWNLOAD_END_RSP:               printf( "Download End Rsp" );             break;
    case NXTY_STATUS_RSP:                     printf( "Status Rsp" );                   break;

    
    default:
    {
      uRtn = NXTY_INVALID_COMMAND_ERR;
      break;
    }
  }
  
  printf( "\r\n" );

  return( uRtn );
}




void SendNxtyMsg( unsigned char uCmd, unsigned char * pMsgData, unsigned char uLen )
{
  unsigned char   i;
  unsigned char   uCrc;
  unsigned char   uStdBuff[NXTY_STD_MSG_SIZE];
  unsigned char   uBigBuff[NXTY_BIG_MSG_SIZE];


  if( uLen > (NXTY_BIG_MSG_SIZE-3) )
  {
    // Msg len too big...
    return;
  }
      

  
  // Check for STD message size...
  if( (uLen + 3) <= NXTY_STD_MSG_SIZE )
  {
    memset( uStdBuff, NXTY_MSG_FILL_BYTE, sizeof(uStdBuff) );
    uStdBuff[0] = NXTY_STD_MSG_SIZE;
    uStdBuff[1] = uCmd;
  
    if( uLen && pMsgData )
    {
      for( i = 0; i < uLen; i++ )
      {
        uStdBuff[2+i] = *pMsgData++;
      }
    }

    // Calculate the CRC...
    uCrc     = 0;
    CalcCrc8( uStdBuff, NXTY_STD_MSG_SIZE-1, &uCrc );
    uStdBuff[NXTY_STD_MSG_SIZE-1] = uCrc;

    // Send the data..
    PrintBuffer( "Tx: ", (unsigned char *)uStdBuff, NXTY_STD_MSG_SIZE );
    Transmit( uStdBuff, NXTY_STD_MSG_SIZE );
  }
  else
  {

    memset( uBigBuff, NXTY_MSG_FILL_BYTE, sizeof(uBigBuff) );
    uBigBuff[0] = NXTY_BIG_MSG_SIZE;   
    uBigBuff[1] = uCmd;

    if( uLen && pMsgData )
    {
      for( i = 0; i < uLen; i++ )
      {
        uBigBuff[2+i] = *pMsgData++;
      }
    }

    // Calculate the CRC...
    uCrc = 0;
    CalcCrc8( uBigBuff, NXTY_BIG_MSG_SIZE-1, &uCrc );
    uBigBuff[NXTY_BIG_MSG_SIZE-1] = uCrc;

    // Send the data..
    PrintBuffer( "Tx: ", (unsigned char *)uBigBuff, NXTY_BIG_MSG_SIZE );
    Transmit( uBigBuff, NXTY_BIG_MSG_SIZE );
  }
  



}



#define NXTY_STD_MSG_SIZE                   (12)
#define NXTY_BIG_MSG_SIZE                   (255)
#define NXTY_MSG_FILL_BYTE                  (0x00)   


#define NXTY_SYS_SN_REQ                     (0x01)
#define NXTY_SYS_SN_RSP                     (0x41)
#define NXTY_SET_BLUETOOTH_CNX_STATUS_REQ   (0x02)
#define   BLUETOOTH_NOT_CNX                   (0x00)
#define   BLUETOOTH_CNX                       (0x01)
#define NXTY_SET_BLUETOOTH_CNX_STATUS_RSP   (0x42)
#define NXTY_CELL_INFO_REQ                  (0x03)
#define NXTY_CELL_INFO_RSP                  (0x43)
#define NXTY_REGISTRATION_REQ               (0x04)
#define NXTY_REGISTRATION_RSP               (0x44)
#define NXTY_GET_MON_MODE_HEADINGS_REQ      (0x05)
#define NXTY_GET_MON_MODE_HEADINGS_RSP      (0x45)
#define NXTY_GET_MON_MODE_PAGE_REQ          (0x06)
#define NXTY_GET_MON_MODE_PAGE_RSP          (0x46)
#define NXTY_SW_VERSION_REQ                 (0x07)
#define NXTY_SW_VERSION_RSP                 (0x47)
#define NXTY_DOWNLOAD_START_REQ             (0x08)
#define NXTY_DOWNLOAD_START_RSP             (0x48)
#define NXTY_DOWNLOAD_TRANSFER_REQ          (0x09)
#define NXTY_DOWNLOAD_TRANSFER_RSP          (0x49)
#define NXTY_DOWNLOAD_END_REQ               (0x0A)
#define NXTY_DOWNLOAD_END_RSP               (0x4A)

#define NXTY_STATUS_RSP                     (0x4B)

   
// Errors processing...
#define NXTY_INVALID_BUFFER_ERR             (0xF0)
#define NXTY_INVALID_LEN_ERR                (0xF1)
#define NXTY_INVALID_CRC_ERR                (0xF2)
#define NXTY_INVALID_COMMAND_ERR            (0xF3)   


*/


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
  
var  NXTY_STD_MSG_SIZE = 12;
var  NXTY_BIG_MSG_SIZE = 255;

var  NXTY_STATUS_REQ   = 0x0B;

var nxty = {

     
    SendNxtyMsg: function( uCmdByte, pMsgData, uLenByte )
    {
      var i;
      var uCrc     = new Uint8Array(1);
      var uStdBuff = new Uint8Array(NXTY_STD_MSG_SIZE);
      var uBigBuff = new Uint8Array(NXTY_BIG_MSG_SIZE);
    
    
      if( uLenByte > (NXTY_BIG_MSG_SIZE-3) )
      {
        // Msg len too big...
        console.log( "Nxty: Msg too long" );
        return;
      }
          
    
      
      // Check for STD message size...
      if( (uLenByte + 3) <= NXTY_STD_MSG_SIZE )
      {
//        memset( uStdBuff, NXTY_MSG_FILL_BYTE, sizeof(uStdBuff) );
        uStdBuff[0] = NXTY_STD_MSG_SIZE;
        uStdBuff[1] = uCmdByte;
      
        if( uLenByte && (pMsgData != null) )
        {
          for( i = 0; i < uLenByte; i++ )
          {
            uStdBuff[2+i] = pMsgData[i].contents;
          }
        }
    
        // Calculate the CRC...
        uCrc = 0;
        uCrc = nxty.CalcCrc8( uStdBuff, NXTY_STD_MSG_SIZE-1, uCrc );
        uStdBuff[NXTY_STD_MSG_SIZE-1] = uCrc;
    
        // Send the data..
        var outText = uStdBuff[0].toString(16);    // Convert to hex output...
        for( i = 1; i < NXTY_STD_MSG_SIZE; i++ )
        {
            outText = outText + " " + uStdBuff[i].toString(16);
        }
        console.log( "Tx: " + outText );

        
        WriteBluetoothDevice(uStdBuff);
        
//        Transmit( uStdBuff, NXTY_STD_MSG_SIZE );
      }
/*      
      else
      {
    
        memset( uBigBuff, NXTY_MSG_FILL_BYTE, sizeof(uBigBuff) );
        uBigBuff[0] = NXTY_BIG_MSG_SIZE;   
        uBigBuff[1] = uCmd;
    
        if( uLen && pMsgData )
        {
          for( i = 0; i < uLen; i++ )
          {
            uBigBuff[2+i] = *pMsgData++;
          }
        }
    
        // Calculate the CRC...
        uCrc = 0;
        CalcCrc8( uBigBuff, NXTY_BIG_MSG_SIZE-1, &uCrc );
        uBigBuff[NXTY_BIG_MSG_SIZE-1] = uCrc;
    
        // Send the data..
        PrintBuffer( "Tx: ", (unsigned char *)uBigBuff, NXTY_BIG_MSG_SIZE );
        Transmit( uBigBuff, NXTY_BIG_MSG_SIZE );
      }
*/      
    
    
    
    },
     

    CalcCrc8: function( dataBytes, uLen, crcByte )
    {
  
      for( var i = 0; i < uLen; i++ )
      {
        crcByte = crc8_table[crcByte ^ dataBytes[i]];
      }

      return( crcByte );
    },
    




};
