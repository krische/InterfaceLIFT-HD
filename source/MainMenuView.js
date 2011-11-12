enyo.kind({
	name: "MainMenuView",
	kind: "VFlexBox",
	className: "interfaceLIFT-menu-bg",
	events: {
		onSelectSearch: "",
		onSelectArtists: "",
		onSelectTags: "",
		onSelectWallpapers: ""
	},
	components: [
		{name: "header", kind: "Header", content: "InterfaceLIFT for WebOS", style: "font-size: 13pt;"},
		{name: "search", kind: "Item", className: "menu-item", style: "padding-bottom: 2px;", components: [
			{kind: "Image", src: "images/menu-icon-search.png", style: "float: left; padding-right: 10px;"},
			{content: "Search"}
		], onclick: "doSelectSearch"},
		{kind: "Scroller", flex: 1, components: [
			{style: "height: 10px;"},
			{name: "artists", kind: "Item", className: "menu-item", components: [
				{kind: "Image", src: "images/menu-icon-artists.png", style: "float: left; padding-right: 10px;"},
				{content: "Artists"}
			], onclick: "doSelectArtists"},
			{name: "tags", kind: "Item", className: "menu-item", components: [
				{kind: "Image", src: "images/menu-icon-tags.png", style: "float: left; padding-right: 10px;"},
				{content: "Tags"}
			], onclick: "doSelectTags"},
			{name: "wallpapers", kind: "Item", className: "menu-item selected", components: [
				{kind: "Image", src: "images/menu-icon-wallpapers.png", style: "float: left; padding-right: 10px;"},
				{content: "Wallpapers"}
			], onclick: "doSelectWallpapers"},
		]},
		{kind: "Toolbar"}
	],
	create: function() {
		this.inherited(arguments);
	},
	select: function(item) {
		switch(item)
		{
			case "search":
				this.$.search.addClass("selected");
				this.$.artists.removeClass("selected");
				this.$.tags.removeClass("selected");
				this.$.wallpapers.removeClass("selected");
				break;
			case "artists":
				this.$.search.removeClass("selected");
				this.$.tags.removeClass("selected");
				this.$.wallpapers.removeClass("selected");
				this.$.artists.addClass("selected");
				break;
			case "tags":
				this.$.search.removeClass("selected");
				this.$.artists.removeClass("selected");
				this.$.wallpapers.removeClass("selected");
				this.$.tags.addClass("selected");
				break;
			case "wallpapers":
				this.$.search.removeClass("selected");
				this.$.artists.removeClass("selected");
				this.$.tags.removeClass("selected");
				this.$.wallpapers.addClass("selected");
				break;
			default:
				this.$.search.removeClass("selected");
				this.$.artists.removeClass("selected");
				this.$.tags.removeClass("selected");
				this.$.wallpapers.removeClass("selected");
				break;
		}
	}
});
