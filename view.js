var faceID;
$(document).ready(function(){
  faceID = getParameterByName('id');
  getImage(faceID);
  prepLinks();
});

function prepLinks(){

  var remixLink, makeLink;

  if(environment == "local") {
    makeLink = "/";
    remixLink = "/?id=" + faceID;
  } else {
    makeLink = "flukeout.github.io/wobbl/";
    remixLink = "flukeout.github.io/wobbl/?id=" + faceID;
  }

  $(".make-your-own").attr("href",makeLink);
  $(".remix-it").attr("href",remixLink);

}


