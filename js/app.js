//The wobbler
var drawing = false;
var drawingThreshold = 10;
var startX, startY,endX, endY, shape;
var shapeStartX, shapeStartY, shapeEndY, shapeEndX;
var imageWidth, imageHeight;
var animations = ["vibrate","mouth","wobble","googly","eyebrows","swing","none"]; //spin, breathe

//These specify possible origins for the animations that need them
var animationSpec = {
  "swing" : {
    "origins" : ["bottom","left","top","right"]
  },
  "eyebrows" : {
    "origins" : ["bottom","top"]
  }
}

// the different selection types
var outlines = ["circle","square","semi-top","semi-right","semi-bottom","semi-left"];
var origins = ["top","right","bottom","left","center"];

var imgURL = "madmax.jpg";
// var imgURL = "http://imgur.com/Xu8bLuV"; //madmax

var selectedOutline = "circle";
var selectedAnimation = animations[0];
var avgDelta; //Keeps track of how much the mouse moved when makgin a shape
var isRemix = false;

var starterImages = [
  "aken4.gif",
  "jonah.jpg",
  "http://blog.hostelbookers.com/wp-content/uploads/2012/02/shoreditch-cat.jpg"
];

$(document).ready(function(){

  $(".upload-gif").on("click",function(){
    uploadGif();
    return false;
  });

  //Checks if this is a remix by looking for an ID, and loads if necessary
  checkRemix();

  //Builds the image picker
  //buildPicker();

  $(window).on("keypress",function(e){
    if(e.keyCode == 98) {
      sendShapeToBack();
      $(".send-to-back").addClass("activated");
    }
  });

  $(window).on("keyup",function(e){
    if(e.keyCode == 66) {
      $(".send-to-back").removeClass("activated");
    }
  })

  $(".send-to-back").on("click",function(){
    sendShapeToBack();
    return false;
  });

  $(".start-over").on("click", function(){
    startOver();
    return false;
  });

  $(".make-gif").on("click", function(){
    makeGIF();
    return false;
  });

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

  //Prep name UI
  $(".imageURL").text(imgURL);

  $(".change").on("click",function(){
    $(".image-source").toggleClass("collapsed");
    $(".image-source input").focus();
  });

  $(".pick").on("click",function(){
    $(".image-source").toggleClass("collapsed");
    var newImage = $("input").val();
    if(newImage.length > 0 && newImage != imgURL){
      changeImage(newImage);
    }
  });

  $("body").on("click",function(e){
    var clicked = e.target;
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
      deselectShape();
      startX = e.offsetX;
      startY = e.offsetY;
      drawing = true;
      $(".ftu-on").removeClass("ftu-on");

      shape = $("<div class='shape selected'><div class='lock'></div></div>");
      shape.css("z-index",9999);
      shape.attr("z",9999);
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

        if(animationSpec[animations[i]]){
          var origins = animationSpec[animations[i]].origins;
          newEl.attr("origin",origins[0]);
          newEl.append("<div class='origin'></div>");
        } else {
          var origins = [];
        }

        newEl.attr("animation",animations[i]);
        newEl.on("click",function(){
          selectedAnimation = $(this).attr("animation");
          $(".selected").attr("animation",selectedAnimation);

          if($(this).hasClass("selected-outline") && $(this).attr("origin")){
            var currentOrigin = $(this).attr("origin");
            var possibleOrigins = animationSpec[$(this).attr("animation")].origins;
            var originIndex = possibleOrigins.indexOf(currentOrigin);
            originIndex++;
            if(originIndex >= possibleOrigins.length ){
              originIndex = 0;
            }
            $(".selected").attr("origin",possibleOrigins[originIndex]);
            $(this).attr("origin",possibleOrigins[originIndex]);
          }

          if($(this).attr("origin")){
            $(".selected").attr("origin",$(this).attr("origin"));
          } else {
            $(".selected").removeAttr("origin");
          }
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

function endShape(){
    drawing = false;
    shape.css("background-image","url("+imgURL+")");
    var offsetX = 0 - shapeStartX;
    var offsetY = 0 - shapeStartY;

    updateBackground(shape,shapeStartY,shapeStartX);

    shape.addClass("animate");
    shape.attr("animation",selectedAnimation);

    //Checks to see what origin has been selected
    //for this animation...
    var animationUI = $(".animation-ui .selected-outline");
    if(animationUI.attr("origin")){
      shape.attr("origin",animationUI.attr("origin"));
    }

    makeShapeEditable(shape);

    if(avgDelta < 10 ){
      shape.remove();
      checkSendToBack();
    }

    checkShareUI();
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
          checkSendToBack();
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
        checkSendToBack();
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
    savedPic.savedAt = Firebase.ServerValue.TIMESTAMP;

    $(".image .shape").each(function(i,el){
        var shape = {};
        shape.top = parseInt($(el).css("top"));
        shape.left = parseInt($(el).css("left"));
        shape.width = parseInt($(el).width());
        shape.height = parseInt($(el).height());
        shape.outline = $(el).attr("outline");
        shape.animation = $(el).attr("animation");
        shape.z = $(el).attr("z") || 9999;


        if($(el).attr("origin")){
          shape.origin = $(el).attr("origin");
        }

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

}

function checkRemix(){
  faceID = getParameterByName('id');
  if(faceID) {
    isRemix = true;
    getImage(faceID);
    $(".ftu-on").removeClass("ftu-on");
  } else {
    changeImage(imgURL);
    checkShareUI();
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
    });
  }
}
function getDataUri(url, callback) {
    var image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0);

        // Get raw image data
        // callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
        // ... or get as Data URI
        callback(canvas.toDataURL('image/png'));
    };
    image.src = url;
}


var gif = new GIF({
  workers: 2,
  quality: 10,
  width: imageWidth,
  height: imageHeight
});

var totalFrames = 16;
var blobber;

function makeGIF(){

  var img = new Image();
  img.src = imgURL;

  $(".image").append(img);
  $(".shape").append($(img).clone());
  $(".shape").css("overflow","hidden");
  $(".shape").css("animation-name","none");

  $(".shape").each(function(){
    var that = $(this);

    if(that.attr("outline") == "circle"){
      var borderRadius = that.width()/2 + "px/" + that.height()/2 + "px";
      that.css("border-radius",borderRadius);
    }

    $(this).find("img").css("position","absolute");
    $(this).find("img").css("left",$(this).attr("backgroundx"));
    $(this).find("img").css("top",$(this).attr("backgroundy"));
  });

  makeFrame(1);

  $(".recording-indicator").show();

  //Sets the image source for the .gif after it's finished rendering
  gif.on('finished', function(blob) {
    blobber = blob;
    $(".gif").attr("src",URL.createObjectURL(blob));
    $(".image, .shape").css("background-image","url("+imgURL+")");
    $(".shape").each(function(){
      $(this).css("background-position",$(this).attr("backgroundx") + " " + $(this).attr("backgroundy"));
      $(this).css("animation-name","");
    });
    $(".image img").remove();
    $(".shape img").remove();
  });
}

//Makes a frame of the gif
function makeFrame(frame){
  $(".shape").attr("frame","frame-" + frame);

  html2canvas(document.querySelector(".image"), {

    onrendered: function(canvas) {
      gif.addFrame(canvas, {delay: 33.3});
      if(frame <= totalFrames) {
        frame++;
        makeFrame(frame);
      }
      if(frame == totalFrames){
        renderGif(gif);
      }
    },
    useCORS : true
  });
}

function uploadGif(){
  var canvas = document.createElement('canvas');
  canvas.width = 1000; // or 'width' if you want a special/scaled size
  canvas.height = 1000; // or 'height' if you want a special/scaled size
  var gif = document.querySelector(".gif");
  canvas.getContext('2d').drawImage(gif, 0, 0);

  $(".imgur-status").show();
  $(".imgur-status .uploading").show();

  var reader = new window.FileReader();
    reader.readAsDataURL(blobber);
    reader.onloadend = function() {
    base64data = reader.result;

    var d = base64data;
    var d = d.replace("data:image/gif;base64","");

    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: {
          Authorization: "CLient-ID c57c1cf3bd35cbe",
          Accept: 'application/json'
        },
        data: {
          image: d,
          type: 'base64'
        },
        success: function(result) {
          var id = result.data.id;
          var url = 'https://imgur.com/gallery/' + id;
          $(".imgur-status .imgur-link").text(url).attr("href",url).show();
          $(".imgur-status .uploading").hide();
        }
      });

    }
}

function renderGif(gif){
  $(".gif-wrapper").show();
  gif.render();
  $(".recording-indicator").hide();
}

function deselectShape(){
  $(".image .selected").removeClass("selected");
  checkSendToBack();
}

function startOver() {
  $(".image .shape").remove();
  checkShareUI();
}

function sendShapeToBack(){
  var lowestIndex = 9999;

  $(".image .shape").each(function(){
    var z = $(this).attr("z");
    if(z < lowestIndex) {
      lowestIndex = z;
    }
  });

  lowestIndex--;

  $(".shape.selected").css("z-index",lowestIndex).attr("z",lowestIndex);
}


function checkSendToBack(){
  var shapes = $(".image .shape").length;
  var shapesSelected = $(".image .shape.selected").length;

  if(shapes > 1 && shapesSelected > 0){
    $(".send-to-back").show();
  } else {
    $(".send-to-back").hide();
  }
}

