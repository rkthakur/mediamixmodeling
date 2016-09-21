var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
queue().defer(d3.json, "/api/data").await(tableGraph);
function tableGraph(error, apiData) {
  if (apiData != undefined && apiData.length > 0)
  {
  var dateFormat = d3.time.format("%m/%d/%Y");
	apiData.forEach(function(d) {
		d.TDate = dateFormat.parse(d.TDate);
	  d.TDate.setDate(1);
  });
  /* We will create a table that sorts the experiments
     from the one that has the highest average speed
     to the one that has the lowest average speed
  */
  /* To do so, we need:
     - that the .group() is defined, and returns the same value for all elements
     - the .order() is defined & defined to something else than the default value which seems to
       be either d3.ascending or descending. (a method that is undefined for .reduce()-d
       dimension groups is called else).
     This demonstrates that a crossfilter group can (oddly, but usefully) be passed
     as the dimension for a dc.dataTable, because it's just using `dimension.all()`.
  */

/*  monthDim  = ndx.dimension(function(d) {return d.TDate;}),
  salesDim = ndx.dimension(function(d) {return d.Sales;}),
  tvDim  = ndx.dimension(function(d) {return d.TV;}),
  salesPerYear = monthDim.group().reduceSum(function(d) {return d.Sales;}),
  //spendPerName = nameDim.group().reduceSum(function(d) {return +d.Spent;}),
  salesHist    = salesDim.group().reduceCount();*/

  var ndx              = crossfilter(apiData),
      salesDim = ndx.dimension(function(d) {return d.Sales;}),
      tvDim  = ndx.dimension(function(d) {return d.TV;}),
      monthDimension    = ndx.dimension(function(d) {return +d.TDate.getMonth();}),
      salesPerYear = monthDimension.group().reduceSum(function(d) {return +d.TDate.getMonth();}),
      groupedDimension = monthDimension.group().reduce(
          function (p, v) {
              ++p.number;
              p.total += v.Sales;
              p.tvTotal += +v.TV;
              p.radioTotal += +v.Radio;
              p.newsPaperTotal += +v.Newspaper;
              p.salesTotal += +v.Sales;
              p.avg = Math.round(p.total / p.number);
              return p;
          },
          function (p, v) {
              --p.number;
              p.tvTotal -= +v.TV;
              p.radioTotal -= +v.Radio;
              p.newsPaperTotal -= +v.Newspaper;
              p.salesTotal -= +v.Sales;

              p.total -= +v.Sales;
              p.avg = (p.number == 0) ? 0 : Math.round(p.total / p.number);
              return p;
          },
          function () {
              return {tvTotal: 0, radioTotal: 0, newsPaperTotal: 0, salesTotal: 0}
      }),
      rank = function (p) { return "sample data" };

  var yearRingChart   = dc.pieChart("#chart-ring-year");
  yearRingChart
    .width(300)
    .height(300)
    .dimension(groupedDimension)
    .group(salesPerYear)
    .innerRadius(50)
    .controlsUseVisibility(true);

  var spendHistChart  = dc.barChart("#chart-hist-spend");
  spendHistChart
    .dimension(groupedDimension)
    .group(salesPerYear)
    .x(d3.scale.linear().domain([0,10]))
    .elasticY(true)
    .controlsUseVisibility(true);
spendHistChart.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
spendHistChart.yAxis().ticks(2);

  var spenderRowChart = dc.rowChart("#chart-row-spenders");
  spenderRowChart
      .dimension(groupedDimension)
      .group(salesPerYear)
      .elasticX(true)
      .controlsUseVisibility(true);

  var chart = dc.dataTable("#sampledatatable");
  chart
    .width(600)
    .height(250)
    .dimension(groupedDimension)
    .group(rank)
    .showGroups(false)
    .columns([function (d) { return monthShortNames[d.key] },
              function (d) { return d.value.salesTotal.toFixed(0) },
              function (d) { return d.value.tvTotal.toFixed(0) },
              function (d) { return d.value.radioTotal.toFixed(0) },
              function (d) { return d.value.newsPaperTotal.toFixed(0) }])
    .sortBy(function (d) {
      //console.log(monthShortNames[d.key]);
      return d.key; })
    .order(d3.descending);
    //chart.render();
    dc.renderAll();
}
};
