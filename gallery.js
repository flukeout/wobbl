$(document).ready(function(){
  getImages();
});

function getImages() {
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/");

  // firebase.limitToLast(20).once("value", function(snapshot) {

  firebase.limitToLast(40).once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var id = childSnapshot.key();
      var childData = childSnapshot.val();
      buildImageGallery(childData,id);
    });
  });

  // scoresRef.orderByValue().limitToLast(3).on("value", function(snapshot) {
  //   snapshot.forEach(function(data) {
  //     console.log("The " + data.key() + " dinosaur's score is " + data.val());
  //   });
  // });

}

function deleteImage(id){
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/"+id);
  firebase.remove();
}

//Builds each image for the gallery
function buildImageGallery(face,id){
  var newImage = $("<a class='image'></a>");
  var newImageWrapper = $("<div class='image-wrapper'></div>");

  if(environment == "local") {
    var deleteLink = $("<a class='delete-image'>Delete</a>");
    newImageWrapper.append(deleteLink);
    deleteLink.hide();

    deleteLink.on("click",function(){
      removeShape($(this).closest(".image-wrapper"));
      deleteImage(id);
      return false;
    });
  }

  newImage.attr("href",getFaceURL(id,"view"));
  newImage.css("background-image","url("+face.imageURL+")");

  var img = $("<img/>");
  img.attr("src",face.imageURL);

  $("body").append(img);

  img.on("load",function(){

    var ratio = 200 / img.height();
    newImage.width(img.width()).height(img.height());
    newImageWrapper.width(img.width() * ratio).height(img.height() * ratio);
    newImage.removeClass("image-loading");
    deleteLink.show();
    // console.log(ratio);
    img.remove();
    newImage.css("transform","scale("+ratio+")");
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

  newImageWrapper.append(newImage);

  $(".gallery").append(newImageWrapper);


}

