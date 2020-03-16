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
                        '<div class="input-group input-group-sm" style="margin-bottom: 15px;">'+
                            '<input autofocus id="search-county" onkeypress="SearchEngine.searchCountyByEnterKey(event)" type="text" class="form-control" placeholder="Search">'+
                            '<label>'+
                                '<button class="btn btngreen" data-dismiss="modal" onclick="SearchEngine.searchCounty()" style="padding:0px;"><i class="material-icons">search</i></button>'+
                            '</label>'+
                        '</div>'+
                        '<span id="txt1h" style="display:none;">Selecione um item na lista de municípios encontrados.</span>'+
                        '<div class="counties-list"><ul id="filtered-list"></ul></div>'+
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
        (r.length==0)?($('#txt1h').hide()):($('#txt1h').show());
        document.getElementById("filtered-list").innerHTML=(r.length==0)?(Translation[Lang.language].not_found):("");
        r.forEach(function(o){
            var m=o.key.replace("'","´");
            document.getElementById("filtered-list").innerHTML+="<li><a href=\"javascript:SearchEngine.selectedItem('"+m+"',"+o.value+");\">"+m+"</a></li>";
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
    applyCountyFilter: function(d){
		if(!d || !d.length) {
			this.top10ByMunChartReference.data(function (group) {
				var fakeGroup=[];
				fakeGroup.push({key:Translation[Lang.language].no_value,value:0});
				return (group.all().length>0)?(group.top(10)):(fakeGroup);
			});
		}else{
			this.top10ByMunChartReference.data(function (group) {
				var filteredGroup=[], index,allItems=group.top(Infinity);
				allItems.findIndex(function(item,i){
					if(item.key==d[0].key){
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
			// enable this line if you want to clean municipalities of the previous selections.
			//this.top10ByMunChartReference.filterAll();
			// -----------------------------------------------------------------
			this.top10ByMunChartReference.filter(d[0].key);
			dc.redrawAll();
		}
	},
}