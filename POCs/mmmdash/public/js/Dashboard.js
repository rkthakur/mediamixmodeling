queue().defer(d3.json, "/api/data").await(makeGraphs);
function makeGraphs(error, apiData) {

//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.SalesDate = dateFormat.parse(d.SalesDate);
	  d.SalesDate.setDate(1);
	//	d.Sales = +d.Sales;
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.SalesDate; });

	//Calculate metrics
	//var projectsByDate = datePosted.group();
	var projectsByDate = datePosted.group().reduceSum(function(d) {
			return d.Sales;
	});
	//Calculate %ag metrics
	//var projectsByDate = datePosted.group();
	var projectsByDate1 = datePosted.group().reduce(function(p,d) {
		  ++p.count;
			p.total+=parseInt(d.Sales);
			console.log(p.count);
			return p;
	},
	function(p,d) {
		--p.count;
		p.total-=parseInt(d.Sales);
		console.log("-"+p.total);
		return p;
	},
	function() {
		return {
			count : 0,
			total : 0,
		};
	}
);

//Stack Pageview
	var projectsByTV = datePosted.group().reduceSum(function(d) {
			return d.TV;
	});

	var projectsByRadio = datePosted.group().reduceSum(function(d) {
			return d.Radio;
	});

	var projectsByNews = datePosted.group().reduceSum(function(d) {
			return d.Newspaper;
	});
	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].SalesDate;
	var maxDate = datePosted.top(1)[0].SalesDate;

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
