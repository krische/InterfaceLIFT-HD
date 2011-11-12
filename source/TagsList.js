enyo.kind({
	name: "TagsList",
	kind: "VFlexBox",
	className: "interfaceLIFT-bg",
	published: {
		headerContent: "",
		tagType: "",
		tagSort: ""
	},
	events: {
		onSelect: ""
	},
	components: [
		{name: "header", kind: "Header"},
		{flex: 1, name: "tagsList", kind: "VirtualList", onSetupRow: "getListItem", className: "tags-list-container",
		      components: [
			  {kind: "Item", layoutKind: "HFlexLayout", style: "width: 100%;", className: "tag-list-item",
			      components: [
				  {name: "tag", style: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;", flex: 1},
				  {name: "tagCount", sytle: "text-align: right;"}
			      ],
			      onclick: "listItemClick"
			  }
		]},
		{name: "fadeTop", className: "tags-list-fade-top"},
		{name: "fadeBottom", className: "tags-list-fade-bottom"},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
			{name: "sortButton", kind: "Button", caption: "Sort", onclick: "sortTags", className: 'enyo-button-dark'},
			{name: "typeButton", kind: "Button", caption: "Tag Type", onclick: "changeTypeMenu", className: 'enyo-button-dark'}
		]},
		{name: "sortMenu", kind: "PopupSelect", onSelect: "changeSort", components: [
			{name: "sortAlphabetically", kind: "MenuCheckItem", checked: false, caption: "Alphabetically"},
			{name: "sortNumerically", kind: "MenuCheckItem", checked: false, caption: "Numerically"}
		]},
		{name: "typeMenu", kind: "PopupSelect", onSelect: "changeType", lazy: false, components: [
			{name: "typeColor", kind: "MenuCheckItem", checked: false, caption: "Color"},
			{name: "typeEquipment", kind: "MenuCheckItem", checked: false, caption: "Equipment"},
			{name: "typeEvent", kind: "MenuCheckItem", checked: false, caption: "Event"},
			{name: "typeLocation", kind: "MenuCheckItem", checked: false, caption: "Location"},
			{name: "typeMedium", kind: "MenuCheckItem", checked: false, caption: "Medium"},
			{name: "typeScene", kind: "MenuCheckItem", checked: false, caption: "Scene"},
			{name: "typeSubject", kind: "MenuCheckItem", checked: false, caption: "Subject"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		
		// initialize variables
		this.start = 0;
		this.stop = 1000;
		this.db = null;
		this.tags = [];
		
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
	tagsChanged: function() {
		this.tags.length = 0;
		this.getTags();
		this.$.tagsList.punt();
		return;
	},
	getTags: function() {
		// Query tags tables
		if (this.tagSort == 'Alphabetically')
			var transactionString = 'SELECT name, id, count FROM tags WHERE type="' + this.tagType + '" ORDER BY name;';
		else if (this.tagSort == 'Numerically')
			var transactionString = 'SELECT name, id, count FROM tags WHERE type="' + this.tagType + '" ORDER BY count DESC;';
		
		this.db.transaction(
		    enyo.bind(this, (function (transaction) {
				transaction.executeSql(
					transactionString,
					[],
					enyo.bind(this, (function (transaction, results) {
						try {
							var tagName = [], tagID = [], tagCount = [];
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								var name;
								for (name in row)
								{
									if (typeof row[name] !== 'function')
									{
										switch (name) {
											case 'name':
												tagName[i] = row[name];
												break;
											case 'id':
												tagID[i] = row[name];
												break;
											case 'count':
												tagCount[i] = row[name];
												break;
										}
									}
								}
							}
							this.$.header.setContent(this.tagType + ' tags (' + tagName.length + ' tags)');
							
							//push everything into the list model
							for (var i = this.start; (i < this.stop) && (i < tagName.length); i++) {
								this.tags.push({
									tag: tagName[i],
									tagID: tagID[i],
									tagCount: tagCount[i]
								});
							}
							
							this.$.tagsList.refresh();
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
		var item = this.tags[inIndex];
		if(item) {
			this.$.tag.setContent(item.tag);
			this.$.tagCount.setContent("(" + item.tagCount + ")");
			return true;
		}
		return false;
	},
	listItemClick: function(inSender, inEvent) {
		var item = [{
		  tag: this.tags[inEvent.rowIndex].tag,
			  tagID: this.tags[inEvent.rowIndex].tagID,
			  tagCount: this.tags[inEvent.rowIndex].tagCount
		}];
		this.doSelect(item);
		return;
  	},
  	sortTags: function(inSender) {
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
		this.tagSort = inSender.selected.caption;
		this.tagsChanged();
	},
  	changeTypeMenu: function(inSender) {
  		this.$.typeMenu.openAroundControl(inSender);
  		return;
  	},
  	changeType: function(inSender) {
  		this.tagType = inSender.selected.caption;
  		this.tagsChanged();
  		return;
  	}
});