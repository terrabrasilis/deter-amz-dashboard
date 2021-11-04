var utils = {

  datePicker: {
    initComponent() {
      let options = {
        locale: 'pt-br',
        format: 'L',
        useCurrent: false
      };
      $('#datepickerstart').datetimepicker(options);
      $('#datepickerend').datetimepicker(options);
    },
    setInterval(dt0, dt1) {
      /** dt0 is start date and dt1 is end date */
      this.setStartDate(dt0);
      this.setEndDate(dt1);
    },
    setStartDate(dt) {
      /** date format in pt-br: '20/07/2017' */
      this.setProperty("start", "date", dt);
    },
    setEndDate(dt) {
      /** date format in pt-br: '20/07/2017' */
      this.setProperty("end", "date", dt);
    },
    getStartDate() {
      return this.getProperty("start", "date");
    },
    getEndDate() {
      return this.getProperty("end", "date");
    },
    setStartMinDate(dt) {
      /** date format in pt-br: '20/07/2017' */
      this.setProperty("start", "minDate", dt);
    },
    setStartMaxDate(dt) {
      /** date format in pt-br: '20/07/2017' */
      this.setProperty("start", "maxDate", dt);
    },
    setEndMinDate(dt) {
      /** date format in pt-br: '20/07/2017' */
      this.setProperty("end", "minDate", dt);
    },
    setEndMaxDate(dt) {
      /** date format in pt-br: '20/07/2017' */
      this.setProperty("end", "maxDate", dt);
    },
    setProperty(which, property, val) {
      /** which is 'start' or 'end' */
      $('#datepicker' + which).datetimepicker(property, val);
    },
    getProperty(which, property) {
      /** which is 'start' or 'end' */
      return $('#datepicker' + which).datetimepicker(property);
    }
  },

  displayLoginExpiredMessage() {
    if ((typeof Authentication != "undefined") && Authentication.isExpiredToken()) {
      Authentication.setExpiredToken(false);
      d3.select('#expired_token_box').style('display', '');
    } else {
      d3.select('#expired_token_box').style('display', 'none');
    }
  },

  highlightClassFilterButtons: function (ref) {

    $('#' + ref + '-classes').removeClass('disable');
    $('#' + ref + '-bt').addClass('disable');

    if (ref == 'deforestation') {
      $('#degradation-classes').addClass('disable');
      $('#custom-classes').addClass('disable');
      $('#degradation-bt').removeClass('disable');
      $('#custom-bt').removeClass('disable');
    } else if (ref == 'degradation') {
      $('#deforestation-classes').addClass('disable');
      $('#custom-classes').addClass('disable');
      $('#deforestation-bt').removeClass('disable');
      $('#custom-bt').removeClass('disable');
    } else if (ref == 'custom') {
      $('#degradation-classes').addClass('disable');
      $('#deforestation-classes').addClass('disable');
      $('#degradation-bt').removeClass('disable');
      $('#deforestation-bt').removeClass('disable');
    }
  },

  setStateAnimateIcon: function (id, enable, error) {
    document.getElementById(id).style.display = '';
    if (enable) {
      document.getElementById(id).className = "glyphicon glyphicon-refresh glyphicon-refresh-animate";
    } else {
      document.getElementById(id).className = "glyphicon " + ((error) ? ("glyphicon-warning-sign glyphicon-red") : ("glyphicon-ok glyphicon-green"));
    }
  },
  getSelectedFormatFile: function () {
    var opt = document.getElementById('download-option');
    if (!opt) {
      opt = "SHAPE-ZIP";
    }
    return opt[opt.selectedIndex].value;
  },
  /*
   * Remove numeric values less than 1e-6
   */
  removeLittlestValues: function (sourceGroup) {
    return {
      all: function () {
        return sourceGroup.all().filter(function (d) {
          return (Math.abs(d.value) < 1e-6) ? 0 : d.value;
        });
      },
      top: function (n) {
        return sourceGroup.top(Infinity)
          .filter(function (d) {
            return (Math.abs(d.value) > 1e-6);
          })
          .slice(0, n);
      }
    };
  },

  /* Insert a title into one chart using a div provided by elementId.
     Use %dim% or %Dim% to insert a dimension name or capitalize first letter of the name into your title string.
   */
  setTitle: function (elementId, title) {
    elementId = 'title-chart-' + elementId;
    document.getElementById(elementId).innerHTML = this.wildcardExchange(title);
  },

  wildcardExchange: function (str) {
    var dim = ((graph.config.defaultDataDimension == 'area') ? (Translation[Lang.language].areas) : (Translation[Lang.language].num_alerts_dc));
    var unit = ((graph.config.defaultDataDimension == 'area') ? ('km²') : (Translation[Lang.language].unit_alerts));
    str = str.replace(/%dim%/gi, function (x) { return (x == '%Dim%' ? dim.charAt(0).toUpperCase() + dim.slice(1) : dim); });
    str = str.replace(/%unit%/gi, function (x) { return (x == '%Unit%' ? unit.charAt(0).toUpperCase() + unit.slice(1) : unit); });
    return str;
  },

  numberByUnit: function (num) {
    return ((graph.config.defaultDataDimension == 'area') ? (num.toFixed(2)) : (num.toFixed(0)));
  },

  onResize: function (event) {
    clearTimeout(graph.config.resizeTimeout);
    graph.config.resizeTimeout = setTimeout(graph.doResize, 100);
  },

  getDefaultHeight: function () {
    return ((window.innerHeight * 0.4).toFixed(0)) * 1;
  },
  mappingClassNames: function (cl) {
    if (graph.config.dataConfig.legendOriginal === undefined) {
      return cl;
    }
    var l = graph.config.dataConfig.legendOriginal.length;
    for (var i = 0; i < l; i++) {
      if (graph.config.dataConfig.legendOriginal[i] === cl) {
        cl = graph.config.dataConfig.legendOverlay[Lang.language][i];
        break;
      }
    }
    return cl;
  },
  getNumberOfDaysForRangeDate: function (dt1, dt2) {
    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;
    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(dt1 - dt2);
    // Convert back to days and return
    return Math.round(differenceMs / ONE_DAY);
  }
  /** End of utils object */
}