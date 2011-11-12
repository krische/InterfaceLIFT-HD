/*	---------------------------------------------------------------
	DATABASE
	---------------------------------------------------------------
	
	Handles all of the database stuff.
*/

InterfaceLIFT.Database = ({
	// open database, drop artists/tags tables and create artists/tags tables
	initialize: function() {
		// open the database
		try {
			InterfaceLIFT.SQLdatabase = openDatabase('ext:ILIFTdb', '', 'InterfaceLIFT Database', 3000000);
		} catch (e) {
			console.log("Database Open Error:", e);		
		}
		//drop and create tags and artists tables
		try {
		    InterfaceLIFT.SQLdatabase.transaction( 
		        enyo.bind(function (transaction) {
					transaction.executeSql('DROP TABLE IF EXISTS tags; GO;', []);
					transaction.executeSql('DROP TABLE IF EXISTS artists; GO;', []);
					transaction.executeSql('CREATE TABLE tags (type TEXT, name TEXT, id INTEGER, count INTEGER); GO;');
					transaction.executeSql('CREATE TABLE artists (name TEXT, id INTEGER, count INTEGER); GO;');
					transaction.executeSql('CREATE TABLE IF NOT EXISTS wallpapers (title TEXT, artist TEXT, artistID INTEGER, description TEXT, preview TEXT, download TEXT, date TEXT, size INTEGER); GO;');
					transaction.executeSql('CREATE TABLE IF NOT EXISTS favorites (title TEXT, artist TEXT, artistID INTEGER, description TEXT, preview TEXT, download TEXT, date TEXT, size INTEGER); GO;');
		    	}));
			console.log('Tables created');
		} catch (e) {
			console.log('Database Drop Error:', e);
		}
	},
	
	// delete both wallpapers and favorites. tags and artists will be dropped on next startup.
	deleteDatabase: function() {
		InterfaceLIFT.SQLdatabase.transaction(
		    enyo.bind(this, (function (transaction) {
				transaction.executeSql(
					'DROP TABLE IF EXISTS favorites; GO;', [], enyo.bind(this, (function (transaction) {
						transaction.executeSql(
							'DROP TABLE IF EXISTS wallpapers; GO;', [], enyo.bind(this, (function (transaction) {
								enyo.setCookie("downloadedWallpapers", 0);
								console.log("database deleted");
								window.close();
						})))
				})))
		})));
	},
	
	deleteWallpapers: function() {
		InterfaceLIFT.SQLdatabase.transaction(
		    (function (transaction) {
				transaction.executeSql('DROP TABLE IF EXISTS wallpapers; GO;', [], (function (transaction) {
					transaction.executeSql('CREATE TABLE IF NOT EXISTS wallpapers (title TEXT, artist TEXT, artistID INTEGER, description TEXT, preview TEXT, download TEXT, date TEXT, size INTEGER); GO;');
				}));
			}));
		console.log('wallpapers dropped');
	},
	
	deleteFavorites: function() {
		InterfaceLIFT.SQLdatabase.transaction(
		    (function (transaction) {
				transaction.executeSql('DROP TABLE IF EXISTS favorites; GO;', [], (function (transaction) {
					transaction.executeSql('CREATE TABLE IF NOT EXISTS favorites (title TEXT, artist TEXT, artistID INTEGER, description TEXT, preview TEXT, download TEXT, date TEXT, size INTEGER); GO;');
				}));
			}));
		console.log('favorites dropped');
	},
	
	// load the tags table with data
	loadTags: function(xmlstring) {
		InterfaceLIFT.SQLdatabase.transaction( 
        	enyo.bind(function (transaction) {
				var tag, tagID, tagCount, xpath, nodes;
				var tagType = ['Color', 'Scene', 'Location', 'Event', 'Subject', 'Equipment', 'Medium'];
				// Convert the string to an XML object
				var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
				
				for (var n=0; n < tagType.length; n++) {
					// Use xpath to parse xml object
					xpath = 'channel/section[@title=\"' + tagType[n] + '\"]/item';
					nodes = document.evaluate(xpath, xmlobject, null, XPathResult.ANY_TYPE, null);
					
					var result = nodes.iterateNext();
					if ((tagType[n] == "Color")||(tagType[n] == "Scene")) {
						result = nodes.iterateNext(); // skip the first node. The blank node value causes problems.
					}
					var i = 0;
					while (result)
					{
						tag = result.getElementsByTagName('tag')[0].childNodes[0].nodeValue;
						tagID = result.getElementsByTagName('tag_id')[0].childNodes[0].nodeValue;
						tagCount = result.getElementsByTagName('count')[0].childNodes[0].nodeValue;
						var transactionString = 'INSERT INTO tags (type, name, id, count) VALUES ("' + tagType[n] + '","' + tag + '",' + tagID + ',' + tagCount + ');';
						transaction.executeSql(transactionString, [], enyo.bind(this, this.successHandler), enyo.bind(this, this.errorHandler));
						i++;
						result=nodes.iterateNext();
					}
				}
		}));
	},
	
	// load the artists table with data
	loadArtists: function(xmlstring) {
		InterfaceLIFT.SQLdatabase.transaction( 
        	enyo.bind(function (transaction) {
				var artist, artistID, artistCount, nodes;

				// Convert the string to an XML object
				var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
				
				// Use xpath to parse xml object
				nodes = document.evaluate('channel/item', xmlobject, null, XPathResult.ANY_TYPE, null);
				
				var result = nodes.iterateNext();
				var i = 0;
				while (result)
				{
					artist = result.getElementsByTagName('name')[0].childNodes[0].nodeValue;
					artistID =  result.getElementsByTagName('artist_id')[0].childNodes[0].nodeValue;
					artistCount =result.getElementsByTagName('count')[0].childNodes[0].nodeValue;
					var transactionString = 'INSERT INTO artists (name, id, count) VALUES ("' + artist + '",' + artistID + ',' + artistCount + ');';
					transaction.executeSql(transactionString, []);
					i++;
					result=nodes.iterateNext();
				}
		}));
	},
	
	// load the wallpapers table with data
	loadWallpapers: function(xmlstring) {
		try {
			InterfaceLIFT.SQLdatabase.transaction(enyo.bind(function(transaction){
				var title, artist, artistID, description, preview, preview_240x150, download, date, nodes, size;
				var allGood = true;
				// Convert the string to an XML object
				var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");
				
				// Use xpath to parse xml object
				nodes = document.evaluate('channel/item', xmlobject, null, XPathResult.ANY_TYPE, null);
				
				var result = nodes.iterateNext();
				var i = 0;
				while (result) {
					title = result.getElementsByTagName('title')[0].childNodes[0].nodeValue;
					artist = result.getElementsByTagName('artistname')[0].childNodes[0].nodeValue;
					artistID = result.getElementsByTagName('artistid')[0].childNodes[0].nodeValue;
					if (result.getElementsByTagName('description')[0].childNodes[0]) {
						description = result.getElementsByTagName('description')[0].childNodes[0].nodeValue;
					}
					else {
						description = '';
					}
					preview = result.getElementsByTagName('preview_240x150')[0].childNodes[0].nodeValue;
					download = result.getElementsByTagName('download')[0].childNodes[0].nodeValue;
					date = result.getElementsByTagName('dateformat')[0].childNodes[0].nodeValue;
					if (result.getElementsByTagName('downloadsize')[0].childNodes[0]) {
						size = result.getElementsByTagName('downloadsize')[0].childNodes[0].nodeValue;
						allGood = true;
					} else {
						allGood = false;
					}
					if (allGood)
					{
						var transactionString = 'INSERT INTO wallpapers VALUES ("' + title + '","' + artist + '",' + artistID + ',"' + description + '","' + preview + '","' + download + '","' + date + '",' + size + '); GO;';
						transaction.executeSql(transactionString, []);
					}
					i++;
					result = nodes.iterateNext();
				}
				console.log("wallpapers loaded");
			}));
		} catch (e) {
			console.log('Database Error:', e);
		}
	},
	
	// load a wallpaper into the favorites database
	loadFavorite: function(wallpaper) {
		try {
			InterfaceLIFT.SQLdatabase.transaction(enyo.bind(this, (function(transaction){
				var transactionString = 'INSERT INTO favorites VALUES ("' + wallpaper.title + '","' + wallpaper.artist + '",' + wallpaper.artistID + ',"' + wallpaper.description + '","' + wallpaper.preview + '","' + wallpaper.download + '","' + wallpaper.date + '",' + wallpaper.size + '); GO;';
				transaction.executeSql(transactionString, []);
			})));
		} catch (e) {
			console.log('Database Error:', e);
		}
	},
	
	// remove a wallpaper from the favorites database
	removeFavorite: function(wallpaper) {
		try {
			InterfaceLIFT.SQLdatabase.transaction(enyo.bind(this, (function(transaction){
				var transactionString = 'DELETE FROM favorites WHERE preview="' + wallpaper.preview + '"; GO;';
				transaction.executeSql(transactionString, []);
			})));
		} catch (e) {
			console.log('Database Error:', e);
		}
	},
	successHandler: function(transaction, results) {
		
	},
	errorHandler: function(transaction, error) 
	{ 
	    console.log('Error was '+error.message+' (Code '+error.code+')'); 
	}
});
