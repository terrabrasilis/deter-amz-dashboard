$(document).ready(function () {
    // value that will be stored in local storage after login
    var myToken = null;
    var user = null;
    var msg = null;

    // get token
    $("#submitLogin").click(function(){
        console.log("Logging in.");
        user = document.getElementById('username').value;
        // console.log("user: ", user);

        $.ajax("http://brazildatacube.dpi.inpe.br/oauth/auth/login", {
            type: "POST",
            data: JSON.stringify({
                username: "adelinemaciel",
                password: "terra#01"
            }),
            contentType: "application/json",
        }).done(function (data) {
            // get token, put in local storage and change logout text by name + Logout
            myToken=data.access_token;
            Token.change(myToken); 
            msg=user+ " Logout";
            document.getElementById("goto_modal_logout").innerHTML=msg;
            $('#goto_modal_login').hide();
            $('#goto_modal_logout').show();
        }).fail(function (xhr, status, error) {
            console.log("Could not reach the API: " + error);
        });
        });

        //  //verify user
        //  $.ajax("brazildatacube.dpi.inpe.br/oauth/users/", {
        //     type: "GET",
        //     data: JSON.stringify({
        //         username: "username",
        //         password: "password"
        //     }),
        //     contentType: "application/json",
        //     Authorization: "Bearer " + myToken,
        // }).done(function (data) {
        //     // console.log(data);
        //     //myToken=data.access_token;
        //     // console.log(myToken);
        //     //Token.change(myToken); 
        //     msg=user+ " Logout";
        //     document.getElementById("goto_modal_logout").innerHTML=msg;
        //     $('#goto_modal_login').hide();
        //     $('#goto_modal_logout').show();
        // }).fail(function (xhr, status, error) {
        //     console.log("User does not exist");
        //     console.log("Could not reach the API: " + error);
        // });


    $("#goto_modal_logout").click(function(){
        $('#goto_modal_login').show();
        $('#goto_modal_logout').hide();

        console.log("Logging out.");
        Token.change("myLoginToken"); 
    });

   
});  
