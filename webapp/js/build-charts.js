let buildCompositeChart=(context,barColors)=>{
  context.lineSeriesMonthly = dc.compositeChart("#agreg", "agrega");
  let fcDomain=d3.scale.linear().domain( (context.calendarConfiguration=='prodes')?([8,19]):([1,12]) );

  let composeCharts=()=>{
    let lines=[];
    context.yearGroup0.all().forEach(
      function(d,fi) {
        let colors=[]; barColors.some((c)=>{if(d.key==c.key) colors.push(c.color)});
        let areaGroupByYear = context.monthDimension0.group()
        .reduceSum(
          (v) => {
            return (v.year==d.key)?(v.area):(0);
          }
        );
        // ordered by months
        areaGroupByYear.all().sort((a,b)=>{
          return a.key-b.key;
        });
        lines.push(
          dc.lineChart(context.lineSeriesMonthly)
          .dimension(context.monthDimension0)
          .group(areaGroupByYear,d.key)
          .ordinalColors(colors)
          .renderDataPoints(true)
          .evadeDomainFilter(true)
          .keyAccessor(function(k) {
            return k.key;
          })
          .valueAccessor(function(dd) {
            if(!context.lineSeriesMonthly.hasFilter()) {
              return +(dd.value.toFixed(2));
            }else{
              if(graph.monthFilters.indexOf(dd.key)>=0) {
                return +(dd.value.toFixed(2));
              }else{
                return 0;
              }
            }
          })
          //.useRightYAxis(true)
        );
      });
      return lines;
  };

  context.lineSeriesMonthly
    .height(context.defaultHeight-70)
    .x(fcDomain)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .brushOn(false)
    .yAxisLabel(Translation[Lang.language].focus_y_label)
    .elasticY(true)
    .yAxisPadding('10%')
    .clipPadding(10)
    .legend(dc.legend().x(100).y(30).itemHeight(15).gap(5).horizontal(1).legendWidth(600).itemWidth(80))
    .margins({top: 20, right: 65, bottom: 30, left: 65})
    .compose(composeCharts());
};

/**
 * The series chart with only alerts areas by months
 * 
 */
let buildSeriesChart=(context, barColors)=>{
  context.lineSeriesMonthly = dc.seriesChart("#agreg", "agrega");

  let fcDomain=d3.scale.linear().domain( (graph.calendarConfiguration=='prodes')?([8,19]):([1,12]) );

  context.lineSeriesMonthly
    .height(context.defaultHeight-70)
    //.chart(function(c) { return dc.lineChart(c).interpolate('cardinal').renderDataPoints(true).evadeDomainFilter(true); })
    .chart(function(c) { return dc.lineChart(c).renderDataPoints(true).evadeDomainFilter(true); })
    .x(fcDomain)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .brushOn(false)
    .yAxisLabel(Translation[Lang.language].focus_y_label)
    //.xAxisLabel(Translation[Lang.language].focus_x_label)
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
  });

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