var Lang={
	language:undefined,
	init:function() {
		this.language=this.getFromLocalStorage();
		if(!this.language) {
			this.language='pt-br';
		}
	},
	highlightFlag:function() {
		var f;
		for (i in this.languages) {
			f=this.getObj('flag-'+this.languages[i]);
			f.style.border='none';
			f.style.borderRadius='50%';
		}
		f=this.getObj('flag-'+this.language);
		f.style.border='2px solid white';
		f.style.borderRadius='unset';
	},
	change:function(l) {
		if(l!==undefined && Translation[l]) {
			this.language=l;
		}
		this.apply();
		AuthenticationTranslation.changeLanguage(l);
		graph.resetFilters();
		graph.build();
	},
	setInLocalStorage:function() {
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("langcode", this.language);
		} else {
		    console.log("Sorry! No Web Storage support..");
		}
	},
	getFromLocalStorage:function() {
		if (typeof(Storage) !== "undefined") {
			var langcode=localStorage.getItem("langcode");
			if(!langcode) {
				langcode = this.language;
			}
		}else {
		    console.log("Sorry! No Web Storage support..");
		}
		return langcode;
	},
	getObj:function(id) {
		return document.getElementById(id);
	},
	apply:function() {
		this.setInLocalStorage();
		this.highlightFlag();
		this.changeInfoForClasses();
		var obj=Translation[this.language];
		for (var property in obj) {
			if (obj.hasOwnProperty(property)) {
				var o=this.getObj(property);
				if(o){
					if(o.title!==""){
						o.title=obj[property];
					}else{
						o.innerHTML=obj[property];
					}
				}
			}
		}
	},
	changeInfoForClasses: function() {
		// a hardcoded way to change the HTML fragment with embedded texts
		for (i in this.languages) {
			f=this.getObj('info_classes_'+this.languages[i]);
			if(f)
				f.style.display=((this.languages[i]==this.language)?('block'):('none'));
		}
	},
	languages:['pt-br','en']
};