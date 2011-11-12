enyo.kind({
	name: "WallpaperViewer",
	kind: "VFlexBox",
	className: "wallpaper-viewer",
	wallpaper: [],
	results: [],
	stuffShown: true,
	components: [
		{name: "wallpaperImage", kind: "ImageView", flex: 1, onclick: "toggleStuff"},
		{name: "footer", kind: "VFlexBox", className: "viewer-footer", components: [
			{name: "titleBar", kind: "HFlexBox", className: "viewer-titlebar", components: [
				{name: "title", className: "viewer-title"},
				{name: "artist", className: "viewer-artist"},
				{name: "date", flex: 1, className: "viewer-date"}
			]},
			{name: "descriptionScroller", kind: "FadeScroller", autoHorizontal: false, horizontal: false, flex: 3, components: [
				{name: "description", className: "viewer-description"}
			]}
		]},
		{name: "moreContainer", kind: "Scroller", autoVertical: false, vertical: false, className: "more-container", components: [
			{name: "moreList", kind: "VirtualRepeater", className: "more-list", onSetupRow: "getListItem", components: [
				{name: "moreItem", kind: "Item", className: "more-item", components: [
					{name: "thumbnail", kind: "Image", className: "more-thumbnail"}
				], onclick: "listItemClick"}
			]},
			{name: "noMore", style: "color: #DDD; padding-top: 40px; width: 100%; text-align: center;"}
		]},
		{name: "header", kind: "Header", className: "viewer-header", components: [
			{kind: "HFlexBox", style: "width: 100%;", components: [
				{name: "client", kind: "HFlexBox"},
				{kind: "HFlexBox", flex: 1, style: "text-align: right;", components: [
					{kind: "Spacer"},
					{name: "favoriteButton", kind: "Button", caption: "Add to Favorites", className: 'enyo-button-dark viewer-button', onclick: 'doFavorite'},
					{name: "applyButton", kind: "Button", caption: "Apply Wallpaper", className: 'enyo-button-dark viewer-button', onclick: "doApply"},
					{name: "moreButton", kind: "Button", caption: "More by Artist", className: 'enyo-button-dark viewer-button', onclick: "doMore"}
				]}
			]}
		]},
		{name: "applyPopup", kind: "Popup", className: "viewer-popup", components: [
			{content: "Apply this Wallpaper?", style: "text-align: center; padding-bottom: 4pt;"},
			{kind: "Button", content: "Yes", className: "enyo-button-dark", onclick: "applyWallpaper"},
			{kind: "Button", content: "No", className: "enyo-button-dark", onclick: "dismissApplyPopup"}
		]},
		{name: "progressPopup", kind: "Popup", className: "viewer-popup", components: [
			{content: "Download Progress", style: "text-align: center; padding-bottom: 4pt;"},
			{name: "downloadProgress", kind: "ProgressBar", minimum: 0, maximum: 100}
		]},
		{name: "appliedPopup", kind: "Popup", className: "viewer-popup", components: [
			{content: "Wallpaper Applied", style: "text-align: center; padding-bottom: 4pt;"},
			{kind: "Button", content: "OK", className: "enyo-button-dark", onclick: "dismissApplied"}
		]},
		{name: "downloadWallpaper", kind: "PalmService", service: "palm://com.palm.downloadmanager/", method: "download", onSuccess: "downloadSuccess", onFailure: "serviceFailure", subscribe: true, keepFilenameOnRedirect: true},
		{name: "importWallpaper", kind: "PalmService", service: "palm://com.palm.systemservice/", method: "wallpaper/importWallpaper", onSuccess: "importSuccess", onFailure: "serviceFailure"},
		{name: "setWallpaper", kind: "PalmService", service: "palm://com.palm.systemservice/", method: "setPreferences", onSuccess: "setSuccess", onFailure: "serviceFailure"}
	],
	create: function() {
		this.inherited(arguments);
		
		// open the database
		try {
			this.db = openDatabase('ext:ILIFTdb', '', 'InterfaceLIFT Database', 3000000);
		} catch (e) {
			console.log("Database Open Error: " + e);		
		}
	},
	wallpaperChanged: function() {
		if (window.PalmSystem) {
			window.PalmSystem.enableFullScreenMode(true);
		}
		
		// apply info
		this.$.wallpaperImage.setCenterSrc(this.wallpaper[0].download);
		this.$.title.setContent(this.wallpaper[0].title);
		this.$.artist.setContent("by '" + this.wallpaper[0].artist + "'");
		this.$.date.setContent(this.wallpaper[0].date);
		this.$.description.setContent(this.wallpaper[0].description);
		this.showStuff();
		this.setHideTimeout();
		
		// reset 'more by artist'
		this.moreShowing = false;
		this.$.moreContainer.addClass('hide');
		this.$.noMore.hide();
		this.results.length = 0;
		this.getMore();
		
		// reset favorite stuff
		this.$.favoriteButton.removeClass("enyo-button-affirmative");
		this.$.favoriteButton.removeClass("enyo-button-negative");
		this.getFavorite();
		this.isFavorite = false;
	},
	// more by artist stuff
	doMore: function() {
		if(this.stuffShown) {
			if(this.moreShowing)
			{
				this.$.moreContainer.addClass('hide');
				this.moreShowing = false;
			}
			else
			{
				this.$.moreContainer.removeClass('hide');
				this.moreShowing = true;
				this.clearHideTimeout();
			}
		}
		return;
	},
	getMore: function(inSender, inResponse) {
		var transactionString = "SELECT * FROM wallpapers WHERE artistID='" + this.wallpaper[0].artistID + "';";
		
		this.db.transaction(
		    enyo.bind(this, (function (transaction) {
				transaction.executeSql(
					transactionString,
					[],
					enyo.bind(this, (function (transaction, results) {
						try {
							var title = [], artist = [], artistID = [], description = [], preview = [], download = [], date = [], size = [];
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								var name;
								for (name in row)
								{
									if (typeof row[name] !== 'function')
									{
										switch (name) {
											case 'title':
												title[i] = row[name];
												break;
											case 'artist':
												artist[i] = row[name];
												break;
											case 'artistID':
												artistID[i] = row[name];
												break;
											case 'description':
												description[i] = row[name];
												break;
											case 'preview':
												preview[i] = row[name];
												break;
											case 'download':
												download[i] = row[name];
												break;
											case 'date':
												date[i] = row[name];
												break;
											case 'size':
												size[i] = row[name];
												break;
										}
									}
								}
							}
							
							//push everything into the artists array
							for (var i = 0; i < title.length; i++) {
								if(this.wallpaper[0].download != download[i])
								{
									this.results.push({
										title: title[i],
										artist: artist[i],
										artistID: artistID[i],
										description: description[i],
										preview: preview[i],
										download: download[i],
										date: date[i],
										size: size[i]
									});
								}
							}
							
							if(this.results.length == 0)
							{
								this.$.noMore.setContent("No other wallpapers by '" + this.wallpaper[0].artist + "'");
								this.$.noMore.show();
							}
							
							this.$.moreList.render();
							this.$.moreList.applyStyle("width", title.length*147 + "px");
						}
						catch (e)
						{
							console.log("error " + e);	
						} 
					})),
					enyo.bind(this, (function (transaction, error) {console.log('SQL Error', error.message);})));
		    })));
		return;
	},
	getListItem: function(inSender, inIndex) {
		var item = this.results[inIndex];
		if(item) {
			this.$.thumbnail.setSrc(item.preview);
			return true;
		}
		return false;
	},
	listItemClick: function(inSender, inEvent) {
		if(this.stuffShown && this.moreShowing)
		{
			var item = [{
				title: this.results[inEvent.rowIndex].title,
				artist: this.results[inEvent.rowIndex].artist,
				artistID: this.results[inEvent.rowIndex].artistID,
				description: this.results[inEvent.rowIndex].description,
				preview: this.results[inEvent.rowIndex].preview,
				download: this.results[inEvent.rowIndex].download,
				date: this.results[inEvent.rowIndex].date,
				size: this.results[inEvent.rowIndex].size
			}];
			this.wallpaper = item;
			this.wallpaperChanged();
		}
		return;
	},
	// favorite stuff
	getFavorite: function() {
		var transactionString = "SELECT * FROM favorites WHERE download='" + this.wallpaper[0].download + "';";
		
		this.db.transaction(
		    enyo.bind(this, (function (transaction) {
				transaction.executeSql(
					transactionString,
					[],
					enyo.bind(this, (function (transaction, results) {
						try {
							if (results.rows.length == 0) { // it's not a favorite
								this.$.favoriteButton.setContent('Add to Favorites');
								this.$.favoriteButton.addClass('enyo-button-affirmative');
								this.$.favoriteButton.removeClass('enyo-button-negative');
								this.isFavorite = false;
							} else { // it is a favorite
								this.$.favoriteButton.setContent('Remove from Favorites');
								this.$.favoriteButton.addClass('enyo-button-negative');
								this.$.favoriteButton.removeClass('enyo-button-affirmative');
								this.isFavorite = true;
							}
						}
						catch (e)
						{
							console.log("error " + e);	
						} 
					})),
					enyo.bind(this, (function (transaction, error) {console.log('SQL Error', error.message);})));
			})));
	},
	doFavorite: function(inSender) {
		if(this.stuffShown) {
			if (this.isFavorite) {
				//remove favorite
				InterfaceLIFT.Database.removeFavorite(this.wallpaper[0]);
				this.$.favoriteButton.setContent('Add to Favorites');
				this.$.favoriteButton.addClass('enyo-button-affirmative');
				this.$.favoriteButton.removeClass('enyo-button-negative');
				this.isFavorite = false;
			} else {
				//add as a favorite
				InterfaceLIFT.Database.loadFavorite(this.wallpaper[0]);
				this.$.favoriteButton.setContent('Remove from Favorites');
				this.$.favoriteButton.addClass('enyo-button-negative');
				this.$.favoriteButton.removeClass('enyo-button-affirmative');
				this.isFavorite = true;
			}
		}
		return;
	},
	// apply wallpaper
	doApply: function() {
		if(this.stuffShown) {
			this.hideStuff();
			this.$.applyPopup.openAtCenter();
		}
		return;
	},
	dismissApplyPopup: function() {
		this.$.applyPopup.close();
		this.showStuff();
		return;
	},
	applyWallpaper: function() {
		this.$.applyPopup.close();
		this.$.progressPopup.openAtCenter();
		// we don't want multiple files of the same image, so regex out the file name and always overwrite it
		var filename = this.wallpaper[0].download.match(/[\w_.-]*?(?=[\?\#])|[\w_.-]*$/i)[0];
		this.$.downloadWallpaper.call({
			"target": this.wallpaper[0].download,
			"targetDir": "/media/internal/interfaceLIFT",
			"targetFilename": filename,
			"mime": "application/jpg"
		});
		return;
	},
	downloadSuccess: function(inSender, inResponse) {
		if(inResponse.completed)
		{
			console.log("target " + inResponse.target);
			this.$.importWallpaper.call({
				"target": "file://" + inResponse.target,
				"focusX": 0.5,
        		"focusY": 0.5,
        		"scale": 1.0
        	});
		}
		else
			this.$.downloadProgress.setPosition((inResponse.amountReceived/this.wallpaper[0].size)*100);
	},
	importSuccess: function(inSender, inResponse) {
		console.log("import " + inResponse.wallpaper);
		this.$.progressPopup.close();
		this.$.setWallpaper.call({
			"wallpaper": inResponse.wallpaper
		});
	},
	setSuccess: function(inSender, inResponse) {
		console.log("wallpaper applied");
		this.$.appliedPopup.openAtCenter();
		return;
	},
	serviceFailure: function(inSender, inResponse) {
		console.log(inResponse.errorText);
		return;
	},
	dismissApplied: function(inSender) {
		this.$.appliedPopup.close();
		this.showStuff();
		return;
	},
	// show and hide things
	toggleStuff: function() {
		console.log("toggleStuff");
		if (this.stuffShown)
			this.hideStuff();
		else
			this.showStuff();
		return true;
	},
	hideStuff: function() {
		if (!this.stuffShown)
			return;
		this.stuffShown = false;
		this.clearHideTimeout();
		this.$.header.addClass('hide');
		this.$.footer.addClass('hide');
		if(this.moreShowing)
			this.$.moreContainer.addClass('hide');
	},
	showStuff: function() {
		if (this.stuffShown)
			return;
		this.stuffShown = true;
		this.$.header.removeClass('hide');
		this.$.footer.removeClass('hide');
		if(this.moreShowing)
			this.$.moreContainer.removeClass('hide');
		//this.setHideTimeout();
	},
	clearHideTimeout : function() {
		if (this.timeoutHide) {
			window.clearTimeout(this.timeoutHide);
			this.timeoutHide = null;
		}
	},
	setHideTimeout: function() {
		this.clearHideTimeout();
		this.timeoutHide = window.setTimeout(enyo.bind(this, "hideStuff"), 5000);		
	}
});
