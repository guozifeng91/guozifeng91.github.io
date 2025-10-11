// check home link
(function(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.get('gallery')>0) {
    // scroll down by 100hv (return from other pages)
    document.getElementById("home-link").href="./gallery.html?position=1";
  }
})();
