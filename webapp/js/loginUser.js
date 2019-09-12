$(document).ready(function () {
    // value that will be stored in local storage after login
    var myToken = null;
    
    function loginUser(){    
        // get token
        $("#submitLogin").click(function(){
            
            var user = document.getElementById('username').value;
            var pass = document.getElementById("password").value;
            var msg = null;

            $.ajax("http://brazildatacube.dpi.inpe.br/oauth/auth/token?service=terrabrasilis&scope=portal:dash:admin", {
                type: "GET",
                dataType: 'json',
                headers: {
                    "Authorization": "Basic " + btoa(user + ":" + pass)
                  },
                data: '{ "comment" }',
                contentType: "application/json",    
            }).done(function (data) {
                // get token, put in local storage and change logout text by name + Logout
                console.log("Logging in.");

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
                console.log("Could not reach the API: " + error);
                $('#modal-container-warning').modal('show');
              });
        });
    }

    function logoutUser(){
        $("#goto_modal_logout").click(function(){
            $('#goto_modal_login').show();
            $('#goto_modal_logout').hide();

            console.log("Logging out.");
            Token.change(""); 

            // Show the DETER data not updated
            window.onload();
        });
    }
   
    // init by login user function
    loginUser();
    Token.init();

});  
