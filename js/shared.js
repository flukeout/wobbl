var environment;
var isRemix = false;
checkEnvironment();
var maxWidth = 800;
var maxheight = 600;
var imageSizeRatio = 1;

//Handles import of the Beta Banner - and will eventually do other content
$(document).ready(function(){
  // var content = document.querySelector('link[rel="import"]').import;
  // var el = content.querySelector('.beta-banner');
  // $("body").append($(el).clone());
});

//Changes the image being edited or viewed
function changeImage(image,hello){

  $(".image-picker").hide();
  var img = $("<img class='test-image' />");
  img.attr("src",image);
  imgURL = image;
  $("body").append(img);

  img.on("load",function(){

    var ratio = 1;
    if(img.width() > maxWidth){
      ratio = 1 / (img.width() / maxWidth);
      imageSizeRatio = ratio;
      imageWidth = img.width() * ratio;
      imageHeight = img.height() * ratio;
    }

    imageWidth = img.width() * ratio;
    imageHeight = img.height() * ratio;

    $(".image").width(imageWidth).height(imageHeight);
    $(".image").removeClass("image-loading");
    $(".image").css("background-image","url("+image+")");
    $(".image").css("background-size", imageWidth + "px " +imageHeight + "px" );
    $(".image-source input").val(image);
    if(environment == "local"){
      testIfGiffable();
    }
    $(".gif").attr("src",image);
    img.remove();
    hello();
  });

  $(".shape").remove();
}

function testIfGiffable(){

  var img = new Image();

  var canGif = false;

  $(img).on("load",function(){
    var canvas = document.querySelector(".test-canvas");
    var context = canvas.getContext('2d');
    context.drawImage(img, 69, 50);

    try {
      var pixel = context.getImageData(0, 0, 1, 1);
      canGif = true;
    } catch(err) {
      canGif = false;
    }

    if(!canGif){
      $(".make-gif").hide();
    } else {
      $(".make-gif").show();
    }

    checkShareUI();
  });


  img.crossOrigin = "Anonymous";
  img.src = imgURL;
}

//Updates the background of a shape
function updateBackground(shape,top,left) {
  var offsetX = 0 - left;
  var offsetY = 0 - top;
  shape.css("background-position", offsetX + " " + offsetY);
  shape.attr("backgroundx",offsetX);
  shape.attr("backgroundy",offsetY);
}

//checks if we're on localhost
function checkEnvironment(){
  var URL = window.location.href;
  if(URL.indexOf("localhost") > -1) {
    environment = "local";
  } else {
    environment = "production";
  }
}

//Checks to see if we should show a bunch of the UI

function checkShareUI(){
  if($(".image .shape").length > 0){
    $(".share-ui").show();
    $(".make-gif").show();
    $(".start-over").show();
    $(".image-editor").removeClass("ftu-on");
  } else {
    $(".share-ui").hide();
    $(".make-gif").hide();
    $(".start-over").hide();
    $(".image-editor").addClass("ftu-on");
  }
}

function removeShape(shape){
  shape.addClass('remove-shape');
  setTimeout(function(){
    shape.remove();
    checkShareUI();
    checkSendToBack();
  },300);
}

function getImage(id) {
  var firebase = new Firebase("https://facejam-4bc7d.firebaseio.com/faces/");
  firebase.once("value", function(snapshot) {
    var nameSnapshot = snapshot.child(id);
    var face = nameSnapshot.val();
    buildImage(face);
  });
}


// Add shapes, build shapes, make shapes
function buildImage(face){

  changeImage(face.imageURL,function(){

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

      if(shapeData.z){
        newShape.css("z-index",shapeData.z);
        newShape.attr("z",shapeData.z);
      }
      newShape.css("background-image","url("+face.imageURL+")");
      var backgroundSize = imageWidth + "px " + imageHeight + "px";
      console.log(backgroundSize);
      newShape.css("background-size", backgroundSize);
      newShape.css("background-position", "top left");

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


  });

  //It doesn't know the ratio yet at this point because the image hasn't loaded potentially.



  checkShareUI();
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