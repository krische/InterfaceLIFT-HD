enyo.kind({
    name: "SearchView",
    kind: "VFlexBox",
    className: "interfaceLIFT-bg",
    events: {
        onSelectArtist: "",
        onSelectTag: "",
        onSelectWallpaper: ""
    },
    components: [
        {name: "header", kind: "Header", caption: "Search"},
        {kind: "FadeScroller", autoHorizontal: false, flex: 1, horizontal: false, components: [
            {name: "searchBox", kind: "Input", className: "search-box", hint: "Search...", onchange: "search", autoCapitalize: "lowercase", selectAllOnFocus: true},
            {name: "artistsDrawer", kind: "DividerDrawer", caption: "Artists", icon: "images/menu-icon-artists.png", open: false, components: [
                {name: "artistsList", kind: "VirtualRepeater", className: "search-list", onSetupRow: "renderArtists", components: [
                    {name: "artistItem", kind: "Item", layoutKind: "HFlexLayout", className: "search-item", components: [
                        {name: "artist", style: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;", flex: 1},
                        {name: "artistCount", sytle: "text-align: right;"}
                    ], onclick: "artistClick"}
                ]}
            ]},
            {name: "tagsDrawer", kind: "DividerDrawer", caption: "Tags", icon: "images/menu-icon-tags.png", open: false, components: [
                {name: "tagsList", kind: "VirtualRepeater", className: "search-list", onSetupRow: "renderTags", components: [
                    {name: "tagItem", kind: "Item", layoutKind: "HFlexLayout", className: "search-item", components: [
                        {name: "tag", style: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;", flex: 1},
                        {name: "tagCount", sytle: "text-align: right;"}
                    ], onclick: "tagClick"}
                ]}
            ]},
            {name: "wallpapersDrawer", kind: "DividerDrawer", caption: "Wallpapers", icon: "images/menu-icon-wallpapers.png", open: false, components: [
                {name: "wallpapersList", kind: "VirtualRepeater", className: "wallpaper-list", style: "margin-top: 0;", onSetupRow: "renderWallpapers", components: [
                    {name: "wallpaperItem", kind: "Item", className: "wallpaper-item", components: [
                            {name: "thumbnail", kind: "Image", className: "wallpaper-thumbnail"},
                            {name: "date", className: "wallpaper-date"},
                            {name: "title", className: "wallpaper-title"},
                            {name: "artistName", className: "wallpaper-artist"},
                            {name: "description", className: "wallpaper-description"}
                    ], onclick: "wallpaperClick"}
		]},  
            ]}
        ]},
        {name: "errorDialog", kind: "Dialog", className: "enyo-dialog-dark", components: [
            {className: "enyo-item enyo-first", style: "padding: 12px", content: "Error"},
            {className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: "Please enter at least 3 characters for the search."},
            {kind: "Button", caption: "OK", onclick: "dismissDialog"}
	]},
        {kind: "Toolbar", components: [
                {kind: "GrabButton"}
        ]}
    ],
    create: function() {
        this.inherited(arguments);
        this.artists = [];
        this.tags = [];
        this.wallpapers = [];
        
        // open the database
        try {
            this.db = openDatabase('ext:ILIFTdb', '', 'InterfaceLIFT Database', 3000000);
        } catch (e) {
            console.log("Database Open Error: " + e);		
        }
    },
    resize: function() {
        this.$.artistsList.render();
        this.$.tagsList.render();
        this.$.wallpapersList.render();
        return;
    },
    newSearch: function() {
        this.$.searchBox.forceFocus();
        this.$.searchBox.forceSelect();
        return;
    },
    dismissDialog: function(inSender) {
        this.$.errorDialog.toggleOpen();
        this.newSearch();
        return;
    },
    artistClick: function(inSender, inEvent) {
        var item = [{
            artist: this.artists[inEvent.rowIndex].artist,
            artistID: this.artists[inEvent.rowIndex].artistID,
            artistCount: this.artists[inEvent.rowIndex].artistCount
        }];
        this.doSelectArtist(item);
        return;
    },
    tagClick: function(inSender, inEvent) {
        var item = [{
            tag: this.tags[inEvent.rowIndex].tag,
            tagID: this.tags[inEvent.rowIndex].tagID,
            tagCount: this.tags[inEvent.rowIndex].tagCount
        }];
        this.doSelectTag(item);
        return;
    },
    wallpaperClick: function(inSender, inEvent) {
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
        this.doSelectWallpaper(item);
        return;
    },
    renderArtists: function(inSender, inIndex) {
        var item = this.artists[inIndex];
        if(item) {
            this.$.artist.setContent(item.artist);
            this.$.artistCount.setContent("(" + item.artistCount + ")");
            switch(this.getBounds().width)
            {
                case 544:
                    this.$.artistItem.applyStyle("width", "50%");
                    break
                case 768:
                    this.$.artistItem.applyStyle("width", "33.33%");
                    break;
                case 800:
                    this.$.artistItem.applyStyle("width", "33.39%");
                    break;
                case 1024:
                    this.$.artistItem.applyStyle("width", "25%");
                    break;
            }
            return true;
        }
        return false;
    },
    renderTags: function(inSender, inIndex) {
        var item = this.tags[inIndex];
        if(item) {
            this.$.tag.setContent(item.tag);
            this.$.tagCount.setContent("(" + item.tagCount + ")");
            switch(this.getBounds().width)
            {
                case 544:
                    this.$.tagItem.applyStyle("width", "50%");
                    break
                case 768:
                    this.$.tagItem.applyStyle("width", "33.33%");
                    break;
                case 800:
                    this.$.tagItem.applyStyle("width", "33.39%");
                    break;
                case 1024:
                    this.$.tagItem.applyStyle("width", "25%");
                    break;
            }
            return true;
        }
        return false;
    },
    renderWallpapers: function(inSender, inIndex) {
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
                this.$.artistName.setContent("by " + item.artist);
                this.$.title.setContent(item.title);
                this.$.date.setContent(item.date);
                this.$.description.setContent(item.description);
                return true;
        }
        return false;
    },
    search: function(inSender, inEvent) {      
        if(inSender.value.length > 2)
        {
            this.artists.length = 0;
            this.tags.length = 0;
            this.wallpapers.length = 0;
            this.$.searchBox.forceBlur();
            this.searchArtists(inSender.value);
            this.searchTags(inSender.value);
            this.searchWallpapers(inSender.value);
        } else {
            this.$.errorDialog.toggleOpen();
        }
    },
    searchArtists: function(search) {
        // Query artists tables
        var transactionString = 'SELECT name, id, count FROM artists WHERE name LIKE "%' + search + '%";';
        
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
                                                
                                                //push everything into the artists array
                                                for (var i = 0; i < artistName.length; i++) {
                                                        this.artists.push({
                                                                artist: artistName[i],
                                                                artistID: artistID[i],
                                                                artistCount: artistCount[i]
                                                        });
                                                }
                                                
                                                this.$.artistsDrawer.setCaption("Artists (" + artistName.length + ")");
                                                
                                                if(results.rows.length > 0)
                                                    this.$.artistsDrawer.setOpen(true);
                                                else
                                                    this.$.artistsDrawer.setOpen(false);
                                                    
                                                this.$.artistsList.render();
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
    searchTags: function(search) {
        // Query artists tables
        var transactionString = 'SELECT name, id, count FROM tags WHERE name LIKE "%' + search + '%";';
        
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
                                                
                                                //push everything into the artists array
                                                for (var i = 0; i < tagName.length; i++) {
                                                        this.tags.push({
                                                                tag: tagName[i],
                                                                tagID: tagID[i],
                                                                tagCount: tagCount[i]
                                                        });
                                                }
                                                
                                                this.$.tagsDrawer.setCaption("Tags (" + tagName.length + ")");
                                                
                                                if(results.rows.length > 0)
                                                    this.$.tagsDrawer.setOpen(true);
                                                else
                                                    this.$.tagsDrawer.setOpen(false);
                                                    
                                                this.$.tagsList.render();
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
    searchWallpapers: function(search) {
        // Query artists tables
        var transactionString = 'SELECT * FROM wallpapers WHERE title LIKE "%' + search + '%" ORDER BY title;';
        
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
                                
                            //push everything into the wallpapers array
                            for (var i = 0; i < title.length; i++) {
                                this.wallpapers.push({
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
                            
                            this.$.wallpapersDrawer.setCaption("Wallpapers (" + title.length + ")");
                            
                            if(results.rows.length > 0)
                                this.$.wallpapersDrawer.setOpen(true);
                            else
                                this.$.wallpapersDrawer.setOpen(false);
                                
                            this.$.wallpapersList.render();
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