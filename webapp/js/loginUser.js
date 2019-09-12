$(document).ready(function () {
    // value that will be stored in local storage after login
    var myToken = null;
    var user = null;
    var msg = null;
   
    var attempt = 3; // Count number of attempts.
    
    function loginUser(){    
        // get token
        $("#submitLogin").click(function(){
            
            user = document.getElementById('username').value;
            var pass = document.getElementById("password").value;
            
                console.log("Logging in.");

                //user = uername;
                // console.log("user: ", user);
            
                $.ajax("http://brazildatacube.dpi.inpe.br/oauth/auth/login", {
                    type: "POST",
                    data: JSON.stringify({
                        username: user,
                        password: pass
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

                    logoutUser();
                    
                    // Hide the DETER data not updated and show the newest. In this case show a message
                    $('#charts-painel').hide();
                    $('#loading_data_info').hide();
                    $('#info_container').show();
                    $('#panel_container').hide();
                    $('#warning_data_info').show();
                    $('#radio-area').hide();
                    $('#radio-alerts').hide();

                }).fail(function (xhr, status, error) {
                    attempt --;// Decrementing by one.
                    console.log("Could not reach the API: " + error);
                    alert("Você tem "+attempt+" tentativas. O nome de usuário ou senha está incorreta. Verifique se CAPS LOCK não está ativado. Se você receber essa mensagem novamente, entre em contato com o administrador do sistema para garantir que você tenha as permissões corretas para logar no ambiente.");
                    if( attempt === 0){
                        attempt = 1;
                        document.getElementById("username").disabled = true;
                        document.getElementById("password").disabled = true;
                        document.getElementById("submit").disabled = true;
                    return false;
                    }
                });
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
   
    // init by login user function
    loginUser();

});  
