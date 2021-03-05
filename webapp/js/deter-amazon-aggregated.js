var graph={
	
	totalizedDeforestationArea:null,
	totalizedDegradationArea:null,
	totalizedAlertsInfoBox: null,
	totalizedCustomArea: null,
	lineSeriesMonthly: null,
	ringTotalizedByState: null,
	rowTotalizedByClass: null,
	barAreaByYear: null,

	monthFilters: [],
	deforestation:["DESMATAMENTO_CR", "DESMATAMENTO_VEG", "MINERACAO"],
	degradation:["CICATRIZ_DE_QUEIMADA", "CORTE_SELETIVO", "CS_DESORDENADO", "CS_GEOMETRICO", "DEGRADACAO"],
	
	temporalDimension0: null,
	areaGroup0: null,
	classDimension0: null,
	yearDimension0: null,
	ufDimension0: null,
	monthDimension0: null,
	
	temporalDimensionCloud: null,
	areaGroupCloud: null,
	areaUfGroupCloud: null,
	yearDimensionCloud: null,
	yearGroupCloud:null,
	ufDimensionCloud: null,
	monthDimensionCloud: null,

	monthDimension: null,
	numPolDimension: null,
	yearDimension: null,
	yearGroup: null,
	ufDimension: null,
	classDimension: null,
	ufGroup: null,
	totalDeforestationAreaGroup: null,
	totalDegradationAreaGroup: null,
	totalAlertsGroup: null,
	
	data:null,
	cloudData:null,

	/** to store subcharts of the composite chart used to switch groups */
	_cloudSubCharts:[],
	_deforestationSubCharts:[],
	_deforestationStatus:true,
	_cloudStatus:false,

	ringPallet: null,
	defPallet: null,
	cldPallet: null,

	defaultHeight: null,

	calendarConfiguration: 'prodes',

	/**
	 * Load configuration file before loading data.
	 */
	loadConfigurations: function(callback) {
		
		d3.json("config/deter-amazon-aggregated.json", function(error, conf) {
			if (error) {
				console.log("Didn't load config file. Using default options.");
			}else{
				if(conf) {
					graph.ringPallet=conf.ringPallet?conf.ringPallet:graph.ringPallet;
					graph.defPallet=conf.defPallet?conf.defPallet:graph.defPallet;
					graph.cldPallet=conf.cldPallet?conf.cldPallet:graph.cldPallet;
					graph.defaultHeight=conf.defaultHeight?conf.defaultHeight:graph.defaultHeight;
					graph.legendOriginal=conf.legendOriginal?conf.legendOriginal:undefined;
					graph.legendOverlay=conf.legendOverlay?conf.legendOverlay:undefined;
				}
			}
			callback();
		});
	},
	doResize: function() {
		graph.defaultHeight = utils.getDefaultHeight();
		utils.renderAll();
	},
	getYears: function() {
		return this.yearDimension.group().all();
	},
	getRangeYears: function() {
		var ys=this.getYears(), l=ys.length;
		var y=[];
		for(var i=0;i<l;i++) {
			y.push(ys[i].key);
		}
		return y;
	},
	getOrdinalColorsToYears: function(colorList) {
		var c=[];
		var ys=this.getRangeYears();
		//var cor=d3.scale.category20();
		for(var i=0;i<ys.length;i++) {
			c.push({key:ys[i],color:colorList[i]});//cor(i)});
		}
		return c;
	},
	setChartReferencies: function() {
		this.totalizedDeforestationArea = dc.numberDisplay("#deforestation-classes", "agrega");
		this.totalizedDegradationArea = dc.numberDisplay("#degradation-classes", "agrega");
		this.totalizedAlertsInfoBox = dc.numberDisplay("#numpolygons", "agrega");
		this.totalizedCustomArea = d3.select("#custom-classes");

		//this.lineSeriesMonthly = dc.seriesChart("#agreg", "agrega");
		this.ringTotalizedByState = dc.pieChart("#chart-by-state", "filtra");
		this.rowTotalizedByClass = dc.rowChart("#chart-by-class", "filtra");
		this.barAreaByYear = dc.barChart("#chart-by-year", "filtra");
	},

	setUpdatedDate: function(updated_date)
	{
		var dt=new Date(updated_date+'T21:00:00.000Z');
		d3.select("#updated_date").html(' '+dt.toLocaleDateString());
	},

	loadData: function(url, type, callback) {
		d3.json(url)
		.header("Authorization", "Bearer "+((typeof Authentication!="undefined")?(Authentication.getToken()):("")) )
		.get(function(error, root) {
			if(error && error.status==401) {
				if(typeof Authentication!="undefined"){
					Authentication.logout();
					Authentication.setExpiredToken(true);
				}
			}else{
				if(type=='deforestation')	graph.processData(root);
				else graph.processCloudData(root);
			}
			if(callback) callback();
		});
	},
	/** This method must be called before processData! */
	processCloudData: function(data) {
		if(!data || !data.totalFeatures || data.totalFeatures<=0) {
			utils.displayWarning(true);
			return;
		}
		let o=[];
		for (let j = 0, n = data.totalFeatures; j < n; ++j) {
			let fet=data.features[j];
			let month=+fet.properties.m;
			let year=+fet.properties.y;
			if(graph.calendarConfiguration=='prodes') {
				if(month >=1 && month<=7) {
					year = (year-1)+"/"+year;
				}
				if(month >=8 && month<=12) {
					year = year+"/"+(year+1);
				}
			}
			o.push({year:year,month:month,a:fet.properties.a,au:fet.properties.au,uf:fet.properties.u});
		}
		graph.cloudData = o;
	},
	processData: function(data) {
		if(!data || !data.totalFeatures || data.totalFeatures<=0) {
			utils.displayWarning(true);
			return;
		}
		graph.setUpdatedDate(data.updated_date);
		utils.displayGraphContainer();
		
		var o=[];
		var numberFormat = d3.format('.2f');
		
		for (var j = 0, n = data.totalFeatures; j < n; ++j) {
			var fet=data.features[j];
			var month=+fet.properties.m;
			var year=+fet.properties.y;
			if(graph.calendarConfiguration=='prodes') {
				if(month >=1 && month<=7) {
					year = "20"+(year-1)+"/20"+year;
				}
				if(month >=8 && month<=12) {
					year = "20"+year+"/20"+(year+1);
				}
			}else{
				year = "20"+year;
			}
			o.push({year:year,month:month,area:+(numberFormat(fet.properties.ar)),uf:fet.properties.uf,className:fet.properties.cl,numPol:fet.properties.np});
		}
		graph.data=o;
		graph.registerDataOnCrossfilter();
		utils.displayWaiting(false);
		graph.build();
	},
	registerDataOnCrossfilter: function() {
		var ndx0 = crossfilter(graph.data),
		ndx1 = crossfilter(graph.data),
		cloud = crossfilter(graph.cloudData);

		/** register cloud data */
		this.temporalDimensionCloud = cloud.dimension(function(d) {
			var m=utils.fakeMonths(d.month);
			return [d.year, m];
		});
		this.areaUfGroupCloud = this.temporalDimensionCloud.group().reduceSum(function(d) {
			return +d.au;
		});
		this.areaGroupCloud = this.temporalDimensionCloud.group().reduceSum(function(d) {
			return +d.a;
		});
		this.yearDimensionCloud = cloud.dimension(function(d) {
			return d.year;
		});
		this.yearGroupCloud = this.yearDimensionCloud.group().reduceSum(function(d) {
			return d.au;
		});
		this.ufDimensionCloud = cloud.dimension(function(d) {
			return d.uf;
		});
		this.monthDimensionCloud = cloud.dimension(function(d) {
			var m=utils.fakeMonths(d.month);
			return m;
		});
		/** end register cloud data */
		
		this.monthDimension = ndx1.dimension(function(d) {
			var m=utils.fakeMonths(d.month);
			return m;
		});
		this.temporalDimension0 = ndx0.dimension(function(d) {
			var m=utils.fakeMonths(d.month);
			return [d.year, m];
		});
		this.areaGroup0 = this.temporalDimension0.group().reduceSum(function(d) {
			return d.area;
		});
		this.yearDimension0 = ndx0.dimension(function(d) {
			return d.year;
		});
		this.yearGroup0 = this.yearDimension0.group().reduceSum(function(d) {
			return d.area;
		});
		this.ufDimension0 = ndx0.dimension(function(d) {
			return d.uf;
		});
		this.classDimension0 = ndx0.dimension(function(d) {
			return d.className;
		});
		this.monthDimension0 = ndx0.dimension(function(d) {
			var m=utils.fakeMonths(d.month);
			return m;
		});

		this.numPolDimension = ndx1.dimension(function(d) {
			return d.numPol;
		});
		this.yearDimension = ndx1.dimension(function(d) {
			return d.year;
		});
		this.yearGroup = this.yearDimension.group().reduceSum(function(d) {
			return d.area;
		});
		this.ufDimension = ndx1.dimension(function(d) {
			return d.uf;
		});
		this.ufGroup = this.ufDimension.group().reduceSum(function(d) {
			return d.area;
		});
		this.classDimension = ndx1.dimension(function(d) {
			return d.className;
		});
		this.classGroup = this.classDimension.group().reduceSum(function(d) {
			return d.area;
		});

		this.totalDeforestationAreaGroup = this.classDimension0.groupAll().reduce(
			function (p, v) {
				if(graph.deforestation.includes(v.className)) {
					++p.n;
					p.tot += v.area;
				}
				return p;
			},
			function (p, v) {
				if(graph.deforestation.includes(v.className)) {
					--p.n;
					p.tot -= v.area;
				}
				return p;
			},
			function () {
				return {n:0,tot:0};
			}
		);
		this.totalDegradationAreaGroup = this.classDimension0.groupAll().reduce(
			function (p, v) {
				if(graph.degradation.includes(v.className)) {
					++p.n;
					p.tot += v.area;
				}
				return p;
			},
			function (p, v) {
				if(graph.degradation.includes(v.className)) {
					--p.n;
					p.tot -= v.area;
				}
				return p;
			},
			function () { return {n:0,tot:0}; }
		);
		this.totalAlertsGroup = this.numPolDimension.groupAll().reduce(
			function (p, v) {
				p.tot += v.numPol;
				return p;
			},
			function (p, v) {
				p.tot -= v.numPol;
				return p;
			},
			function () { return {tot:0}; }
		);
	},
	build: function() {
		this.setChartReferencies();

		var htmlBox="<div class='icon-left'><i class='fa fa-leaf fa-2x' aria-hidden='true'></i></div><span class='number-display'>";

		// build totalized Alert boxes
		// use format integer see: http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
		this.totalizedDeforestationArea.formatNumber(localeBR.numberFormat(',1f'));
		this.totalizedDeforestationArea.valueAccessor(function(d) {
			return d.n ? d.tot.toFixed(2) : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>0 km²</div></span>"
		})
		.group(this.totalDeforestationAreaGroup);
		
		this.totalizedDegradationArea.formatNumber(localeBR.numberFormat(',1f'));
		this.totalizedDegradationArea.valueAccessor(function(d) {
			return d.n ? d.tot.toFixed(2) : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].degradation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].degradation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].degradation+"</span><br/><div class='numberinf'>0 km²</div></span>"
		})
		.group(this.totalDegradationAreaGroup);

		this.totalizedAlertsInfoBox.formatNumber(localeBR.numberFormat(','));
		this.totalizedAlertsInfoBox.valueAccessor(function(d) {
			return d.tot ? d.tot : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>0</div></span>"
		})
		.group(this.totalAlertsGroup);
		
		// build the monthly series chart
		//buildSeriesChart(this);
		buildCompositeChart(this);

		this.ringTotalizedByState
			.height(this.defaultHeight)
			.innerRadius(10)
			.externalRadiusPadding(30)
			.dimension(this.ufDimension)
			.group(this.ufGroup)
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return Translation[Lang.language].area+": " + v + " "+Translation[Lang.language].unit;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(0)));
				v=localeBR.numberFormat(',1f')(v);
				return d.key + ":" + v + " "+Translation[Lang.language].unit;
			})
			.ordering(dc.pluck('key'))
			.ordinalColors(graph.ringPallet)
			.legend(dc.legend().x(20).y(10).itemHeight(13).gap(7).horizontal(0).legendWidth(50).itemWidth(35));

		this.ringTotalizedByState.valueAccessor(function(d) {
			return Math.abs(+(d.value.toFixed(2)));
		});

		// start chart by classes
		this.rowTotalizedByClass
			.height(this.defaultHeight)
			.dimension(this.classDimension)
			.group(utils.snapToZero(this.classGroup))
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				var t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit;
				if(d.key==="CORTE_SELETIVO") {
					t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit + " ("+
					( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].warning_class_prodes):(Translation[Lang.language].warning_class) )+")";
					
				}
				return t;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(1)));
				v=localeBR.numberFormat(',1f')(v);
				var t=utils.mappingClassNames(d.key) + ": " + v + " " + Translation[Lang.language].unit;
				if(d.key==="CORTE_SELETIVO") {
					t=utils.mappingClassNames(d.key) + "*: " + v + " " + Translation[Lang.language].unit + " ("+
					( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].warning_class_prodes):(Translation[Lang.language].warning_class) )+")";
				}
				return t;
			})
			.elasticX(true)
			.ordinalColors(["#FF0000","#FFFF00","#FF00FF","#F8B700","#78CC00","#00FFFF","#56B2EA","#0000FF","#00FF00"])
			.ordering(function(d) {
				return -d.value;
			})
			.controlsUseVisibility(true);

		this.rowTotalizedByClass.xAxis().tickFormat(function(d) {
			var t=parseInt(d/1000);
			t=(t<1?parseInt(d):t+"k");
			return t;
		}).ticks(5);
		
		this.rowTotalizedByClass
		.filterPrinter(function(f) {
			var l=[];
			f.forEach(function(cl){
				l.push(utils.mappingClassNames(cl));
			});
			return l.join(",");
		});

		let	barColors = this.getOrdinalColorsToYears(graph.defPallet);

		this.barAreaByYear
			.height(this.defaultHeight)
			.yAxisLabel(Translation[Lang.language].area+" ("+Translation[Lang.language].unit+")")
			.xAxisLabel( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].barArea_x_label_prodes):(Translation[Lang.language].barArea_x_label) )
			.dimension(this.yearDimension)
			.group(utils.snapToZero(this.yearGroup))
			.title(function(d) {
				var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
				v=localeBR.numberFormat(',1f')(v);
				return Translation[Lang.language].area+": " + v + " "+Translation[Lang.language].unit;
			})
			.label(function(d) {
				var v=Math.abs(+(parseFloat(d.data.value).toFixed(0)));
				v=localeBR.numberFormat(',1f')(v)+ " "+Translation[Lang.language].unit;
				return v;
			})
			.elasticY(true)
			.yAxisPadding('10%')
			.x(d3.scale.ordinal())
			.xUnits(dc.units.ordinal)
			.barPadding(0.2)
			.outerPadding(0.1)
			.renderHorizontalGridLines(true)
			.colorCalculator(function(d) {
				var i=0,l=barColors.length;
				while(i<l){
					if(barColors[i].key==d.key){
						return barColors[i].color;
					}
					i++;
				}
			})
			.margins({top: 20, right: 35, bottom: 50, left: 55});

		dc.chartRegistry.list("filtra").forEach(function(c,i){
			c.on('filtered', function(chart, filter) {
				var filters = chart.filters();
				var commonFilterFunction = function (d) {
					for (var i = 0; i < filters.length; i++) {
						var f = filters[i];
						if (f.isFiltered && f.isFiltered(d)) {
							return true;
						} else if (f <= d && f >= d) {
							return true;
						}
					}
					return false;
				};

				if(chart.anchorName()=="chart-by-year"){
					if(!filters.length) {
						graph.yearDimension0.filterAll();
						graph.yearDimensionCloud.filterAll();
					}else {
						graph.yearDimension0.filterFunction(commonFilterFunction);
						graph.yearDimensionCloud.filterFunction(commonFilterFunction);
					}
				}
				if(chart.anchorName()=="chart-by-state"){
					if(!filters.length) {
						graph.ufDimension0.filterAll();
						graph.ufDimensionCloud.filterAll();
					}else {
						graph.ufDimension0.filterFunction(commonFilterFunction);
						graph.ufDimensionCloud.filterFunction(commonFilterFunction);
					}
				}
				if(chart.anchorName()=="chart-by-class"){
					if(!filters.length) {
						graph.classDimension0.filterAll();
					}else {
						var eqDef=true,eqDeg=true;
						filters.forEach(
							(f) => {
								if(!graph.deforestation.includes(f)){
									eqDef=false;
								}
								if(!graph.degradation.includes(f)){
									eqDeg=false;
								}
							}
						);
						eqDef=(eqDef)?(filters.length==graph.deforestation.length):(false);
						eqDeg=(eqDeg)?(filters.length==graph.degradation.length):(false);
						if(eqDef && !eqDeg) {
							utils.highlightClassFilterButtons('deforestation');
						}else if(!eqDef && eqDeg) {
							utils.highlightClassFilterButtons('degradation');
						}else {
							utils.highlightClassFilterButtons('custom');
						}
						graph.classDimension0.filterFunction(commonFilterFunction);
					}
				}
				dc.redrawAll("agrega");
				graph.displayCustomValues();
			});
		});

		utils.renderAll();
		// defining filter to deforestation classes by default
		graph.filterByClassGroup('deforestation');
		utils.attachListenersToLegend();
		// utils.setMonthNamesFilterBar();
	},
	init: function() {
		window.onresize=utils.onResize;
		
		utils.displayWaiting();
		utils.displayLoginExpiredMessage();
		this.loadConfigurations(this.startLoadData);
	},

	startLoadData() {
		Lang.apply();

		let cloudDataUrl = downloadCtrl.getFileDeliveryURL()+"/download/"+downloadCtrl.getProject()+"/cloud";
		// cloudDataUrl = "./data/deter-amazon-cloud-month.json";// to use in localhost
		let deforDataUrl = downloadCtrl.getFileDeliveryURL()+"/download/"+downloadCtrl.getProject()+"/monthly";
		// deforDataUrl = "./data/deter-amazon-month.json";// to use in localhost

		graph.loadData(cloudDataUrl, 'cloud', ()=>{
			graph.loadData(deforDataUrl, 'deforestation',null);
		});
		utils.attachEventListeners();
	},

	/*
	 * Called from the UI controls to clear one specific filter.
	 */
	resetFilter: function(who,group) {
		var g=(typeof group === 'undefined')?("filtra"):(group);
		if(who=='state'){
			graph.ringTotalizedByState.filterAll();
		}else if(who=='year'){
			graph.barAreaByYear.filterAll();
		}else if(who=='class'){
			graph.rowTotalizedByClass.filterAll();
			graph.filterByClassGroup('custom');
		}else if(who=='agreg'){
			graph.lineSeriesMonthly.filterAll();
			graph.monthDimension.filterAll();
			graph.monthDimension0.filterAll();
			graph.monthFilters=[];
			utils.highlightSelectedMonths();
			dc.redrawAll("filtra");
		}
		dc.redrawAll(g);
	},
	resetFilters: function() {
		if(!graph.data) return;
		graph.ringTotalizedByState.filterAll();
		graph.rowTotalizedByClass.filterAll();
		graph.barAreaByYear.filterAll();
		graph.lineSeriesMonthly.filterAll();
		graph.monthDimension.filterAll();
		graph.monthDimension0.filterAll();
	},

	/**
	 * Filter by months selected on the month list.
	 * @param {number} aMonth, a fake number of month. To map for real number, see utils.nameMonthsById
	 */
	applyMonthFilter: function(aMonth) {
		if(graph.lineSeriesMonthly.hasFilter()) {
			graph.lineSeriesMonthly.filterAll();
		}
		var pos=graph.monthFilters.indexOf(aMonth);
		if(pos<0) {
			graph.monthFilters.push(aMonth);
		}else{
			graph.monthFilters.splice(pos,1);
		}

		if (graph.monthFilters.length) {
			graph.monthFilters.sort(
				(a,b) => {
					return a>b;
				}
			);
			var min=graph.monthFilters[0],max=graph.monthFilters[graph.monthFilters.length-1];
			graph.lineSeriesMonthly.filter([min,max]);
			graph.lineSeriesMonthly.redraw();
			dc.redrawAll("agrega");
		}else {
			graph.resetFilter('agreg','agrega');
		}

		utils.highlightSelectedMonths();
	},

	filterByClassGroup(ref) {

		utils.highlightClassFilterButtons(ref);
		
		graph.rowTotalizedByClass.filterAll();

		if(ref=='deforestation') {

			graph.deforestation.forEach(
				(cl) => {
					graph.rowTotalizedByClass.filter(cl);
				}
			);
		}else if(ref=='degradation') {
			graph.degradation.forEach(
				(cl) => {
					graph.rowTotalizedByClass.filter(cl);
				}
			);
		}
		dc.redrawAll("filtra");
	},

	displayCustomValues: function() {
		var area=0;
		var htmlBox="<div class='icon-left'><i class='fa fa-leaf fa-2x' aria-hidden='true'></i></div><span class='number-display'>";
		var data=graph.rowTotalizedByClass.data();
		var filters=graph.rowTotalizedByClass.filters();
		data.forEach(
			(d) => {
				if(!filters.length) {
					area+=d.value;
				}else if(filters.includes(d.key)){
					area+=d.value;
				}
			}
		);
		area=localeBR.numberFormat(',1f')(area.toFixed(2));
		graph.totalizedCustomArea.html(htmlBox+"<span>"+Translation[Lang.language].degrad_defor+"</span><div class='numberinf'>"+area+" km²</div></span>");
	},

	changeCompositeSubCharts(){
		let l=[].concat(
			( (graph._deforestationStatus)?(graph._deforestationSubCharts):([]) ),
			( (graph._cloudStatus)?(graph._cloudSubCharts):([]) ),
		);
		graph.lineSeriesMonthly.compose(l);
		
		// this call is an important method for keeping data points at the vertices of the lines
		utils.renderAll();
		// dc.redrawAll("agrega");
		// graph.displayCustomValues();
	},

	changeDeforStatus(value) {
		graph._deforestationStatus=value;
		this.changeCompositeSubCharts();
	},

	changeCloudStatus(value) {
		graph._cloudStatus=value;
		this.changeCompositeSubCharts();
	},

	changeCalendar(value) {
		graph.calendarConfiguration=(value=='prodes-calendar')?('prodes'):('civil');
		graph.restart();
	},

	restart() {
		graph.monthFilters=[];
		// utils.makeMonthsChooserList();
		// utils.highlightSelectedMonths();
		graph.startLoadData();
	}
};

window.onload=function(){
	Mousetrap.bind(['command+p', 'ctrl+p'], function() {
        console.log('command p or control p');
        // return false to prevent default browser behavior
        // and stop event from bubbling
        return false;
	});
	//utils.makeMonthsChooserList();
	utils.btnChangeCalendar();
	Lang.init();
	graph.init();
	if(typeof Authentication!="undefined"){
		Authentication.init(Lang.language, function(){
			graph.resetFilters();
			graph.restart();
		});
	}
};