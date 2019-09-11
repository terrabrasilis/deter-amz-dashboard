$(document).ready(function () {
    // value that will be stored in local storage after login
    var myToken = null;
    var user = null;
    var msg = null;
    
    // read file.json with credential of login in format: {"username":"name_admin","password":"pass_admin"}
    var json =  $.getJSON("./data/tokenLogin.json");

    // get token
    $("#submitLogin").click(function(){
        console.log("Logging in.");
        user = document.getElementById('username').value;
        // console.log("user: ", user);
    
        $.ajax("http://brazildatacube.dpi.inpe.br/oauth/auth/login", {
            type: "POST",
            data: json.responseText,
            contentType: "application/json",
        }).done(function (data) {
            // get token, put in local storage and change logout text by name + Logout
            myToken=data.access_token;
            Token.change(myToken); 
            msg=user+ " Logout";
            document.getElementById("goto_modal_logout").innerHTML=msg;
            $('#goto_modal_login').hide();
            $('#goto_modal_logout').show();
            
            // Hide the DETER data not updated and show the newest. In this case show a message
            $('#charts-painel').hide();
            $('#loading_data_info').hide();
            $('#info_container').show();
            $('#panel_container').hide();
            $('#warning_data_info').show();
            $('#radio-area').hide();
            $('#radio-alerts').hide();

            // //verify user
            // $.ajax("http://brazildatacube.dpi.inpe.br/oauth/users/", {
            //     type: "GET",
            //     data: "5d4b2d3442fb78c6b702eea1",
            //     // contentType: "application/json",
            //     Authorization: "Bearer " + myToken,
            // }).done(function (data) {
            //     myToken=data.access_token;
            //     Token.change(myToken); 
            //     console.log("User finded: ", data);
            //     msg=user+ " Logout";
            //     document.getElementById("goto_modal_logout").innerHTML=msg;
            //     $('#goto_modal_login').hide();
            //     $('#goto_modal_logout').show();
            // }).fail(function (xhr, status, error) {
            //     console.log("User does not exist");
            //     console.log("Could not reach the API: " + error);
            // });    

        }).fail(function (xhr, status, error) {
            console.log("Could not reach the API: " + error);
        });
        });

    $("#goto_modal_logout").click(function(){
        $('#goto_modal_login').show();
        $('#goto_modal_logout').hide();

        console.log("Logging out.");
        Token.change("myLoginToken"); 

        // Show the DETER data not updated
        window.onload();
    });

   
});  
