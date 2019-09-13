let loginUI={

    init() {
        $(document).ready(function () {
            // when reload page, evaluate the login state by read tiken from local storage
            loginUI.evaluate();
        
            // get token
            $("#submitLogin").click(function(){
                
                let user = $('#username').val();
                let pass = $('#password').val();
        
                Token.login(user,pass);
                Token.loadAppToken(user,pass);
            });
        
            $("#submitLogout").click(function(){
                Token.logout();
                loginUI.leave();
                graph.restart();
            });
        });
    },

    evaluate() {
        if(Token.hasToken()) {
            loginUI.logged();
        }else{
            loginUI.leave();
        }
    },

    logged() {
        $('#login_box').hide();
        $('#logout_box').show();
        this.displayUserInfo();
    },

    leave() {
        $('#login_box').show();
        $('#logout_box').hide();
    },

    displayUserInfo() {
        let info=Token.getUserInfo();
        if(info && info.name) {
            $('#userName').text(info.name);
            $('#userInstitution').text(info.institution);
        }
    }
};