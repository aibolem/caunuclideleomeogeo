1/*
    init.js
    Does initial setup, regardless of chart.  DataLoaded callbacks starts the show.
*/

var gui;
var chart;
var data;
var colour;

function init()
{
    colour = new Colour();
    data = new Data();
    gui = new GUI();
    chart = new Chart();
    
    let res=data.init()
	.then( function(result) { gui.parseURL(); })
	.then( function(result) { gui.createCombo(); })
	.then( function(result) { data.processData(); })
        .then( function(result) { data.setVisible(); })
	.then( function(result) { gui.setGUI(); })
        .then( function(result) { gui.setGUIFirstTime(); })
	.then( function(result) { gui.resetMinMaxValue(); })
	.then( function(result) { gui.updateStyles(); })
        .then( function(result) { colour.setAllColours(); })
	.then( function(result) { gui.createChart(); })
        .finally( function(result) { data.processAllData(); });
}
