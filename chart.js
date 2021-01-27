class Chart {
    constructor(opts) {
        this.extent = opts.extent;
        this.axis_labels = opts.axis_labels;
    }

    draw() {
        // define width, height and margin
        this.width = this.element.offsetWidth;
        this.height = this.width;
        this.margin = {
            top: 20,
            right: 75,
            bottom: 45,
            left: 50
        };

        // set up parent element and SVG
        this.element.innerHTML = ''; // Clear the chart (removing the svg)
        const svg = d3.select(this.element).append('svg');
        svg.attr('width',  this.width);
        svg.attr('height', this.height);

        // we'll actually be appending to a <g> element
        this.plot = svg.append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`);

        // create the other stuff
        this.createScales();
        this.addAxes();
        this.add_components();
    }

    add_components() {
        
    }

    createScales() {
        // shorthand to save typing later
        const m = this.margin;
        
        // calculate max and min for data
        // const xExtent = d3.extent(this.data, d => d.x[0]);
        // const yExtent = d3.extent(this.data, d => d.x[1]);
        const xExtent = this.extent.x;
        const yExtent = this.extent.y;

        // force zero baseline if all data points are positive
        if (yExtent[0] > 0) { yExtent[0] = 0; };

        this.xScale = d3.scaleLinear()
            .range([0, this.width-m.right])
            .domain(xExtent);

        this.yScale = d3.scaleLinear()
            .range([this.height-(m.top+m.bottom), 0])
            .domain(yExtent);
    }

    addAxes() {
        const m = this.margin;

        // create and append axis elements
        // this is all pretty straightforward D3 stuff
        const xAxis = d3.axisBottom()
            .scale(this.xScale)
            .tickFormat(d3.format(".1f"));

        const yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickFormat(d3.format(".1f"));

        this.plot.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.height-(m.top+m.bottom)})`)
            .call(xAxis);

        this.plot.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        // Add axis labels
        // X-Label
        this.plot.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "bottom")
            .attr("x", this.xScale(this.extent.x[1]))
            .attr("y", this.yScale(this.extent.y[0]))
            .text(this.axis_labels.x);

        // Y-Label
        this.plot.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "hanging")
            .attr("x", this.xScale(this.extent.x[0]))
            .attr("y", this.yScale(this.extent.y[1]))
            .attr("transform", "rotate(-90)")
            .text(this.axis_labels.y);
    }

    // the following are "public methods"
    // which can be used by code outside of this file

    setColor(newColor) {
        this.plot.select('.line')
            .style('stroke', newColor);
        
        // store for use when redrawing
        this.lineColor = newColor;
    }

    setData(newData) {
        this.data = newData;
        
        // full redraw needed
        this.draw();
    }
}

class ScatterChart extends Chart {

    constructor(opts) {
        super(opts);
        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;
        this.boundary = opts.boundary;
        // create the chart
        this.draw();
    }

    add_components() {
        this.addBoundary();
        this.addPoints();
    }
    
    addBoundary() {
        let radius = 2;
        this.plot.selectAll("circle.boundary")
            .data(this.boundary)
            .enter()
            .append("circle")
	        .attr("cx", d => this.xScale(d.x[0]))
	        .attr("cy", d => this.yScale(d.x[1]))
	        .attr("r", radius)
	        .attr("index", d => d.index)
	        .attr('class', function(d) {
	            if (d.y===0) {
	                return "class-neg-boundary";
	            } else {
	                return "class-pos-boundary";
	            }
            })
    }

    addPoints() {
        let radius = 3;

        this.plot.selectAll("circle.data")
            .data(this.data)
            .enter()
            .append("circle")
            .filter(d => { 
                return d.x[0] > this.extent.x[0] && d.x[0] < this.extent.x[1] && d.x[1] > this.extent.y[0] && d.x[1] < this.extent.y[1]; 
             })
	        .attr("cx", d => this.xScale(d.x[0]))
	        .attr("cy", d => this.yScale(d.x[1]))
	        .attr("r", radius)
	        .attr("index", d => d.index)
	        .attr('class', function(d) {
	            if (d.y===0) {
	                return "class-neg";
	            } else {
	                return "class-pos";
	            }
	        })
    }

    setData(opts) {
        this.data = opts.data;
        this.boundary = opts.boundary;

        // full redraw needed
        this.draw();
    }
}

class PredictionsChart extends Chart {

    constructor(opts) {
        // load in arguments from config object
        super(opts);

        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;
        this.preds = opts.preds;
        this.boundary = opts.boundary;
       
        // create the chart
        this.draw();
    }

    setData(opts) {
        this.data = opts.data;
        this.preds = opts.preds; 
        this.boundary = opts.boundary;

        // full redraw needed
        this.draw();
    }

    add_components() {
        this.addBoundary();
        this.addPoints();
    }
    
    addBoundary() {
        let radius = 2;
        this.plot.selectAll("circle.boundary")
            .data(this.boundary)
            .enter()
            .append("circle")
	        .attr("cx", d => this.xScale(d.x[0]))
	        .attr("cy", d => this.yScale(d.x[1]))
	        .attr("r", radius)
	        .attr("index", d => d.index)
	        .attr('class', function(d) {
	            if (d.y===0) {
	                return "class-neg-boundary";
	            } else {
	                return "class-pos-boundary";
	            }
            })
    }

    addPoints() {
        let radius = 3;

        this.plot.selectAll("circle.data")
            .data(this.data)
            .enter()
            .append("circle")
            .filter(d => { 
                return d.x[0] > this.extent.x[0] && d.x[0] < this.extent.x[1] && d.x[1] > this.extent.y[0] && d.x[1] < this.extent.y[1]; 
             })
	        .attr("cx", d => this.xScale(d.x[0]))
	        .attr("cy", d => this.yScale(d.x[1]))
	        .attr("r", radius)
	        .attr("index", d => d.index)
	        .attr('class', function(d) {
	            if (d.y===0) {
	                return "class-neg";
	            } else {
	                return "class-pos";
	            }
            })
            
        let preds = this.preds;
        this.plot.selectAll("circle.label")
            .data(this.data)
            .enter()
            .append("circle")
            .filter(d => { 
                return (d.x[0] > this.extent.x[0]) && (d.x[0] < this.extent.x[1]) && (d.x[1] > this.extent.y[0]) && (d.x[1] < this.extent.y[1]); 
             })
	        .attr("cx", (d,i) => this.xScale(d.x[0]))
	        .attr("cy", (d,i) => this.yScale(d.x[1]))
	        .attr("r", radius*1.5)
	        .attr("index", d => d.index)
	        .attr('class', function(d) {
	            if (preds[d.index]===0) {
	                return "class-pred-neg";
	            } else {
	                return "class-pred-pos";
	            }
	        })
    }
}

class RocChart extends Chart {

    constructor(opts) {
        // load in arguments from config object
        super(opts);

        // load in arguments from config object
        this.element = opts.element;
        this.data = opts.data;
        this.roc_collection = opts.roc_collection;
       
        // create the chart
        this.draw();
    }

    setData(opts) {
        this.data = opts.data;
        this.roc_collection = opts.roc_collection;

        // full redraw needed
        this.draw();
    }

    add_components() {
        this.addChanceDiagonal();
        this.addRocCollection();
        this.addLine();
    }

    line() {
        return d3.line()
                .x(d => this.xScale(d.fpr))
                .y(d => this.yScale(d.tpr));
    }

    // Best to refactor this to have a single line function and the rest call it with options
    addLine() {
        this.plot.append('path')
            // use data stored in `this`
            .datum(this.data)
            .attr('class','roc-line')
            .attr('d',this.line());
    }

    addRocCollection() {
        this.roc_collection.forEach(d => {
            // Add a line
            this.plot.append('path')
                .datum(d)
                .attr('class','roc-line-old')
                .attr('d',this.line());
        });
    }

    addChanceDiagonal() {
        let chance = [{fpr: 0, tpr: 0},
                      {fpr: 1, tpr: 1}];

        this.plot.append('path')
            // use data stored in `this`
            .datum(chance)
            .attr('class','chance-line')
            .attr('d',this.line())
            .style("stroke-dasharray", ("6, 6"));
    }



    // This is only necessary because of the roc is in a different form than data.x[1]
    createScales() {
        // shorthand to save typing later
        const m = this.margin;
        
        // calculate max and min for data
        const xExtent = d3.extent(this.data, d => d.fpr);
        const yExtent = d3.extent(this.data, d => d.tpr);

        // force zero baseline if all data points are positive
        if (yExtent[0] > 0) { yExtent[0] = 0; };

        this.xScale = d3.scaleLinear()
            .range([0, this.width-m.right])
            .domain(xExtent);

        this.yScale = d3.scaleLinear()
            .range([this.height-(m.top+m.bottom), 0])
            .domain(yExtent);
    }
}