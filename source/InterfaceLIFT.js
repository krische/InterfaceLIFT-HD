enyo.kind({
	name: "InterfaceLIFT",
	kind: enyo.VFlexBox,
	startup: true,
	version: "1.0.1",
	components: [
		{name: "pane", kind: "Pane", flex: 1, components: [
			{name: "mainSlidingPane", kind: "SlidingPane", flex: 1, components: [
				{name: "left", width: "224px", components: [
					{kind: "MainMenuView", flex: 1, onSelectSearch: "goToSearch", onSelectArtists: "goToArtists", onSelectTags: "goToTags", onSelectWallpapers: "goToWallpapers"}
				]},
				{name: "right", flex: 1, onResize: "resize", components: [
					{name: "mainPane", kind: "Pane", flex: 1, components: [
						{name: "startup", kind: "Startup", onStartupComplete: "startupComplete", flex: 1},
						{name: "searchView", kind: "SearchView", onSelectArtist: "artistSelected", onSelectTag: "tagSelected", onSelectWallpaper: "wallpaperSelected"},
						{name: "wallpaperListView", kind: "WallpaperListView", headerContent: "Most Recent Wallpapers", onSelect: "wallpaperSelected", lazy: true, flex: 1},
						{name: "help", kind: "Help"},
						{name: "tagsSlidingPane", kind: "SlidingPane", flex: 1, lazy: true, components: [
							{name: "tagsMiddle", width: "288px", components: [
								{name: "tagsList", kind: "TagsList", flex: 1, onSelect: "tagSelected"}
							]},
							{name: "tagsRight", flex: 1, onResize: "resize", components: [
								{name: "tagViewer", kind: "TagViewer", onSelect: "wallpaperSelected", flex: 1}
							]}
						]},
						{name: "artistsSlidingPane", kind: "SlidingPane", flex: 1, lazy: true, components: [
							{name: "artistsMiddle", width: "288px", components: [
								{name: "artistsList", kind: "ArtistsList", flex: 1, onSelect: "artistSelected"}
							]},
							{name: "artistsRight", flex: 1, onResize: "resize", components: [
								{name: "artistViewer", kind: "ArtistViewer", onSelect: "wallpaperSelected", flex: 1}
							]}
						]}
					]}
				]},
			]},
			{name: "viewerPane", kind: "Pane", lazy: true, flex: 1, components: [
				{name: "wallpaperViewer", kind: "WallpaperViewer", components: [
					{name: "viewerBackButton", kind: "Button", caption: "Back", className: 'enyo-button-dark viewer-button', onclick: "goBack"}
				]}
			]}
		]},
		{kind: "AppMenu", components: [
			{caption: "About", onclick: "goToAbout"},
			{caption: "Help", onclick: "goToHelp"}
		]},
		{name: "applicationService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
		{name: "aboutDialog", kind: "Dialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: "InterfaceLIFT HD"},
			{name: "aboutMessage", kind: "HtmlContent", className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", onLinkClick: "htmlClick"},
			{kind: "Button", caption: "OK", onclick: "dismissAbout"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.$.pane.selectViewByName("mainSlidingPane");
	},
	openAppMenuHandler: function() {
		if(!this.startup)
		{
			this.$.appMenu.open();
		}
		return;
	},
	closeAppMenuHandler: function() {
		if(!this.startup)
		{
			this.$.appMenu.close();
		}
		return;
	},
	startupComplete: function() {
		this.startup = false;
		this.goToWallpapers();
		return;
	},
	goBack: function() {
		if(this.$.wallpaperViewer.stuffShown)
		{
			this.$.wallpaperListView.getFavorites();
			this.$.pane.selectViewByName("mainSlidingPane");
			if (window.PalmSystem) {
				window.PalmSystem.enableFullScreenMode(false);
			}
		}
		return;
	},
	resize: function(inSender) {
		switch(inSender.name)
		{
			case "tagsRight":
				this.$.tagViewer.resize();
				break;
			case "artistsRight":
				this.$.artistViewer.resize();
				break;
			case "right":
				switch(this.$.mainPane.getViewName())
				{
					case "searchView":
						this.$.searchView.resize();
						break;
					case "wallpaperListView":
						this.$.wallpaperListView.resize();
						break;
				}
				break;
		}
		return;
	},
	goToWallpapers: function() {
		if(!this.startup)
		{
			this.$.mainMenuView.select("wallpapers");
			this.$.pane.selectViewByName("mainSlidingPane");
			this.$.mainPane.selectViewByName("wallpaperListView");
			this.$.wallpaperListView.resize();
		}
		return;
	},
	goToTags: function() {
		if(!this.startup)
		{
			this.$.mainMenuView.select("tags");
			this.$.mainPane.selectViewByName("tagsSlidingPane");
			this.$.tagsList.tagType = "Color";
			this.$.tagsList.tagSort = "Alphabetically";
			this.$.tagsList.getTags();
		}
		return;
	},
	goToSearch: function() {
		if(!this.startup)
		{
			this.$.mainMenuView.select("search");
			this.$.pane.selectViewByName("mainSlidingPane");
			this.$.mainPane.selectViewByName("searchView");
			this.$.searchView.newSearch();
		}
	},
	goToArtists: function() {
		if(!this.startup)
		{
			this.$.mainMenuView.select("artists");
			this.$.mainPane.selectViewByName("artistsSlidingPane");
			this.$.artistsList.artistSort = "Alphabetically";
			this.$.artistsList.getArtists();
		}
		return;
	},
	artistSelected: function(inSender, inArtist) {
		if(inSender.name != "artistsList")
		{
			this.goToArtists();
		}
		this.$.artistViewer.artist = inArtist;
		this.$.artistViewer.artistChanged();
		return;
	},
	tagSelected: function(inSender, inTag) {
		if(inSender.name != "tagsList")
		{
			this.goToTags();
		}
		this.$.tagViewer.tag = inTag;
		this.$.tagViewer.tagChanged();
		return;
	},
	wallpaperSelected: function(inSender, inWallpaper) {
		this.$.pane.selectViewByName("viewerPane");
		this.$.wallpaperViewer.wallpaper = inWallpaper;
		this.$.wallpaperViewer.wallpaperChanged();
		return;
	},
	goToAbout: function(inSender) {
		this.$.aboutDialog.toggleOpen();
		this.$.aboutMessage.setContent("Version: " + this.version + "<br>All content in this application is provided by <a href='http://www.interfacelift.com'>interfacelift.com</a>.");
		return;
	},
	htmlClick: function(inSender, inUrl) {
		this.$.applicationService.call({
			"target": inUrl
		});
	},
	dismissAbout: function(inSender) {
		this.$.aboutDialog.toggleOpen();
		return;
	},
	goToHelp: function(inSender) {
		this.$.pane.selectViewByName("mainSlidingPane");
		this.$.mainMenuView.select("none");
		this.$.mainPane.selectViewByName("help");
		return;
	}
});