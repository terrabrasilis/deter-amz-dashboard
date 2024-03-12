/**
 * @ file mun-search-engine.js
 * Provide a search engine over municipalities
 * 
 * To use this code you need inject the button code below into your HTML page 
 * 
 * <a href="#modal-container-filtered" role="button" data-toggle="modal" class="search-mun boxsearch">
 *      <span aria-hidden="true" id="txt33" title="Procurar um município."><i class="material-icons" style="color:gray">pageview</i></span>
 * </a>
 * 
 * To clean filterd itens call this function.
 *  SearchEngine.applyCountyFilter();
 * 
 * To start this object, call init function after render all dc charts.
 *  SearchEngine.init(munChart, stateChart, 'idModal');
 * 
 * 
 */
var SearchEngine = {
    top10ByMunChartReference: null,
    stateChartReference: null,
    munGroup: null,

    /**
     * @param munChart is the reference to dcjs chart object for top 10 municipality.
     * @param stateChart is the reference to dcjs state chart object for display filtered results regard the previously selected states.
     * @param idModal is the id for the div element to insert the html code for inject the search modal window.
     */
    init: function(munChart, stateChart, idModal) {
        this.top10ByMunChartReference=munChart;
        this.stateChartReference=stateChart;
        this.munGroup = this.top10ByMunChartReference.dimension().group().reduceCount(function(d) {return d;});
        this.injectSearchModalWindow(idModal);
    },
    injectSearchModalWindow: function(idModal) {

        var modalHTML=''+
        '<div class="modal fade" id="modal-container-filtered">'+
            '<div class="modal-dialog logo-card">'+
                '<div class="modal-content modalinf">'+
                    '<div class="modal-header fechar">'+
                        '<h5 class="modal-title boxtitletable"> <span id="txt1f">Pesquisa de municípios</span></h5>'+
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="material-icons">clear</i></button>'+
                    '</div>'+
                    '<div class="modal-body">'+
                        '<span id="txt1g">Encontre um município.</span>'+
                        '<div class="input-group input-group-sm search-form">'+
                            '<input autofocus id="search-county" onkeypress="SearchEngine.searchCountyByEnterKey(event)" type="text" class="form-control" placeholder="Search">'+
                            '<label>'+
                                '<button class="btn btngreen btnsearch" onclick="SearchEngine.searchCounty()"><i class="material-icons">search</i></button>'+
                            '</label>'+
                        '</div>'+
                        '<span id="txt1h" style="display:none;">Selecione um item na lista de municípios encontrados.</span>'+
                        '<div class="counties-list"><ul id="filtered-list"></ul></div>'+
                        '<span id="txt1w" style="display:none; color: red;">* Municípios sem valor a apresentar. Área ou número de alertas é zero.</span>'+
                    '</div>'+
                    '<div class="modal-footer">'+
                        '<div class="checkbox pull-right">'+
                            '<label>'+
                                '<button type="button" class="btn btngreen" data-dismiss="modal">'+
                                '<span id="txt1i">Fechar</span>'+
                            '</button>'+
                            '</label>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>';

        $('#'+idModal).html(modalHTML);

    },
    searchCountyByEnterKey: function(key){
        if(key.keyCode==13){
            SearchEngine.searchCounty();
        }
        return key;
    },
    searchCounty:function(){
        var r=SearchEngine.findInArray(this.munGroup.all(), $('#search-county')[0].value);
        // filter with previously selected states.
        if(r.length>0 && this.stateChartReference.hasFilter()){
            r=SearchEngine.findUsingStates(r, this.stateChartReference.filters());
        }
        // display results, if find only one result then hide modal and apply result directly
        if(r.length==1) {
            SearchEngine.selectedItem(r[0].key,r[0].value);
        }else{
            this.showFilteredItems(r);
        }
    },
    showFilteredItems: function(r) {
        (r.length==0)?($('#txt1h').hide() && $('#txt1w').hide()):($('#txt1h').show() && $('#txt1w').show());
        document.getElementById("filtered-list").innerHTML=(r.length==0)?(Translation[Lang.language].not_found):("");
        r.forEach(function(o){
            var m=o.key.replace("'","´");
            if(o.value)
                document.getElementById("filtered-list").innerHTML+="<li><a href=\"javascript:SearchEngine.selectedItem('"+m+"',"+o.value+");\">"+m+"</a></li>";
            else
                document.getElementById("filtered-list").innerHTML+="<li>"+m+" <span style='color: red;'>*</span></li>";
        });
        $('#modal-container-filtered').modal('show');
    },
    selectedItem: function(key,value) {
		$('#modal-container-filtered').modal('hide');
		SearchEngine.applyCountyFilter([{key:key.replace("´","'"),value:value}]);
	},
    /**
	 * anArray contains the array of objects gathering from crossfilter group.
	 * substring is string that you want
	 */
	findInArray:function(anArray,substring) {
		substring=substring.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
		var found = $.grep( anArray, function ( value, i) {
			return (value.key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").indexOf(substring) >= 0)
		});
		return found;
	},
	findUsingStates:function(anArray, states) {
		var found=[];
		states.forEach(state => {
			found=found.concat($.grep( anArray, function ( value, i) {
				return (value.key.split('/')[1]===state)
			}));
		})
		return found;
    },
    applyCountyFilter: function(d, multiselection){
        multiselection=( (typeof multiselection=='undefined')?(false):(true) );

		if(!multiselection && (!d || !d.length)){
            // used to reset data function when reset all filter was called
			this.top10ByMunChartReference.data(function (group) {
				var fakeGroup=[];
				fakeGroup.push({key:Translation[Lang.language].no_value,value:0});
				return (group.all().length>0)?(group.top(10)):(fakeGroup);
			});
		}else{
			this.top10ByMunChartReference.data(function (group) {
				var filteredGroup=[], index,allItems=group.top(Infinity);
                let dkey=( (multiselection)?(d[0][d[0].length-1]):(d[d.length-1].key) );
				allItems.findIndex(function(item,i){
					if(item.key==dkey){
						index=i;
						filteredGroup.push({key:item.key,value:item.value});
					}
				});
				var ctl=1,max=[],min=[];
				while (ctl<=5) {
					var item=allItems[index+ctl];
					if(item) min.push({key:item.key,value:item.value});
					item=allItems[index-ctl];
					if(item) max.push({key:item.key,value:item.value});
					++ctl;
				}
				filteredGroup=filteredGroup.concat(max);
				min.reverse();
				filteredGroup=min.concat(filteredGroup);
				filteredGroup.reverse();
				return filteredGroup;
			});
			// -----------------------------------------------------------------
			// to clean municipalities of the previous selections.
			if(multiselection){
                this.top10ByMunChartReference.filterAll();

                d[0].forEach((f)=>{
                    SearchEngine.top10ByMunChartReference.filter(f);
                });
            }else{
                this.top10ByMunChartReference.filter(d[d.length-1].key);
            }
            dc.redrawAll();
		}
	},
    loadMunicipalityList: function() {
        /**
         * Used to read the JSON data as a municipality list from backend
         */
        let url=downloadCtrl.getTerraBrasilisHref()+"/geoserver/prodes-brasil-nb/ows?OUTPUTFORMAT=application/json&SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&exceptions=text/xml&srsName=EPSG:4326&TYPENAME=prodes-brasil-nb:priority_municipalities";
        let responseJson=function(error, body) {
            if(error) {
                console.log(error.status);
            }else{
                SearchEngine.selectByList(body);
            }
        };
        d3.json(url, responseJson);

    },
    selectByList: function(munlist){
        /**
         * Used to filter the municipalities from the ibge code as municipality list
         * and apply as filter on panel.
         */
        // used to apply the priority municipalities filter
        let codes=munlist.features[0].properties.codes.split(',');
        let allMun=SearchEngine.munGroup.all();
        // multiselection filter
        let msf=[];
        codes.forEach(function(mun){
            let filtered=graph.dimensions["codibge"].filterFunction(function(d) { return d.codibge == mun; });
            if(filtered.top(1).length){
                let r=filtered.top(1);
                let found=allMun.find( (mg)=>{
                    return (mg.key.toLowerCase()==(r[0].county+"/"+r[0].uf).toLowerCase());
                } );
                if (typeof found!='undefined' && found.value)
                    msf.push(found.key);
            }
        });
        graph.dimensions["codibge"].filterAll();
        window.setTimeout(()=>{
            SearchEngine.applyCountyFilter([msf], true);
        },100);
    }
}