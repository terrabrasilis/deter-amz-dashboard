var utils = {
	config:{},
	statusPrint:false,
	cssDefault:true,
	btnPrintPage:function() {
		d3.select('#prepare_print')
	    .on('click', function() {
	    	utils.preparePrint();
	    });
	},
	
	displayLoginExpiredMessage() {
		if ((typeof Authentication!="undefined") && Authentication.isExpiredToken()) {
			d3.select('#expired_token_box').style('display', '');
			Authentication.removeExpiredToken();
		} else {
			d3.select('#expired_token_box').style('display', 'none');
		}
	},
	getDefaultHeight:function() {
		return ((window.innerHeight*0.4).toFixed(0))*1;
	},
	getSeriesChartWidth:function() {
		return $("#agreg").width();
	},
	btnDownload:function() {
		// without filters
		d3.select('#download-csv-monthly-all')
	    .on('click', function() {
			var blob = new Blob([d3.csv.format(graph.data)], {type: "text/csv;charset=utf-8"});
			saveAs(blob, downloadCtrl.getProject()+'-aggregated-'+downloadCtrl.getDownloadTime()+'.csv');
		});
		// with filters
		d3.select('#download-csv-monthly')
	    .on('click', function() {
			var filteredData=graph.classDimension.top(Infinity);
	        var blob = new Blob([d3.csv.format(filteredData)], {type: "text/csv;charset=utf-8"});
	        saveAs(blob, downloadCtrl.getProject()+'-aggregated-'+downloadCtrl.getDownloadTime()+'.csv');
		});
		// shapefile 
		d3.select('#download-shp')
		.on('click', function() {
			downloadCtrl.startDownload();
		});
	},
	preparePrint: function() {
		d3.select('#print_information').style('display','block');
		d3.select('#print_page')
	    .on('click', function() {
	    	d3.select('#print_information').style('display','none');
	    	window.print();
	    });
	},
	btnOnOffCloudDefor:function() {
		$('#cloud-selector')
	    .on('change', function() {
			let cookieCloudNotice = EasyCookie.read("cloudNotice");
			if($('#cloud-selector')[0].checked && cookieCloudNotice === null){
				$('#cloudNotice').modal('show');
			}
	    	graph.changeCloudStatus($('#cloud-selector')[0].checked);
		});
		$('#defor-selector')
	    .on('change', function() {
	    	graph.changeDeforStatus($('#defor-selector')[0].checked);
	    });
	},
	btnChangeCalendar: function() {
		$('#change-calendar input').on('change', function() {
			graph.changeCalendar($('input[name=calendars]:checked', '#change-calendar').attr('id'));
		});
	},
	attachEventListeners:function() {
		utils.btnPrintPage();
		utils.btnDownload();
		utils.btnOnOffCloudDefor();
	},

	attachListenersToLegend: function() {
		var legendItems=$('#agreg .dc-legend-item');
		for(var i=0;i<legendItems.length;i++) {
			$(legendItems[i]).on('click', function (ev) {
				graph.barAreaByYear.filter(ev.currentTarget.textContent.split(" ")[0]);
			});
		}
	},

	onResize:function(event) {
		clearTimeout(utils.config.resizeTimeout);
		utils.config.resizeTimeout = setTimeout(graph.doResize, 200);
	},
	renderAll:function() {
		/**
		 * This method keeping data points at the vertices of the lines on render calls.
		 */
		dc.renderAll("agrega");
		dc.renderAll("filtra");
		d3.selectAll("circle")
			.attr("r",function(){return 5;})
			.on("mouseout.foo", function(){
				d3.select(this)
				.attr("r", function(){return 5;});
			});
	},
	/*
	 * Remove numeric values less than 1e-6
	 */
	snapToZero:function(sourceGroup) {
		return {
			all:function () {
				return sourceGroup.all().map(function(d) {
					return {key:d.key,value:( (Math.abs(d.value)<1e-6) ? 0 : d.value )};
				});
			}
		};
	},
	rangesEqual: function (range1, range2) {
        if (!range1 && !range2) {
            return true;
        } else if (!range1 || !range2) {
            return false;
        } else if (range1.length === 0 && range2.length === 0) {
            return true;
        } else if (range1[0].valueOf() === range2[0].valueOf() &&
            range1[1].valueOf() === range2[1].valueOf()) {
            return true;
        }
        return false;
	},
	mappingClassNames: function(cl) {
		if(graph.legendOriginal===undefined) {
			return cl;
		}
		var l = graph.legendOriginal.length;
		for (var i = 0; i < l; i++) {
			if(graph.legendOriginal[i]===cl) {
				cl=graph.legendOverlay[Lang.language][i];
				break;
			}
		}
		return cl;
	},
	xaxis:function(d) {
		var list=[];
		if(graph.calendarConfiguration=='prodes') {
			list=Translation[Lang.language].months_of_prodes_year;
			return list[d-8];
		}else{
			list=Translation[Lang.language].months_of_civil_year;
			return list[d-1];
		}
	},
	monthYearList: function(monthNumber,month,years) {
		var fy=[];
		
		if(graph.calendarConfiguration=='prodes') {
			years.forEach(
			(y) =>
				{
					if(monthNumber >=13 && monthNumber<=19) {
						fy.push(y.split("/")[1]);
					}
					if(monthNumber >=8 && monthNumber<=12) {
						fy.push(y.split("/")[0]);
					}
				}
			);
		}else{
			fy=years;
		}
		fy.sort();
		return month+"/("+fy.join(", ")+")";
	},
	nameMonthsById: function(id) {
		var list={};
		if(graph.calendarConfiguration=='prodes') {
			list[13]='Jan';
			list[14]='Fev';
			list[15]='Mar';
			list[16]='Abr';
			list[17]='Mai';
			list[18]='Jun';
			list[19]='Jul';
			list[8]='Ago';
			list[9]='Set';
			list[10]='Out';
			list[11]='Nov';
			list[12]='Dez';
		}else{
			list[1]='Jan';
			list[2]='Fev';
			list[3]='Mar';
			list[4]='Abr';
			list[5]='Mai';
			list[6]='Jun';
			list[7]='Jul';
			list[8]='Ago';
			list[9]='Set';
			list[10]='Out';
			list[11]='Nov';
			list[12]='Dez';
		}
		
		return list[id];
	},
	fakeMonths: function(d) {
		var list=[],m=1;
		if(graph.calendarConfiguration=='prodes') {
			list=[13,14,15,16,17,18,19,8,9,10,11,12];
			m=list[d-1];
		}else{
			m=d;
		}
		return m;
	},
	displayWarning:function(enable) {
		if(enable===undefined) enable=true;
		d3.select('#warning_data_info').style('display',((enable)?(''):('none')));
		d3.select('#loading_data_info').style('display',((enable)?('none'):('')));
		d3.select('#info_container').style('display',((enable)?(''):('none')));
		document.getElementById("warning_data_info").innerHTML='<h3><span id="txt8">'+Translation[Lang.language].txt8+'</span></h3>';
	},
	displayGraphContainer:function() {
		d3.select('#panel_container').style('display','block');
	},
	displayWaiting: function(enable) {
		if(enable===undefined) enable=true;
		d3.select('#charts-panel').style('display',((enable)?('none'):('')));
		d3.select('#loading_data_info').style('display',((!enable)?('none'):('')));
		d3.select('#info_container').style('display',((!enable)?('none'):('')));
		d3.select('#panel_container').style('display',((enable)?('none'):('')));
		d3.select('#warning_data_info').style('display','none');
	},

	changeCss: function(bt) {
		utils.cssDefault=!utils.cssDefault;
		document.getElementById('stylesheet_dash').href='../theme/css/dashboard-aggregated'+((utils.cssDefault)?(''):('-dark'))+'.css';
		bt.style.display='none';
		setTimeout(bt.style.display='',200);
	},

	highlightSelectedMonths: function() {
		let iMin=(graph.calendarConfiguration=='prodes')?(8):(1);
		let iMax=(graph.calendarConfiguration=='prodes')?(20):(13);
		for (var i=iMin;i<iMax;i++) {
			if(graph.monthFilters.includes(i) || !graph.monthFilters.length) {
				d3.select('#month_'+i).style('opacity', '1');
			}else {
				d3.select('#month_'+i).style('opacity', '0.4');
			}
		}
	},

	setMonthNamesFilterBar: function() {
		let iMin=(graph.calendarConfiguration=='prodes')?(8):(1);
		let iMax=(graph.calendarConfiguration=='prodes')?(20):(13);
		for (var i=iMin;i<iMax;i++) {
			d3.select('#month_'+i).html((graph.calendarConfiguration=='prodes')?(Translation[Lang.language].months_of_prodes_year[i-8]):(Translation[Lang.language].months_of_civil_year[i-1]));
		}
	},

	moveBars: (chart)=> {
		/** Space adjust between bars group for months. Larger numbers smaller space and vice versa. */
		let offsetBars=18;
		let years=graph.yearGroup0.all();
		let mr=graph.lineSeriesMonthly.margins().right;
		let ml=graph.lineSeriesMonthly.margins().left;
		let wl=(graph.lineSeriesMonthly.width()-mr-ml)/offsetBars;
		
		let l=years.length, l2 = parseInt(wl/l), start=parseInt(wl-(wl/2) )*-1;

		chart.selectAll("g.sub").selectAll("rect.bar").forEach(
			(sub,i)=>{
				if(sub.length){
					chart.selectAll("g.sub._"+i).attr("transform", "translate("+start+", 0)");
					start=start+l2;
				}
			}
		);
	},

	makeMonthsChooserList: function() {
		let magicNumber=14;// this number is the number of ticks used in series chart. It's equal to 12 or 14. See the chart to define.
		let width=parseInt(utils.getSeriesChartWidth()/magicNumber);
		let template='',extra='<div style="width:'+width+'px;"></div>';
		let iMin=(graph.calendarConfiguration=='prodes')?(8):(1);
		let iMax=(graph.calendarConfiguration=='prodes')?(20):(13);
		for (var i=iMin;i<iMax;i++) {
			template+='<div style="width:'+width+'px;" id="month_'+i+'" class="month_box" onclick="graph.applyMonthFilter('+i+')"></div>';
		}
		template=magicNumber==14?extra+template+extra:template
		$('#months_chooser').html(template);
		utils.setMonthNamesFilterBar();
	},

	highlightClassFilterButtons: function(ref) {

		$('#'+ref+'-classes').removeClass('disable');
		$('#'+ref+'-bt').addClass('disable');
		
		if(ref=='deforestation') {
			$('#degradation-classes').addClass('disable');
			$('#custom-classes').addClass('disable');
			$('#degradation-bt').removeClass('disable');
			$('#custom-bt').removeClass('disable');
		}else if(ref=='degradation') {
			$('#deforestation-classes').addClass('disable');
			$('#custom-classes').addClass('disable');
			$('#deforestation-bt').removeClass('disable');
			$('#custom-bt').removeClass('disable');
		}else if(ref=='custom') {
			graph.displayCustomValues();
			$('#degradation-classes').addClass('disable');
			$('#deforestation-classes').addClass('disable');
			$('#degradation-bt').removeClass('disable');
			$('#deforestation-bt').removeClass('disable');
		}
	}
};