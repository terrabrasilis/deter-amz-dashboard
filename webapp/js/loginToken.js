var Token={
  baseURL:"http://brazildatacube.dpi.inpe.br",
  tokenKey:"login_token",
  expiredKey: "expired_token",
  usedInfoKey: "user_info",

  login(user,pass) {
    $.ajax(this.baseURL+"/oauth/auth/login", {
      type: "POST",
      dataType: 'json',
      data: '{ "username": "'+user+'","password": "'+pass+'" }',
      contentType: "application/json",
    }).done(function (data) {
        Token.loadUserInfo(data.user_id,data.access_token);

    }).fail(function (xhr, status, error) {
        console.log("Could not reach the API: " + error);
    });
  },

  loadUserInfo(userId,userToken) {
    $.ajax(this.baseURL+"/oauth/users/"+userId, {
      type: "GET",
      dataType: 'json',
      headers: {
        "Authorization": "Bearer " + userToken
        },
      contentType: "application/json",
    }).done(function (data) {
        Token.setUserInfo(JSON.stringify(data));
        loginUI.displayUserInfo();
    }).fail(function (xhr, status, error) {
        console.log("Could not reach the API: " + error);
    });
  },

  loadAppToken(user,pass) {
    $.ajax(this.baseURL+"/oauth/auth/token?service=terrabrasilis&scope=portal:dash:admin", {
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
        loginUI.logged();
        graph.restart();

    }).fail(function (xhr, status, error) {
        console.log("Could not reach the API: " + error);
    });
  },

  logout() {
    this.removeToken();
    this.removeUserInfo();
    this.removeExpiredToken();
  },

  getUserInfo() {
    return JSON.parse(this.getValueByKey(this.usedInfoKey));
  },

  setUserInfo(value) {
    this.setKey(this.usedInfoKey,value);
  },

  removeUserInfo() {
    this.setKey(this.usedInfoKey,null);
  },
  
  hasToken() {
    var token=this.getValueByKey(this.tokenKey);
    return (token && token!="");
  },
  
  removeToken() {
    this.setKey(this.tokenKey,null);
  },

  getToken() {
    return this.getValueByKey(this.tokenKey);
  },

  setToken(value) {
    this.setKey(this.tokenKey,value);
  },

  isExpiredToken() {
    return this.getValueByKey(this.expiredKey)==="true";
  },

  setExpiredToken(state) {
    this.setKey(this.expiredKey,state);
  },

  removeExpiredToken() {
    this.setKey(this.expiredKey,null);
  },

  parseJwt(token) {
      var base64Url = token.split('.')[1]
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))

      return JSON.parse(jsonPayload)
  },

  /**
   * Set a new value for the specified key.
   * To remove one key, set the value with null or undefined
   * 
   * @param {string} key The name of key
   * @param {any} value The value of key
   */
  setKey(key,value) {
    if (typeof(Storage) !== "undefined") {
      if(value===undefined || value===null) {
        localStorage.removeItem(key);
      }else{
        localStorage.setItem(key, value);
      }
    }else {
        console.log("Sorry! No Web Storage support..");
    }
  },

  getValueByKey(key) {
    var value=null;
    if (typeof(Storage) !== "undefined") {
      value=localStorage.getItem(key);
    }else{
        console.log("Sorry! No Web Storage support..");
    }
    return value;
  }
}
