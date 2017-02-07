queue().defer(d3.json, "/api/data").await(makeGraphs);
queue().defer(d3.json, "/api/modeldata").await(makePiGraphs);
function makePiGraphs(error, apiData) {
 var ndx   = crossfilter(apiData[0].modelResult),
	      runDimension  = ndx.dimension(function(d) {
					return d.media;
				})
	      shareSumGroup = runDimension.group().reduceSum(function(d) {return d.share;});
 var chart = dc.pieChart("#pieChart");
	  chart
		  .width(600)
		  .height(220)
		  //.margins({top: 10, right: 50, bottom: 30, left: 50})
	    .slicesCap(4)
	    .innerRadius(0)
	    .dimension(runDimension)
	    .group(shareSumGroup)
	    .legend(dc.legend())
	    // workaround for #703: not enough data is accessible through .label() to display percentages
	    .on('pretransition', function(chart) {
	        chart.selectAll('text.pie-slice').text(function(d) {
	            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
	        })
	    });
	  chart.render();
	};

function makeGraphs(error, apiData) {

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
	//var projectsByDate = datePosted.group();
	var projectsByDate = datePosted.group().reduceSum(function(d) {
			return d.Sales;
	});

//Stack Pageview
	var projectsByTV = datePosted.group().reduceSum(function(d) {
			return d.TV / 10; //Normalize TV vloume to align with other media
	});

	var projectsByRadio = datePosted.group().reduceSum(function(d) {
			return d.Radio;
	});

	var projectsByNews = datePosted.group().reduceSum(function(d) {
			return d.Newspaper;
	});


	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].TDate;
	var maxDate = datePosted.top(1)[0].TDate;
  
    //Charts
	var dateChart = dc.lineChart("#date-chart");

	dateChart
		.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsByDate)
		.renderArea(true)
		.transitionDuration(500)
		.stack(projectsByTV)
		.stack(projectsByRadio)
		.stack(projectsByNews)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Month")
		.yAxis().ticks(6);
    dc.renderAll();

};
