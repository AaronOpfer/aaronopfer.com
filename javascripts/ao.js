(function(document,window,Swipe){
	'use strict';
	
	//------------------------------------------------------------------------
	// GLOBAL VARS
	//------------------------------------------------------------------------

	var nav = document.querySelector('nav')
	, tabs = nav.querySelectorAll('a')
	, articles = document.querySelectorAll('article')
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
	
	//------------------------------------------------------------------------
	// FUNCTIONS
	//------------------------------------------------------------------------
		
	, resizePlayer = function () {
		if (playerIframe === null) {
			return;
		}
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
			playerIframe = document.createElement('iframe');
			playerIframe.setAttribute('width','100%');
			playerIframe.setAttribute('height','280');
			playerIframe.setAttribute('scrolling','no');
			playerIframe.src = url;
			document.getElementById('soundcloud_player').appendChild(playerIframe);
			
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
		} else {
			//http://www.ozzu.com/programming-forum/ignoring-iframes-with-javascript-history-t67189.html
			playerIframe.contentWindow.location.replace(url);
		}
		resizePlayer();
		document.getElementById('album_name').innerHTML = albumEmbeds[index].name;
		currentAlbum = index;
		
		if (index === 0) {
			document.body.classList.remove('last_album');
			document.body.classList.add('first_album');
		} else if (index === albumEmbeds.length-1) {
			document.body.classList.add('last_album');
			document.body.classList.remove('first_album');
		} else {
			document.body.classList.remove('last_album');
			document.body.classList.remove('first_album');
		}
	}
	
	
	
	, initializeMusicPage = function () {
		if (musicPageInitialized === true) {
			return;
		}
		musicPageInitialized = true;
		
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
		document.title = "Aaron Opfer - "+pageName[0].toUpperCase() + pageName.slice(1);
	}
	
	, tabClickHandler = function (e) {
		if (e.which !== 1) {
			return;
		}
		
		var index = Array.prototype.indexOf.call(tabs,e.target);
		
		if (index < 0) {
			return;
		}
		
		e.preventDefault();
		if (swipe) {
			swipe.slide(index,200);
		}
	}
	
	, choosyHandler = function (e) {
		if (e.which !== 1) {
			return;
		}
		
		var index = parseInt(e.target.getAttribute('data-index'),10);
		
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
		
		tabs[activeTab].classList.add('selected');
		articles[activeTab].classList.add('selected');
		setPageTitle(pageName);
		
		
		swipe = new Swipe(document.getElementsByTagName('content')[0],{
			startSlide: activeTab,
			callback: function (index,article) {
				var tab = tabs[index]
				, i
				, url;
				
				for (i = 0; i < tabs.length; i++) {
					tabs[i].classList.remove('selected');
					articles[i].classList.remove('selected');
				}
				
				tab.classList.add('selected');
				article.classList.add('selected');
				
				url = tab.innerHTML.toLowerCase();
				
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
			setTimeout(initializeMusicPage,15000);
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
	
	// handles resizing the soundcloud iframe
	window.addEventListener('resize',resizePlayer,false);
	
	// handles clicks on the navbar
	nav.addEventListener('click',tabClickHandler,false);
	
	// Music next/prev buttons
	document.getElementById('prev_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum-1);
	}, false);
	
	document.getElementById('next_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum+1);
	}, false);
	
	// first page article links
	document.getElementById('choosy').addEventListener('click',choosyHandler,false);

	
}(document,window,window.Swipe));
