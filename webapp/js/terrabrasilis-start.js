$(document).ready(function () {
    $("#notice").click(function () {
        EasyCookie.create("firstNotice", "Not show modal again", 30);
    });
    $("#notice-cloud").click(function () {
        EasyCookie.create("cloudNotice", "Not show modal again", 30);
    });
    /**
    * Show the main TerraBrasilis modal
    */
    let cookieFirstNotice = EasyCookie.read("firstNotice");
    if (cookieFirstNotice === null) {
        $('#firstNotice').modal('show');
    }
    
    //carousel
    $('.carousel').carousel({
        interval: 2000
    });
    
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#sidebarCollapse, #prepare_print').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        // no sense because when side bar has class active the return is false
        if($('#sidebar').hasClass('active')){// if open
            $('#panel_container').addClass('full-width');
        }else{//if close
            $('#panel_container').removeClass('full-width');
        }
        graph.doResize();
    });
});

/* Altera icone do accordion da tabela */

$(document).ready(function () {
    $('.collapse')
        .on('shown.bs.collapse', function() {
            $(this)
                .parent()
                .find(".fa-plus-circle")
                .removeClass("fa-plus-circle")
                .addClass("fa-minus-circle");
        })
        .on('hidden.bs.collapse', function() {
            $(this)
                .parent()
                .find(".fa-minus-circle")
                .removeClass("fa-minus-circle")
                .addClass("fa-plus-circle");
        });
});

$(document).ready(function () {

    let versionDiv = $('#version');
    let hn=document.location.hostname;
    if(versionDiv.length>0)
    {
        if(hn.includes('127.')||hn.includes('localhost'))
            versionDiv.append('ver: IN_DEV_ENV');
        else
            $.getJSON('PROJECT_VERSION', function(data) {
                let version = data.version;
                versionDiv.append('ver: '+version);
            });
    }
});