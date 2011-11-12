enyo.kind({
	name: "ArtistViewer",
	kind: "VFlexBox",
	className: "interfaceLIFT-bg",
	published: {
		artist: [{
			artist: "",
			artistID: "",
			artistCount: ""
		}],
		results: []
	},
	events: {
		onSelect: ""
	},
	components: [
		{name: "header", kind: "Header", components: [
			{name: "headerText", style: "overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 100%"}
		]},
		{name: "artistsList", kind: "VirtualList", onSetupRow: "getListItem", className: "artist-viewer-container", flex: 1, pageSize: 30, lookAhead: 10, components: [
			{kind: "Item", className: "artist-viewer-item", components: [
				{name: "thumbnail", kind: "Image", className: "artist-thumbnail"},
				{name: "date", className: "artist-date"},
				{name: "title", className: "artist-title"},
				{name: "artist", className: "artist-artist"},
				{name: "description", className: "artist-description"}
			], onclick: "listItemClick"}
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"}
		]}
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
	resize: function() {
		return;
	},
	artistChanged: function() {
		this.$.artistsList.applyStyle("background", "rgba(150,150,150,0.6)");
		this.results.length = 0;
		this.$.headerText.setContent(this.artist[0].artist + "'s wallpapers (" + this.artist[0].artistCount + ")");
		this.getArtists();
		this.$.artistsList.punt();
		return;
	},
	getListItem: function(inSender, inIndex) {
		var item = this.results[inIndex];
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
			title: this.results[inEvent.rowIndex].title,
			artist: this.results[inEvent.rowIndex].artist,
			artistID: this.results[inEvent.rowIndex].artistID,
			description: this.results[inEvent.rowIndex].description,
			preview: this.results[inEvent.rowIndex].preview,
			download: this.results[inEvent.rowIndex].download,
			date: this.results[inEvent.rowIndex].date,
			size: this.results[inEvent.rowIndex].size
		}];
		this.doSelect(item);
		return;
  	},
  	getArtists: function() {
		var transactionString = "SELECT * FROM wallpapers WHERE artistID='" + this.artist[0].artistID + "';";
		
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
							
							this.$.artistsList.refresh();
						}
						catch (e)
						{
							console.log("error " + e);	
						} 
					})),
					enyo.bind(this, (function (transaction, error) {console.log('SQL Error', error.message);})));
		    })));
		return;
  	}
});