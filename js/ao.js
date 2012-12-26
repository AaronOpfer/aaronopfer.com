(function(){
	'use strict';

	var lis = document.querySelectorAll('header > ul > li')
	, articles = document.querySelectorAll('content > div > article')
	, pageName = window.location.href.match("/([a-z]+)$")
	, playerIframe = null
	, i
	, swipe
	, currentAlbum
	, albumEmbeds = [
		{
			name: "Bipolar",
			uri: "https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F2688032&amp;color=30b0e8&amp;auto_play=false&amp;show_artwork=true"
		},
		{
			name: "Foot In The Door",
			uri: "https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F2688050&amp;color=30b0e8&amp;auto_play=false&amp;show_artwork=true"
		}
	]
	, musicPageInitialized = false
	
	, loadMusic = function(index) {
		if (playerIframe === null) {
			playerIframe = document.createElement('iframe');
			playerIframe.setAttribute('width','100%');
			playerIframe.setAttribute('height','350');
			playerIframe.setAttribute('scrolling','no');
			playerIframe.setAttribute('frameborder','no');
			playerIframe.src = albumEmbeds[index].uri;
			document.getElementById('soundcloud_player').appendChild(playerIframe);
		} else {
			//http://www.ozzu.com/programming-forum/ignoring-iframes-with-javascript-history-t67189.html
			playerIframe.contentWindow.location.replace(albumEmbeds[index].uri);
		}
		
		currentAlbum = index;
		
		if (index === 0) {
			document.body.classList.remove('last_album');
			document.body.classList.add('first_album');
		} else if (index === albumEmbeds.length-1) {
			document.body.classList.add('last_album');
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
		
		console.log(document.title);
	}

	for (i = 0; i < lis.length; i++) {
		(function (i){
			lis[i].addEventListener('click',function(e){
				if (e.which !== 1) {
					return;
				}
				swipe.slide(i,200);
			},false);
		}(i));
	}
	
	
	if (pageName === null) {
		pageName = "home";
	} else {
		pageName = pageName[1];
	}
	
	for (i = 0; i < lis.length; i++) {
		if (lis[i].innerHTML.toLowerCase() === pageName) {
			break;
		}
	}
	
	if (i === lis.length) {
		i = 0;
	}
	
	
	
	if (pageName === "music") {
		initializeMusicPage();
	} else {
		// Set up handlers to initialize music page when we predict the user 
		// will go to them soon.
		var music_btn = document.getElementById('music_btn');
		
		music_btn.addEventListener('mouseover',initializeMusicPage,false);
		setTimeout(initializeMusicPage,15000);
	}
	
	document.getElementById('prev_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum-1);
	}, false);
	
	document.getElementById('next_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum+1);
	}, false);
	
	lis[i].classList.add('selected');
	articles[i].classList.add('selected');
	setPageTitle(pageName);
	
	swipe = new Swipe(document.getElementsByTagName('content')[0],{
		startSlide: i,
		callback: function (index,ele) {
			var li = lis[index]
			, i;
			
			for (i = 0; i < lis.length; i++) {
				lis[i].classList.remove('selected');
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
					history.pushState({index:index},false,url);
				}
			}
		}
	});
	
	window.addEventListener('popstate',function (e) {
		if (e.state === null) {
			return;
		}
		swipe.slide(e.state.index,55);
	},false);
}());