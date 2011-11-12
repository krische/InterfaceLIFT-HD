enyo.kind({
	name: "ArtistsList",
	kind: "VFlexBox",
	className: "interfaceLIFT-bg",
	published: {
		headerContent: "",
		artistSort: ""
	},
	events: {
		onSelect: ""
	},
	components: [
		{name: "header", kind: "Header"},
		{flex: 1, name: "artistsList", kind: "VirtualList", onSetupRow: "getListItem", className: "artists-list-container",
		      components: [
			  {kind: "Item", layoutKind: "HFlexLayout", style: "width: 100%;", className: "artist-list-item",
			      components: [
				  {name: "artist", style: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;", flex: 1},
				  {name: "artistCount", sytle: "text-align: right;"}
			      ],
			      onclick: "listItemClick"
			  }
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
			{name: "sortButton", kind: "Button", caption: "Sort", onclick: "sortArtists", className: 'enyo-button-dark'}
		]},
		{name: "sortMenu", kind: "PopupSelect", onSelect: "changeSort", components: [
			{name: "sortAlphabetically", kind: "MenuCheckItem", checked: false, caption: "Alphabetically"},
			{name: "sortNumerically", kind: "MenuCheckItem", checked: false, caption: "Numerically"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		
		// initialize variables
		this.start = 0;
		this.stop = 1000;
		this.db = null;
		this.artists = [];
		
		// open the database
		try {
			this.db = openDatabase('ext:ILIFTdb', '', 'InterfaceLIFT Database', 3000000);
		} catch (e) {
			console.log("Database Open Error: " + e);		
		}
	},
	headerContentChanged: function() {
		this.$.header.setContent(this.headerContent);
		return;
	},
	artistsChanged: function() {
		this.artists.length = 0;
		this.getArtists();
		this.$.artistsList.punt();
		return;
	},
	getArtists: function() {
		// Query artists tables
		if (this.artistSort == 'Alphabetically')
			var transactionString = 'SELECT name, id, count FROM artists ORDER BY name;';
		else if (this.artistSort == 'Numerically')
			var transactionString = 'SELECT name, id, count FROM artists ORDER BY count DESC;';
		
		this.db.transaction(
		    enyo.bind(this, (function (transaction) {
				transaction.executeSql(
					transactionString,
					[],
					enyo.bind(this, (function (transaction, results) {
						try {
							var artistName = [], artistID = [], artistCount = [];
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								var name;
								for (name in row)
								{
									if (typeof row[name] !== 'function')
									{
										switch (name) {
											case 'name':
												artistName[i] = row[name];
												break;
											case 'id':
												artistID[i] = row[name];
												break;
											case 'count':
												artistCount[i] = row[name];
												break;
										}
									}
								}
							}
							this.$.header.setContent('All ' + artistName.length + ' artists');
							
							//push everything into the artists array
							for (var i = this.start; (i < this.stop) && (i < artistName.length); i++) {
								this.artists.push({
									artist: artistName[i],
									artistID: artistID[i],
									artistCount: artistCount[i]
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
	},
	getListItem: function(inSender, inIndex) {
		var item = this.artists[inIndex];
		if(item) {
			this.$.artist.setContent(item.artist);
			this.$.artistCount.setContent("(" + item.artistCount + ")");
			return true;
		}
		return false;
	},
	listItemClick: function(inSender, inEvent) {
		var item = [{
			artist: this.artists[inEvent.rowIndex].artist,
			artistID: this.artists[inEvent.rowIndex].artistID,
			artistCount: this.artists[inEvent.rowIndex].artistCount
		}];
		this.doSelect(item);
		return;
  	},
  	sortArtists: function(inSender) {
		/*switch(this.sort)
		{
			case "Alphabetically":
				this.$.sortAlphabetically.addClass('menuitem-checkmark');
				break;
			case "Numerically":
				this.$.sortNumerically.addClass('menuitem-checkmark');
				break;
		}*/
  		this.$.sortMenu.openAroundControl(inSender);
  		return;
  	},
	changeSort: function(inSender) {
		this.artistSort = inSender.selected.caption;
		this.artistsChanged();
	}
});