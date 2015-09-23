var galleryType;

$(document).ready(function(){

  galleryType = getParameterByName('show') || "best";
  $(".nav-selected").removeClass(".nav-selected");
  if(galleryType == "best"){
    $(".nav .best-wobbles").addClass("nav-selected");
  } else {
    $(".nav .newest-wobbles").addClass("nav-selected");
  }
  getImages();

});


function getImages() {
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/");
  var count = 0;

  if(galleryType == "best") {
    firebase.orderByChild("likes").limitToLast(100).once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var id = childSnapshot.key();
        var childData = childSnapshot.val();
        buildImageGallery(childData,id);
      });
    });
  } else {
    firebase.orderByChild("savedAt").limitToLast(100).once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var id = childSnapshot.key();
        var childData = childSnapshot.val();
        buildImageGallery(childData,id);
      });
    });
  }
}

function deleteImage(id){
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/"+id);
  firebase.remove();
}

function likeImage(id,heart){
  var firebase = new Firebase("https://facejam.firebaseio.com/faces/"+id);

  //Get your likes
  var liked = JSON.parse(localStorage.getItem("liked")) || [];

  var likedAlready = true;

  if(liked.indexOf(id) < 0){
    likedAlready = false;
  }

  if(likedAlready){
    liked.splice(liked.indexOf(id), 1);
    heart.removeClass("active");
  } else {
    heart.addClass("active");
    liked.push(id);
  }

  firebase.once("value", function(snapshot) {
    var data = snapshot.val();
    var likes = data.likes || 0;
    if(likedAlready){
      likes--;
    } else {
      likes++;
    }
    var ref = snapshot.ref();
    ref.update({"likes":likes});
    heart.find(".count").text(likes);
  });

  localStorage.setItem("liked",JSON.stringify(liked));


}

//Builds each image for the gallery
function buildImageGallery(face,id){
  var liked = JSON.parse(localStorage.getItem("liked")) || [];
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

  var likeLink = $("<div class='like-wrapper'><span class='count'>0</span><a class='like-image'></a></div>");

  if(liked.indexOf(id) > -1){
    likeLink.addClass("active");
  }

  likeLink.find(".count").text(face.likes || 0);

  newImageWrapper.append(likeLink);

  likeLink.on("click",function(){
    likeImage(id,$(this));
    return false;
  });

  newImage.attr("href",getFaceURL(id,"view"));
  newImage.css("background-image","url("+face.imageURL+")");

  var img = $("<img class='temporary' />");
  img.attr("src",face.imageURL);


  $("body").append(img);

  img.on("load",function(){

    var ratio = 250 / img.height();
    newImage.width(img.width()).height(img.height());
    newImageWrapper.width(img.width() * ratio).height(img.height() * ratio);
    newImage.removeClass("image-loading");

    if(environment == "local"){
      deleteLink.show();
    }

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
    newShape.css("z-index",shapeData.z || 9999);

    if(shapeData.origin){
      newShape.attr("origin",shapeData.origin);
    }

    newImage.append(newShape);
    updateBackground(newShape,shapeData.top,shapeData.left);
  }

  newImageWrapper.append(newImage);

  $(".gallery").prepend(newImageWrapper);
}
