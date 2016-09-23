queue().defer(d3.json, "/api/data").await(makeGraphs);
queue().defer(d3.json, "/api/modeldata").await(makePiGraphs);
function makePiGraphs(error, apiData) {
  if (apiData != undefined && apiData.length > 0)
  {
 var ndx   = crossfilter(apiData[0].modelResult),
	      runDimension  = ndx.dimension(function(d) {
					return d.media;
				})
	      shareSumGroup = runDimension.group().reduceSum(function(d) {return d.share;});
 var chart = dc.pieChart("#pieChart");
 var wd = chart.width()
	  chart
		  .width(wd)
		  .height(550)
		  //.margins({top: 10, right: 50, bottom: 30, left: 50})
	    .slicesCap(4)
	    .innerRadius(0)
	    .dimension(runDimension)
	    .group(shareSumGroup)
      .ordinalColors(['DarkGreen', 'DarkKhaki', 'DarkMagenta','DarkOrange','DeepPink','DarkTurquoise'])
	    //.legend(dc.legend());
      .legend(dc.legend().x(0).y(0).autoItemWidth(true).gap(5))
	    // workaround for #703: not enough data is accessible through .label() to display percentages
	     .on('pretransition', function(chart) {
	        chart.selectAll('text.pie-slice').text(function(d) { //'text.pie-slice'
	            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
	        })
	    });

    /* chart.on('pretransition', function(chart) {
                chart.selectAll('.dc-legend-item text')
                    .text('')
                  .append('tspan')
                    .text(function(d) {
                      return d.name;
                    })
                  .append('tspan')
                    .attr('x', 100)
                    .attr('text-anchor', 'end')
                    .text(function(d) {
                      return d.data;
                    });
            });
*/
	//  chart.render();
}
else {
  {
    $("#pieChart").html("Media mix model is not available to show pie chart. Please use refesh model button to run regression analysis.");
  }
}
};

function makeGraphs(error, apiData) {
  if (apiData != undefined && apiData.length > 0)
  {
//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.TDate = dateFormat.parse(d.TDate);
	  d.TDate.setDate(1);
	//	d.Sales = +d.Sales;
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.TDate; });

	//Calculate metrics
	//var projectsBySales = datePosted.group();
	var projectsBySales = datePosted.group().reduceSum(function(d) {
			return d.Sales;
	});

//Stack Pageview
	var projectsByTV = datePosted.group().reduceSum(function(d) {
			return d.TV / 10; //Normalize TV vloume to align with other media
	});

	var projectsByRadio = datePosted.group().reduceSum(function(d) {
			return d.Radio / 10;
	});

	var projectsByNews = datePosted.group().reduceSum(function(d) {
			return d.Newspaper / 100;
	});


	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].TDate;
	var maxDate = datePosted.top(1)[0].TDate;

    //Charts
/*	var dateChart = dc.lineChart("#date-chart");

	dateChart
		.width(600)
		.height(250)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsBySales)
		.renderArea(false)
		.transitionDuration(500)
		.stack(projectsByTV)
		.stack(projectsByRadio)
		.stack(projectsByNews)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
    .legend(dc.legend())
		.renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
		.xAxisLabel("Month")
    //.xAxis().ticks(12)
		.yAxis().ticks(0);*/


    var composite = dc.compositeChart("#composite-chart");
    var wd = composite.width()
    composite
    .width(wd)
    .height(550)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .xAxisLabel("--")
        .yAxisLabel("Sales")
        .rightYAxisLabel("Media Support",50)
        .useRightAxisGridLines(true)
        .rightY(d3.yScale)
        .legend(dc.legend().x(50).y(0).itemHeight(15).gap(10).horizontal(true))
        .renderHorizontalGridLines(true)
        .compose([
            dc.barChart(composite)
                .dimension(datePosted)
                .colors('DarkCyan')
                .useRightYAxis(true)
                .group(projectsByTV, "TV GRP"),
                //.dashStyle([2,2]),
            dc.barChart(composite)
                .dimension(datePosted)
                .colors('DarkSlateGray')
                .useRightYAxis(true)
                .group(projectsByRadio, "Radio"),
            dc.barChart(composite)
                .dimension(datePosted)
                .colors('ForestGreen')
                .useRightYAxis(true)
                .group(projectsByNews, "Newspaper"),
            dc.lineChart(composite)
                .dimension(datePosted)
                .colors('OrangeRed')
                .group(projectsBySales, "Sales Unit")
                //.dashStyle([5,5])
            ])
        .brushOn(false);
        composite.rightY(composite.y());
        composite.xUnits(function(){return 15;});

    dc.renderAll();
}
};
