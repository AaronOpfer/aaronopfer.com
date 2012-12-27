(function(){
	'use strict';
	
	//------------------------------------------------------------------------
	// GLOBAL VARS
	//------------------------------------------------------------------------

	var tabs = document.querySelectorAll('header > ul > a')
	, articles = document.querySelectorAll('content > div > article')
	, pageName = window.location.href.match("/([a-z]+)$")
	, swipeWrap = document.getElementById('swipe-wrap')
	, musicTab = document.getElementById('music_tab')
	, oldHeight = 0
	, playerIframe = null
	, i
	, activeTab = null
	, swipe
	, currentAlbum
	// data for embedding iframes
	, albumEmbeds = [
		{
			name: "Bipolar",
			uri: "2688032"
		},
		{
			name: "Foot In The Door",
			uri: "2688050"
		},
		{
			name: "Oldies But Goodies",
			uri: "3102627"
		}
	]
	, musicPageInitialized = false
	
	//------------------------------------------------------------------------
	// FUNCTIONS
	//------------------------------------------------------------------------
	
	, loadMusic = function(index) {
		if (index < 0 || index >= albumEmbeds.length) {
			return;
		}
	
		var url = "https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F" + albumEmbeds[index].uri + "&amp;color=30b0e8&amp;auto_play=false&amp;show_artwork=true";

		if (playerIframe === null) {
			playerIframe = document.createElement('iframe');
			playerIframe.setAttribute('width','100%');
			playerIframe.setAttribute('height','350');
			playerIframe.setAttribute('scrolling','no');
			playerIframe.src = url;
			document.getElementById('soundcloud_player').appendChild(playerIframe);
			
			// facebook javascript
			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
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
		
		loadMusic(0);
	}
	
	, setPageTitle = function (pageName) {
		document.title = "Aaron Opfer - "+pageName[0].toUpperCase() + pageName.slice(1);
	}
	
	, resizePlayer = function (evt) {
		if (playerIframe === null) {
			return;
		}
		// we find the tallest tab that isn't the music tab (which we assume is the last tab)
		var tallestHeight=0,tallest,element;
		for (element = tallest = musicTab.previousSibling; element; element = element.previousSibling) {
			if (element.scrollHeight > tallestHeight) {
				tallestHeight = element.scrollHeight;
				tallest = element;
			}
		}
		
		// ... and make the music player match its height
		if (tallest.offsetHeight !== oldHeight) {
			oldHeight = tallest.offsetHeight;
			
			var newHeight = tallest.offsetHeight - (musicTab.scrollHeight - playerIframe.scrollHeight);
			// the player must be at least 280px
			newHeight = Math.max(newHeight,280);
			
			playerIframe.style.height = newHeight + "px";
		}
	}
	
	//------------------------------------------------------------------------
	// INITIALIZATION
	//------------------------------------------------------------------------
	
	// installs handler, handles resizing the soundcloud iframe
	window.addEventListener('resize',resizePlayer,false);
	
	// fallback to home if we can't find the pagename
	if (pageName === null) {
		pageName = "home";
	} else {
		pageName = pageName[1];
	}

	// install event listeners on the tabs
	for (i = 0; i < tabs.length; i++) {
		if (activeTab === null && tabs[i].innerHTML.toLowerCase() === pageName) {
			activeTab = i;
		}
	
		(function (i){
			tabs[i].addEventListener('click',function(e){
				if (e.which !== 1) {
					return;
				}
				e.preventDefault();
				swipe.slide(i,200);
			},false);
		}(i));
	}
	
	// default to the first tab
	if (activeTab === null) {
		activeTab = 0;
	}
	
	document.getElementById('prev_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum-1);
	}, false);
	
	document.getElementById('next_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum+1);
	}, false);
	
	window.addEventListener('popstate',function (e) {
		if (e.state === null) {
			return;
		}
		swipe.slide(e.state.index,55);
	},false);
	
	tabs[activeTab].classList.add('selected');
	articles[activeTab].classList.add('selected');
	setPageTitle(pageName);
	
	
	swipe = new Swipe(document.getElementsByTagName('content')[0],{
		startSlide: activeTab,
		callback: function (index,ele) {
			var li = tabs[index]
			, i;
			
			for (i = 0; i < tabs.length; i++) {
				tabs[i].classList.remove('selected');
				articles[i].classList.remove('selected');
			}
			
			li.classList.add('selected');
			ele.classList.add('selected');
			
			var url = li.innerHTML.toLowerCase();
			
			if (url === "music") {
				initializeMusicPage();
			}
			
			setPageTitle(url);
			
			if (index == 0) {
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
		var music_btn = document.getElementById('music_btn');
		
		music_btn.addEventListener('mouseover',initializeMusicPage,false);
		setTimeout(initializeMusicPage,15000);
	}
	
}());