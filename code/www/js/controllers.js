angular.module('songhop.controllers', ['ionic', 'songhop.services'])

/*
Controller for the discover page
*/
.controller('DiscoverCtrl',['$scope', '$timeout','User','Recommendations','$ionicLoading', function($scope,$timeout, User, Recommendations, $ionicLoading) {
	
	var showLoading = function(){
		$ionicLoading.show({
			template: '<i class="ion-loading-c"></i>',
			noBackdrop: true
		});
	}

	var hideLoading = function(){
		$ionicLoading.hide();
	}

	showLoading();

	Recommendations.init()
	.then(function(){
		$scope.currentSong = Recommendations.queue[0];
		Recommendations.playCurrentSong();
	}).then(function(){
		hideLoading();
		$scope.currentSong.loaded = true;
	});

	$scope.songs = [
	{
		"title":"Stealing Cinderella",
		"artist":"Chuck Wicks",
		"image_small":"https://i.scdn.co/image/d1f58701179fe768cff26a77a46c56f291343d68",
		"image_large":"https://i.scdn.co/image/9ce5ea93acd3048312978d1eb5f6d297ff93375d"
	},
	{
		"title":"Venom - Original Mix",
		"artist":"Ziggy",
		"image_small":"https://i.scdn.co/image/1a4ba26961c4606c316e10d5d3d20b736e3e7d27",
		"image_large":"https://i.scdn.co/image/91a396948e8fc2cf170c781c93dd08b866812f3a"
	},
	{
		"title":"Do It",
		"artist":"Rootkit",
		"image_small":"https://i.scdn.co/image/398df9a33a6019c0e95e3be05fbaf19be0e91138",
		"image_large":"https://i.scdn.co/image/4e47ee3f6214fabbbed2092a21e62ee2a830058a"
	}
	];
	$scope.sendFeedback = function (bool) {
		if(bool)
			User.addSongToFavorites($scope.currentSong);
		$scope.currentSong.rated = bool;
		$scope.currentSong.hide = true;

		Recommendations.nextSong();

		$timeout(function(){
			$scope.currentSong = Recommendations.queue[0];
			$scope.currentSong.loaded = false;
		}, 250);

		Recommendations.playCurrentSong().then(function(){
			$scope.currentSong.loaded = true;
		});

	}

	$scope.nextAlbumImg = function(){
		if(Recommendations.queue.length > 1){
			return Recommendations.queue[1].image_large;
		}
		return '';
	}
}])
/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', ['$scope', 'User','$window', function($scope, User, $window) {
	$scope.favorites = User.favorites;

	$scope.removeSong = function(song, index){
		User.removeSongFromFavorites(song, index);
	};

	$scope.openSong = function(song){
		$window.open(song.open_url, "_system");
	};

	$scope.username = User.username;
}])

/*
Controller for our tab bar
*/
.controller('TabsCtrl', ['$scope', 'User', 'Recommendations','$state','$window', function($scope, User, Recommendations, $state, $window) {

	$scope.logout = function(){
		User.destroySession();
		$window.location.href = 'index.html';
	}

	$scope.favCount = User.favoriteCount;

	$scope.enteringFavorites = function(){
		User.newFavorites = 0;
		Recommendations.haltAudio();
	}

	$scope.leavingFavorites = function(){
		Recommendations.init();
	}

}])

.controller('SplashCtrl', function($scope, User, $state, $cordovaOauth) {

	$scope.login = function() {
        $cordovaOauth.facebook("749305931863439", ["email", "read_stream", "user_website", "user_location", "user_relationships"]).then(function(result) {
            console.log(JSON.Stringify(result));
        }, function(error) {
            alert("There was a problem signing in!  See the console for logs");
            console.log(error);
        });
    };

	$scope.submitForm = function(username, signingUp){
		User.auth(username, signingUp).then(function(){
			$state.go('tab.discover');
		},function(){
			alert('Hmm... try another username');
		});
	}
});