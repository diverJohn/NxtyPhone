/**************************************************************************************************
  Filename:       msg_nxty.h

**************************************************************************************************/


/*********************************************************************
 * INCLUDES
 */

/*********************************************************************
 * CONSTANTS
 */

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
#define NXTY_STATUS_REQ                     (0x0B)
#define NXTY_STATUS_RSP                     (0x4B)

   
// Errors processing...
#define NXTY_INVALID_BUFFER_ERR             (0xF0)
#define NXTY_INVALID_LEN_ERR                (0xF1)
#define NXTY_INVALID_CRC_ERR                (0xF2)
#define NXTY_INVALID_COMMAND_ERR            (0xF3)   
   
// Misc...
#ifndef TRUE
#define TRUE 1
#endif

#ifndef FALSE
#define FALSE 0
#endif

#ifndef NULL
#define NULL 0
#endif

#define NXTY_SYS_SN_LEN                     (8)
#define NXTY_MAX_RX_MSG_LEN                 (255)   

typedef struct
{
  unsigned char   uLen;
  unsigned char   uCmd;
  
} S_NXTY_HEADING;

typedef struct
{
  unsigned char   hw_platform;        // from buildoptions.h
  unsigned char   hw_platform_rev;    // from buildoptions.h
  unsigned char   unii_status;        // 0=down, 1=up
  unsigned char   reg_status;         // 0=not registered, 1=registered
  
} S_NXTY_STATUS_RSP_DATA;

typedef struct
{
  S_NXTY_HEADING          head;
  S_NXTY_STATUS_RSP_DATA  data;
  unsigned char           uCrc;
  
} S_NXTY_STATUS_RSP;


typedef struct
{
  unsigned char   uSysSn[NXTY_SYS_SN_LEN];
  
} S_NXTY_SYS_SN_RSP_DATA;


typedef struct
{
  S_NXTY_HEADING          head;
  unsigned char           uCnxStatus;
  unsigned char           uCrc;
  
} S_NXTY_SET_BLUETOOTH_CNX_STATUS_REQ;


typedef struct
{
  unsigned char   uLastError;
  unsigned char   uLastCmd;

  // Sys SN Cmd...
  S_NXTY_SYS_SN_RSP_DATA  sys_sn_rsp;
  
  // Status Cmd...
  S_NXTY_STATUS_RSP_DATA  status_rsp;

  // Errors
  unsigned short  uErrCksum;
  unsigned short  uErrInvalidMsg;
  
} S_NXTY_MSG_INFO;

   
/*********************************************************************
 * MACROS
 */

/*********************************************************************
 * FUNCTIONS
 */


extern void SendNxtyMsg( unsigned char uCmd, unsigned char * pMsgData, unsigned char uLen );
extern unsigned char ProcessNxtyRxMsg( unsigned char * pRxMsgData, unsigned char uLen );

extern S_NXTY_MSG_INFO nxty;
extern unsigned char g_uRxMsgBuff[];
/*********************************************************************
*********************************************************************/
