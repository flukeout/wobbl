var environment;
var isRemix = false;
checkEnvironment();

//Changes the image being edited or viewed
function changeImage(image){
  var img = $("<img class='test-image' />");
  img.attr("src",image);
  imgURL = image;
  $("body").append(img);

  img.on("load",function(){
    $(".image").width(img.width()).height(img.height());
    imageWidth = img.width();
    imageHeight = img.height();
    img.remove();
    $(".image").removeClass("image-loading");

    $(".image").css("background-image","url("+image+")");
    $(".image-source input").val(image);
  });

  $(".shape").remove();
}

//Updates the background of a shape
function updateBackground(shape,top,left) {
  var offsetX = 0 - left;
  var offsetY = 0 - top;
  shape.css("background-position", offsetX + " " + offsetY);
}

//checks if we're on localhost
function checkEnvironment(){
  var URL = window.location.href;
  if(URL.indexOf("localhost") > -1) {
    environment = "local";
  } else {
    environment = "production";
  }
  console.log("environment is " + environment);
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

    if(shapeData.origin){
      newShape.attr("origin",shapeData.origin);
    }

    $(".imageURL").text(face.imageURL);

    $(".image").append(newShape);
    updateBackground(newShape,shapeData.top,shapeData.left);

    if(isRemix){
      makeShapeEditable(newShape);
    }

  }


}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}



function getFaceURL(id,type){
  // Type is view or remix

  var URL;
  var view;
  if(type == "view"){
    view = "view.html"
  }

  if(environment == "local"){
    URL = "http://localhost:8080/"+ view +"?id=" + id;
  } else {
    URL = "http://flukeout.github.io/wobbl/"+ view +"?id=" + id;
  }
  return URL;
}