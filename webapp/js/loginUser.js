$(document).ready(function () {
    // value that will be stored in local storage after login
    var myToken = null;
    var user = null;
    var msg = null;
    
    // read file.json with credential of login in format: {"username":"name_admin","password":"pass_admin"}
    var json =  $.getJSON("./data/tokenLogin.json");

    var attempt = 3; // Count number of attempts.
    // Verify if user and password are correct
    function validateUser(user, pass){
        var username = user; 
        var password = pass; 
        if ( username == "user1" && password == "user#123"){
            loginUser(username);
            alert ("Login com sucesso!");
            return true;
        }else{
            attempt --;// Decrementing by one.
            alert("Você tem "+attempt+" tentativas. O nome de usuário ou senha está incorreta. Verifique se CAPS LOCK não está ativado. Se você receber essa mensagem novamente, entre em contato com o administrador do sistema para garantir que você tenha as permissões corretas para logar no ambiente.");
            // Disabling fields after 3 attempts.
            if( attempt === 0){
                attempt = 1;
                document.getElementById("username").disabled = true;
                document.getElementById("password").disabled = true;
                document.getElementById("submit").disabled = true;
            return false;
            }
        }
    }    
    
    function loginUser(){    
        // get token
        $("#submitLogin").click(function(){
            
            user = document.getElementById('username').value;
            var pass = document.getElementById("password").value;
            
            // verify if user is valide
            var result = validateUser(user, pass);
            if (result == true){
                attempt = 3; // restart number of attempts

                console.log("Logging in.");

                //user = uername;
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

                    logoutUser();
                    
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
            }else{
                }
        });
    }

    function logoutUser(){
        $("#goto_modal_logout").click(function(){
            $('#goto_modal_login').show();
            $('#goto_modal_logout').hide();

            console.log("Logging out.");
            Token.change("myLoginToken"); 

            // Show the DETER data not updated
            window.onload();
        });
    }
   
    // init by login user
    loginUser();

});  
