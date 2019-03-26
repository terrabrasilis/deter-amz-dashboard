var dataTable = function(divId) {
	
	var dt=
	{
		config:{},
	    tbContainer:null,
	    tb:null,
	    data:null,
		setConfig: function(config) {
			utils.config=config;
		},
		initContainer: function(c) {
			if(c) {
	            this.tbContainer=document.getElementById(c);
	            if(this.tbContainer) {
	                return true;
	            }
	        }
			try{
			var dv = document.createElement("div");
			dv.setAttribute('id', 'data-table');
			document.body.appendChild(dv);
			this.tbContainer=dv;
			}catch (e) {
				// TODO: handle exception
				console.log('Container object is empty.');
				return false;
			}
			return true;
		},
		init:function(json) {
	        if(!json) {
	            console.log('Collection data is empty.');
	            return false;
	        }
	        this.data = json;
	        this.build();
		},
		build: function() {
			var d=[];
			this.data.forEach(function(o) {

				var yearIndex=o.year.toString()+" ";
				if(d.indexOf(yearIndex)<0){
					d.push(yearIndex);
					d[yearIndex]=[];
				}
				d[yearIndex].push({u:o.uf,r:o.rate});
			});
	
			this.tb = document.createElement("table"),
			tbody = document.createElement("tbody");
			this.tb.setAttribute('class', 'table table-hover table-condensed table-bordered');
	
			var hasTableHeader=false;
	
	        for (var i=0; i<d.length; ++i) {
				var theader=null,
				thead = document.createElement("thead"),
				tr = document.createElement("tr"),
				td = document.createElement("td");
				td.setAttribute('style', 'font-weight:bold');
				td.innerText=d[i];
				tr.appendChild(td);
				if(!hasTableHeader) {
					theader = document.createElement("tr");
					theader.setAttribute('class', 'table-header');
					var th = document.createElement("th");
					th.innerText=Translation[Lang.language].tableYearState;
					theader.appendChild(th);
					hasTableHeader=true;
				}
	
				var dy=d[d[i]];
	            for (var j=0; j<dy.length; ++j) {
					if(theader) {
						var th = document.createElement("th");
						th.innerText=dy[j].u;
						theader.appendChild(th);
					}
	                var col = document.createElement("td");
	                col.innerText=dy[j].r;
	                tr.appendChild(col);
	            }
	            if(theader) {
	            	thead.appendChild(theader);
	            	this.tb.appendChild(thead);
	            }
	            tbody.appendChild(tr);
	        }
			this.tb.appendChild(tbody);
		},
		redraw: function() {
			if(this.tbContainer.childNodes[0]) {
				this.tbContainer.removeChild(this.tbContainer.childNodes[0]);
			}
			this.tbContainer.appendChild(this.tb);
		}
	};
	if(dt.initContainer(divId)){
		return dt;
	}else{
		return null;
	}
}