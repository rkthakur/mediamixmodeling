
function showcontent(x) {
     $('#aboutresult .aboutresult').each(function(index) {
          if ($(this).attr("id") == x) {
               $(this).slideDown();
          }
          else {
               $(this).slideUp();
          }
     });
}

$(document).ready(function(e) {
    $(".service-box a").click(function(e){
      e.preventDefault();
      var _div = $(this).data('controls').toString();
      showcontent(_div)
    })
});
