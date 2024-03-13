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
    msf_ui:[], // multiselection itens to display on UI
    msf:[], // multiselection filter
    msf_pm:[], // used as complete priority municipalities list
    msf_all:[], // used as complete list to search function
    enableCtl: false,

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
                        '<span class="txtgreen" id="txt1tg">Filtrar por Municípios Prioritários </span>'+    
                        '<input type="checkbox" id="btnPriorityMun" onclick="SearchEngine.showContextMuns()"><br/>'+

                        // '<span class="txtgreen" id="txt1g">Digite um termo para pesquisa.</span>'+
                        '<div class="input-group input-group-sm search-form">'+
                            '<input autofocus id="search-county" onkeypress="SearchEngine.searchCountyByEnterKey(event)" type="text" class="form-control" placeholder="Search">'+
                            '<label>'+
                                '<button class="btn btngreen btnsearch" onclick="SearchEngine.search()"><i class="material-icons">search</i></button>'+
                            '</label>'+
                        '</div>'+
                        '<div id="selectool" style="display:none;">'+
                            '<input type="checkbox" id="btnSelectool" onclick="SearchEngine.enableDisableAll()">'+
                            '<span class="txtgreen" id="txt1h"> Marcar/desmarcar todos ou selecione item a item na lista.</span>'+
                        '</div>'+
                        '<div class="counties-list"><ul id="filtered-list"></ul></div>'+
                        '<div id="missing_area" style="display:none;">'+
                            '<br/><span style="color: red;">*</span>'+
                            '<span id="txt1w" class="disable-li"> Municípios sem valor a apresentar. Área ou número de alertas é zero.</span>'+
                        '</div>'+    
                    '</div>'+
                    '<div class="modal-footer">'+
                        '<div class="checkbox pull-right">'+
                            '<label>'+
                                '<button type="button" class="btn btngreen" onclick="SearchEngine.selectPriorityMuns();">'+
                                    '<span id="txt1p">Aplicar</span>'+
                                '</button>'+
                            '</label>'+
                            '&nbsp;'+
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

    enableDisableAll: function(){
        SearchEngine.enableCtl=!SearchEngine.enableCtl;
        let fl=$('#filtered-list li');
        if(fl.length){
            fl.each((i,li)=>{
                li.className=(SearchEngine.enableCtl)?('enable-li'):('');
            });
        }

        SearchEngine.msf=[];// reset multiselection filter
        if(SearchEngine.enableCtl && SearchEngine.msf_ui.length){
            SearchEngine.msf_ui.forEach( (item)=>{
                SearchEngine.msf.push(item.key);
            });
        }
    },

    enableDisableItem: function(id){
        let li=$('#idmun_'+id);
        if(!li.length) return;
        li=li[0];
        li.className=(li.className=='')?('enable-li'):('');

        if(li.className==''){
            // to be remove from the selected list, if any
            if(SearchEngine.msf.length){
                let ids=SearchEngine.msf.findIndex((it)=>{
                    return it==SearchEngine.msf_ui[id].key;
                });
                SearchEngine.msf.splice(ids, 1);
            }

        }else{
            // to be add from the selected list
            SearchEngine.msf.push(SearchEngine.msf_ui[id].key);
        }
    },

    searchCountyByEnterKey: function(key){
        if(key.keyCode==13){
            SearchEngine.search();
        }
        return key;
    },
    preSearchFromPriority: function(munlist){
        /**
         * Used to filter the municipalities from the ibge code as municipality list
         * and display as list on search window.
         */
        let codes=munlist.features[0].properties.codes.split(',');
        if (SearchEngine.msf_pm.length){
            SearchEngine.msf_ui=SearchEngine.msf_pm;
        }else{
            let allMun=this.munGroup.all();
            this.msf_ui=[];// reset multiselection list to display
            codes.forEach(function(mun){
                let filtered=graph.dimensions["codibge"].filterFunction(function(d) { return d.codibge == mun; });
                if(filtered.top(1).length){
                    let r=filtered.top(1);
                    let found=allMun.find( (mg)=>{
                        return (mg.key.toLowerCase()==(r[0].county+"/"+r[0].uf).toLowerCase());
                    } );
                    if (typeof found!='undefined'){
                        SearchEngine.msf_ui.push({key:found.key,value:found.value});
                    }
                }
            });
            SearchEngine.msf_ui.sort((a,b)=>{
                return a.key.toLowerCase() > b.key.toLowerCase() ? 1 : -1
            });
            SearchEngine.msf_pm=SearchEngine.msf_ui;
            graph.dimensions["codibge"].filterAll();
        }
        SearchEngine.msf_all=SearchEngine.msf_pm;
        this.showFilteredItems();
    },

    search: function(){
        var r=SearchEngine.findInArray(SearchEngine.msf_all, $('#search-county')[0].value);
        // filter with previously selected states.
        if(r.length>0){
            this.msf_ui=r;
        }else{
            this.msf_ui=[]; //reset ui list
        }

        this.showFilteredItems();
    },

    showFilteredItems: function() {
        $('#missing_area').hide();
        (this.msf_ui.length==0)?($('#selectool').hide()):($('#selectool').show());
        document.getElementById("filtered-list").innerHTML=(this.msf_ui.length==0)?(Translation[Lang.language].without):("");
        this.msf_ui.forEach(function(o,id){
            var m=o.key.replace("'","´");
            let clazz=(( SearchEngine.msf.includes(o.key) )?('enable-li'):(''));
            if(o.value){
                document.getElementById("filtered-list").innerHTML+="<li id='idmun_"+id+"' class='"+clazz+"'><a href=\"javascript:SearchEngine.enableDisableItem('"+id+"');\">"+(id+1)+": "+m+"</a></li>";
            }else{
                $('#missing_area').show();
                document.getElementById("filtered-list").innerHTML+="<li id='idmun_"+id+"' class='disable-li'>"+(id+1)+": "+m+" <span style='color: red;'>*</span></li>";
            }
        });
        $('#modal-container-filtered').modal('show');
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
            this.top10ByMunChartReference.filterAll();
            this.msf=[];//reset selected list
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
                SearchEngine.top10ByMunChartReference.filter(d);
            }else{
                this.top10ByMunChartReference.filter(d[d.length-1].key);
            }
		}
        dc.redrawAll();
	},
    loadPriorityMunicipalityList: function() {
        /**
         * Used to read the JSON data as a municipality list from backend
         */
        let priorityMunData=sessionStorage.getItem("priorityMunData");
        if(priorityMunData){
            priorityMunData=JSON.parse(priorityMunData);
            SearchEngine.preSearchFromPriority(priorityMunData);
        }else{

            let url=downloadCtrl.getTerraBrasilisHref()+"/geoserver/prodes-brasil-nb/ows?OUTPUTFORMAT=application/json&SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&exceptions=text/xml&srsName=EPSG:4326&TYPENAME=prodes-brasil-nb:priority_municipalities";
            let responseJson=function(error, body) {
                if(error) {
                    console.log(error.status);
                    document.getElementById("filtered-list").innerHTML="<li><span>"+Translation[Lang.language].without+"</span></li>";
                }else{
                    sessionStorage.setItem("priorityMunData", JSON.stringify(body));
                    SearchEngine.preSearchFromPriority(body);
                }
            };
            d3.json(url, responseJson);
        }
    },

    showAllMunicipalityList: function() {
        // clean UI list
        document.getElementById("filtered-list").innerHTML="";
        let allMun=this.munGroup.all();
        this.msf_ui=[];// reset multiselection list to display
        allMun.forEach( (mg)=>{
            SearchEngine.msf_ui.push({key:mg.key,value:mg.value});
        });
        SearchEngine.msf_all=SearchEngine.msf_ui;
        this.showFilteredItems();
    },

    selectPriorityMuns: function() {
        if(SearchEngine.msf.length){
            SearchEngine.applyCountyFilter([SearchEngine.msf], true);
            $('#modal-container-filtered').modal('hide');
        }else{
            // no have selected data
            SearchEngine.applyCountyFilter();
        }
    },

    setPriorityMode: function(){
        /** Called from the main window menu option */
        $('#btnPriorityMun')[0].checked=true;
        this.showContextMuns();
    },

    showContextMuns: function(){
        /** Called from the search window, priority municipalities pre-selection button. */
        $('#search-county')[0].value="";// reset search box
        

        if($('#btnPriorityMun')[0].checked){
            this.loadPriorityMunicipalityList();
        }else{
            this.showAllMunicipalityList();
        }
    },

    updateSelectedList: function() {
        /**
         * Used to sync the selected itens on chart with selected list on search UI.
         * It's called from filtered event over chart.
         */
        if(SearchEngine.top10ByMunChartReference.hasFilter()){
            let sfc=SearchEngine.top10ByMunChartReference.filters();// selection from chart
            if(sfc.length){
                // to be add from the select on chart
                sfc.forEach((o)=>{
                    if(!SearchEngine.msf.includes(o))
                        SearchEngine.msf.push(o);
                });
            }
            if(SearchEngine.msf.length){
                // to be remove from the remove on chart
                SearchEngine.msf.forEach((o,i)=>{
                    if(!sfc.includes(o))
                        SearchEngine.msf.splice(i,1);
                });
            }
        }else{
            SearchEngine.msf=[];
        }
    }
}