<?php

    header ("Access-Control-Allow-Origin: *");


    $nearby_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    $nearby_token ="AIzaSyD6uUsUydi_QiZ6Vo_h78st-25JXOzpbYA";

    $googleGeo_url = "https://maps.googleapis.com/maps/api/geocode/json?";
    $googleGeo_token = "AIzaSyBUF49hGvXdf3hVcdFc7u3BUZNnO6-Y-gM";

    $detail_url = "https://maps.googleapis.com/maps/api/place/details/json?";
    $detail_token = "AIzaSyAwqkK1KaTy6hXCaqAByAnWepG4Qz1CcxM";

    $photo_url = "https://maps.googleapis.com/maps/api/place/photo?";
    $photo_token = "AIzaSyAHN7A4lAgrfHi5bpTybDB71gDG_g69qNc";

    $next_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    $next_token = "AIzaSyAZ9x16YjZYsTBCQU8HzK3flDLGAaD5uTg";

    $yelp_bestMatch_url = "https://api.yelp.com/v3/businesses/matches/best?";
    $yelp_lookup_url = "https://api.yelp.com/v3/businesses/matches/lookup?";
    $yelp_businessID_url = "https://api.yelp.com/v3/businesses/";
    $yelp_token = "DtMWP4bXgrccawR5jPkCtFNLuPsbPGvRFRpeHRG-kh8RvdsADsOnJU4oP-0l7QM_pPkBFM8F4guvwPP-20EDRxX9Du_npblXtZZQTzQHQIq8OtyU3Ze--Nt-T5HAWnYx";

    //header('Content-Type: application/json');
    if (isset($_GET)){
        // For location
        if(isset($_GET["func"])){ 
            if($_GET["func"] == "nearby_func"){// 1.nearby func
                if (isset($_GET["from"])){
                    if($_GET["from"] == "current"){// 1-1. current location
                        $nearby_url .= 'location=' . $_GET['location'] . '&radius=' . $_GET['radius'] . '&type=' . $_GET['type'] . '&keyword=' . $_GET['keyword'] . '&key=' . $nearby_token;
                    }
                    else{// 1-2. other location
                        if(isset($_GET["location"])){
                            if($_GET["location"] != ""){
                                $googleGeo_url .= "address=" . $_GET['location'] . "&key=" . $googleGeo_token;
                                //$googleGeo_url = str_replace(' ','+', $googleGeo_url);
                                $google_response = file_get_contents($googleGeo_url); // array somthing
                                $google_json_data = json_decode($google_response);
                                $location_lat = $google_json_data -> results[0] -> geometry -> location -> lat;
                                $location_lng = $google_json_data -> results[0] -> geometry -> location -> lng;
                                $nearby_url .= 'location=' . $location_lat . "," . $location_lng . '&radius=' . $_GET['radius'] . '&type=' . $_GET['type'] . '&keyword=' . $_GET['keyword'] . '&key=' . $nearby_token;
                            } // ELSE => error
                        }
                    }
                    echo file_get_contents($nearby_url); // get nerby json file
                }
            }else if($_GET["func"] == "detail_func"){ // 2. detail func
                if(isset($_GET["place_id"])) {
                    $detail_url .= "placeid=" . $_GET["place_id"] . "&key=" . $detail_token;
                    echo file_get_contents($detail_url);
                }
            }else if($_GET["func"] == "photo_func"){ // 3. photo func
                if(isset($_GET["photo_width"]) && (isset($_GET["photo_reference"]))) {
                    $photo_url .= "maxwidth=" . $_GET["photo_width"] . "&photoreference=" . $_GET["photo_reference"] . "&key=" . $photo_token;
                    echo file_get_contents($photo_url);
                }
            }else if($_GET["func"] == "next_func"){
                if(isset($_GET["page_token"])){
                    $next_url .= "pagetoken=" . $_GET["page_token"] . "&key=" . $next_token;
                    echo file_get_contents($next_url);
                }
            }else if($_GET["func"] == "yelp_func"){

                // name=' + $scope.detail_name + "&latitude=" + $scope.detail_lat + "&longitude=" + $scope.detail_lon;
                // yelpSearch_url += "&city=" + $scope.detail_city + "&state=" + $scope.detail_state + "&country=" + $scope.detail_country + "&postal_code=" + $scope.detail_postal_code + "&address1=" + $scope.detail_address1;
                // yelpSearch_url += "$phone_num" + $scope.detail_yelp_phoneNum;

                if(isset($_GET["name"])) {
                    $yelp_lookup_url .= "name=" . $_GET["name"] . "&latitude=" . $_GET["latitude"] . "&longitude=" . $_GET["longitude"] . "&address1=".$_GET["address1"] . "&city=" . $_GET["city"] . "&state=" . $_GET["state"] . "&country=" . $_GET["country"] . "&postal_code=" . $_GET["postal_code"] . "&phone=".$_GET["phone_num"];


                    $headers = "Authorization: Bearer DtMWP4bXgrccawR5jPkCtFNLuPsbPGvRFRpeHRG-kh8RvdsADsOnJU4oP-0l7QM_pPkBFM8F4guvwPP-20EDRxX9Du_npblXtZZQTzQHQIq8OtyU3Ze--Nt-T5HAWnYx\r\n" . 
                                "Cache-Control: no-cache\r\n";
                    $opts = ['http' => ['method' => 'GET',
                                        'header' => $headers, ]
                            ];
                    $context = stream_context_create($opts);

                    $yelp_response = file_get_contents($yelp_lookup_url, false, $context);

                    //echo $yelp_lookup_url;
                    //echo $yelp_response;

                    $yelp_data = json_decode($yelp_response);
                    $yelp_id = $yelp_data -> businesses[0] -> id;
                    $yelp_name = $yelp_data -> businesses[0] -> name;
                    $yelp_lat = $yelp_data -> businesses[0] -> coordinates -> latitude;
                    $yelp_lon = $yelp_data -> businesses[0] -> coordinates -> longitude;
                    $yelp_address1 = $yelp_data -> businesses[0] -> location -> address1;
                    $yelp_city = $yelp_data -> businesses[0] -> location -> city;
                    $yelp_postal_code = $yelp_data -> businesses[0] -> location -> zip_code;
                    $yelp_phone = $yelp_data -> businesses[0] -> location -> phone;

                    // heuristic score func
                    $score = 0;
                    if ($yelp_name == $_GET['name'])
                        $score++;
                    if ($yelp_address1 == $_GET['address1'])
                        $score++;
                    if ($yelp_postal_code == $_GET['postal_code'])
                        $score++;
                    if ($yelp_phone == $_GET['phone_num'])
                        $score++;
                    if (abs($yelp_lat - $_GET['latitude']) < 0.0002) // !!
                        $score++;
                    if (abs($yelp_lon - $_GET['longitude']) < 0.0002)
                        $score++; 

                    if ($score >= 3){
                        $yelp_businessID_url .= $yelp_id . "/reviews";
                        echo file_get_contents($yelp_businessID_url, false, $context);
                    }else{
                        echo null;
                    }
                }
            }else {
                // Something more?
            }
        }
    } //isset($_GET["from"])
?>