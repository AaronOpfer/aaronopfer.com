(function(){

	'use strict';
	var lis = document.querySelectorAll('header > ul > li')
	, pageName = window.location.href.match("/([a-z]+)$")
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
		var player = document.getElementById('soundcloud_player')
		
		player.src = albumEmbeds[index].uri;
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
		if (lis[i].children[0].innerHTML.toLowerCase() === pageName) {
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
		setTimeout(initializeMusicPage,7500);
	}
	
	document.getElementById('prev_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum-1);
	}, false);
	
	document.getElementById('next_album').addEventListener('click', function (e) {
		loadMusic(currentAlbum+1);
	}, false);
	
	lis[i].classList.add('selected');
	
	swipe = new Swipe(document.getElementsByTagName('content')[0],{
		startSlide: i,
		callback: function (index) {
			var li = lis[index]
			, i;
			
			for (i = 0; i < lis.length; i++) {
				lis[i].classList.remove('selected');
			}
			
			li.classList.add('selected');
			
			var url = li.children[0].innerHTML.toLowerCase();
			
			if (url === "music") {
				initializeMusicPage();
			}
			
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