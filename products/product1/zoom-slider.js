if ($) $(function () {

    var isTopWindow = false;
    var messageForExitZoom = "<button type='button' class='btn btn-warning safety'>Return to 360 Mode</button>";
    var controllerContainer = $("#controllerContainer");

    var imageContainer = $("#imageContainer");
    var images = imageContainer.find("img");

    var $zoomSlider = $('.zoom-slider');
    var timeout = false;
    var lastX = false;

    var deepZoom = 1;
    var zoomIn = $("#zoomin");
    zoomIn.html("");
    var zoomCheck = $("#zoomcheck");

    var zoomContainer = $("#zoomContainer");
    var draggableContainer = $("#draggableContainer");
    var topContainer = $("#topContainer");

    // default initial zoom parameters
    var valueZoom = 1.0;
    var minZoom = 1.0;
    var maxZoom = 2;
    var stepZoom = 0.1;

    var isZooming = false;
    var isZoomClicked = false;
    var currentZoomXPosition = 0;
    var currentZoomYPosition = 0;
    var zoomBackgroundPosition = "center";

    var zoomDragPosX = 0;
    var zoomDragPosY = 0;
    var zoomedDraggableWidth = 0;
    var zoomedDraggableHeight = 0;

    var isFirstDrag = true;

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


    // *******************
    // Draggable Container
    // *******************
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

    $(document).on('click', '#exitZoomBtn', function (e) {
        console.log('exitZoom');

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

    //Firefox
    topContainer.on("DOMMouseScroll", function (e) {
        if (mouseZoom) {

            isFirstDrag = true;

            if (e.originalEvent.detail > 0) {
                //scroll down
                valueZoom -= stepZoom;
                valueZoom = (valueZoom < minZoom) ? minZoom : valueZoom;
                console.log('valueZoom=' + valueZoom + ', ' + valueZoom * 100);
                zsMoveSlider((valueZoom - 1) * 100);
            } else {
                //scroll up
                valueZoom += stepZoom;
                valueZoom = (valueZoom > maxZoom) ? maxZoom : valueZoom;
                console.log('valueZoom=' + valueZoom + ', ' + valueZoom * 100);
                zsMoveSlider((valueZoom - 1) * 100);
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
                zsMoveSlider((valueZoom - 1) * 100);
            } else {
                //scroll up
                valueZoom += stepZoom;
                valueZoom = (valueZoom > maxZoom) ? maxZoom : valueZoom;
                zsMoveSlider((valueZoom - 1) * 100);
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

    // slider.on("slide", function (e, ui) {

    //     slider.slider("value", ui.value);
    //     var slideValue = (ui.value) ? (ui.value / 100) : 0;

    //     isFirstDrag = true;

    //     if (slideValue > maxSlideValue) {
    //         //scroll down
    //         valueZoom = 1 + slideValue;
    //         valueZoom = (valueZoom < minZoom) ? minZoom : valueZoom;
    //     } else {
    //         //scroll up
    //         valueZoom = 1 + slideValue;
    //         valueZoom = (valueZoom > maxZoom) ? maxZoom : valueZoom;
    //     }

    //     if ((valueZoom > minZoom) && (valueZoom < maxZoom)) {
    //         doZoom();
    //     }

    //     if (valueZoom < 1.1) {
    //         exitZoom();
    //     }
    //     console.log(ui.value + ", " + slideValue + ", " + maxSlideValue + ", " + valueZoom);
    //     maxSlideValue = slideValue;


    //     //prevent page fom scrolling
    //     return false;
    // });

    zoomContainer.on("mousedown touchstart", function (e) {
        if (isHotspotImage) {
            hideHotspotImage();
        }
    });

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

    var doZoom = function () {
        isZooming = true;
        sendMessage('isZooming');

        zoomIn.removeClass("zoomin");
        zoomIn.addClass("zoomout");
        zoomIn.html(messageForExitZoom);

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


    // *******************
    // Zoom Slider
    // *******************
    var zsUpdateData = function (who, doColor, doNumber, number) {
        console.log(`zsUpdateData(who:${who}, doColor:${doColor}, doNumber:${doNumber}, number:${number})`);
        // if (doNumber) {
        //     $(who).parent().find('.zoom-slider-preview').html(number);
        // }
        // if (doColor) {
        //     var color = Math.round(v * 192 / 200)
        //     $(who).parent().find('.zoom-slider-preview').css('background', 'rgb(' + (192 - color) +
        //         ',' + color + ',192)');
        // }
    };

    var zsUpdateSlider = function (who, event, isFinal, isForReal = false) {
        console.log(`zsUpdateSlider(who:${who}, event:${event}, isFinal:${isFinal}, isForReal:${isForReal})`);
        var x = event.clientX;
        if (event.originalEvent.touches && event.originalEvent.touches.length > 0) x = event
            .originalEvent.changedTouches[0].clientX;
        if (!x) x = lastX;
        lastX = x;
        if (!isForReal && $(who).parent().is('.zoom-slider-slow')) {
            if (!timeout) {
                timeout = setTimeout(function () {
                    zsUpdateSlider(who, event, isFinal, true);
                    timeout = false;
                }, 200 + Math.random() * 200);
            }
            return false;
        }
        if (!who) return false;
        if (!isFinal && $(who).parent().is('.zoom-slider-bad-release-only')) return false;
        v = (x - $(who).find('.zoom-slider-slide').offset().left);
        if (v < 0) v = 0;
        if (v > 200) v = 200;
        $(who).find('.zoom-slider-slider').css('left', v);
        // console.log($(who).parent().find('.zoom-slider-preview'));
        if (isFinal || !$(who).parent().is('.zoom-slider-preview-release-only')) {
            if ($(who).parent().is('.zoom-slider-slow-data')) {
                if ($(who).parent().is('.zoom-slider-slow-data-partial')) {
                    zsUpdateData(who, false, true, Math.round(v / 2));
                }
                if (!timeout) {
                    timeout = setTimeout(function () {
                        zsUpdateData(who, true, true, Math.round(v / 2));
                        timeout = false;
                    }, 200 + Math.random() * 200);
                }
            } else {
                zsUpdateData(who, true, true, Math.round(v / 2));
            }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    };

    var zsMoveSlider = function (valueZoom) {
        console.log(`zsMoveSlider(valueZoom:${valueZoom})`);

        v = valueZoom * 2;
        if (v < 0) v = 0;
        if (v > 200) v = 200;
        $(this).find('.zoom-slider-slider').css('left', v);

        event.stopPropagation();
        event.preventDefault();
        return false;
    };

    var current = false;

    var zsMouseDown = function (event) {
        console.log(event.target);
        if ($(this).parent().is('.zoom-slider-bad-handle-only')) {
            if (!$(event.target).is('.zoom-slider-slider, .zoom-slider-handle')) return;
        }
        if ($(this).parent().is('.zoom-slider-bad-groove-only')) {
            if (!$(event.target).is(
                    '.zoom-slider-slide-groove, .zoom-slider-slider, .zoom-slider-handle')) return;
        }
        if ($(this).parent().is('.zoom-slider-bad-jump-only')) {
            if (!$(event.target).is('.zoom-slider-slider, .zoom-slider-handle'))
                return zsUpdateSlider(this, event, false);
        }
        current = this;
        $(current).addClass('slider-is-current');
        return zsUpdateSlider(current, event, false);
    };

    var zsMouseUp = function (event) {
        zsUpdateSlider(current, event, true);
        $(current).removeClass('slider-is-current');
        current = false;
        return false;
    };

    var zsMouseMove = function (event) {
        if (!current) return;
        return zsUpdateSlider(current, event, false);
    };

    // Send a message to the parent
    var sendMessage = function (msg) {
        // Make sure you are sending a string, and to stringify JSON
        window.parent.postMessage(msg, '*');
    };

    $('.zoom-slider-slide-area').bind('mousedown touchstart', zsMouseDown);
    $(document.body).bind('mouseup touchend touchcancel', zsMouseUp);
    $(document.body).bind('mousemove touchmove', zsMouseMove);
});