let buildCompositeChart=(context)=>{
  context.lineSeriesMonthly = dc.compositeChart("#agreg", "agrega");
  let maxUf=graph.areaUfGroup2.top(1)[0].value;// max area of all selected UFs
  let maxA=graph.areaGroup2.top(1)[0].value;

  let makeAreaGroup=(dim,k)=>{
    let g=dim.group()
    .reduceSum(
      (v) => {
        return (v.year==k)?(v.area):(0);
      }
    );
    // ordered by months
    g.all().sort((a,b)=>{
      return a.key-b.key;
    });
    return g;
  };
  let makePercentGroup=(dim,d)=>{
    let g=dim.group()
    .reduceSum(
      (v) => {
        return (v.year==d.key)?(v.a*100/maxUf):(0);
      }
    );
    // ordered by months
    g.all().sort((a,b)=>{
      return a.key-b.key;
    });
    return g;
  };
  
  let makeChartLine=(mainChart,dim,group,groupName,colors,isCloud)=>{
    
    let gn=groupName+" ("+( (isCloud)?("cl"):("de") )+")";
    let l=dc.lineChart(mainChart)
    .dimension(dim)
    .group(group,gn)
    .colorCalculator(()=>{return colors[0];})
    .renderDataPoints({radius: 5, fillOpacity: 0.8, strokeOpacity: 0.9})
    .title((v)=>{
      let v1=Math.abs(+(parseFloat(v.value).toFixed(2)));
      v1=localeBR.numberFormat(',1f')(v1);
      return utils.xaxis(v.key) + " - " + gn
      + "\n" + ((isCloud)?(Translation[Lang.language].percentage+" "+v1+"%"):(Translation[Lang.language].area+" "+v1+Translation[Lang.language].unit));
    })
    .keyAccessor(function(k) {
      return k.key;
    })
    .valueAccessor(function(dd) {
      if(!mainChart.hasFilter()) {
        return +(dd.value.toFixed(2));
      }else{
        if(graph.monthFilters.indexOf(dd.key)>=0) {
          return +(dd.value.toFixed(2));
        }else{
          return 0;
        }
      }
    })
    .useRightYAxis(isCloud);

    // if(isCloud){
    //   // create a Dash Dot Dot Dot
    //   l.dashStyle([5,5,5,5]);
    // }
    return l;
  };

  let makeChartBar=(mainChart,dim,group,groupName,colors,isCloud)=>{
    
    let gn=groupName+" ("+( (isCloud)?("cl"):("de") )+")";
    let l=dc.barChart(mainChart)
    //.gap(100)
    //.centerBar(true)
    .dimension(dim)
    .group(group,gn)
    .colorCalculator(()=>{return colors[0];})
    .title((v)=>{
      let v1=Math.abs(+(parseFloat(v.value).toFixed(2)));
      v1=localeBR.numberFormat(',1f')(v1);
      return utils.xaxis(v.key) + " - " + gn
      + "\n" + ((isCloud)?(Translation[Lang.language].percentage+" "+v1+"%"):(Translation[Lang.language].area+" "+v1+Translation[Lang.language].unit));
    })
    .keyAccessor(function(k) {
      return k.key;
    })
    .valueAccessor(function(dd) {
      if(!mainChart.hasFilter()) {
        return +(dd.value.toFixed(2));
      }else{
        if(graph.monthFilters.indexOf(dd.key)>=0) {
          return +(dd.value.toFixed(2));
        }else{
          return 0;
        }
      }
    });
    return l;
  };

  let composeCharts=()=>{
    let charts=[];
    // reset arrays if this method will be called more than once to prevent reinsert the charts.
    context._cloudSubCharts=[];
    context._deforestationSubCharts=[];

    // prepare deforestation charts
    let	defColors = context.getOrdinalColorsToYears(graph.defPallet);
    context.yearGroup0.all().forEach(
      (d)=>{
        let colors=[]; defColors.some((c)=>{if(d.key==c.key) colors.push(c.color)});
        let deterGroupByYear = makeAreaGroup(context.monthDimension0,d.key);
        let l=makeChartBar(context.lineSeriesMonthly,context.monthDimension0,deterGroupByYear,d.key,colors,false);
        if(graph._deforestationStatus) charts.push(l);
        context._deforestationSubCharts.push(l);// used to control the composite chart groups
      });

    // prepare cloud charts
    let	cldColors = context.getOrdinalColorsToYears(graph.cldPallet);
    context.yearGroup2.all().forEach(
      (d)=>{
        let colors=[]; cldColors.some((c)=>{if(d.key==c.key) colors.push(c.color)});
        let cloudGroupByYear = makePercentGroup(context.monthDimension2,d);
        let l=makeChartLine(context.lineSeriesMonthly,context.monthDimension2,cloudGroupByYear,d.key,colors,true);
        if(graph._cloudStatus) charts.push(l);
        context._cloudSubCharts.push(l);// used to control the composite chart groups
      });
    return charts;
  };

  let legendItemWidth=100, legendWidth=context.yearGroup0.all().length*legendItemWidth;
  legendWidth=(legendWidth<utils.getSeriesChartWidth())?(+legendWidth.toFixed(0)):(utils.getSeriesChartWidth());

  let fxDomain=d3.scale.linear().domain( (context.calendarConfiguration=='prodes')?([7,20]):([0,13]) );

  context.lineSeriesMonthly
    .height(context.defaultHeight)
    .x(fxDomain)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .brushOn(false)
    .yAxisLabel(Translation[Lang.language].alerts_y_label)
    .rightYAxisLabel(Translation[Lang.language].clouds_y_label)
    .elasticY(true)
    .shareTitle(false)
    .yAxisPadding('10%')
    .clipPadding(10)
    .legend(dc.legend().x(100).y(10).itemHeight(15).gap(5).horizontal(1).legendWidth(legendWidth).itemWidth(legendItemWidth))
    .margins({top: 40, right: 65, bottom: 30, left: 65})
    //.childOptions ({ renderDataPoints: {fillOpacity: 0.8} })
    .compose(composeCharts());

    context.lineSeriesMonthly.xAxis().tickFormat(function(d) {
      return utils.xaxis(d);
    });

    context.lineSeriesMonthly.on('renderlet.a', (c)=>{
      utils.moveBars(c);// split bars on bar charts
      utils.makeMonthsChooserList();
      utils.highlightSelectedMonths();
    }).on('pretransition', (c) => {
      const svg = c.select('svg');
      // new class to define width of bars when split bars on bar charts
      svg.selectAll("rect.bar").attr("class", "bar bar1");
		}).on("preRedraw", function (c) {
			c.rescale();
		}).on("preRender", function (c) {
			c.rescale();
		});

    let tv=[], percMax=(maxA*100/maxUf);
    for (let d=0; d <= 1; d+=0.1) {
      tv.push(percMax*d);
    }
    context.lineSeriesMonthly.rightYAxis()
    .tickSize(tv.length)
    .tickValues(tv)
    .tickFormat(
      (a)=>{
        return parseInt(a)+"%";
      }
    );

    lineSeriesRenderlet(context);
};

/**
 * The series chart with only alerts by months
 * 
 */
let buildSeriesChart=(context)=>{
  context.lineSeriesMonthly = dc.seriesChart("#agreg", "agrega");

  let fcDomain=d3.scale.linear().domain( (graph.calendarConfiguration=='prodes')?([8,19]):([1,12]) );

  context.lineSeriesMonthly
    .height(context.defaultHeight-70)
    .chart(function(c) { return dc.lineChart(c).renderDataPoints(true).evadeDomainFilter(true); })
    .x(fcDomain)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .brushOn(false)
    .yAxisLabel(Translation[Lang.language].alerts_y_label)
    .elasticY(true)
    .yAxisPadding('10%')
    .clipPadding(10)
    .dimension(context.temporalDimension0)
    .group(context.areaGroup0)
    .title(function(d) {
      var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
      v=localeBR.numberFormat(',1f')(v);
      return utils.xaxis(d.key[1]) + " - " + d.key[0]
      + "\n"+Translation[Lang.language].area+" " + v + " "+Translation[Lang.language].unit;
    })
    .seriesAccessor(function(d) {
      return d.key[0];
    })
    .keyAccessor(function(d) {
      return d.key[1];
    })
    .valueAccessor(function(d) {
      if(!graph.lineSeriesMonthly.hasFilter()) {
        return Math.abs(+(d.value.toFixed(2)));
      }else{
        if(graph.monthFilters.indexOf(d.key[1])>=0) {
          return Math.abs(+(d.value.toFixed(2)));
        }else{
          return 0;
        }
      }
    })
    .legend(dc.legend().x(100).y(30).itemHeight(15).gap(5).horizontal(1).legendWidth(600).itemWidth(80))
    .margins({top: 20, right: 35, bottom: 30, left: 65});

  context.lineSeriesMonthly.yAxis().tickFormat(function(d) {
    //return d3.format(',d')(d);
    return localeBR.numberFormat(',1f')(d);
  });
  context.lineSeriesMonthly.xAxis().tickFormat(function(d) {
    return utils.xaxis(d);
  });


  context.lineSeriesMonthly.on('filtered', function(c) {
    if(c.filter()) {
      graph.monthDimension.filterFunction(
        (d) => {
          return graph.monthFilters.includes(d);
        }
      );
      graph.temporalDimension0.filterFunction(
        (d) => {
          return graph.monthFilters.includes(d[1]);
        }
      );
      dc.redrawAll("filtra");
    }
  });

  lineSeriesRenderlet(context);

  let	barColors = context.getOrdinalColorsToYears(graph.defPallet);
  context.lineSeriesMonthly.colorAccessor(function(d) {
    var i=0,l=barColors.length;
    while(i<l){
      if(barColors[i].key==d.key){
        return barColors[i].color;
      }
      i++;
    }
  });
};

let lineSeriesRenderlet=(context)=>{
  context.lineSeriesMonthly.on('renderlet', function(c) {
    utils.attachListenersToLegend();
    graph.displayCustomValues();
    dc.redrawAll("filtra");

    var years=[];
    if(graph.barAreaByYear.hasFilter()){
      years=graph.barAreaByYear.filters();
    }else{
      graph.barAreaByYear.group().all().forEach((d)=> {years.push(d.key);});
    }

    if(!c.hasFilter()){
      $('#txt18').css('display','none');// hide filter reset buttom
      $('#txt8b').html(Translation[Lang.language].allTime);
      $('#highlight-time').html("&nbsp;" +  years.join(", ") );
    }else{
      if(c.group()){// TODO: implements the logic to list filtered month on filterPrinter

        var fp="", allData=c.group().top(Infinity);
        graph.monthFilters.forEach(
          (monthNumber) => {
            var ys=[];
            allData.some(
              (d)=> {
                years.forEach(
                  (year) => {
                    if(d.key.includes(monthNumber) && d.key.includes(year)) {
                      ys.push(year);
                      return true;
                    }
                  }
                );
              }
            );
            if(ys.length) fp+=(fp==''?'':', ')+utils.monthYearList(monthNumber,utils.nameMonthsById(monthNumber),ys);
          }
        );
        $('#txt18').css('display','');// display filter reset buttom
        $('#txt8b').html(Translation[Lang.language].someMonths);
        $('#highlight-time').html("&nbsp;" +  fp );
      }
    }
  });
}