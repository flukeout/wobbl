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

  }

  $(".make-your-own").attr("href",makeLink);
  $(".remix-it").attr("href",remixLink);

}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getImage(id) {
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/");
  firebase.once("value", function(snapshot) {
    var nameSnapshot = snapshot.child(id);
    var face = nameSnapshot.val();
    buildImage(face);
  });
}



function buildImage(face){

  changeImage(face.imageURL);

  // $(".image").height(face.height);
  // $(".image").width(face.width);

  if(!face.shapes){
    face.shapes = [];
  }

  for(var i = 0; i < face.shapes.length; i++){
    var shapeData = face.shapes[i];
    var newShape = $("<div class='shape'></div>");
    newShape.attr("animation",shapeData.animation);
    newShape.attr("outline",shapeData.outline);
    newShape.css("left",shapeData.left);
    newShape.css("top",shapeData.top);
    newShape.css("width",shapeData.width);
    newShape.css("height",shapeData.height);
    newShape.css("background-image","url("+face.imageURL+")");
    $(".image").append(newShape);
    updateBackground(newShape,shapeData.top,shapeData.left);
  }
}
