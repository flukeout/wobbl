// TODO add a link from each gallery item to the full view

$(document).ready(function(){
  getImages();
});

function getImages() {
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/");

  firebase.once("value", function(snapshot) {

    snapshot.forEach(function(childSnapshot) {
      // key will be "fred" the first time and "barney" the second time
      // var key = childSnapshot.key();
      // console.log(key);
      // childData will be the actual contents of the child
      var childData = childSnapshot.val();
      buildImageGallery(childData,childSnapshot.key());
    });


    // var nameSnapshot = snapshot.child(id);
    // var face = nameSnapshot.val();
    // buildImage(face);
  });
}


function buildImageGallery(face,id){


  var newImage = $("<div class='image'></div>");

  var newImageWrapper = $("<a class='image-wrapper'></a>");
  newImageWrapper.attr("href",getFaceURL(id,"view"));


  console.log(getFaceURL(id,"view"));

  newImage.css("background-image","url("+face.imageURL+")");


  var img = $("<img/>");
  img.attr("src",face.imageURL);

  $("body").append(img);

  var ratio = .5;

  img.on("load",function(){
    newImage.width(img.width()).height(img.height());

    newImageWrapper.width(img.width() * ratio).height(img.height() * ratio);
    img.remove();
    newImage.removeClass("image-loading");
  });

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

    newImage.append(newShape);
    updateBackground(newShape,shapeData.top,shapeData.left);
  }

  newImage.css("transform","scale("+ratio+")")
  newImageWrapper.append(newImage);

  $(".gallery").append(newImageWrapper);


}

