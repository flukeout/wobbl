//Changes the image being edited or viewed
function changeImage(image){
    $(".image").css("background-image","url("+image+")");
    var img = $("<img/>");
    img.attr("src",image);
    imgURL = image;
    $("body").append(img);
    img.on("load",function(){
        $(".image").css("width",img.width()).css("height",img.height());
        img.remove();
        imageWidth = $(".image").width();
        imageHeight = $(".image").height();
    });
}

//Updates the background of a shape
function updateBackground(shape,top,left) {
  var offsetX = 0 - left;
  var offsetY = 0 - top;
  shape.css("background-position", offsetX + " " + offsetY);
}