


$(document).ready(function(){



    $(function(){
        $(".btn-primary").click(function () {
           $(this).text(function(i, text){
               return text === "Hide the Party Members" ? "See the Party Members" : "Hide the Party Members";
           })
        });
     })


});