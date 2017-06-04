var d3 = require('d3'),
	jsdom = require('jsdom'),
	fs = require('fs'),
	spawn = require('child_process').spawnSync,
	htmlStub = '<html><head></head><body><div id="dataviz-container"></div></body></html>'

jsdom.env({
	features: { QuerySelector : true },
	html: htmlStub,
	done: function(errors, window) {
		// this callback function pre-renders the dataviz inside the html document, then export result into a static file
		var el = window.document.querySelector('#dataviz-container');
		var body = window.document.querySelector('body');

		var passFailCounts = [75, 25];
	    var labels = [
	        { name: 'Pass', color: '#1aa4e8' },
	        { name: 'Fail', color: '#d62728' }
	    ];
        var width = 800;
        var height = 800;
        var radius = Math.min(width*0.9, height*0.9) / 2;

        var layout = d3.layout.pie().sort(null).value(function(d) { return d; });

        var svg = d3.select(el)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(0);


        var angles = layout(passFailCounts);
        var arcs = svg.selectAll("g.arc")
                .data(angles)
                .enter()
                .append("g")
                .attr("class", "arc")

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", function(d, i) { return labels[i].color; })

        updateLabels(passFailCounts);

        svg.selectAll('text')
            .data(angles)
            .enter()
            .append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .style("fill", "white")
            .style("text-anchor", "middle")
            .style("font-size", "50px")
            .text(function(d, i) { return labels[i].name + ': ' + labels[i].percentage; })


		function updateLabels(passFailCounts) {
		    var total = d3.sum(passFailCounts);
		    var percentageFormat = d3.format(".0%");
		    labels[0].percentage = percentageFormat(passFailCounts[0] / total);
		    labels[1].percentage = percentageFormat(passFailCounts[1] / total);
		}

		var svgsrc = window.document.documentElement.outerHTML;
		fs.writeFileSync('index.html', svgsrc);
		spawn('wkhtmltopdf', ['index.html', 'test2.pdf'])
	}
});