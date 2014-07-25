var app = {

	registerEvents: function() {
	    var self = this;
	    	
        console.log("reg events");
        
        // Call onDeviceReady when PhoneGap is loaded.
	    //
	    // At this point, the document has loaded but phonegap-1.0.0.js has not.
	    // When PhoneGap is loaded and talking with the native device,
	    // it will call the event `deviceready`.
	    // 
        document.addEventListener('deviceready', this.onDeviceReady, false);
  
    

	  	              	    
//	    $(window).on('hashchange', $.proxy(this.route, this));
	    	    
	    	    
	    // Check of browser supports touch events...
	    if (document.documentElement.hasOwnProperty('ontouchstart')) {
	        // ... if yes: register touch event listener to change the "selected" state of the item
	        $('body').on('touchstart', 'a', function(event) {
	            $(event.target).addClass('tappable-active');
	        });
	        $('body').on('touchend', 'a', function(event) {
	            $(event.target).removeClass('tappable-active');
	        });
	    } else {
	            console.log("reg mouse events");
	        // ... if not: register mouse events instead
	        $('body').on('mousedown', 'a', function(event) {
	            $(event.target).addClass('tappable-active');
	            console.log("mousedown");
	        });
	        $('body').on('mouseup', 'a', function(event) {
	            $(event.target).removeClass('tappable-active');
	            console.log("mouseup");
	        });
	    }
	    
	},

     
    // deviceready Event Handler
    //
  	// PhoneGap is now loaded and it is now safe to make calls using PhoneGap
    //
    onDeviceReady: function() {
    	console.log( "device ready" );
        StartBluetooth();
    },   
       
       
    showAlert: function (message, title) {
      if (navigator.notification) {
        navigator.notification.alert(message, null, title, 'OK DOK');
      } else {
        alert(title ? (title + ": " + message) : message);
      }
    },


	initialize: function() {
		this.registerEvents();
	}

};






	
