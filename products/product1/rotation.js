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
        var isTopWindow = false;

        var topContainer = $("#topContainer");
        var hotspotCanvas = $("#hotspotcanvas");
        var isHotspotImage = false;

        var fullscreenControl = $("#fullscreen");
        var playPauseControl = $("#play");
        var wasPlaying = false;
        var prevControl = $("#prev");
        var nextControl = $("#next");
        var imageContainer = $("#imageContainer");
        var images = imageContainer.find("img");
        var imagesCount = images.length;
        var isClicked = false;
        var currentPosition;
        var currentImage = 0;
        var previousImage = 0;

        var animation;
        var canvas;

        var isBouncingFinished = false;
        var bounceRotationCount = 0;

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