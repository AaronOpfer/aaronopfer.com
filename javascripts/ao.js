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
	, musicLinks = null
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
		
		var i;
		
		if (musicLinks && document.removeEventListener) {
			for (i = 0; i < musicLinks.length; i++) {
				musicLinks[i].removeEventListener('mouseover', initializeMusicPage, false);
				musicLinks[i].removeEventListener('touchstart', initializeMusicPage, false);
			}
		}
		
		loadMusic(0);
	}
	
	, setPageTitle = function (pageName) {
		document.title = "Aaron Opfer - "+pageName.slice(0,1).toUpperCase() + pageName.slice(1);
	}
	
	, tabClickHandler = function (e) {
		if (e.which && e.which !== 1) {
			return;
		}
		
		var index;
		for (index = 0; tabs[index] !== e.target && index < tabs.length; index++);
		
		if (index >= tabs.length) {
			return;
		}
		
		e.preventDefault();
		if (swipe) {
			swipe.slide(index,200);
		}
	}
	;
	
		
	//------------------------------------------------------------------------
	// PAGE INITIALIZATION
	//------------------------------------------------------------------------
	
	(function(){
		var pageName = window.location.href.match("/([a-z]+)$")
		, activeTab = null
		, i;

		if (/mobile/i.test(navigator.userAgent) && document.body.scrollTop <= 1) {
			window.scrollTo(0, 1);
		}
	
		// fallback to home if we can't find the pagename via regex
		if (pageName === null) {
			pageName = "home";
			activeTab = 0;
		} else {
			pageName = pageName[1];
			
			// figure out which tab is active
			for (i = 0; i < tabs.length; i++) {
				if (tabs[i].innerHTML.toLowerCase() === pageName) {
					activeTab = i;
					break;
				}
			}
			
			// fallback to home if pagename isn't any of our pages
			if (activeTab === null) {
				activeTab = 0;
				pageName = "home";
			}
		}
		addClass(tabs[activeTab],'selected');
		addClass(articles[activeTab],'selected');
		setPageTitle(pageName);
		
		
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
		
		if (pageName === "music") {
			// music page is the active page, initialize right away
			initializeMusicPage();
		} else {
			// Lazy load the music page
			musicLinks = document.querySelectorAll('[href=music]');
			for (i = 0; i < musicLinks.length; i++) {
				musicLinks[i].addEventListener('mouseover',initializeMusicPage,false);
				musicLinks[i].addEventListener('touchstart',initializeMusicPage,false);
			}
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
	
	// handles clicks on the navbar
	nav.addEventListener('click',tabClickHandler,false);
	
	// Music next/prev buttons
	document.getElementById('prev_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum-1);
	}, false);
	
	document.getElementById('next_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum+1);
	}, false);

	
}(document,window,window.Swipe));
