# Place-Search-Web
Travel-n-Entertainment Search Webpage
https://827-dot-helloworld-198821.appspot.com/

# 1. High Level Description
: A webpage that allows users to search for places using the Google Places API and display the result on the same page below the form. Once the user clicks on a button to serach for place details, the webpage should display several tabs which contain an info/ photos/ map/ route/ reviews respectively. It also supports adding places to and removing from favorites and posintg places info to Twitter. 
   
   
# 2. Skillsets
: JavaScript, PHP, HTML, CSS, Bootstrap, Angular, Google App Engine(GAE)
   
   
# 3. Code relationships
1) app.yaml
:is used for the configuration files

2) main.html
:designs the webpage that displays search and result forms using Bootstrap for responsive design.

3) search.php
:constucts HTTP requests to the Google Places API "Nearby Search" service using the input address which is from                the geocoding via Google Maps Geocoding API. It also passes the JSON object returned by the Nearby Search to                  the client side, or parse the returned JSON and extract useful fields and pass these fields to the client side                in JSON format. AJAX call to the script hosted on GAE. 

4) place.js
:deals with Autocomplete service provided by Google Maps Plateform and Search controller to parse the JSON                      object and display the result in a tabular format with AngularJS. Plus, it obtains User Location using                        geolocation APIs(ip-api.com)

5) style.css
:is a style sheet for main.html


# 4. Demo and Details
- The application makes an AJAX call to the search.php script hosted on GAE
- For the full video: https://youtu.be/SUELFdAqNx8

- The result table display upto 20 places and active the Previous/Next button if there are more pages
- A user can modify the start location with autocomplete service
![Imgur Image](https://imgur.com/Eobq9o0.gif)


- Info tab contains Address/ Phone Number/ Price Level/ Rating/ Google Page/ Webpage/ Website/ Hours
![Imgur](https://i.imgur.com/2aJgWt3.gif)


- Photos tab contains photos in 4 rows from the Google library
![Imgur](https://i.imgur.com/vu8rUHs.gif)


- Map tab shows street views and directions from the customized start place to the searched one
![Imgur](https://i.imgur.com/Z4Eiigw.gifv)


- Review tab displays the Google reviews and Yelp review of the place; For Yelp,"Business Match", "Business Reviews" APIs
![Imgur](https://i.imgur.com/UZB9FUG.gif)


- Favorite tab keeps the selected places and they could be deleted from the favorite list using HTML5 local storage 



(+) Error messages is poped up with a propriate comments when an error occurs for any reason
(+) A dynamic progress bar is displayed while data is being fetched
(+) Time conversion using Moment.js(http://momentjs.com/)

