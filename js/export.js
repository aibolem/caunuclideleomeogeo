/**************************************************************************************************/
// export.js
// functions for exporting the chart
/**************************************************************************************************/

var isExport=false;
var pixellimit=80e6;

var sizeCustom=1;

var nCen, zCen;

/**************************************************************************************************/
// Does the export of the chart
function exportchart()
{		
    if(USE_GA) { ga('send', 'event', 'Canvas', 'Export PNG', canvas.width+"x"+canvas.height); }
    console.log(">>> exportchart start");
    isExport=false;
    drawChart();
    console.log(">>> exportchart finished drawing");

    var pngDataURL = canvas.toDataURL('image/png');    
    var blob=dataURItoBlob(pngDataURL);
    console.log(">>> exportchart finished exporting");
    
    setTimeout( function() {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var url = window.URL.createObjectURL(blob); 
        a.href = url;
        a.download = "chart.png";
        a.click();
        setTimeout(function(){ window.URL.revokeObjectURL(url); },20000);

        //window.open(pngDataURL);
        isExport=false;
	console.log(">>> exportchart opened");

	setTimeout("exportreset()",1000);
	
    },1000);
}

function exportreset() {
    // reset everything
    zoomLevelChange(0);
    CanvasResize();
    userKeyScale=true;
    keyScale=keyScale*size/sizeCustom;
    setcorner(zCen,nCen);
    console.log("nCen zCen size ",nCen,zCen,size);
    drawChart();
}

/**************************************************************************************************/
// Prepares for export, either current or custom
function exportcontrol(pdf)
{

    
    imouse=-1;
    //icurrent=-1;

    console.log(">>> exportcontrol custom");
    
    // store the current center
    nCen=ncenter();
    zCen=zcenter();
    console.log("nCen zCen size ",nCen,zCen,size);

    // Now crop to those actually visible
    var zmin, nmax;
    if(document.getElementById("radioExportCustom").checked)
    {

        // get the custom ranges
        zmin=parseInt(document.getElementById("inputZmin").value,10);
        ztop=parseInt(document.getElementById("inputZmax").value,10);
        nleft=parseInt(document.getElementById("inputNmin").value,10);
        nmax=parseInt(document.getElementById("inputNmax").value,10);
	
        console.log("LOG 1 ",zmin,ztop,nleft,nmax);
        var NuclideMinMax=SelectVisible(0);
        var t=0;
        var code=properties[currentPropertyIndex]["code"];
        var plotzmin=1000,plotzmax=-1000,plotnmin=1000,plotnmax=-1000;
        for(var i=0; i<Nuclide[code][t].length; i++) {
            if(Nuclide[code][t][i].z<zmin) { continue; }
            if(Nuclide[code][t][i].z>ztop) { continue; }
            if(Nuclide[code][t][i].n<nleft) { continue; }
            if(Nuclide[code][t][i].n>nmax) { continue; }
            if(plotzmin>Nuclide[code][t][i].z) { plotzmin=parseInt(Nuclide[code][t][i].z); }
            if(plotzmax<Nuclide[code][t][i].z) { plotzmax=parseInt(Nuclide[code][t][i].z); }
            if(plotnmin>Nuclide[code][t][i].n) { plotnmin=parseInt(Nuclide[code][t][i].n); }
            if(plotnmax<Nuclide[code][t][i].n) { plotnmax=parseInt(Nuclide[code][t][i].n); }
        }
        zmin =Math.max(plotzmin,zmin)-1;
        ztop =Math.min(plotzmax,ztop)+3;
        nleft=Math.max(plotnmin,nleft)-2;
        nmax =Math.min(plotnmax,nmax)+2;

        if(document.getElementById("checkElementLabels").checked)
        { 
            zmin=zmin-2;
            ztop=ztop+2;
            nleft=nleft-2;
            nmax=nmax+2;
        }
	
        console.log("LOG 2",plotzmin,plotzmax,plotnmin,plotnmax);
        console.log("LOG 2",zmin,ztop,nleft,nmax);
    }
    else {
        zmin=ztop-canvas.height/size;
        nmax=nleft+canvas.width/size;
    }
    
    // change the sizes
    sizeOriginal=size;
    sizeCustom=parseInt(document.getElementById("formExport").elements["size"].value,10);

    // Check total size
    var pixels = (nmax-nleft)*(ztop-zmin)*sizeCustom*sizeCustom;
    if( pixels > pixellimit)
    {
        sizeCustom = Math.floor(Math.sqrt(pixellimit / ((nmax-nleft)*(ztop-zmin))));
        alert("Warning: the requested image size is too large. The isotope size has been set to " + sizeCustom+ " px.");
    }

    // Set the key size
    userKeyScale=false;
    keyScale=keyScale*sizeCustom/size;

    // This actuall sets the size
    zoomLevelCustom(sizeCustom)

    if(!pdf) {
        canvas = document.createElement("canvas");
        context = canvas.getContext('2d');
        canvas.display = "none";
        document.body.appendChild(canvas);
    
        // changes the canvas size
        canvas.width = (nmax-nleft)*sizeCustom;
        canvas.height = (ztop-zmin)*sizeCustom;
    
        // redraw the canvas and export
        exportchart();
    }

    else {
        exportpdf(zmin,ztop,nleft,nmax);
    }
  
    if(!pdf) {
        document.body.removeChild(canvas);
        canvas = document.getElementById("chartcanvas");
        context = canvas.getContext("2d");
    }
    return false;
}


// Load the Roboto font for exporting.  Need to do this somewhat in advance.
var oReq = new XMLHttpRequest();
oReq.open("GET", "../common/fonts/Roboto-Regular.ttf", true);
oReq.responseType = "arraybuffer";
var arrayBuffer;
oReq.onload = function(oEvent) { arrayBuffer = oReq.response; }; // Note: not oReq.responseText
oReq.send(null);


function exportpdf(zmin,zmax,nmin,nmax) {
    
    if(USE_GA) { ga('send', 'event', 'Canvas', 'Export PDF', canvas.width+"x"+canvas.height); }
    
    /* Notes
       # size is arbitrary, so just don't change it, use it.
    */

    // change the sizes
    sizeOriginal=size;
    
    var doc = new PDFDocument({autoFirstPage: false, bufferPages: true, margin: 2*size,
			       info:{Title:"The CAU Nuclide LEOMEOGEO ©°hÅ℞T"}});
    var stream = doc.pipe(blobStream());
    doc.on('pageAdded', () => console.log("Page "+doc.bufferedPageRange().start+" "+doc.bufferedPageRange().count));

    doc.registerFont('Roboto', arrayBuffer);
    doc.font("Roboto");

    
    stream.on("finish", function() {
      // get a blob you can do whatever you like with
      blob = stream.toBlob("application/pdf");
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = 'ColourfulNuclideChart.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      SetHTMLCanvas();
      zoomLevelCustom(sizeOriginal);
      exportreset();
      
    });

    zoomLevelCustom(36);

    // Set to the PDF canvas
    console.log("PDF PAGE SIZE ",(nmax-nmin)*size,(zmax-zmin)*size);
    doc.addPage({size:[(nmax-nmin)*size,(zmax-zmin)*size]});
    
    SetPDFCanvas(doc);

    // Now do some drawing
    var code=properties[currentPropertyIndex]["code"];
    SelectVisible(0);
    var NuclideMinMax=[0,Nuclide[code][0].length-1];
    console.log("DrawAllNuclides");
    DrawAllNuclides(NuclideMinMax);
    console.log("DrawAllStable");
    DrawAllStable(NuclideMinMax);
    console.log("DrawAllLabelSymbol");
    DrawFullText(NuclideMinMax);
    if(document.getElementById("checkElementLabels").checked)
    { 
        DrawElementNames();
    }
    CanvasDrawKey();
    console.log("Done");
    CanvasDrawMagic();
    // Finish
    doc.end();
    
    return false;
    
}

