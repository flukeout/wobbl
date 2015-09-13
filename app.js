var drawing = false;
var drawingThreshold = 10;
var startX, startY,endX, endY, shape;
var shapeStartX, shapeStartY, shapeEndY, shapeEndX;
var imageWidth, imageHeight;
var animations = ["mouth","vibrate","wobble","googly","eyebrows","nonono"]; // "spin"
var outlines = ["square","circle","semi-top","semi-right","semi-bottom","semi-left"];

var imgURL = "aken4.gif";
// var imgURL = "http://www.fullnetworth.com/wp-content/uploads/2015/07/Roger-Federer.jpg";
var selectedOutline = "square";
var selectedAnimation = animations[0];
var avgDelta; //Keeps track of how much the mouse moved when makgin a shape

var starterImages = [
  "aken4.gif",
  "jonah.jpg",
  "http://www.fullnetworth.com/wp-content/uploads/2015/07/Roger-Federer.jpg"
];

$(document).ready(function(){

    checkRemix();

    buildPicker();

    $(".share").on("click", function(){
        savePic();
        return false;
    });

    imageWidth = $(".image").width();
    imageHeight = $(".image").height();

    buildAnimationUI();
    buildOutlineUI();


    $(".shape-ui [outline="+selectedOutline+"]").addClass("selected-outline");
    $(".animation-ui [animation="+selectedAnimation+"]").addClass("selected-outline");

    $(".pick").on("click",function(){
        var newImage = $("input").val();
        if(newImage.length > 0){
            changeImage(newImage);
        }
    });

    $(".outline").on("click",function(e){
        $(this).closest(".options-ui").find(".selected-outline").removeClass("selected-outline");
        $(e.target).addClass("selected-outline");
    });

    $(".image").on("click",".shape",function(e){
        clickShape(e.target);
    });

    //Starts a shape
    $(".image").on("mousedown",function(e){
        if ($(e.target).hasClass("image")){
            $(".selected").removeClass("selected");
            startX = e.offsetX;
            startY = e.offsetY;
            drawing = true;
            shape = $("<div class='shape selected'></div>");
            shape.attr("outline",selectedOutline);
            $(".image").append(shape);
            updateShape();
        }
    });

    $(".image").on("mousemove",function(e){
        var imagePosition = $(".image").offset();
        endX = e.pageX - imagePosition.left;
        endY = e.pageY - imagePosition.top;
        if(drawing == true){
            updateShape(shape);
        }
    });

    $("body").on("mouseup",function(e){
        if(drawing == true) {
            drawing = false;
            endShape();
        }
    });

});

function buildAnimationUI() {
    for(var i = 0; i < animations.length; i++) {
        var newEl = $("<div class='outline'/>");
        $(".animation-ui").append(newEl);
        newEl.attr("animation",animations[i]);
        newEl.on("click",function(){
            selectedAnimation = $(this).attr("animation");
            $(".selected").attr("animation",selectedAnimation);
        });
    }
}

function buildOutlineUI() {
    for(var i = 0; i < outlines.length; i++) {
        var newEl = $("<div class='outline'/>");
        $(".shape-ui").append(newEl);
        newEl.attr("outline",outlines[i]);
        newEl.on("click",function(){
            selectedOutline = $(this).attr("outline");
            $(".selected").attr("outline",selectedOutline);
        });
    }
}


//Draws the shape as you drag
function updateShape(){

    var deltaX = Math.abs(endX - startX);
    var deltaY = Math.abs(endY - startY);
    avgDelta = Math.round((deltaX + deltaY) / 2)

    if(avgDelta < 10) {
        shape.css("display","none");
    } else {
        shape.css("display","block");
    }

    if(endX > startX) {
        shapeStartX = startX;
        shapeEndX = endX;
    } else {
        shapeStartX = endX;
        shapeEndX = startX;
    }

    if(endY > startY) {
        shapeStartY = startY;
        shapeEndY = endY;
    } else {
        shapeStartY = endY;
        shapeEndY = startY;
    }

    shape.css("left",shapeStartX).css("right",imageWidth - shapeEndX);
    shape.css("top",shapeStartY).css("bottom",imageHeight - shapeEndY);
}

function removeShape(shape){
    shape.addClass('remove-shape');
    setTimeout(function(){
        shape.remove();
    },300);
}

function endShape(){
    shape.css("background-image","url("+imgURL+")");
    var offsetX = 0 - shapeStartX;
    var offsetY = 0 - shapeStartY;
    shape.css("background-position", offsetX + " " + offsetY);
    shape.addClass("animate");
    shape.attr("animation",selectedAnimation);

    makeShapeEditable(shape);

    if(avgDelta < 10 ){
        shape.remove();
    }
}

function makeShapeEditable(shape){

  shape.resizable({
      handles: "se"
  });

  // TODO make it so that it becomes selected when you start dragging it
  shape.draggable({
      start : function(event,ui){
          $(".shape.selected").removeClass("selected");
          $(event.target).addClass("selected");
      },
      stop: function(event,ui){
          var width = $(this).width();
          var height = $(this).height();
          var topStart = ui.position.top;
          var leftStart = ui.position.left;

          var off = false;
          if(leftStart > $(".image").width()) {off = true;}
          if(leftStart + width < 0) {off = true;}
          if(topStart > $(".image").height()) { off = true; }
          if(topStart + height < 0) {off = true;}
          if(off) {
              removeShape($(this));
          }
      },
      drag: function(event,ui){
          var top = ui.position.top;
          var left = ui.position.left;
          updateBackground($(".selected"),top,left)
      }
  });
}


// Changes the animation of a shape when you click it
function clickShape(target){
    var shape = $(target);

    var outline = shape.attr("outline");

    $(".selected-outline").removeClass("selected-outline");

    if(shape.hasClass("selected")) {
        var index = animations.indexOf(shape.attr("animation"));
        index++;
        if(index > animations.length -1 ){
            index = 0;
        }
        shape.attr("animation",animations[index]);

    } else {
        $(".selected").removeClass("selected");
        shape.addClass("selected");
    }

    $(".animation-ui").find("[animation=" + shape.attr("animation") + "]").addClass("selected-outline");
    $(".shape-ui").find("[outline=" + shape.attr("outline") + "]").addClass("selected-outline");

}


var firebase = new Firebase("https://facejam.firebaseio.com/");

function savePic(){
    var savedPic = {};
    savedPic.shapes = [];
    savedPic.imageURL = imgURL;
    savedPic.height = parseInt($(".image").height());
    savedPic.width = parseInt($(".image").width());

    $(".image .shape").each(function(i,el){
        var shape = {};
        shape.top = parseInt($(el).css("top"));
        shape.left = parseInt($(el).css("left"));
        shape.width = parseInt($(el).width());
        shape.height = parseInt($(el).height());
        shape.outline = $(el).attr("outline");
        shape.animation = $(el).attr("animation");
        savedPic.shapes.push(shape);
    });

    //Gets a unique ID
    var hashids = new Hashids("Hello World");
    var id = hashids.encode(parseInt(Math.random() * 99), parseInt(Math.random() * 99));

    var facesRef = firebase.child("faces");
    facesRef.child(id).set(savedPic);

    if(environment == "local") {
        var baseURL = "http://localhost:8080/";
    } else {
        var baseURL = "http://flukeout.github.io/wobbl/";
    }

    var link = baseURL + "view.html?id=" + id;
    $(".share-link").attr("href", link).text(link).show();

    // html2canvas(document.querySelector(".image"), {
    //     onrendered: function(canvas) {
    //         $("body").append(canvas);
    //     }
    // });
}

function checkRemix(){
  faceID = getParameterByName('id');
  if(faceID) {
    getImage(faceID);
  } else {
    changeImage(imgURL);
    // showPicker();
  }
}

function buildPicker(){

  for(var i = 0;i < starterImages.length; i++) {
    var imageChoice = $("<div class='image-option'></div>");
    imageChoice.css("background-image","url("+starterImages[i]+")");
    imageChoice.attr("url",starterImages[i]);
    $(".image-picker").append(imageChoice);
    imageChoice.on("click",function(){
      changeImage($(this).attr("url"));
      $(".image-picker").hide();
    });
  }
}