enyo.kind({
	name: "TagViewer",
	kind: "VFlexBox",
	className: "interfaceLIFT-bg",
	published: {
		tag: [{
			tag: "",
			tagID: "",
			tagCount: ""
		}],
		results: []
	},
	events: {
		onSelect: ""
	},
	components: [
		{name: "tagsService", handleAs: "text", kind: "WebService", onSuccess: "gotTags", onFailure: "gotTagsFailure"},
		{name: "header", kind: "Header", components: [
			{name: "headerText", style: "overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 100%"}
		]},
		{name: "tagsList", kind: "VirtualList", onSetupRow: "getListItem", className: "tag-viewer-container", flex: 1, pageSize: 30, lookAhead: 10, components: [
			{kind: "Item", className: "tag-viewer-item", components: [
				{name: "thumbnail", kind: "Image", className: "tag-thumbnail"},
				{name: "date", className: "tag-date"},
				{name: "title", className: "tag-title"},
				{name: "artist", className: "tag-artist"},
				{name: "description", className: "tag-description"}
			], onclick: "listItemClick"}
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	resize: function() {
		this.$.tagsList.refresh();
		console.log("width", this.getBounds().width);
		return;
	},
	tagChanged: function() {
		this.$.tagsList.applyStyle("background", "rgba(150,150,150,0.6)");
		this.results.length = 0;
		this.$.headerText.setContent("'" + this.tag[0].tag + "'" + " tags (" + this.tag[0].tagCount + ")");
		this.$.tagsService.url = "http://webos.interfacelift.com/feed/category.php?res=1024x1024&id=" + this.tag[0].tagID + "&start=0&stop=" + this.tag[0].tagCount;
		console.log("getting: " + this.$.tagsService.url);
		this.$.tagsService.call();
		this.$.tagsList.punt();
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
  	gotTags: function(inSender, inResponse) {
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
			if (result.getElementsByTagName('downloadsize')[0].childNodes[0]) {
				titles[i] = result.getElementsByTagName('title')[0].childNodes[0].nodeValue;
				artists[i] = result.getElementsByTagName('artistname')[0].childNodes[0].nodeValue;
				artistIDs[i] = result.getElementsByTagName('artistid')[0].childNodes[0].nodeValue;
				if (result.getElementsByTagName('description')[0].childNodes[0]) {
					descriptions[i] = result.getElementsByTagName('description')[0].childNodes[0].nodeValue;
				} else {
					descriptions[i] = '';
				}
				previews[i] = result.getElementsByTagName('preview_240x150')[0].childNodes[0].nodeValue;
				downloads[i] = result.getElementsByTagName('download')[0].childNodes[0].nodeValue;
				dates[i] = result.getElementsByTagName('dateformat')[0].childNodes[0].nodeValue;
				sizes[i] = result.getElementsByTagName('downloadsize')[0].childNodes[0].nodeValue;
				i++;
			}
			result=nodes.iterateNext();
		}
		
		//push everything into the list model
		for (var i = 0; i < titles.length; i++) {
			this.results.push({
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
		
		this.$.tagsList.refresh();
  	},
  	gotTagsFailure: function(inSender, inResponse) {
  		console.log("error getting tags");
  		return;
  	}
});