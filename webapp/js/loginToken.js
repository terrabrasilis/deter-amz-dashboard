var Token={
  logintoken:undefined,
  // init local storage with a fake token
  init:function() {
		this.logintoken=this.getFromLocalStorage();
		if(!this.logintoken) {
			  this.logintoken='';
		}
  },
  
  // change value of token when to perform login
  change:function(newtoken) {
		if(newtoken!==undefined) {
			this.logintoken=newtoken;
		}
		this.apply();
	},

  // set local storage
	setInLocalStorage:function() {
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("logintoken", this.logintoken);
    } else {
        console.log("Sorry! No Web Storage support..");
    }
  },

  // get value in local storage
  getFromLocalStorage:function() {
    if (typeof(Storage) !== "undefined") {
      var logintk=localStorage.getItem("logintoken");
      // console.log(logintk);
      if(!logintk) {
        logintk = this.logintoken;
      }
    }else {
        console.log("Sorry! No Web Storage support..");
    }
    return logintk;
  },
  
  // apply new value for local storage
  apply:function() {
    this.setInLocalStorage();
  },

}
