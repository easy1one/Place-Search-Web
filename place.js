(function () {

/*********************************************************************************************************/
/*********************************************************************************************************/
// Get Current location

    var lat = 34.0093;
    var lon = -118.2584;

    var app = angular.module('SearchApp', ['ngAnimate', 'ngMap']);

    app.controller('currentCtrl', function($scope, $http) {

		$http.get("http://ip-api.com/json")
		.then(function(response) {
			lat = response.data.lat;
			lon = response.data.lon;
			$scope.current_lat = lat;
			$scope.current_lon = lon;
		});
    }); 


/*********************************************************************************************************/
/*********************************************************************************************************/
// Rating 

    app.directive("rateYo", function() {
        return {
            restrict: "E",
            scope: {
                rating: "="
            },
            template: "<div id='rateYo'></div>",
            link: function( scope, ele, attrs ) {
                $(ele).rateYo({
                    rating: scope.rating,
                    starWidth: "18px",      
                    ratedFill: "#F39C12",
                    readOnly: true          
                });
            }
        };
    });

/*********************************************************************************************************/
/*********************************************************************************************************/
// Auto Complete

	app.directive('googleplace', function() {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, model) {
				var options = {
					types: [],
					componentRestrictions: {}
				};
				scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
				google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
					scope.$apply(function() {
						model.$setViewValue(element.val());                
					});
				});
			}
		};
	}); 

	function SearchCtrl($scope) {
		$scope.gPlace;
	}

/*********************************************************************************************************/
/*********************************************************************************************************/
// Search Controller START :: Define Variables & Set Search input Variables

    app.controller('SearchCtrl', ['$scope', '$http', '$window', function ($scope, $http, $window, NgMap) {

		$scope.heading = 90;
		$scope.pitch = 0;
		$scope.map_mode_lowerCase = "Driving";

        $scope.title = "Travel and Entertainment Search";
        $scope.myTxt = "";
        $scope.keyword = "";
        $scope.from = "current";
        $scope.type = "Default";
        $scope.latitude = 0.0;
        $scope.longitude = 0.0;
        $scope.favorite_data = [];
        $scope.cur_favorite_data = [];
        $scope.favorite_album = [];
        $scope.cur_page_fav = 0;
        $scope.prevDetail_data = [];
        $scope.detail_album = [];

        $scope.cur_page = 0;
        $scope.next_page = "";
        $scope.searchPrevTable = [];
        $scope.visitedDetail = false;

		$scope.contentsResult = false;
		$scope.contentsFav = false;
        $scope.contentsPhoto = false;
		$scope.contentsGG = false;
		$scope.contentsYelp = true;

		$scope.activeResult = true;
        $scope.activeTAB = "";

		$scope.prevDetail_flag = false;

		$scope.wrapper_result_fav = true;
		$scope.wrapper_ALL = true;

		$scope.FAVORITE_DATA = "";


/*********************************************************************************************************/
/*********************************************************************************************************/
// Manage Page Btns

		$scope.pageBtnHandler = function() {

			if($scope.cur_page <= 0){
				$scope.showPrevBtn = false;
			}else {
				$scope.showPrevBtn = true;
			}
			if(typeof($scope.next_page) == "undefined" || $scope.next_page == ""){
				$scope.showNextBtn = false;
			}
			else{
				$scope.showNextBtn = true;
			}
		}

		$scope.prev = function(){

			$scope.cur_page = $scope.cur_page-1;
			$scope.LOADING = true;
			$scope.wrapper_ALL = false;

			prevSearch_url = "helloworld-198821.appspot.com/?";
			if($scope.cur_page == 0){
				prevSearch_url += 'keyword='+ $scope.keyword + "&type=" + $scope.type + "&location=" + $scope.location + "&radius=" + $scope.real_radius + "&from=" + $scope.from + "&func=nearby_func";            
			}else {
				prevSearch_url += 'page_token=' + $scope.searchPrevTable[$scope.cur_page] + "&func=next_func";
			}         
			$http({ method: 'GET', url: prevSearch_url, })
			.then(function successCallback(response) {

				$scope.LOADING = false;
				$scope.wrapper_ALL = true;

				$scope.data = response.data.results; // update the data list in serach table
				$scope.next_page = response.data.next_page_token; // update next_page token
				$scope.pageBtnHandler();

			}, function errorCallback(response) {
				// error
				$scope.wrapper_ALL = false;
				$scope.failMsg = true;
				alert("ERROR : Prev Page");
			});

			$scope.activeTable[0] = $scope.resultTAB;
			$scope.resultTAB = true;
			$scope.showSearchTable();
			
		}


		$scope.next = function(){

			$scope.LOADING = true;
			$scope.wrapper_ALL = false;

			$scope.cur_page = $scope.cur_page+1;
			$scope.searchPrevTable[$scope.cur_page] = $scope.next_page;
			nextSearch_url ='helloworld-198821.appspot.com/?page_token=' + $scope.next_page + "&func=next_func";            
			$http({ method: 'GET', url: nextSearch_url, })
			.then(function successCallback(response) {

				$scope.LOADING = false;
				$scope.wrapper_ALL = true;
				$scope.resultTAB = true;

				$scope.data = response.data.results; // update the list
				$scope.next_page = response.data.next_page_token; // update next_page token

				$scope.pageBtnHandler();

			}, function errorCallback(response) {
				// error
				$scope.wrapper_ALL = false;
				$scope.failMsg = true;
				alert("ERROR : Next Page");
			});

			$scope.showSearchTable();
			$scope.activeTable[0] = $scope.resultTAB;
		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// Nearby Search when ng-submit "Search" Button

        $scope.nearbySearch = function(keyword,type,radius,from,other_loc,func){

			$scope.LOADING = true;
			$scope.wrapper_ALL = false;

        	$scope.activePageTab = false;
       	 	$scope.activeFavoriteTab = false;
        	$scope.detailTAB = false;
	        $scope.data = [];
	        $scope.prevDetail_data = [];
	        $scope.cur_page = 0;
	        $scope.visitedDetail = false;

	        $scope.contentsResult = false;
	        $scope.contentsFav = false;

            $scope.keyword = keyword;
            $scope.type = type;
            $scope.func = func;
            if(radius == undefined){
                $scope.radius = 10;
                $scope.real_radius = 16090;
            }else {
                $scope.radius = radius;
                $scope.real_radius = radius*1609;
            }
             $scope.from = from;
             $scope.other_loc = other_loc;
             if($scope.from == "current") { // current location
                 $scope.location = lat + "," + lon;
             }else { // other location
                 $scope.location = $scope.other_loc;
            }

            search_url ='helloworld-198821.appspot.com/?keyword='+ keyword + "&type=" + type + "&location=" + $scope.location + "&radius=" + $scope.real_radius + "&from=" + $scope.from + "&func=" + $scope.func;            
            $http({ method: 'GET', url: search_url, })
            .then(function successCallback(response) {

                $scope.LOADING = false;
				$scope.wrapper_ALL = true;
                $scope.resultTAB = true;

                $scope.data = response.data.results; // get json data
                $scope.next_page = response.data.next_page_token;

                $scope.contentsResult = true;
                if($scope.data == undefined || $scope.data.length == 0){
					$scope.contentsResult = false;
                }

				$scope.pageBtnHandler();

            }, function errorCallback(response) {
            	// error
            	$scope.wrapper_ALL = false;
            	$scope.failMsg = true;
            	alert("nearbySearch Error");
            });

            $scope.showSearchTable();
            $scope.activeTable[0] = $scope.resultTAB;

        }// nearbySearch func

/*********************************************************************************************************/
/*********************************************************************************************************/
// Detail :: (1)Info (2)Photos (3)Map (4)Reviews

        $scope.detail = function(name, address, plcae_id, func){
			
			$scope.LOADING = true;
			$scope.wrapper_ALL = false;
			$scope.visitedDetail = true;
			$scope.detail_name = name;
			$scope.detail_icon = "";
			$scope.detail_address = address;
			$scope.detail_lat = "";
			$scope.detail_lon = "";
			$scope.detail_phoneNum = "";
			$scope.detail_price = 0;
			$scope.detail_priceLev = "";
			$scope.detail_rating = 0;
			$scope.detail_ggPage = "";
			$scope.detail_website = "";
			$scope.detail_openNow = "";
			$scope.detail_period = "";
			$scope.detail_weekday = "";
			$scope.detail_func = func;
			$scope.detail_id = plcae_id;
			$scope.lastPicked_placeId = plcae_id;
			$scope.detail_reviews = "";
			$scope.reviews_bucket_GG = [];
			$scope.reviews_bucket_yelp = [];
			$scope.reviews_bucket_GG_ori = [];
			$scope.reviews_bucket_yelp_ori = [];
			$scope.prevDetail_data = [];
			$scope.detail_album_1 = [];
			$scope.detail_album_2 = [];
			$scope.detail_album_3 = [];
			$scope.detail_album_4 = [];
			$scope.contentsPhoto = false;
			$scope.contentsGG = false;
			$scope.contentsYelp = true;
			$scope.infoToggle = true;

			detail_url = 'helloworld-198821.appspot.com/?place_id=' + $scope.detail_id + "&func=" + $scope.detail_func;
			$http({ method: 'GET', url: detail_url, })
			.then(function successCallback(response) {

				$scope.LOADING = false;
				$scope.wrapper_ALL = true;
				$scope.detail_data = response.data.result;
				$scope.detail_icon = $scope.detail_data.icon;
				$scope.detail_lat = $scope.detail_data.geometry.location.lat;
				$scope.detail_lon = $scope.detail_data.geometry.location.lng;
				if($scope.detail_lat == undefined || $scope.detail_lon == undefined){
					$scope.checkAddress = false;
				}else {
					$scope.checkAddress = true;
				}
				$scope.detail_phoneNum = $scope.detail_data.international_phone_number;
				if($scope.detail_phoneNum == undefined){
					$scope.checkPhoneNum = false;
				}else {
					$scope.checkPhoneNum = true;
				}

				if($scope.detail_data.price_level) {
					$scope.detail_price = $scope.detail_data.price_level;
					var tmp_dollar1 = "$";
					var tmp_dollar2 = "$$";
					var tmp_dollar3 = "$$$";
					var tmp_dollar4 = "$$$$";
					var tmp_dollar5 = "$$$$$";
					$scope.checkPrice = true;
					if($scope.detail_price == 1) {
						$scope.detail_priceLev = tmp_dollar1;
					}else if($scope.detail_price == 2) {
						$scope.detail_priceLev = tmp_dollar2;
					}else if($scope.detail_price == 3) {
						$scope.detail_priceLev = tmp_dollar3;
					}else if($scope.detail_price == 4) {
						$scope.detail_priceLev = tmp_dollar4;
					}else if($scope.detail_price == 5) {
						$scope.detail_priceLev = tmp_dollar5;
					}else {
						$scope.checkPrice = false;
					}
				}else{
					checkPrice = false;
				}
				
				$scope.detail_rating = $scope.detail_data.rating;
				if($scope.detail_rating == undefined){
					$scope.checkRating = false;
				}else {
					$scope.checkRating = true;
				}
				$scope.detail_rating_round = Math.round($scope.detail_rating);
				$scope.showRate($scope.detail_rating_round);
				$scope.detail_ggPage = $scope.detail_data.url;
				if($scope.detail_ggPage == undefined){
					$scope.checkGGpage = false;
				}else{
					$scope.checkGGpage = true;
				}
				$scope.detail_website = $scope.detail_data.website;
				if($scope.detail_website == undefined){
					$scope.checkWebpage = false;
				}else{
					$scope.checkWebpage = true;
				}


				// Manage Day for detail info
				if($scope.detail_data.opening_hours){
					$scope.detail_weekday = $scope.detail_data.opening_hours.weekday_text;
					$scope.detail_openHours_table = [];
					$scope.detail_dayOfweek_tag = ["Monday","Tuseday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
					$scope.detail_openHours_table_sorted = [];
					$scope.detail_dayOfweek_tag_sorted = [];
					var uctToLocal= moment().utc().utcOffset($scope.detail_data.utc_offset).format();
					var tmp_d = uctToLocal.split("T")[0];
					$scope.detail_cur_dayOfWeek = moment(tmp_d).format('d'); // Get day of week :: 0:Sun ~ 6:Sat
					// set to 0 to Monday
					if($scope.detail_cur_dayOfWeek == 0) { // sunday
						$scope.detail_cur_dayOfWeek = 6;
					}else {
						$scope.detail_cur_dayOfWeek = $scope.detail_cur_dayOfWeek-1;
					}

					for(var w = 0; w < 7; w++){
						var str = $scope.detail_weekday[w].indexOf(":");
						var openHour = $scope.detail_weekday[w].substring(str+1,$scope.detail_weekday[w].length);
						if(openHour == undefined || openHour.length == 0 || openHour == "") openHour = "Closed";
						$scope.detail_openHours_table[w] = openHour;
					}
					// SORT the openHours_table & dayOfweek_tag
					for(var w_ = 0; w_ < 7; w_++) {
						$scope.detail_openHours_table_sorted[w_] = $scope.detail_openHours_table[(w_+$scope.detail_cur_dayOfWeek)%7];
						$scope.detail_dayOfweek_tag_sorted[w_] = $scope.detail_dayOfweek_tag[(w_+$scope.detail_cur_dayOfWeek)%7];
					}

					if($scope.detail_data.opening_hours.open_now == undefined){
						$scope.checkOpen = false;
					}else {
						$scope.checkOpen = true;
					}

					if($scope.detail_data.opening_hours.open_now){
						$scope.detail_openNow = "Open now: " + $scope.detail_openHours_table_sorted[0];
					}else {
						$scope.detail_openNow = "Closed. ";
					}
				}else{
					$scope.checkOpen = false;
				}

				var d_photo = new google.maps.Map(document.getElementById('keyword'), {
				    center: {lat: $scope.detail_lat, lng: $scope.detail_lon},
				    zoom: 13
				});
				var service = new google.maps.places.PlacesService(d_photo);

				service.getDetails({placeId: $scope.detail_id}, function(place, status){
				    if (status == google.maps.places.PlacesServiceStatus.OK){

				    	for (p = 0; p < place.photos.length; p++){    
                            var photo = place.photos[p].getUrl({'maxWidth': place.photos[0].width, 'maxHeight': place.photos[0].hight});
                            var row_idx = p%4;
                            var col_idx = Math.floor(p/4);
                            if (row_idx == 0)
                                $scope.detail_album_1[col_idx] = photo;
                            else if (row_idx == 1)
                                $scope.detail_album_2[col_idx] = photo;
                            else if (row_idx == 2)
                                $scope.detail_album_3[col_idx] = photo;
                            else if (row_idx == 3)
                                $scope.detail_album_4[col_idx] = photo; 
                        }

                        if($scope.detail_album_1) {
                        	$scope.contentsPhoto = true;
                        }else{
                        	$scope.contentsPhoto = false;
                        }

				    }else{
				    	$scope.wrapper_ALL = false;
				    	$scope.failMsg = true;
				        alert("ERROR: Detail Album");
				    }

				});


				// reviews_bucket_GG = [0:author_url, 1:profile_photo_url, 2:author_name, 3:rating, 4:time_converted, 5:text, 6:time_raw]
				$scope.detail_reviews = $scope.detail_data.reviews;

				$scope.reviews_bucket_GG = [];
				for(var r = 0; r < $scope.detail_reviews.length; r++) {
					$scope.contentsGG = true;
					var rev = [];
					rev.push($scope.detail_reviews[r].author_url);
					rev.push($scope.detail_reviews[r].profile_photo_url);
					rev.push($scope.detail_reviews[r].author_name);
					rev.push($scope.detail_reviews[r].rating);
					rev.push($scope.convertTime($scope.detail_reviews[r].time));
					rev.push($scope.detail_reviews[r].text);
					rev.push($scope.detail_reviews[r].time);

					$scope.reviews_bucket_GG.push(rev);
				}
				$scope.reviews_bucket_GG_ori = angular.copy($scope.reviews_bucket_GG);

				// for yelp
				if($scope.detail_phoneNum){
					$scope.detail_yelp_phoneNum = $scope.detail_phoneNum.replace(/[^+\d]+/g, "");
					var address_arr = $scope.detail_data.formatted_address.split(',');
					$scope.detail_address1 = address_arr[0];
					$scope.detail_address_components = $scope.detail_data.address_components;
					for(var j = 0; j < $scope.detail_address_components.length; j++){
						var address_type = $scope.detail_address_components[j].types[0];
						if(address_type == "country") {
							$scope.detail_country = $scope.detail_address_components[j].short_name;
						}else if(address_type == "administrative_area_level_1"){
							$scope.detail_state = $scope.detail_address_components[j].short_name;
						}else if(address_type == "locality"){
							$scope.detail_city = $scope.detail_address_components[j].short_name;
						}else if(address_type == "postal_code"){
							$scope.detail_postal_code = $scope.detail_address_components[j].short_name;
						}
					}
				}else{
					checkPhoneNum = false;
				}

			}, function errorCallback(response) {
				// error
				$scope.wrapper_ALL = false;
				$scope.failMsg = true;
				alert("Detail ERROR");
			});

			// UPDATE prev detail info
			$scope.prevDetail_data = [$scope.detail_name,
									$scope.detail_address,
									$scope.detail_id,
									$scope.detail_func];

			$scope.showDetail();

    	}


    	$scope.prevDetail = function() {
    		$scope.visitedDetail = true;
    		$scope.prevDetail_flag = true;
    		$scope.wrapper_result_fav = false;
			$scope.detail($scope.prevDetail_data[0], $scope.prevDetail_data[1], $scope.prevDetail_data[2], $scope.prevDetail_data[3]);
		}


		$scope.show = function(tabType) {

			if(tabType=="info")		$scope.showInfo();
			if(tabType=="photo")	$scope.showPhoto();
			if(tabType=="map")		$scope.setMap();
			if(tabType=="review")	$scope.showReview();

		}


    	$scope.showDetail = function(){

			$scope.resultTAB = false;
			$scope.detailTAB = true;
			$scope.favoriteTAB = false;

			$scope.infoTAB = true;
			$scope.photoTAB = false;
			$scope.mapTAB = false;
			$scope.reviewTAB = false;
			$scope.infoToggle = "active";

		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// Favorite 

		$scope.showFavorites = function() {

			$scope.favorite_data = $scope.getToLocalStorage();
			$scope.updateFavAlbum();

			$scope.activeTAB = "favorites";
			$scope.activeResult = false;

			$scope.wrapper_result_fav = true;
			$scope.resultTAB = false;
			$scope.favoriteTAB = true;
			$scope.detailTAB = false;

			$scope.infoTAB = false;
			$scope.photoTAB = false;
			$scope.mapTAB = false;
			$scope.reviewTAB = false;

			if($scope.cur_favorite_data == undefined || $scope.cur_favorite_data.length < 1){
				$scope.contentsFav = false;
			}else {
				$scope.contentsFav = true;
			}
		}


		$scope.pageBtnHandler_Fav = function() {
			if($scope.cur_page_fav == 0){
				$scope.showPrevBtn_fav = false;
			}else{
				$scope.showPrevBtn_fav = true;
			}

			if($scope.cur_page_fav*20+20 >= $scope.favorite_data.length){
				$scope.showNextBtn_fav = false;
			}else{
				$scope.showNextBtn_fav = true;
			}
		}

		$scope.prev_fav = function() {
			$scope.cur_page_fav = $scope.cur_page_fav - 1;
			$scope.cur_favorite_data = $scope.favorite_album[$scope.cur_page_fav];
			$scope.pageBtnHandler_Fav();
		}

		$scope.next_fav = function() {
			$scope.cur_page_fav = $scope.cur_page_fav + 1;
			$scope.cur_favorite_data = $scope.favorite_album[$scope.cur_page_fav];
			$scope.pageBtnHandler_Fav();
		}

		$scope.updateFavAlbum = function() {
			// update album :: $scope.favorite_album
			$scope.favorite_data = $scope.getToLocalStorage();
			var e;
			var f_idx=0;
			for(var f=0; f<$scope.favorite_data.length; f+=20){
				e = f + 20;
				if(e  > $scope.favorite_data.length){
					e = $scope.favorite_data.length;
				}
				$scope.favorite_album[f_idx]= $scope.favorite_data.slice(f, e);
				f_idx ++;
			}
			$scope.cur_favorite_data = $scope.favorite_album[$scope.cur_page_fav];
			$scope.pageBtnHandler_Fav();
		}


		$scope.saveFavorite = function(icon, name, address, plcae_id){
			$scope.favorite_album = [];

			$scope.favorite_data.push([icon, name, address, plcae_id]);
			$scope.saveToLocalStorage($scope.favorite_data);

			$scope.updateFavAlbum();
		}


		$scope.deleteFavorite = function(place_id){
			$scope.favorite_album = [];

			$scope.favorite_data = $scope.getToLocalStorage();

			var idx = $scope.favorite_data.findIndex( function (item) {
				return item[3] === place_id;
			})

			if (idx > -1) {
				$scope.favorite_data.splice(idx, 1);
				$scope.saveToLocalStorage($scope.favorite_data);
			}

			if($scope.favorite_data == undefined || $scope.favorite_data.length < 1){
				$scope.contentsFav = false;
			}else {
				$scope.contentsFav = true;
			}

			$scope.updateFavAlbum();
		}


		$scope.checkFavorite = function(place_id){

			var idx = $scope.favorite_data.findIndex( function (item) {
				return item[3] === place_id;
			})
			if (idx > -1)
				return true;
			else
				return false;
		}

		$scope.saveToLocalStorage = function(data){
	      localStorage.setItem($scope.FAVORITE_DATA, JSON.stringify(data));
	    }

	    $scope.getToLocalStorage = function(){
	      return JSON.parse(localStorage.getItem($scope.FAVORITE_DATA)) || [];
	    }

/*********************************************************************************************************/
/*********************************************************************************************************/
// Twitter

		$scope.twitterOpen = function() {

			var cur_website = "";
			if($scope.detail_website == undefined || $scope.detail_website == "") {
				cur_website = $scope.detail_ggPage;
			}else { 
				cur_website = $scope.detail_website;
			}
			var tiwtter_url = "https://twitter.com/intent/tweet?";
			var twitter_text = "text=Check out " + $scope.detail_name + " located at " + $scope.detail_address + ". Website: &url=" + cur_website + "&hashtags=TravelAndEntertainmentSearch";
			$window.open(tiwtter_url + twitter_text, "_blank", "resizable=1,top=500,left=500,width=400,height=400");
		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// (1) Manage Info information. 

		$scope.showInfo = function() {

			$scope.favoriteTAB = false;
			$scope.infoTAB = true;
			$scope.photoTAB = false;
			$scope.mapTAB = false;
			$scope.reviewTAB = false;
		}

		$scope.showRate = function(numRate) {

			$scope.detail_rate1 = false;
			$scope.detail_rate2 = false;
			$scope.detail_rate3 = false;
			$scope.detail_rate4 = false;
			$scope.detail_rate5 = false;

			if(numRate == 1 || numRate == "1") $scope.detail_rate1 = true;
			if(numRate == 2 || numRate == "2") $scope.detail_rate2 = true;
			if(numRate == 3 || numRate == "3") $scope.detail_rate3 = true;
			if(numRate == 4 || numRate == "4") $scope.detail_rate4 = true;
			if(numRate == 5 || numRate == "5") $scope.detail_rate5 = true;
		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// (2) Manage Photos information. 

		$scope.showPhoto = function() {

			$scope.favoriteTAB = false;
			$scope.infoTAB = false;
			$scope.mapTAB = false;
			$scope.photoTAB = true;
			$scope.reviewTAB = false;

		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// (3) Manage Map information.

		$scope.setMap = function() {
			$scope.mapTAB = true;

			if($scope.from == "current"){
				$scope.map_from = "Your location";
			}else {
				$scope.map_from = $scope.other_loc;
			}

			$scope.map_mode_lowerCase = "Driving";
			$scope.map_mode = "DRIVING";
			$scope.favoriteTAB = false;
			$scope.infoTAB = false;
			$scope.photoTAB = false;
			$scope.reviewTAB = false;
			$scope.show_map = true;
			$scope.show_street = false;
			$scope.mar = true;
			$scope.dir = false;
			$scope.pic_map = false;
			$scope.pic_man = true;
			
		}

		$scope.showStreetView = function(){

			$scope.show_street = true;
			$scope.show_map = false;
			$scope.pic_map = true;
			$scope.pic_man = false;
			
		}

		$scope.showMapView = function(){

			$scope.show_street = false;
			$scope.show_map = true;
			$scope.pic_map = false;
			$scope.pic_man = true;
			
		}

		$scope.getDirection = function() {

			$scope.mapTAB = true;
			if($scope.map_mode_lowerCase == "Driving") $scope.map_mode = "DRIVING";
			if($scope.map_mode_lowerCase == "Bicycling") $scope.map_mode = "BICYCLING";
			if($scope.map_mode_lowerCase == "Transit") $scope.map_mode = "TRANSIT";
			if($scope.map_mode_lowerCase == "Walking") $scope.map_mode = "WALKING";
			$scope.show_map = true;
			$scope.show_street = false;
			$scope.dir = true;
			$scope.mar = false;

			if($scope.map_from == "Your location" || $scope.map_from == "my location" || $scope.map_from == "My location"){
				$scope.map_location_from = $scope.location;
			}else{
				$scope.map_location_from = $scope.map_from;
			}
			
		}

		$scope.dirChange = function(from){
            var re = new RegExp("[^\s]+");
            if (re.test(from))
                return false;
            else
                return true;

        }

		$scope.invalidMapFrom = function(){
			if($scope.mapForm.map_from.$invalid){
				return true;
			}
			return false;
		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// (4) Manage Review information. 

		$scope.getYelpReview = function(){

			$scope.LOADING = true;
			$scope.wrapper_ALL = false;
			yelpSearch_url ='helloworld-198821.appspot.com/?name=' + $scope.detail_name + "&latitude=" + $scope.detail_lat + "&longitude=" + $scope.detail_lon;
			yelpSearch_url += "&city=" + $scope.detail_city + "&state=" + $scope.detail_state + "&country=" + $scope.detail_country + "&postal_code=" + $scope.detail_postal_code + "&address1=" + $scope.detail_address1;
			yelpSearch_url += "&phone_num=" + $scope.detail_yelp_phoneNum + "&func=yelp_func";
			$http({ method: 'GET', url: yelpSearch_url, })
			.then(function successCallback(response) {

				$scope.LOADING = false;
				$scope.wrapper_ALL = true;
				
				$scope.yelp_reviews = response.data.reviews;

				if($scope.yelp_reviews == undefined || $scope.yelp_reviews.length == 0){
					$scope.contentsYelp = false;
				}
				
				//reviews_bucket_yelp = [0:url, 1:user.image_url, 2:user.name, 3:rating, 4:time_created, 5:text, 6:time_raw]
				$scope.reviews_bucket_yelp = [];
				for(var r_ = 0; r_ < $scope.yelp_reviews.length; r_++) {
					var rev_ = [];
					rev_.push($scope.yelp_reviews[r_].url);
					rev_.push($scope.yelp_reviews[r_].user.image_url);
					rev_.push($scope.yelp_reviews[r_].user.name);
					rev_.push($scope.yelp_reviews[r_].rating);
					rev_.push($scope.yelp_reviews[r_].time_created);
					rev_.push($scope.yelp_reviews[r_].text);
					var time_raw = $scope.yelp_reviews[r_].time_created.split(" ").join("").split("-").join("").split(":").join(""); 
					rev_.push(time_raw);
					$scope.reviews_bucket_yelp.push(rev_);
				}
				$scope.reviews_bucket_yelp_ori = angular.copy($scope.reviews_bucket_yelp);

			}, function errorCallback(response) {
				// error
				$scope.wrapper_ALL = false;
				$scope.failMsg = true;
				alert("ERROR : Yelp Review Page");
			});

		}

		$scope.showReview = function() {

			$scope.getYelpReview();
			$scope.reviewTAB = true;
			$scope.favoriteTAB = false;
			$scope.infoTAB = false;
			$scope.photoTAB = false;
			$scope.mapTAB = false;
			$scope.showGGreviews();

		}

		$scope.showGGreviews = function() {

			$scope.reviewTAB = true;
			$scope.cur_review = "Google Reviews";
			$scope.cur_ordering = "Default Order";
			$scope.yelpTAB = false;
			$scope.ggTAB = true;
			
		}

		$scope.showYelpreviews = function() {

			$scope.reviewTAB = true;
			$scope.cur_review = "Yelp Reviews";
			$scope.cur_ordering = "Default Order";
			$scope.ggTAB = false;
			$scope.yelpTAB = true;
		}


		$scope.convertTime = function(time) {

			return moment(time*1000).format("YYYY-MM-DD HH:mm:ss");
		}

		$scope.showReviewRate = function(reviewRate) {

			$scope.review_rate1 = false;
			$scope.review_rate2 = false;
			$scope.review_rate3 = false;
			$scope.review_rate4 = false;
			$scope.review_rate5 = false;

			if(reviewRate == 1 || reviewRate == "1") $scope.review_rate1 = true;
			else if(reviewRate == 2 || reviewRate == "2") $scope.review_rate2 = true;
			else if(reviewRate == 3 || reviewRate == "3") $scope.review_rate3 = true;
			else if(reviewRate == 4 || reviewRate == "4") $scope.review_rate4 = true;
			else if(reviewRate == 5 || reviewRate == "5") $scope.review_rate5 = true;
		}

		$scope.showDefaultOrder = function(){

			$scope.cur_ordering = "Default Order";
			if($scope.cur_review == "Google Reviews"){// google
				$scope.reviews_bucket_GG = angular.copy($scope.reviews_bucket_GG_ori);
			}else {// yelp
				$scope.cur_review = "Yelp Reviews";
				$scope.reviews_bucket_yelp = angular.copy($scope.reviews_bucket_yelp_ori);
			}
		}

		$scope.showHighestRating = function(){

			$scope.cur_ordering = "Highest Rating";
			if($scope.cur_review == "Google Reviews"){// google
				$scope.reviews_bucket_GG.sort(function(a,b){
					return b[3] - a[3];
				});
			}else {// yelp
				$scope.cur_review = "Yelp Reviews";
				$scope.reviews_bucket_yelp.sort(function(a,b){
                    return b[3] - a[3];
				});
			}
		}

		$scope.showLowestRating = function(){

			$scope.cur_ordering = "Lowest Rating";
			if($scope.cur_review == "Google Reviews"){// google
				$scope.reviews_bucket_GG.sort(function(a,b){
					return a[3] - b[3];
				});
			}else {// yelp
				$scope.cur_review = "Yelp Reviews";
				$scope.reviews_bucket_yelp.sort(function(a,b){
                    return a[3] - b[3];
				});
			}
		}

		$scope.showMost = function(){

			$scope.cur_ordering = "Most Recent";
			if($scope.cur_review == "Google Reviews"){// google
				$scope.reviews_bucket_GG.sort(function(a,b){
					return b[6] - a[6];
				});
			}else {// yelp
				$scope.cur_review = "Yelp Reviews";
				$scope.reviews_bucket_yelp.sort(function(a,b){
                    return b[6] - a[6];
                });
			}
		}

		$scope.showLeast = function(){

			$scope.cur_ordering = "Least Recent";
			if($scope.cur_review == "Google Reviews"){// google
				$scope.reviews_bucket_GG.sort(function(a,b){
					return a[6] - b[6];
				});
			}else {// yelp
				$scope.cur_review = "Yelp Reviews";
				$scope.reviews_bucket_yelp.sort(function(a,b){
                    return a[6] - b[6];
                });
			}
		}

/*********************************************************************************************************/
/*********************************************************************************************************/
// Search Form requirements

		$scope.showActiveTAB = function() {
			$scope.prevDetail_flag = false;
			$scope.wrapper_result_fav = true;

			if($scope.activeTAB == "searchTable"){
				$scope.showSearchTable();
			}else {
				$scope.showFavorites();
			}
		}

		$scope.activeFrom = function(flag) {

			if(flag == 0) { // USE current loc
				$scope.activeOtherLoc = false;
				$scope.myForm.other_loc.$touched = false;
				$scope.other_loc = "";
			}
			else{ // USC othre loc
				$scope.activeOtherLoc = true;
			}
		}

		$scope.showSearchTable = function(){

			$scope.activeTAB = "searchTable";
			$scope.activeResult = true;

			$scope.detailTAB = false;
			$scope.favoriteTAB = false;

			if($scope.LOADING == true)
				$scope.resultTAB = false;
			else 
				$scope.resultTAB = true;

			$scope.infoTAB = false;
			$scope.photoTAB = false;
			$scope.mapTAB = false;
			$scope.reviewTAB = false;
		}

		$scope.keyValid = function() {

			 if ($scope.myForm.keyword.$touched && $scope.myForm.keyword.$invalid){
                $scope.keyword_style = {'border-color':'red'};
                return true;
            }
            else{
                $scope.keyword_style = {'border-color':'none'};
                return false;
            }
		}

		$scope.locationValid = function(){

            if ($scope.myForm.other_loc.$touched && $scope.myForm.other_loc.$invalid){
                $scope.other_loc_style = {'border-color':'red'};
                return true;
            }
            else{
                $scope.other_loc_style = {'border-color':'none'};
                return false;
            }
        }


        $scope.submitValid = function(){

            if ($scope.from == "current"){
                if ($scope.myForm.keyword.$invalid)
                    return true;
                else
                    return false;
            }
            else{
                if($scope.myForm.other_loc.$invalid || $scope.myForm.keyword.$invalid)
                    return true;
                else
                    return false;
            }
        }

/*********************************************************************************************************/
/*********************************************************************************************************/
// Clean up the Page

		$scope.clear = function(){

			$scope.data = [];
			$scope.favorite_data = [];
			$scope.detail_album = [];
			$scope.detail_album_1 = [];
			$scope.detail_album_2 = [];
			$scope.detail_album_3 = [];
			$scope.detail_album_4 = [];
			$scope.LOADING = false;
			$scope.wrapper_ALL = true; 
			$scope.resultTAB = false;
			$scope.detailTAB = false;
			$scope.favoriteTAB = false;
			$scope.infoTAB = false;
			$scope.photoTAB = false;
			$scope.mapTAB = false;
			$scope.reviewTAB = false;
			$scope.contentsResult = false;
			$scope.contentsFav = false;
			$scope.contentsPhoto = false;
			$scope.contentsGG = false;
			$scope.contentsYelp = true;
			$scope.func = "";
			$scope.from = "current";
        	$scope.type = "Default";
			$scope.radius = 10;
			$scope.cur_page = 0;
			$scope.next_page = "";
			$scope.visitedDetail = false;
			$scope.activeResult = true;
			$scope.activeOtherLoc = false;
			$scope.other_loc = "";
			$scope.keyword = "";
			$scope.myForm.keyword.$touched = false;
			$scope.myForm.other_loc.$touched = false;
			$scope.lastPicked_placeId = "";

		}
    }]); 
})();