$(document).ready(function (e) {
    var isTouchSupported = 'ontouchstart' in window,
        startEvent = isTouchSupported ? 'touchstart' : 'mouseover',
        moveEvent = isTouchSupported ? 'touchmove' : 'mousemove',
        endEvent = isTouchSupported ? 'touchend' : 'mouseout';

    let isZooming = false;

    // Product content toggling
    var productBtns = document.getElementById('btn-group');
    var btns = document.getElementsByClassName('btn');
    var productContent = document.getElementsByClassName('product');
    var activeProduct = '';
    var activeProductImagewrap = '';

    document.getElementsByClassName('btn')[0].click();

    var $body = $("body"),
        $contactBtn = $("#contactBtn"),
        $blocker = $("#blocker"),
        currentOverlay = "";

    var $cancelBtn = document.getElementById('cancelContact');
    var $submitBtn = document.getElementById('submitContact');

    $cancelBtn.addEventListener('click', function () {
        hideOverlay('#contact-overlay')
    });
    
    $submitBtn.addEventListener('click', sendFormMsg);

    for (let i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', openProduct);
    }

    function openProduct(evt) {
        // console.log(`openProduct(${evt.target.innerHTML})`);

        var productNum = evt.target.innerHTML;
        var product = 'product' + productNum;
        var productImagewrap = 'image-wrap' + productNum;
        activeProduct = document.getElementById(product);
        activeProductImagewrap = document.getElementById(productImagewrap);

        for (let i = 0; i < productContent.length; i++) {
            productContent[i].style.display = "none";
        }
        for (let i = 0; i < btns.length; i++) {
            btns[i].classList.remove('active');
        }

        activeProduct.style.display = "block";
        evt.target.classList.add('active');

        // debugger;

        // Active iframe
        var activeIframe = 'iframe' + productNum;
        var activeIframeEl = document.getElementById(activeIframe);
        activeIframeEl.contentWindow.postMessage('loadProduct', '*');
    }

    // addEventListener support for IE8
    function bindEvent(element, eventName, eventHandler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, eventHandler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler);
        }
    }

    // Listen to messages from parent window
    bindEvent(window, 'message', function (e) {
        let message = e.data;

        switch (message) {
            case 'isZooming':
                isZooming = true;
                break;

            case 'notZooming':
                isZooming = false;
                break;

            case 'disableIcon':
                break;

            default:
                if (!isZooming) {}
                return;
        }
    });

    $($contactBtn).on('click', function (event) {
        event.preventDefault();
        var view = this.getAttribute('data-view');
        showOverlay(view);
    });

    var showOverlay = function (name) {
        currentOverlay = name;
        $blocker.addClass("active");
        $blocker.click(hideOverlay);
        $(name).addClass("active");
        $body.addClass("noflow");
    };

    function hideOverlay(name) {
        $blocker.removeClass("active");
        $(currentOverlay).removeClass("active");
        $body.removeClass("noflow");
    }

    function sendFormMsg() {
        console.log('sendFormMsg()');
        $.ajax({
            url: 'sendMail.php',
            type: "POST",
            data: $("#form1").serialize(),
            complete: function (dataObj) {
                alert(
                    "Thank you for sending a message to ATP Learning Solutions. We will be in contact with you within 24 business hours."
                );

                hideOverlay('#contact-overlay');
            }
        });
    }
});