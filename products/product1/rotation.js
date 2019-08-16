/*******************************************************************************************\
* Copyright 2002-2014 (C) Digital Multi-Media Design (DMMD), LLC (http://www.dmmd.net)      *
* This file is part of DMMD's Software Library.                                             *
* The software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; *
* without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. *
* DMMD can customize or expand this code for your own application.                          *
* Please contact us at contact@dmmd.net or via phone, at 7 0 3 - 4 3 9 - 0 0 6 7 (USA)      *
* or visit us at our website (http://dmmd.net).                                             *
\*******************************************************************************************/

$(window).load(function () {
    jQuery(document).ready(function ($) {
        var messageForExitZoom = "<button type='button' class='btn btn-warning safety'>Return to 360 Mode</button>";
        var isTopWindow = false;
        var fullscreenControl = $("#fullscreen");
        var hotspotCanvas = $("#hotspotcanvas");
        var playPauseControl = $("#play");
        var prevControl = $("#prev");
        var nextControl = $("#next");
        var zoomIn = $("#zoomin");
        var zoomCheck = $("#zoomcheck");
        var zoomContainer = $("#zoomContainer");
        var draggableContainer = $("#draggableContainer");
        var topContainer = $("#topContainer");
        var imageContainer = $("#imageContainer");
        var controllerContainer = $("#controllerContainer");
        var images = imageContainer.find("img");
        var imagesCount = images.length;
        var isClicked = false;
        var currentPosition;
        var currentImage = 0;
        var previousImage = 0;
        var slider = $("#slider-horizontal");

        var animation;

        var canvas;

        // default initial zoom parameters
        var valueZoom = 1.0;
        var minZoom = 1.0;
        var maxZoom = 2;
        var stepZoom = 0.1;

        var wasPlaying = false;

        var isHotspotImage = false;

        var isZooming = false;
        var isZoomClicked = false;
        var currentZoomXPosition = 0;
        var currentZoomYPosition = 0;
        var zoomBackgroundPosition = "center";

        var zoomDragPosX = 0;
        var zoomDragPosY = 0;

        var isBouncingFinished = false;
        var bounceRotationCount = 0;

        var zoomedDraggableWidth = 0;
        var zoomedDraggableHeight = 0;

        var isFirstDrag = true;

        zoomIn.html("");

        slider.css({
            'right': '0',
            'bottom': '0',
            'margin': '0 auto',
            'margin-top': '5px'
        });

        slider.slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 0,
            step: 10,
            classes: {
                "ui-slider": "highlight"
            }
        });

        var maxSlideValue = 0;

        if (self == top) {
            isTopWindow = true;

            if (deepZoom === 1) {
                $('img').prop('src', function () {
                    return this.src.replace("img", "imglarge");
                });
            }
        } else {
            isTopWindow = false;
        }

        for (var i = 1; i < imagesCount; i++) {
            images.eq(i).attr("class", "imageInvisible");
        }

        images.on("mousedown", function (e) {
            e.preventDefault(); // prevent dragging
        });

        var isMobileBrowser = function () {
            var mobileBrowser;
            var userAgent = navigator.userAgent;

            // regex literal, for other user agents, append their name in lower case
            var pattern = new RegExp('android|iphone|ipad|ipod|blackberry|iemobile|webos|opera mini');

            if (pattern.test(userAgent.toLowerCase())) {
                mobileBrowser = true;
            } else {
                mobileBrowser = false;
            }

            return mobileBrowser;
        };

        function onOrientationChange() {
            if (window.innerWidth > window.innerHeight) {
                for (var i = 0; i < imagesCount; i++) {
                    images.eq(i).css({
                        "width": "auto"
                    });
                    images.eq(i).css({
                        "height": "100%"
                    });
                }
            } else {
                for (var i = 0; i < imagesCount; i++) {
                    images.eq(i).css({
                        "width": "100%"
                    });
                    images.eq(i).css({
                        "height": "auto"
                    });
                }
            }
        }

        if (isMobileBrowser()) {
            onOrientationChange();
        }

        $(window).on("orientationchange", function () {
            if (isMobileBrowser()) {
                setTimeout(function () {
                    onOrientationChange();
                }, 500);
            }
        });

        hotspotCanvas.on("mousedown touchstart", function (e) {
            if (isPlaying) {
                wasPlaying = true;
                doPause();
            } else {
                wasPlaying = false;
            }

            if (e.type === "touchstart") {
                var event = e || window.event;
                var touches = event.touches || event.originalEvent.touches;

                currentPosition = touches[0].pageX;
            } else {
                currentPosition = e.pageX;
            }

            if ((hotspotX.length !== 0) || (hotspotX.length !== 0)) {
                var xBounds = (hotspotX[currentImage]) - 12;
                var yBounds = (hotspotY[currentImage]) - 12;

                var widthBounds = xBounds + 24;
                var heightBounds = yBounds + 24;

                if (((e.pageX >= xBounds) && (e.pageY >= yBounds)) && ((e.pageX <= widthBounds) && (e.pageY <= heightBounds))) {
                    switch (hotspotType[currentImage]) {
                        case 0:
                            break;
                        case 1:
                            var wndw = window.open(hotspotAction[currentImage], "_blank");

                            if (wndw) {
                                wndw.focus();
                            } else {
                                alert("Please allow popups");
                            }
                            break;
                        case 2:
                            var jsAction = hotspotAction[currentImage];
                            var jsFunctionArr = jsAction.split("#");
                            var jsFunction = jsFunctionArr[0];
                            var jsParams = jsFunctionArr[1];

                            window[jsFunction](jsParams);

                            break;
                        case 3:
                            displayHotspotImage();
                            break;
                        default:
                            break;
                    }
                }
            }

            isClicked = true;
            return false;
        });

        hotspotCanvas.on("mouseup touchend", function (e) {
            if (e.type === "touchend") {
                sendMessage('enableIcon');
            }
            if (isClicked && !isPlaying) {
                isClicked = false;

                if (isSingleRotation) {
                    doPause();
                } else {
                    if (wasPlaying) {
                        doPlay();
                    } else {
                        doPause();
                    }
                }
            }
        });

        hotspotCanvas.mouseout(function () {
            sendMessage('enableIcon');

            if (isClicked && !isPlaying) {
                isClicked = false;

                if (isSingleRotation) {
                    doPause();
                } else {
                    if (wasPlaying) {
                        doPlay();
                    } else {
                        doPause();
                    }
                }
            }
        });

        hotspotCanvas.on("mousemove touchmove", function (e) {
            sendMessage('disableIcon');
            if ((hotspotX.length !== 0) || (hotspotX.length !== 0)) {
                if (hotspotType[currentImage] !== 0) {
                    var xBounds = (hotspotX[currentImage]) - 12;
                    var yBounds = (hotspotY[currentImage]) - 12;

                    var widthBounds = xBounds + 24;
                    var heightBounds = yBounds + 24;

                    if (((e.pageX >= xBounds) && (e.pageY >= yBounds)) && ((e.pageX <= widthBounds) && (e.pageY <= heightBounds))) {
                        hotspotCanvas.css("cursor", "pointer");
                    } else {
                        hotspotCanvas.css("cursor", "ew-resize");
                    }
                }
            }

            if (isClicked) {
                var xPosition;

                if (e.type === "touchmove") {
                    var event = e || window.event;
                    var touches = event.touches || event.originalEvent.touches;

                    xPosition = touches[0].pageX;
                } else {
                    xPosition = e.pageX;
                }

                if (Math.abs(currentPosition - xPosition) >= sensitivity) {
                    if (currentPosition - xPosition >= sensitivity) {
                        if (isPointerDragNormal) {
                            displayPreviousFrame();
                        } else {
                            displayNextFrame();
                        }
                    } else {
                        if (isPointerDragNormal) {
                            displayNextFrame();
                        } else {
                            displayPreviousFrame();
                        }
                    }

                    currentPosition = xPosition;
                }
            }
        });

        if (document.getElementById("play")) {
            document.getElementById("play").addEventListener('click', function (e) {
                if (!isPlaying) {
                    doPlay();
                } else {
                    doPause();
                }
            }, false);
        }

        draggableContainer.on("mousedown touchstart", function (e) {
            isZoomClicked = true;

            sendMessage('disableIcon');

            if (e.type === "touchstart") {
                var event = e || window.event;
                var touches = event.touches || event.originalEvent.touches;

                currentZoomXPosition = touches[0].pageX;
                currentZoomYPosition = touches[0].pageY;
            } else {
                currentZoomXPosition = e.pageX;
                currentZoomYPosition = e.pageY;
            }
        });

        draggableContainer.on("mouseup touchend", function (e) {
            isZoomClicked = false;

            if (e.type === "touchend") {
                sendMessage('enableIcon');
                var event = e || window.event;
                var touches = event.touches || event.originalEvent.touches;

                currentZoomXPosition = touches[0].pageX;
                currentZoomYPosition = touches[0].pageY;
            } else {
                currentZoomXPosition = e.pageX;
                currentZoomYPosition = e.pageY;
            }
        });

        draggableContainer.on("mouseout", function (e) {
            sendMessage('enableIcon');
        });

        draggableContainer.on("mousemove touchmove", function (e) {
            sendMessage('disableIcon');
            if (isZoomClicked && isZooming) {
                var zoomXPosition;
                var zoomYPosition;

                if (e.type === "touchmove") {
                    var event = e || window.event;
                    var touches = event.touches || event.originalEvent.touches || event.targetTouches;

                    zoomXPosition = touches[0].pageX;
                    zoomYPosition = touches[0].pageY;
                } else {
                    zoomXPosition = e.pageX;
                    zoomYPosition = e.pageY;
                }

                if (isFirstDrag) {
                    isFirstDrag = false;

                    currentZoomXPosition = zoomDragPosX + (zoomedDraggableWidth / 2);
                    currentZoomYPosition = zoomDragPosY + (zoomedDraggableHeight / 2);
                }

                var currentZoomXDifference = currentZoomXPosition - zoomXPosition;
                var currentZoomYDifference = currentZoomYPosition - zoomYPosition;

                currentZoomXPosition = zoomXPosition;
                currentZoomYPosition = zoomYPosition;

                zoomDragPosX -= currentZoomXDifference;
                zoomDragPosY -= currentZoomYDifference;

                if (zoomDragPosX > 0) {
                    zoomDragPosX = 0;
                }

                if (zoomDragPosY > 0) {
                    zoomDragPosY = 0;
                }

                var draggableContainerWidth = draggableContainer.width();
                var draggableContainerHeight = draggableContainer.height();

                if (zoomDragPosX < (draggableContainerWidth - zoomedDraggableWidth)) {
                    zoomDragPosX = draggableContainerWidth - zoomedDraggableWidth;
                }

                if (zoomDragPosY < (draggableContainerHeight - zoomedDraggableHeight)) {
                    zoomDragPosY = draggableContainerHeight - zoomedDraggableHeight;
                }

                if (zoomDragPosX <= 0) {
                    isAtLeft = true;
                    console.log("left");
                } else {
                    isAtLeft = false;
                }

                if (zoomDragPosY <= 0) {
                    isAtTop = true;
                    console.log("top");
                } else {
                    isAtTop = false;
                }

                //

                if (zoomDragPosX >= (draggableContainerWidth - zoomedDraggableWidth)) {
                    isAtRight = true;
                    console.log("right");
                } else {
                    isAtRight = false;
                }

                if (zoomDragPosY >= (draggableContainerHeight - zoomedDraggableHeight)) {
                    isAtBottom = true;
                    console.log("bottom");
                } else {
                    isAtBottom = false;
                }

                var xDragBottomPos = zoomDragPosX + zoomedDraggableWidth;
                var yDragBottomPos = zoomDragPosY + zoomedDraggableHeight;

                console.log("[" + draggableContainerWidth);
                console.log("]" + draggableContainerHeight);

                console.log(xDragBottomPos);
                console.log(yDragBottomPos);

                console.log(zoomDragPosX);
                console.log(zoomDragPosY);

                if (zoomDragPosX <= 0)
                    console.log("#0");

                if (zoomDragPosY <= 0)
                    console.log("#1");

                if (xDragBottomPos >= draggableContainerWidth)
                    console.log("#2");

                if (yDragBottomPos >= draggableContainerHeight)
                    console.log("#3");

                if ((zoomDragPosX <= 0) && (zoomDragPosY <= 0) && (xDragBottomPos >= draggableContainerWidth) && (yDragBottomPos >= draggableContainerHeight)) {
                    draggableContainer.css("background-position", zoomDragPosX + "px " + zoomDragPosY + "px");
                } else {
                    console.log("stop");
                }

            }
        });

        if (document.getElementById("prev")) {
            document.getElementById("prev").addEventListener('click', function (e) {
                displayPreviousFrame();

                if (isPlaying) {
                    doPause();
                }

            }, false);
        }

        if (document.getElementById("next")) {
            document.getElementById("next").addEventListener('click', function (e) {
                displayNextFrame();

                if (isPlaying) {
                    doPause();
                }

            }, false);
        }

        $(document).on('click', '#exitZoomBtn', function (e) {
            console.log('exitZoom');
            if (isPlaying) {
                doPause();
            }

            if (!isZooming) {
                valueZoom = maxZoom;
                doZoom();
            } else {
                valueZoom = minZoom;
                exitZoom();
            }
        });

        if (document.getElementById("zoomin")) {
            document.getElementById("zoomin").addEventListener('click', function (e) {
                if (isPlaying) {
                    doPause();
                }

                if (!isZooming) {
                    zoomIn.removeClass("zoomin");
                    zoomIn.addClass("zoomout");

                    valueZoom = maxZoom;
                    doZoom();
                } else {
                    zoomIn.removeClass("zoomout");
                    zoomIn.addClass("zoomin");

                    valueZoom = minZoom;
                    exitZoom();
                }
            }, false);
        }

        if (document.getElementById("fullscreen")) {
            document.getElementById("fullscreen").addEventListener('click', function (e) {
                // full-screen available?
                if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
                    // image container
                    var i = document.getElementById("topContainer");

                    // in full-screen?
                    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                        // exit full-screen
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        }
                    } else {
                        // go full-screen
                        if (i.requestFullscreen) {
                            this.requestFullscreen();
                        } else if (i.webkitRequestFullscreen) {
                            i.webkitRequestFullscreen();
                        } else if (i.mozRequestFullScreen) {
                            i.mozRequestFullScreen();
                        } else if (i.msRequestFullscreen) {
                            i.msRequestFullscreen();
                        }
                    }
                }

            }, false);
        }

        // addEventListener support for IE8
        function bindEvent(element, eventName, eventHandler) {
            if (element.addEventListener) {
                element.addEventListener(eventName, eventHandler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, eventHandler);
            }
        }

        bindEvent(window, 'message', function (e) {
            console.log(e.data);
            // console.log(`parent message: ${isZooming}`);
            // if (isZooming) {
            //     dragIcon.classList.add('disabled');
            // }

            if (e.data == "loadProduct") {
                displayHotspot();
            }
        });

        //Firefox
        topContainer.on("DOMMouseScroll", function (e) {
            if (mouseZoom) {

                isFirstDrag = true;

                if (e.originalEvent.detail > 0) {
                    //scroll down
                    valueZoom -= stepZoom;
                    valueZoom = (valueZoom < minZoom) ? minZoom : valueZoom;
                    console.log('valueZoom=' + valueZoom + ', ' + valueZoom*100);
                    slider.slider("value", (valueZoom - 1) * 100);
                } else {
                    //scroll up
                    valueZoom += stepZoom;
                    valueZoom = (valueZoom > maxZoom) ? maxZoom : valueZoom;
                    console.log('valueZoom=' + valueZoom + ', ' + valueZoom*100);
                    slider.slider("value", (valueZoom - 1) * 100);
                }

                if ((valueZoom > minZoom) && (valueZoom < maxZoom)) {
                    doZoom();
                }

                if (valueZoom < 1.1) {
                    exitZoom();
                }
            }

            //prevent page fom scrolling
            return false;
        });

        //IE, Opera, Safari
        topContainer.on("mousewheel", function (e) {
            if (mouseZoom) {

                isFirstDrag = true;

                if (e.originalEvent.wheelDelta < 0) {
                    //scroll down
                    valueZoom -= stepZoom;
                    valueZoom = (valueZoom < minZoom) ? minZoom : valueZoom;
                    slider.slider("value", (valueZoom - 1) * 100);
                } else {
                    //scroll up
                    valueZoom += stepZoom;
                    valueZoom = (valueZoom > maxZoom) ? maxZoom : valueZoom;
                    slider.slider("value", (valueZoom - 1) * 100);
                }

                if ((valueZoom > minZoom) && (valueZoom < maxZoom)) {
                    doZoom();
                }

                if (valueZoom < 1.1) {
                    exitZoom();
                }
            }

            //prevent page from scrolling
            return false;
        });

        slider.on("slide", function (e, ui) {

            slider.slider("value", ui.value);
            var slideValue = (ui.value) ? (ui.value / 100) : 0;

            isFirstDrag = true;

            if (slideValue > maxSlideValue) {
                //scroll down
                valueZoom = 1 + slideValue;
                valueZoom = (valueZoom < minZoom) ? minZoom : valueZoom;
            } else {
                //scroll up
                valueZoom = 1 + slideValue;
                valueZoom = (valueZoom > maxZoom) ? maxZoom : valueZoom;
            }

            if ((valueZoom > minZoom) && (valueZoom < maxZoom)) {
                doZoom();
            }

            if (valueZoom < 1.1) {
                exitZoom();
            }
            console.log(ui.value + ", " + slideValue + ", " + maxSlideValue + ", " + valueZoom);
            maxSlideValue = slideValue;


            //prevent page fom scrolling
            return false;
        });

        var doZoom = function () {
            isZooming = true;
            sendMessage('isZooming');

            zoomIn.removeClass("zoomin");
            zoomIn.addClass("zoomout");
            zoomIn.html(messageForExitZoom);

            doPause();

            valueZoom = Math.round(valueZoom * 10) / 10;

            if (deepZoom === 1) {
                if (isTopWindow) {
                    var largeImageSrc = images.eq(currentImage).attr("src");
                    var largeImageLastSeparator = largeImageSrc.lastIndexOf("/");
                    var largeImageFilename = largeImageSrc.substring(largeImageLastSeparator + 1);

                    console.log(largeImageFilename);
                    draggableContainer.css("background-image", "url(imglarge/" + largeImageFilename + ")");
                } else {
                    draggableContainer.css("background-image", "url(imglarge/" + images.eq(currentImage).attr("src").substring(4) + ")");
                }
            } else {
                draggableContainer.css("background-image", "url(" + images.eq(currentImage).attr("src") + ")");
            }

            draggableContainer.css("background-repeat", "no-repeat");
            draggableContainer.css("background-position", zoomBackgroundPosition);
            draggableContainer.css("display", "block");
            zoomContainer.css("display", "block");
            imageContainer.css("display", "none");
            hotspotCanvas.css("visibility", "hidden");
            playPauseControl.css("visibility", "hidden");
            prevControl.css("visibility", "hidden");
            nextControl.css("visibility", "hidden");

            var tempWidth = largeWidth / normalWidth;
            var tempHeight = largeHeight / normalHeight;

            if (isTopWindow) {
                zoomedDraggableWidth = valueZoom * ($(document).height() * largeWidth / largeHeight);
                zoomedDraggableHeight = valueZoom * ($(document).height());
                draggableContainer.css("background-size", zoomedDraggableWidth + "px " + zoomedDraggableHeight + "px");
            } else {
                zoomedDraggableWidth = valueZoom * ($(document).height() * normalWidth / normalHeight);
                zoomedDraggableHeight = valueZoom * ($(document).height());
                draggableContainer.css("background-size", zoomedDraggableWidth + "px " + zoomedDraggableHeight + "px");
            }

            zoomDragPosX = ($(document).width() - zoomedDraggableWidth / maxZoom / 2);
            zoomDragPosY = ($(document).height() - zoomedDraggableHeight / maxZoom / 2);

            hotspotCanvas.css("cursor", "move");
        };

        var exitZoom = function () {
            isZooming = false;
            sendMessage('notZooming');

            zoomIn.html("");
            slider.slider("value", 0.5);
            zoomIn.removeClass("zoomout");
            zoomIn.addClass("zoomin");

            draggableContainer.css("background-image", "none");
            draggableContainer.css("display", "none");
            imageContainer.css("display", "block");
            hotspotCanvas.css("visibility", "visible");
            playPauseControl.css("visibility", "visible");
            prevControl.css("visibility", "visible");
            nextControl.css("visibility", "visible");
            zoomContainer.css("display", "none");

            hotspotCanvas.css("cursor", "ew-resize");

            isFirstDrag = true;
        };

        var displayHotspotImage = function () {
            draggableContainer.css("background-image", "url(hotspotimg/" + hotspotAction[currentImage] + ")");
            draggableContainer.css("background-repeat", "no-repeat");
            draggableContainer.css("background-position", "center");
            draggableContainer.css("display", "block");
            zoomContainer.css("display", "block");

            imageContainer.css("display", "none");
            hotspotCanvas.css("visibility", "hidden");
            controllerContainer.css("display", "none");

            zoomedDraggableWidth = topContainer.width();
            zoomedDraggableHeight = topContainer.height();

            draggableContainer.css("background-size", zoomedDraggableWidth + "px " + zoomedDraggableHeight + "px");

            isHotspotImage = true;

            draggableContainer.css("cursor", "pointer");
        };

        var hideHotspotImage = function () {
            draggableContainer.css("background-image", "none");
            draggableContainer.css("display", "none");
            zoomContainer.css("display", "none");
            imageContainer.css("display", "block");
            hotspotCanvas.css("visibility", "visible");
            controllerContainer.css("display", "block");

            isHotspotImage = false;

            draggableContainer.css("cursor", "move");
        };

        zoomContainer.on("mousedown touchstart", function (e) {
            if (isHotspotImage) {
                hideHotspotImage();
            }
        });

        var displayPreviousFrame = function () {
            if (isBouncing && isSingleRotation && bounceRotationCount === 2 && !isBouncingFinished) {
                console.log("finished");
                isBouncingFinished = true;
                //clearInterval(animation);

                doPause();

                return;
            }

            currentImage++;

            if (currentImage >= imagesCount) {
                currentImage = 0;
            }

            if ((currentImage == imagesCount - 1) && isSingleRotation && !isBouncing) {
                playPauseControl.attr("class", "play");
                isPlaying = false;

                clearInterval(animation);
            }

            if ((currentImage == imagesCount - 1) && isBouncing && !isBouncingFinished) {
                if (isSingleRotation) {
                    bounceRotationCount++;
                    console.log(bounceRotationCount);
                }

                if (isPlaying) {
                    clearInterval(animation);
                    animation = setInterval(displayNextFrame, playSpeed);
                }
            }

            images.eq(previousImage).addClass("imageInvisible");
            images.eq(currentImage).removeClass("imageInvisible");

            previousImage = currentImage;
            displayHotspot();
            //document.title = currentImage;
        };

        var displayNextFrame = function () {
            if (isBouncing && isSingleRotation && bounceRotationCount === 2 && !isBouncingFinished) {
                console.log("finished");
                isBouncingFinished = true;
                //clearInterval(animation);

                doPause();

                return;
            }

            currentImage--;

            if (currentImage < 0) {
                currentImage = imagesCount - 1;
            }

            if ((currentImage == 0) && isSingleRotation && !isBouncing) {
                playPauseControl.attr("class", "play");
                isPlaying = false;

                clearInterval(animation);
            }

            if ((currentImage == 0) && isBouncing && !isBouncingFinished) {
                if (isSingleRotation) {
                    bounceRotationCount++;
                    console.log(bounceRotationCount);
                }

                if (isPlaying) {
                    clearInterval(animation);
                    animation = setInterval(displayPreviousFrame, playSpeed);
                }
            }

            images.eq(previousImage).addClass("imageInvisible");
            images.eq(currentImage).removeClass("imageInvisible");

            previousImage = currentImage;
            displayHotspot();
            //document.title = currentImage;
        };

        var displayHotspot = function () {
            // get computed style for image
            //var imgContainer = document.getElementById("hotspotcanvas");

            //imgContainer.width = normalWidth;
            //imgContainer.height = normalHeight;

            //var computedStyle = getComputedStyle(imgContainer);

            // these will return dimensions in *pixel* regardless of what
            // you originally specified for image:
            //var width = parseInt(computedStyle.getPropertyValue("width"), 10);
            //var height = parseInt(computedStyle.getPropertyValue("height"), 10);

            // now use this as width and height for your canvas element:
            canvas = document.getElementById("hotspotcanvas");

            if (!isTopWindow) {
                canvas.width = normalWidth;
                canvas.height = normalHeight;
            } else {
                imageContainer.width = topContainer.parent().width();
                imageContainer.height = topContainer.parent().height();

                // replace this with the size of the parent
                canvas.width = largeWidth;
                canvas.height = largeHeight;
            }

            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);

            var frameCount = hotspotX.length / imagesCount;
            var count = currentImage;

            if ((hotspotX.length !== 0) || (hotspotX.length !== 0)) {
                if ((hotspotX[count] !== -1) && (hotspotY[count] !== -1)) {
                    for (var i = currentImage; i < (frameCount * imagesCount); i = i + imagesCount) {
                        //console.log(i);
                        var x = hotspotX[i];
                        var y = hotspotY[i];

                        var img = new Image();
                        img.src = hotspotImage[i];

                        //context.drawImage(img, x-12, y-12, 24, 24);

                        if (!isTopWindow) {
                            context.drawImage(img, x - 12, y - 12, 24, 24);
                        } else {
                            // scale canvas content
                            x *= largeWidth / normalWidth;
                            y *= largeHeight / normalWidth;

                            context.drawImage(img, x - 12, y - 12, 24, 24);
                        }
                    }
                }
            }
        };

        var doPlay = function () {
            playPauseControl.attr("class", "pause");
            isPlaying = true;

            if (isRotationDirectionNormal) {
                animation = setInterval(displayNextFrame, playSpeed);
            } else {
                animation = setInterval(displayPreviousFrame, playSpeed);
            }
        };

        var doPause = function () {
            playPauseControl.attr("class", "play");
            isPlaying = false;

            if (isBouncing) {
                bounceRotationCount = 0;
                isBouncingFinished = false;
            }

            clearInterval(animation);
        };

        if (isPlaying) {
            clearInterval(animation);
            doPlay();
        }

        // Send a message to the parent
        var sendMessage = function (msg) {
            // Make sure you are sending a string, and to stringify JSON
            window.parent.postMessage(msg, '*');
        };

        displayHotspot();

    });
});