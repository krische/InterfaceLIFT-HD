enyo.kind({
	name: "WallpaperListView",
	kind: "VFlexBox",
	className: "interfaceLIFT-bg",
	published: {
		headerContent: "",
		sort: "Date"
	},
	events: {
		onSelect: ""
	},
	components: [
		{name: "getWallpapers", kind: "WebService", onSuccess: "gotFeed", onFailure: "gotFeedFailure"},
		{name: "header", kind: "Header"},
		{kind: "FadeScroller", autoHorizontal: false, flex: 1, horizontal: false, components: [
			{kind: "Divider", caption: "Favorites", style: "margin-right: 10px;"},
			{name: "favoritesContainer", kind: "Scroller", autoVertical: false, vertical: false, className: "favorite-container", components: [
				{name: "favorites", kind: "VirtualRepeater", onSetupRow: "setupFavorites", className: "favorite-list", components: [
					{name: "favoriteItem", kind: "Item", className: "favorite-item", components: [
						{name: "favoriteThumbnail", kind: "Image", className: "favorite-thumbnail"}
					], onclick: "favoriteSelected"}
				]}
			]},
			{className: "enyo-divider"},
			{name: "list", kind: "VirtualRepeater", onSetupRow: "getListItem", className: "wallpaper-list", components: [
				{name: "wallpaperItem", kind: "Item", className: "wallpaper-item", components: [
					{name: "thumbnail", kind: "Image", className: "wallpaper-thumbnail"},
					{name: "date", className: "wallpaper-date"},
					{name: "title", className: "wallpaper-title"},
					{name: "artist", className: "wallpaper-artist"},
					{name: "description", className: "wallpaper-description"}
				], onclick: "listItemClick"}
			]},
			{name: "loadMore", caption: "Load More", kind: "Button", className: "enyo-button-dark", onclick: "loadMoreWallpapers", style: "width: 96%; margin-top: 10px;"},
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
			{name: "sortButton", kind: "Button", caption: "Sort", className: 'enyo-button-dark', onclick: "toggleSortMenu"}
		]},
		{name: "sortMenu", kind: "PopupSelect", onSelect: "sortWallpapers", components: [
			{name: "sortDate", kind: "MenuCheckItem", checked: false, caption: "Date"},
			{name: "sortPopular", kind: "MenuCheckItem", checked: false, caption: "Popular"},
			{name: "sortRandom", kind: "MenuCheckItem", checked: false, caption: "Random"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.baseURL = "http://webos.interfacelift.com/feed/date.php?res=1024x1024&start=";
		this.start = 0;
		this.stop = '&stop=24';
		this.wallpapers = [];
		this.favorites = [];
		this.headerContentChanged();
		
		// open the database
		try {
			this.db = openDatabase('ext:ILIFTdb', '', 'InterfaceLIFT Database', 3000000);
		} catch (e) {
			console.log("Database Open Error: " + e);		
		}
		this.getFavorites();
		
		this.$.getWallpapers.url = this.baseURL + this.start + this.stop;
		this.$.getWallpapers.handleAs = "text";
		this.$.getWallpapers.call();
	},
	resize: function() {
		this.$.list.render();
		return;
	},
	headerContentChanged: function() {
		this.$.header.setContent(this.headerContent);
		return;
	},
	wallpapersChanged: function() {
		this.$.loadMore.show();
		this.wallpapers.length = 0;
		this.start = 0;
		this.headerContentChanged();
		this.$.getWallpapers.url = this.baseURL + this.start + this.stop;
		this.$.getWallpapers.call();
		this.$.fadeScroller.scrollTo(0, 0);
	},
	gotFeed: function(inSender, inResponse) {
		var titles = [], artists = [], artistIDs = [], descriptions = [], previews = [], downloads = [], dates = [], sizes = [];
		
		// Replace troublesome characters
		inResponse = inResponse.replace(/&/g, '&amp;');
		inResponse = inResponse.replace(/Ã¥/g, 'å');
		inResponse = inResponse.replace(/Ã­/g, 'í');
		inResponse = inResponse.replace(/Ã¼/g, 'ü');
		inResponse = inResponse.replace(/Ã¸/g, 'ø');
		inResponse = inResponse.replace(/Ã‰/g, 'É');
		inResponse = inResponse.replace(/Ã©/g, 'é');
		inResponse = inResponse.replace(/Ã¤/g, 'ä');
		inResponse = inResponse.replace(/Ã£/g, 'ã');
		inResponse = inResponse.replace(/Ã§/g, 'ç');
		inResponse = inResponse.replace(/Ã¶/g, 'ö');
		inResponse = inResponse.replace(/and#927;/g, 'Ο');
		inResponse = inResponse.replace(/and#943;/g, 'ί');
		inResponse = inResponse.replace(/and#945;/g, 'α');
		inResponse = inResponse.replace(/'/g, '&#39;');
		inResponse = inResponse.replace(/"/g, '&#39;');
		
		// Convert the string to an XML object
		var xmlobject = (new DOMParser()).parseFromString(inResponse, "text/xml");
		
		// Use xpath to parse xml object
		var nodes = document.evaluate('channel/item', xmlobject, null, XPathResult.ANY_TYPE, null);
		
		var result = nodes.iterateNext();
		var i = 0;
		while (result)
		{
		  	titles[i] = result.getElementsByTagName('title')[0].childNodes[0].nodeValue;
			artists[i] = result.getElementsByTagName('artistname')[0].childNodes[0].nodeValue;
			artistIDs[i] = result.getElementsByTagName('artistid')[0].childNodes[0].nodeValue;
			if (result.getElementsByTagName('description')[0].childNodes[0]) {
				descriptions[i] = result.getElementsByTagName('description')[0].childNodes[0].nodeValue;
				}
				else {
					descriptions[i] = '';
			}
			previews[i] = result.getElementsByTagName('preview_240x150')[0].childNodes[0].nodeValue;
			downloads[i] = result.getElementsByTagName('download')[0].childNodes[0].nodeValue;
			dates[i] = result.getElementsByTagName('dateformat')[0].childNodes[0].nodeValue;
			sizes[i] = result.getElementsByTagName('downloadsize')[0].childNodes[0].nodeValue;
			i++;
			result=nodes.iterateNext();
		}
		
		//push everything into the list model
		for (var i = 0; i < titles.length; i++) {
			this.wallpapers.push({
				title: titles[i],
				artist: artists[i],
				artistID: artistIDs[i],
				description: descriptions[i],
				preview: previews[i],
				download: downloads[i],
				date: dates[i],
				size: sizes[i]
			});
		}
		this.$.list.render();
	},
	gotFeedFailure: function(inSender, inResponse) {
		console.log("got failure from getFeed");
	},
	getListItem: function(inSender, inIndex) {
		var item = this.wallpapers[inIndex];
		switch(this.getBounds().width)
		{
			case 544:
				this.$.wallpaperItem.applyStyle("width", "97%");
				break;
			case 768:
				this.$.wallpaperItem.applyStyle("width", "47.3%");
				break;
			case 800:
				this.$.wallpaperItem.applyStyle("width", "47.5%");
				break;
			case 1024:
				this.$.wallpaperItem.applyStyle("width", "48%");
				break;
		}
		if(item) {
			this.$.thumbnail.setSrc(item.preview);
			this.$.artist.setContent("by " + item.artist);
			this.$.title.setContent(item.title);
			this.$.date.setContent(item.date);
			this.$.description.setContent(item.description);
			return true;
		}
		return false;
	},
	listItemClick: function(inSender, inEvent) {
		var item = [{
		  title: this.wallpapers[inEvent.rowIndex].title,
			  artist: this.wallpapers[inEvent.rowIndex].artist,
			  artistID: this.wallpapers[inEvent.rowIndex].artistID,
			  description: this.wallpapers[inEvent.rowIndex].description,
			  preview: this.wallpapers[inEvent.rowIndex].preview,
			  download: this.wallpapers[inEvent.rowIndex].download,
			  date: this.wallpapers[inEvent.rowIndex].date,
			  size: this.wallpapers[inEvent.rowIndex].size
		}];
		this.doSelect(item);
		return;
  	},
  	toggleSortMenu: function(inSender) {
  		this.$.sortMenu.openAroundControl(inSender);
  		return;
  	},
	sortWallpapers: function(inSender) {
		switch(inSender.selected.caption)
		{
			case "Date":
				this.baseURL = "http://webos.interfacelift.com/feed/date.php?res=1024x1024&start=";
				this.headerContent = "Most Recent Wallpapers";
				this.wallpapersChanged();
				break;
			case "Popular":
				this.baseURL = "http://webos.interfacelift.com/feed/popular.php?res=1024x1024&start=";
				this.headerContent = "Most Popular Wallpapers";
				this.wallpapersChanged();
				break;
			case "Random":
				this.baseURL = "http://webos.interfacelift.com/feed/random.php?res=1024x1024&start=";
				this.headerContent = "Random Wallpapers";
				this.wallpapersChanged();
				break;
		}
	},
	loadMoreWallpapers: function(inSender) {
		if(this.start != 96)
		{
			this.start += 24;
			this.$.getWallpapers.url = this.baseURL + this.start + this.stop;
			this.$.getWallpapers.call();
			if(this.start == 96)
				this.$.loadMore.hide();
		}
	},
	getFavorites: function() {
		var transactionString = "SELECT * FROM favorites;";
		this.favorites.length = 0;
		
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
							
							//push everything into the favorites array
							for (var i = 0; i < title.length; i++) {
								this.favorites.push({
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
							if(title.length > 0)
							{
								this.$.favorites.render();
								this.$.favorites.applyStyle("width", title.length*147 + "px");
								this.$.favorites.applyStyle("background", "none");
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
	setupFavorites: function(inSender, inIndex)
	{
		var item = this.favorites[inIndex];
		if(item) {
			this.$.favoriteThumbnail.setSrc(item.preview);
			return true;
		}
		return false;
	},
	favoriteSelected: function(inSender, inEvent) {
		var item = [{
			title: this.favorites[inEvent.rowIndex].title,
			artist: this.favorites[inEvent.rowIndex].artist,
			artistID: this.favorites[inEvent.rowIndex].artistID,
			description: this.favorites[inEvent.rowIndex].description,
			preview: this.favorites[inEvent.rowIndex].preview,
			download: this.favorites[inEvent.rowIndex].download,
			date: this.favorites[inEvent.rowIndex].date,
			size: this.favorites[inEvent.rowIndex].size
		}];
		this.doSelect(item);
		return;
  	}
});
