(function(document,window,Swipe){
	'use strict';
	
	//------------------------------------------------------------------------
	// GLOBAL VARS
	//------------------------------------------------------------------------

	var nav = document.getElementsByTagName('nav')[0]
	, tabs = nav.getElementsByTagName('a')
	, articles = document.getElementsByTagName('article')
	, swipeWrap = document.getElementById('swipe-wrap')
	, musicTab = document.getElementById('music_tab')
	, oldHeight = 0
	, playerIframe = null
	, swipe
	, currentAlbum
	// data for embedding iframes
	, albumEmbeds = [
		{
			name: "Bipolar (2009)",
			uri: "2688032"
		},
		{
			name: "Foot In The Door (2008)",
			uri: "2688050"
		},
		{
			name: "Oldies But Goodies (2007)",
			uri: "3102627"
		}
	]
	, musicPageInitialized = false
	, facebookInitialized = false
	
	//------------------------------------------------------------------------
	// FUNCTIONS
	//------------------------------------------------------------------------
	
	, addClass = (function () {
		if (document.body.classList) {
			return function (dom,className) {
				dom.classList.add(className);
			};
		} else {
			return function (dom,className) {
				dom.className += ' '+className+' ';
			};
		}
	}())
	
	, rmClass = (function () {
		if (document.body.classList) {
			return function (dom,className) {
				dom.classList.remove(className);
			};
		} else {
			return function (dom,className) {
				dom.className = dom.className.replace(className,'');
			};
		}
	}())
	
	, resizePlayer = function () {
		// we find the tallest tab that isn't the music tab (which we assume is the last tab)
		var tallestHeight=0,newHeight,tallest,element;
		for (element = tallest = musicTab.previousSibling; element; element = element.previousSibling) {
			if (element.scrollHeight > tallestHeight) {
				tallestHeight = element.scrollHeight;
				tallest = element;
			}
		}
		
		// ... and make the music player match its height
		if (tallest.offsetHeight !== oldHeight) {
			oldHeight = tallest.offsetHeight;
			
			newHeight = tallest.offsetHeight - (musicTab.scrollHeight - playerIframe.scrollHeight);
			// the player must be at least 280px
			newHeight = Math.max(newHeight,280);
			
			playerIframe.style.height = newHeight + "px";
		}
	}
	
	, loadMusic = function(index) {
		if (index < 0 || index >= albumEmbeds.length) {
			return;
		}
	
		var url = "https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F" + albumEmbeds[index].uri + "&amp;color=30b0e8&amp;auto_play=false&amp;show_artwork=true";

		if (playerIframe === null) {
			// create iframe
			playerIframe = document.createElement('iframe');
			playerIframe.setAttribute('width','100%');
			playerIframe.setAttribute('height','280');
			playerIframe.setAttribute('scrolling','no');
			playerIframe.src = url;
			document.getElementById('soundcloud_player').appendChild(playerIframe);
			
			// handles resizing the soundcloud iframe
			window.addEventListener('resize',resizePlayer,false);
		} else {
			//http://www.ozzu.com/programming-forum/ignoring-iframes-with-javascript-history-t67189.html
			playerIframe.contentWindow.location.replace(url);
		}
		resizePlayer();
		document.getElementById('album_name').innerHTML = albumEmbeds[index].name;
		currentAlbum = index;
		
		if (index === 0) {
			addClass(document.body,'first_album');
			rmClass(document.body,'last_album');
		} else if (index === albumEmbeds.length-1) {
			rmClass(document.body,'first_album');
			addClass(document.body,'last_album');
		} else {
			rmClass(document.body,'first_album');
			rmClass(document.body,'last_album');
		}
	}
	
	, initializeFacebook = function () {
		if (facebookInitialized === true) {
			return;
		}
		facebookInitialized = true;
		
		// facebook javascript
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s); js.id = id;
			js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}
	
	, initializeMusicPage = function () {
		if (musicPageInitialized === true) {
			return;
		}
		musicPageInitialized = true;
		initializeFacebook();
		
		// remove event listeners, we don't need them anymore
		window.removeEventListener('mouseover', initHoverCheck, false);
		window.removeEventListener('touchstart', initHoverCheck, false);
		initHoverCheck = null;
		
		loadMusic(0);
	}
	
	, setPageTitle = function (pageName) {
		document.title = "Aaron Opfer - "+pageName.slice(0,1).toUpperCase() + pageName.slice(1);
	}
	
	, initHoverCheck = function (e) {
		if (e.target.tagName !== "A" || e.target.getAttribute('href') !== "music") {
			return;
		}
		initializeMusicPage();
	}
	
	, anchorClickHandler = function (e) {
		var url, index;
		
		if (e.target.tagName !== "A") {
			return;
		}
		
		url = /^[a-z]+$/.exec(e.target.getAttribute('href'));
		
		if (url === null) {
			return;
		}
		url = url[0];
		
		// figure out which tab this url matches up with, if any
		for (index = 0; index < tabs.length; index++) {
			if (e.target.getAttribute('href') === tabs[index].getAttribute('href')) {
				break;
			}
		}
		if (index >= tabs.length) {
			return;
		}
		// swipe to that tab
		e.preventDefault();
		if (swipe) {
			swipe.slide(index,200);
		}
	}
	
	, orangeifyStyle = function (cssText) {
		var regexStyle1 = /\#([0-9a-zA-Z]{1,2})([0-9a-zA-Z]{1,2})([0-9a-zA-Z]{1,2})/g
		, regexStyle2 = /rgba?\(\s*([0-9\.]+)\s*,\s*([0-9\.]+)\s*,\s*([0-9\.]+)\s*(,\s*([0-9\.]+)\s*)?\)/g
		
		, oldCssText = cssText;
		
		cssText = cssText.replace(regexStyle1, function (match,r,g,b) {
			console.log('replaced #rrggbb');
			return "#"+b+g+r;
		});
		
		cssText = cssText.replace(regexStyle2, function (match,r,g,b,garbage,a) {
			var rtn = "rgb";
			if (a) {
				rtn += "a";
			}
			rtn += "(" + (a ? [b,g,r,a] : [b,g,r]).join(', ') + ")";

			if (a) {
				console.log('replaced rgba ');
			} else {
				console.log('replaced rgb ');
			}
			return rtn;
		});
		
		if (cssText != oldCssText) {
			console.log('old css: '+oldCssText);
			console.log('new css: '+cssText);
		}
		return cssText;
	}
	
	, orangeify = function () {
		var i,j,k,styleSheet, style,backgroundImage;
		
		for (i = 0; i < document.styleSheets.length; i++) {
			styleSheet = document.styleSheets[i];
			
			if (styleSheet.href === null || !styleSheet.rules) {
				continue;
			}
			for (j = 0; j < styleSheet.rules.length; j++) {
				
				if (styleSheet.rules[j].style) {
					style = styleSheet.rules[j].style;
					backgroundImage = style.backgroundImage;
					style.cssText = orangeifyStyle(style.cssText);
					if (backgroundImage && !style.backgroundImage) {
						style.backgroundImage = orangeifyStyle(backgroundImage.replace(/, initial$/,''));
					}
				} else if (styleSheet.rules[j].cssRules) {
					for (k = 0; k < styleSheet.rules[j].cssRules.length; k++) {
						style = styleSheet.rules[j].cssRules[k].style;
						style.cssText = orangeifyStyle(style.cssText);
					}
				}
			}
		}
	}
	
	;
	
		
	//------------------------------------------------------------------------
	// PAGE INITIALIZATION
	//------------------------------------------------------------------------
	
	(function(){
		var activeTab = null, i, selectedRegex = /selected/;

		if (/mobile/i.test(navigator.userAgent) && document.body.scrollTop <= 1) {
			window.scrollTo(0, 1);
		}
	
		// find which tab is selected
		for (i = 0; i < tabs.length; i++) {
			if (selectedRegex.exec(tabs[i].className) !== null) {
				activeTab = i;
				break;
			}
		}
		
		// this should never happen.
		if (activeTab === null) {
			return;
		}
		
		swipe = new Swipe(document.getElementById('content'),{
			startSlide: activeTab,
			transitionEnd: function (index,article) {
				var i
				, url = tabs[index].innerHTML.toLowerCase();
				
				for (i = 0; i < articles.length; i++) {
					if (article !== articles[i]) {
						rmClass(articles[i], 'selected');
					} else {
						addClass(articles[i],'selected');
					}
				}
				
				if (url === "music") {
					initializeMusicPage();
				}
				
				setPageTitle(url);
				
				if (index === 0) {
					url = window.location.href.match("^.+/")[0];
				}
				
				
				if (typeof history.state !== "undefined") {
					if (history.state === null || history.state.index !== index) {
						history.pushState({index:index},document.title,url);
					}
				}
			},
			callback: function (index,article) {
				var tab = tabs[index]
				, i;
				
				for (i = 0; i < tabs.length; i++) {
					if (tab !== tabs[i]) {
						rmClass(tabs[i],'selected');
					} else {
						addClass(tabs[i],'selected');
					}
				}
				

			}
		});
		
		if (tabs[activeTab].getAttribute('href') === "music") {
			// music page is the active page, initialize right away
			initializeMusicPage();
		} else {
			// Lazy load the music page
			window.addEventListener('mouseover',initHoverCheck,false);
			window.addEventListener('touchstart',initHoverCheck,false);
			setTimeout(initializeFacebook,15000);
			setTimeout(initializeMusicPage,30000);
		}
	}());
	
	//------------------------------------------------------------------------
	// HANDLER INITIALIZATION
	//------------------------------------------------------------------------
	
	// html5 history API handler
	window.addEventListener('popstate',function (e) {
		if (e.state === null) {
			return;
		}
		swipe.slide(e.state.index,55);
	},false);
	
	// handles clicks to local links
	window.addEventListener('click',anchorClickHandler,false);
	
	// Music next/prev buttons
	document.getElementById('prev_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum-1);
	}, false);
	
	document.getElementById('next_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum+1);
	}, false);
	
	document.getElementById('orange').addEventListener('click', orangeify);

	
}(document,window,window.Swipe));
