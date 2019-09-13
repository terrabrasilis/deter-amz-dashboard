$(document).ready(function () {
    // when reload page, evaluate the login state by read tiken from local storage
    if(Token.hasToken()) {
        $('#login_box').hide();
        $('#logout_box').show();
    }else{
        $('#login_box').show();
        $('#logout_box').hide();
    }

    // get token
    $("#submitLogin").click(function(){
        
        var user = document.getElementById('username').value;
        var pass = document.getElementById("password").value;

        $.ajax("http://brazildatacube.dpi.inpe.br/oauth/auth/token?service=terrabrasilis&scope=portal:dash:admin", {
            type: "GET",
            dataType: 'json',
            headers: {
                "Authorization": "Basic " + btoa(user + ":" + pass)
                },
            data: '{ "comment" }',
            contentType: "application/json",    
        }).done(function (data) {
            
            var myToken=data.access_token;
            Token.setToken(myToken);
            $('#login_box').hide();
            $('#logout_box').show();
            graph.restart();

        }).fail(function (xhr, status, error) {
            console.log("Could not reach the API: " + error);
        });
    });

    $("#submitLogout").click(function(){
        $('#login_box').show();
        $('#logout_box').hide();

        Token.removeToken();
        graph.restart();
    });
});  
