enyo.kind({
    name: "Help",
    kind: "VFlexBox",
    className: "interfaceLIFT-bg",
    components: [
        {name: "header", kind: "Header"},
        {name: "applicationService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
        {kind: "FadeScroller", autoHorizontal: false, flex: 1, horizontal: false, components: [
            {kind: "Group", caption: "Information", components: [
                {kind: "Item", style: "border: none;", components: [
                    {style: "color: #DDD;", content: "All user-contributed downloadable content hosted on InterfaceLIFT servers is copyright by the original authors of that content. For more information, see the Usage Policy below."}
                ]},
                {kind: "Button", caption: "Copyright & Usage Policy", onclick: "usage", className: "enyo-button-dark"}
            ]},
            {kind: "Group", caption: "Help", components: [
                {kind: "Button", caption: "Visit Website", onclick: "visit", className: "enyo-button-dark"},
                {kind: "Button", caption: "Email", onclick: "email", className: "enyo-button-dark"}
            ]},
            {kind: "Group", caption: "Reset Database", components: [
                {kind: "Item", style: "border: none;", components: [
                    {style: "color: #DDD;", content: "This will delete all information from the database. The app will then close. The next time the application is started, all wallpaper information will be downloaded again."}
                ]},
                {kind: "Button", caption: "Reset Database", className: "enyo-button-negative", onclick: "reset"}
            ]}
        ]},
        {kind: "Toolbar", components: [
	    {kind: "GrabButton"}
	]}
    ],
    create: function() {
        this.inherited(arguments);
        this.$.header.setContent("Help");
    },
    usage: function(inSender) {
        this.$.applicationService.call({
	    "target": "http://interfacelift.com/website/copyright_policy.php"
	});
        return;
    },
    visit: function(inSender) {
        this.$.applicationService.call({
	    "target": "http://www.krischeonline.com/category/webos/interfacelift"
	});
        return;
    },
    email: function(inSender) {
        this.$.applicationService.call({
	    id: "com.palm.app.email",
	        params: {
	            summary: "InterfaceLIFT for WebOS Issue",
	            recipients: [{
	            	contactDisplay: "InterfaceLIFT for WebOS",
	                type:"email",
	                role:1,
	                value:"krische+webos@gmail.com"
	            }]
	        }
	});
        return;
    },
    reset: function(inSender) {
        InterfaceLIFT.Database.deleteDatabase();
        return;
    }
});