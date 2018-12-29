import $ from 'jquery';

var ChangeLayout={
    resize: function () {
        var total_height = $(window).height();
        var page_height = total_height - 46;
        var bar_height = page_height - 14;
        $('#page').outerHeight(page_height);
        $('#left').outerHeight(bar_height);
        $('#middle').outerHeight(bar_height);
        $('#right').outerHeight(bar_height);
        // $('#panel_box').outerHeight(bar_height - 285);
        $('#abnormal_items').css('max-height', bar_height - 260);
        $('#normal_items').css('max-height', bar_height - 260);
        if($('#objective_item_box')){
            $('#objective_item_box').css({
                'max-height': bar_height - 150
            })
        }
    },
}
export default ChangeLayout;
