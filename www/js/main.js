var app = {

/*
	registerEvents: function() {
	    	
        console.log("reg events");
        
        // Call onDeviceReady when PhoneGap is loaded.
	    //
	    // At this point, the document has loaded but phonegap-1.0.0.js has not.
	    // When PhoneGap is loaded and talking with the native device,
	    // it will call the event `deviceready`.
	    // 
        document.addEventListener('deviceready', this.onDeviceReady, false);
	},
*/
     
    // deviceready Event Handler
    //
  	// PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {
    	console.log( "device ready" );
    	
    	// Only start bluetooth if on a phone...
    	if( window.isPhone )
    	{
            StartBluetooth();
        }
        
        this.renderHomeView();
    },   
       
       
    showAlert: function (message, title) {
      if (navigator.notification) {
  		alert("navigator.notification lives");	    
        navigator.notification.alert(message, null, title, 'OK DOK');
      } else {
        alert("No navigator.notification lives");
        alert(title ? (title + ": " + message) : message);
      }
    },


	// Handle the Register key
	handleRegKey: function()
	{
	 	console.log("Reg key pressed");
	 	this.showAlert("Reg key pressed!", "Info");
	},

	// Handle the Check for SW Update key
	handleSwUpdateKey: function()
	{
	 	console.log("SW Update key pressed");
	 	this.showAlert("Check for SW Update Key pressed!", "Info");
	},

	// Handle the Teck Mode key
	handleTechModeKey: function()
	{
	 	console.log("Tech Mode key pressed");
	 	showAlert("Tech Mode key pressed!", "Info");
	},


	renderHomeView: function() 
	{
		var myHtml = 
			"<img src='img/header.png' width='100%' />" +
			"<button type='button' class='mybutton' onclick='app.handleSwUpdateKey()'><img src='img/button_SwUpdate.png' /></button>" +
			"<button type='button' class='mybutton' onclick='app.handleTechModeKey()'><img src='img/button_TechMode.png'/></button>" +
  			"<button type='button' class='mybutton' onclick='app.handleRegKey()'><img src='img/button_Register.png' /></button>"
		$('body').html(myHtml);  			
	},


	initialize: function() {
	
      	if (navigator.notification) 
      	{
			// On a phone....
			window.isPhone = true;
			
	        // Call onDeviceReady when PhoneGap is loaded.
		    //
		    // At this point, the document has loaded but phonegap-1.0.0.js has not.
		    // When PhoneGap is loaded and talking with the native device,
            // it will call the event `deviceready`.
            // 
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } 
        else 
        {
		  // Browser...
          window.isPhone = false;
		  this.onDeviceReady();
        }
	
//		this.registerEvents();
//		this.renderHomeView();
	},

};






	
