$(window).load(function () {
    jQuery(document).ready(function ($) {
        var $imageWrap = $('image-wrap');
        var $spinIcon = $('drag-icon');

        $imageWrap.addEventListener()

    });
});


window.onload = function () {
    var imageWrap = document.getElementsByClassName('image-wrap');
    var spinIcon = document.getElementsByClassName('drag-icon');

    imageWrap.addEventListener('mousedown', function () {
        spinIcon.setAttribute('display', 'none');
        console.log("mousedown");
    })
    imageWrap.addEventListener('mouseup', function () {
        spinIcon.setAttribute('display', 'visible');
        console.log("mouseup");
    })
};