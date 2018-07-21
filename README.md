# Place-Search-Web
Travel-n-Entertainment Search Webpage

# 1. High Level Description
   : A webpage that allows users to search for places using the Google Places API and display the result on the same page below the form. Once the user clicks on a search button to serach for place details, the webpage should display several tabs which contain an info/ photos/ map/ route/ reviews respectively. It also support adding places to and removing from favorites and posintg places info to Twitter. 
   
# 2. Skillsets
   : JavaScript, PHP, HTML, CSS, Bootstrap, Angular, Google App Engine(GAE)
   
# 3. Code relationships
   1) app.yaml: GAE...
   2) main.html: designs the webpage that displays search form and result details using Bootstrap for the responsive design.
   3) search.php: 
   4) place.js: Search controller with AngularJS
   5) style.css: style sheet for main.html

# 3. Implementations
// video..

   1) Search Form Design using Bootstrap form for responsive design
   2) Autocomplete is implemeted by using the autocomplete service provided by Google Maps Platform
   3) Obtainint User Location using geolocation APIs(ip-api.com)
   4) App should make an AJAX call to the PHP script hosted on GAE. Then the php script will make a request to Google Places API to get the placese information.
