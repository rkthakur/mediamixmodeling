var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
queue().defer(d3.json, "/api/data").await(tableGraph);
function tableGraph(error, apiData) {
  var dateFormat = d3.time.format("%m/%d/%Y");
	apiData.forEach(function(d) {
		d.TDate = dateFormat.parse(d.TDate);
	  d.TDate.setDate(1);
  //  d.TDate = d.TDate.getMonth();
  });

  var ndx              = crossfilter(apiData),
      salesDim = ndx.dimension(function(d) {return d.TDate;}),
      projectsBySales = salesDim.group().reduceSum(function(d) {
          return d.Sales;
      }),
      projectsByTV = salesDim.group().reduceSum(function(d) {
          return d.TV;
      }),
      projectsByRadio = salesDim.group().reduceSum(function(d) {
          return d.Radio;
      });

      //Define threshold values for data
      var minDate = salesDim.bottom(1)[0].TDate;
      var maxDate = salesDim.top(1)[0].TDate;


      var composite = dc.compositeChart("#composite");

      composite
          .width(768)
          .height(480)
          .x(d3.time.scale().domain([minDate, maxDate]))
          .xAxisLabel("Month")
          .yAxisLabel("Sales")
          .rightYAxisLabel("TV Support",50)
          .useRightAxisGridLines(true)
          .rightY(d3.yScale)
          .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
          .renderHorizontalGridLines(true)
          .compose([
              dc.barChart(composite)
                  .dimension(salesDim)
                  .colors('red')
                  .useRightYAxis(true)
                  .group(projectsByTV, "TV"),
                  //.dashStyle([2,2]),
              dc.lineChart(composite)
                  .dimension(salesDim)
                  .colors('blue')
                  .group(projectsBySales, "Sales")
                  //.dashStyle([5,5])
              ])
          .brushOn(false);
          composite.rightY(composite.y());
   dc.renderAll();
};
