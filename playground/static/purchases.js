
var width = 200;
var height = 200;
let padding = 100;
var svgPurchases = d3.select("#purchases");
var svgCumulative = d3.select("#cumulative");

var data = [];
var checked = {}

function chooseColour(d) {
    switch (d) {
        case "Rewe":
            return "red";
        case "Aldi":
            return "blue";
        case "Poco":
            return "brown";
        default:
            return "black";
    }
}

function draw() {
    drawScatter();
    drawCumulative();
}

function filterChecks() {
    console.log("Enter filter");
    var checkboxes = d3.select("#controls").selectAll("label").select("input");
    checkboxes.each(function(d) {checked[d] = d3.select(this).property("checked")});
    draw();
    console.log("Exit filter");
}

function filtering(d) {
    return checked[d["store"]] && 
        d3.select("#costRangeMin").property("value") <= d["cost"] &&
        d["cost"] <= d3.select("#costRangeMax").property("value");
}

function updateData() {
    var allData = svgPurchases.selectAll("circle").data(data);
    var filtered = allData.filter(filtering);
    console.log(allData, filtered);
    svgPurchases.selectAll("circle").data(data).filter(filter).enter().append("circle").exit().remove();
    svgCumulative.selectAll("rect").data(data).filter(filter).enter().append("rect").exit().remove();
}

function addAxis(parent, scaleX, scaleY) {
    var axisY = d3.axisLeft(scaleY);
    var axisX = d3.axisBottom(scaleX);

    parent.selectAll("g").remove();
    parent.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ", 0)")
        .call(axisY)
    parent.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height-padding) + ")")
        .call(axisX);
}

function addAxisLabels(parent, xName, yName) {
    parent.selectAll("text").filter(function() {return d3.select(this).attr("class") == "label"}).remove();
    parent.append("text")
        .text(xName)
        .attr("x", "" + width/2)
        .attr("y", "" + (height - padding/2))
        .attr("text-anchor", "middle")
        .attr("class", "label");

    parent.append("text")
        .text(yName)
        .attr("transform", "rotate(-90, " + padding/2 + ", " + height/2 + ")")
        .attr("x", "" + padding/2)
        .attr("y", "" + height/2)
        .attr("text-anchor", "middle")
        .attr("class", "label");
}


function drawScatter() {
    svgPurchases.attr("width", width)
        .attr("height", height);

    // Scaling
    var scaleX = d3.scaleTime().domain([data[0]["date"],data[data.length-1]["date"]])
                                .range([padding, width-padding]);
    var scaleY = d3.scaleLinear().domain([0, d3.max(data, function(d) {return d["cost"]})]).range([height-padding, padding]);

    var circles = svgPurchases.selectAll("circle").data(data.filter(function(d) {return filtering(d);}));
    circles.exit().remove();

    circles.enter().append("circle").merge(circles)
        .attr('cx', function(d) {return scaleX(d["date"])})
        .attr('cy', function(d) {return scaleY(d["cost"])})
        .attr('r', padding/10)
        .attr('fill', function(d) {return chooseColour(d["store"])});

    addAxisLabels(svgPurchases, "Date", "Cost");

    addAxis(svgPurchases, scaleX, scaleY);
}

function drawCumulative() {
    svgCumulative.attr("width", width)
        .attr("height", height);

    var filteredData = data.filter(filtering);
    var accumulation = filteredData.length > 0 ? [filteredData[0]["cost"]] : [];
    for (var i = 1; i < filteredData.length; i++) {
        accumulation[i] = accumulation[i-1] + filteredData[i]["cost"];
    }
    // Scaling
    var scaleX = d3.scaleTime().domain([data[0]["date"], data[data.length-1]["date"]])
                                .range([padding, width-padding]);
    var scaleY = d3.scaleLinear().domain([0, d3.sum(data, function(d) {return d["cost"]})]).range([height-padding, padding]);

    var bars = svgCumulative.selectAll("rect").data(filteredData);
    bars.exit().remove();

    bars.enter().append("rect").merge(bars).attr('x', function(d) {return scaleX(d["date"])})
        .attr('y', function(d, i) {return scaleY(accumulation[i])})
        .attr('height', function(d, i) {return height - scaleY(accumulation[i]) - padding})
        .attr('width', width/data.length - padding/4)
        .attr('fill', function(d) {return chooseColour(d["store"])});

    addAxisLabels(svgCumulative, "Date", "Cumulative Cost");

    addAxis(svgCumulative, scaleX, scaleY);
}


function outerHeight(el) {
    // Taken from youmightnotneedjquery.com
    var height = el.offsetHeight;
    var style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

window.onresize = function() {
    var container = document.getElementById("graph");
    width = container.clientWidth;
    height = container.clientHeight - outerHeight(document.getElementsByTagName("h1")[0]);
    draw();
}
