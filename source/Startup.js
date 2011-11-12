enyo.kind({
	name: "Startup",
	kind: "VFlexBox",
	className: "interfaceLIFT-bg",
	events: {
		onStartupComplete: ""
	},
	components: [
		{name: "getWallpaperRows", kind: "WebService", url: "http://webos.interfacelift.com/feed/date.php?res=1024x1024&start=0&stop=0", handleAs: "text", onSuccess: "gotWallpaperRows", onFailure: "gotFailure"},
		{name: "getWallpapers", kind: "PalmService", service: "palm://com.palm.downloadmanager/", method: "download", subscribe: true, onSuccess: "gotWallpapers", onFailure: "gotFailure"},
		{name: "processWallpapers", kind: "WebService", handleAs: "text", onSuccess: "processedWallpapers", onFailure: "gotFailure"},
		{name: "getArtists", kind: "PalmService", service: "palm://com.palm.downloadmanager/", method: "download", subscribe: true, onSuccess: "gotArtists", onFailure: "gotFailure"},
		{name: "processArtists", kind: "WebService", handleAs: "text", onSuccess: "processedArtists", onFailure: "gotFailure"},
		{name: "getTags", kind: "PalmService", service: "palm://com.palm.downloadmanager/", method: "download", subscribe: true, onSuccess: "gotTags", onFailure: "gotFailure"},
		{name: "processTags", kind: "WebService", handleAs: "text", onSuccess: "processedTags", onFailure: "gotFailure"},
		{name: "header", kind: "Header"},
		{kind: "VFlexBox", pack: "center", flex: 1, components: [
			{name: "startupContainer", kind: "VFlexBox", className: "startup-container", components: [
				{name: "containerContainer", style: "height: 130px; overflow: hidden;", components: [
					{name: "downloadWallpapers", className: "startup-item", components: [
						{content: "Downloading Wallpapers", style: "text-align: center; padding-bottom: 4pt;"},
						{name: "wallpapersProgress", kind: "ProgressBar", minimum: 0, maximum: 100},
						{content: "0/0 KB", name: "wallpapersProgressText", style: "text-align: right; font-size: 10pt; padding-top: 2pt; margin-bottom: -5pt;"}
					]},
					{name: "downloadArtists", className: "startup-item", style: "opacity: .25;", components: [
						{content: "Downloading Artists", style: "text-align: center; padding-bottom: 4pt;"},
						{name: "artistsProgress", kind: "ProgressBar", minimum: 0, maximum: 100},
						{content: "0/0 KB", name: "artistsProgressText", style: "text-align: right; font-size: 10pt; padding-top: 2pt; margin-bottom: -5pt;"}
					]},
					{name: "downloadTags", className: "startup-item", style: "opacity: 0;", components: [
						{content: "Downloading Tags", style: "text-align: center; padding-bottom: 4pt;"},
						{name: "tagsProgress", kind: "ProgressBar", minimum: 0, maximum: 100},
						{content: "0/0 KB", name: "tagsProgressText", style: "text-align: right; font-size: 10pt; padding-top: 2pt; margin-bottom: -5pt;"}
					]}
				]}
			]}
		]},
		{kind: "Toolbar"}
	],	
	create: function() {
		this.inherited(arguments);
		InterfaceLIFT.Database.initialize();
		this.averageSize= 1085;
		this.checkVersion();
		this.$.getWallpaperRows.call();
	},
	checkVersion: function() {
		var oldVersion = enyo.getCookie("version");
		if(oldVersion)
		{
			switch(oldVersion)
			{
				case "1.0.1":
					console.log("up to date");
					break;
			}
		} else {
			console.log("old version");
			enyo.setCookie("downloadedWallpapers", 0);
			InterfaceLIFT.Database.deleteWallpapers();
			InterfaceLIFT.Database.deleteFavorites();
			enyo.setCookie("version", "1.0.1")
		}
		return;
	},
	gotWallpaperRows: function(inSender, inResponse) {
		// get how many wallpapers we've already downloaded
		this.downloadedWallpapers = parseInt(enyo.getCookie("downloadedWallpapers"));
		if(!this.downloadedWallpapers)
		{
			// either this is the first time the app has been run or the cookie was lost.
			this.downloadedWallpapers = 0;
			InterfaceLIFT.Database.deleteWallpapers();
		}
		console.log("currently " + this.downloadedWallpapers + " wallpapers in database");
		
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		var nodes = document.evaluate('channel/totalrows', xmlobject, null, XPathResult.ANY_TYPE, null);
		
		var result = nodes.iterateNext();
		this.numToDownload = parseInt(result.childNodes[0].nodeValue - this.downloadedWallpapers);
		console.log("going to download " + this.numToDownload + " wallpapers");
		
		if(this.numToDownload == 0)
		{
			// move the progress items
			this.$.downloadWallpapers.applyStyle('top', '-92px');
			this.$.downloadWallpapers.applyStyle('opacity', 0);
			this.$.downloadArtists.applyStyle('top', '-92px');
			this.$.downloadArtists.applyStyle('opacity', 1);
			this.$.downloadTags.applyStyle('top', '-92px');
			this.$.downloadTags.applyStyle('opacity', .25);
			
			this.$.getArtists.call({
				"target": "http://webos.interfacelift.com/feed/artist_list.php?res=1024x1024&threshold=1",
				"targetDir": "/media/internal/interfaceLIFT",
				"targetFilename": "data.xml",
				"mime": "application/xml"
			});
		} else {
			var downloadURL = 'http://webos.interfacelift.com/feed/date.php?res=1024x1024&start=0&stop=' + this.numToDownload;
			this.$.getWallpapers.call({
				"target": downloadURL,
				"targetDir": "/media/internal/interfaceLIFT",
				"targetFilename": "data.xml",
				"mime": "application/xml"
			});
		}
	},
	gotWallpapers: function(inSender, inResponse) {
		if(inResponse.completed)
		{
			this.$.processWallpapers.url = inResponse.target;
			this.$.processWallpapers.call();
		}
		else
		{
			// progress bar
			this.$.wallpapersProgress.setPosition((inResponse.amountReceived/(this.numToDownload * this.averageSize))*100);
			
			// progress text
			var received = Math.round(inResponse.amountReceived/1000);
			var total = Math.round((this.numToDownload * this.averageSize)/1000);
			this.$.wallpapersProgressText.setContent(received + '/' + total + " KB");
		}
			
	},
	processedWallpapers: function(inSender, inResponse) {
		var xmlstring = inResponse;
		
		// Replace troublesome characters
		xmlstring = xmlstring.replace(/&/g, '&amp;');
		xmlstring = xmlstring.replace(/Ã¥/g, 'å');
		xmlstring = xmlstring.replace(/Ã­/g, 'í');
		xmlstring = xmlstring.replace(/Ã¼/g, 'ü');
		xmlstring = xmlstring.replace(/Ã¸/g, 'ø');
		xmlstring = xmlstring.replace(/Ã‰/g, 'É');
		xmlstring = xmlstring.replace(/Ã©/g, 'é');
		xmlstring = xmlstring.replace(/Ã¤/g, 'ä');
		xmlstring = xmlstring.replace(/Ã£/g, 'ã');
		xmlstring = xmlstring.replace(/Ã§/g, 'ç');
		xmlstring = xmlstring.replace(/Ã¶/g, 'ö');
		xmlstring = xmlstring.replace(/'/g, '&#39;');
		xmlstring = xmlstring.replace(/"/g, '&#39;');

		InterfaceLIFT.Database.loadWallpapers(xmlstring);
		var newDownloaded = this.numToDownload + this.downloadedWallpapers;
		console.log("Setting cookie to " + newDownloaded);
		enyo.setCookie("downloadedWallpapers", newDownloaded);
		
		// move the progress items
		this.$.downloadWallpapers.applyStyle('top', '-92px');
		this.$.downloadWallpapers.applyStyle('opacity', 0);
		this.$.downloadArtists.applyStyle('top', '-92px');
		this.$.downloadArtists.applyStyle('opacity', 1);
		this.$.downloadTags.applyStyle('top', '-92px');
		this.$.downloadTags.applyStyle('opacity', .25);
		
		this.$.getArtists.call({
				"target": "http://webos.interfacelift.com/feed/artist_list.php?res=1024x1024&threshold=1",
				"targetDir": "/media/internal/interfaceLIFT",
				"targetFilename": "data.xml",
				"mime": "application/xml"
		});
	},
	gotArtists: function(inSender, inResponse) {
		if(inResponse.completed)
		{
			this.$.processArtists.url = inResponse.target;
			this.$.processArtists.call();
		} else {
			// progress bar
			this.$.artistsProgress.setPosition((inResponse.amountReceived/152000)*100);
			
			// progress text
			var received = Math.round(inResponse.amountReceived/1000);
			var total = Math.round(160);
			this.$.artistsProgressText.setContent(received + '/' + total + " KB");
		}
	},
	processedArtists: function(inSender, inResponse) {
		var xmlstring = inResponse;
		
		// Replace troublesome characters
		xmlstring = xmlstring.replace(/&/g, '&amp;');
		xmlstring = xmlstring.replace(/Ã¥/g, 'å');
		xmlstring = xmlstring.replace(/Ã­/g, 'í');
		xmlstring = xmlstring.replace(/Ã¼/g, 'ü');
		xmlstring = xmlstring.replace(/Ã¸/g, 'ø');
		xmlstring = xmlstring.replace(/Ã‰/g, 'É');
		xmlstring = xmlstring.replace(/Ã©/g, 'é');
		xmlstring = xmlstring.replace(/Ã¤/g, 'ä');
		xmlstring = xmlstring.replace(/Ã£/g, 'ã');
		xmlstring = xmlstring.replace(/Ã§/g, 'ç');
		xmlstring = xmlstring.replace(/Ã¶/g, 'ö');
		xmlstring = xmlstring.replace(/'/g, '&#39;');
		xmlstring = xmlstring.replace(/"/g, '&#39;');
		
		InterfaceLIFT.Database.loadArtists(xmlstring);
		
		console.log("Loaded Artists");
		
		this.$.downloadArtists.applyStyle('top', '-184px');
		this.$.downloadArtists.applyStyle('opacity', 0);
		this.$.downloadTags.applyStyle('top', '-184px');
		this.$.downloadTags.applyStyle('opacity', 1);
		
		this.$.getTags.call({
				"target": "http://webos.interfacelift.com/feed/category_list.php?res=1024x1024&threshold=1",
				"targetDir": "/media/internal/interfaceLIFT",
				"targetFilename": "data.xml",
				"mime": "application/xml"
		})
	},
	gotTags: function(inSender, inResponse) {
		if(inResponse.completed)
		{
			this.$.processTags.url = inResponse.target;
			this.$.processTags.call();
		} else {
			// progress bar
			this.$.tagsProgress.setPosition((inResponse.amountReceived/350000)*100);
			
			// progress text
			var received = Math.round(inResponse.amountReceived/1000);
			var total = Math.round(440);
			this.$.tagsProgressText.setContent(received + '/' + total + " KB");
		}
	},
	processedTags: function(inSender, inResponse) {
		var xmlstring = inResponse;
		
		// Replace troublesome characters
		xmlstring = xmlstring.replace(/&/g, '&amp;');
		xmlstring = xmlstring.replace(/Ã¥/g, 'å');
		xmlstring = xmlstring.replace(/Ã­/g, 'í');
		xmlstring = xmlstring.replace(/Ã¼/g, 'ü');
		xmlstring = xmlstring.replace(/Ã¸/g, 'ø');
		xmlstring = xmlstring.replace(/Ã‰/g, 'É');
		xmlstring = xmlstring.replace(/Ã©/g, 'é');
		xmlstring = xmlstring.replace(/Ã¤/g, 'ä');
		xmlstring = xmlstring.replace(/Ã£/g, 'ã');
		xmlstring = xmlstring.replace(/Ã§/g, 'ç');
		xmlstring = xmlstring.replace(/Ã¶/g, 'ö');
		
		InterfaceLIFT.Database.loadTags(xmlstring);
		
		console.log("loaded Tags");
		
		this.$.downloadTags.applyStyle('top', '-276px');
		this.$.downloadTags.applyStyle('opacity', 0);
		this.$.startupContainer.applyStyle('opacity', 0);
		
		this.doStartupComplete();
	},
	gotFailure: function(inSender, inResponse) {
		console.log("Failure");
	}
});