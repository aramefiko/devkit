$(document).ready(function () {
    $('.caption-text').each(function () {
        $(this).replaceWith('<a class="caption-text">' + $(this).html() + '</a>');
    });
    $('.caption-text').next().hide();
    $('.caption-text').on('click', function () {
        $('.caption-text').next().hide();
        $(this).closest('.caption-text').next().show();
    });
    $('.current').closest('.toctree-l1').find('.caption-text').next().show();
    $('footer').remove();
    $('.wy-nav-content').css('max-width','none');
});
