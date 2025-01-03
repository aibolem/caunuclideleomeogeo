//    <!-- jspdf -->
//    <script src=></script>
//
//import * as THREE from 'https://cdn.skypack.dev/three@0.133.1';
//import { MapControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls'
//import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/utils/BufferGeometryUtils'
//import { GLTFExporter } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/exporters/GLTFExporter'



//import { jsPDF } from  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
//import '../js-external/svg2pdf.umd.min.js'

class ChartSVG extends Chart {

    // Need to change this so that it uses size in the same way as the canvas chart.
    
    constructor() {

	super();

        gui.debug("FUNCTION ChartSVG.constructor");
	
        this.svgns = "http://www.w3.org/2000/svg";
	this.svg=document.createElementNS(this.svgns,"svg");
	this.container.appendChild(this.svg);
	this.svg.id="chartSVG";

        // Interaction variables
        this.mouseStartX=0;
        this.mouseStartY=0;
        this.vbMouseStartX=0;
        this.vbMouseStartY=0;
	
	//        svg.onclick = this.chartClick;
	this.svg.addEventListener("mousedown",this.mouseDown.bind(this));
	this.svg.addEventListener("mouseup",this.mouseUp.bind(this));
	//window.addEventListener("mouseout",this.mouseUp.bind(this));
	window.addEventListener("mouseleave",this.mouseUp.bind(this));
	this.svg.addEventListener("wheel",this.wheel.bind(this));
	this.svg.addEventListener("dblclick",this.select.bind(this));


	// For saving to PNG
	this.imagePNG = document.createElement("img");
	document.body.appendChild(this.imagePNG);
	this.imagePNG.style.display="none";
    }

    pixelToN(x) {
	let vb=chart.svg.getAttribute("viewBox").split(" ");
	let nMin=parseFloat(vb[0])/this.size;
	let nMax=nMin+parseFloat(vb[2])/this.size;
	let width=parseFloat(this.svg.getBoundingClientRect().width);
        return x/width*(nMax-nMin)+nMin;
    }

    pixelToZ(y) {
	let vb=chart.svg.getAttribute("viewBox").split(" ");
	let zMin=parseFloat(vb[1])/this.size;
	let zMax=zMin+parseFloat(vb[3])/this.size;
	let height=parseFloat(this.svg.getBoundingClientRect().height);
        return y/height*(zMax-zMin)+zMin;
    }

    zToPixel(z) {
        return -z*this.size;
    }

    nToPixel(n) {
        return n*this.size;
    }

    build() {

        gui.debug("FUNCTION ChartSVG.build");
	
	// Build the key
	this.key.build();

	// Clear!
	this.svg.innerHTML="";
	
	let property=gui.getCurrentProperty();
        let code=property["code"];
        let dataMode=gui.getDataMode();
	let t=0;
        let Nuc=data.table[code][t];

	// Get size
	this.size=50;
	let cookieSize=this.size;
	if(gui.isCookie("size")) {
            cookieSize=parseFloat(gui.getCookie("size"));
	}
	    
	let superscale=0.5;
        let supersize=(superscale*100).toString()+"%";
        //let superdy=(-0.3/superscale+offset).toString()+"em";
        //let textdy=parseFloat(0.3+offset).toString()+"em";
        let valuesize=(40).toString()+"%";

        let borderWidth=this.border*this.size;
	
        let textFontSize=parseFloat(this.getFontSize(".nuclide_text")).toString();	
        this.svg.setAttribute("font-size",textFontSize);
	//this.svg.style.fontSize=textFontSize+"px";
	
        for(var i=0; i<Nuc.length; i++) {
    
	    let extraClass="";
    	    if(Nuc[i].est==1) { extraClass+=" estimated "; }
    	    if(!(Nuc[i].z%2==0&&Nuc[i].n%2==0)) { extraClass+=" not_even_even "; }
    	    if(Nuc[i][dataMode]===undefined) { extraClass+=" unknown "; }
    	    if(isNaN(Nuc[i][dataMode])) { extraClass+=" unknown "; }
	    
    	    let x=(this.size*Nuc[i].n).toString();
    	    let y=-(this.size*Nuc[i].z).toString()
	    
            let group = document.createElementNS(this.svgns, "g");
            group.id=Nuc[i].id;
    	    this.svg.appendChild(group);
	    
            let rect = document.createElementNS(this.svgns, "rect");
            rect.setAttribute("x", (parseFloat(x)+borderWidth-0.5*this.size).toString());
            rect.setAttribute("y", (parseFloat(y)+borderWidth-0.5*this.size).toString());
            rect.setAttribute("width", (this.size-2*borderWidth).toString());
            rect.setAttribute("height", (this.size-2*borderWidth).toString());
            rect.setAttribute("fill", Nuc[i].colour);
    	    rect.className.baseVal="nuclide nuclide_square"+extraClass;
    	    group.appendChild(rect);

    	    if(Nuc[i].stable) {
     		let borderWidth=this.stableBorder*this.size;
		let lineWidth=this.stableLineWidth*this.size;
                let stableRect = document.createElementNS(this.svgns, "rect");
                stableRect.setAttribute("fill","none");
                stableRect.setAttribute("stroke",this.stableColour);
                stableRect.setAttribute("stroke-width",(lineWidth).toString());
                stableRect.setAttribute("x", (parseFloat(x)+borderWidth-0.5*this.size).toString());
                stableRect.setAttribute("y", (parseFloat(y)+borderWidth-0.5*this.size).toString());
                stableRect.setAttribute("width", (this.size-2*borderWidth).toString());
                stableRect.setAttribute("height", (this.size-2*borderWidth).toString());
		stableRect.className.baseVal="nuclide nuclide_square_stable"+extraClass;
                group.appendChild(stableRect);
    	    }
	    
    	    // Handle estimated indicator 
    	    if(Nuc[i].est==1) {
                let borderWidth=this.estimatedBorder*this.size;
                let lineWidth=this.estimatedLineWidth*this.size;
                let estRect = document.createElementNS(this.svgns, "rect");
                estRect.setAttribute("x", (parseFloat(x)+borderWidth-0.5*this.size).toString());
                estRect.setAttribute("y", (parseFloat(y)+borderWidth-0.5*this.size).toString());
                estRect.setAttribute("width",  (this.size-2*borderWidth).toString());
                estRect.setAttribute("height", (this.size-2*borderWidth).toString());
                estRect.setAttribute("stroke",this.estimatedColour);
                estRect.setAttribute("fill", "none");
                estRect.setAttribute("stroke-width",(lineWidth).toString());
                estRect.className.baseVal="nuclide nuclide_square_estimated"+extraClass;
    	        group.appendChild(estRect);
    	    }
    	    
            let text = document.createElementNS(this.svgns,"text");
            text.setAttribute("x",x);     
            text.setAttribute("y",(parseFloat(y)-0.15*this.size).toString());
    	    text.setAttribute("text-anchor","middle");
    	    text.setAttribute("text-rendering","optimizeSpeed");
    	    text.setAttribute("dominant-baseline","middle");
            text.setAttribute("fill",Nuc[i].textColour);
    	    text.className.baseVal="nuclide nuclide_text"+extraClass;
    	    group.appendChild(text);
    	    
    	    let symstr = rtrim(data.sym[Nuc[i].z].sym);
    	    let numstr = rtrim(Nuc[i].a);
    	    let valstr = String(Nuc[i]["string"+dataMode]);

            var textMass = document.createElementNS(this.svgns,"tspan");
	    textMass.innerHTML=numstr;
            textMass.className.baseVal="nuclide nuclide_text_mass"+extraClass;
	    text.appendChild(textMass);

            let textSymbol = document.createElementNS(this.svgns,"tspan");
	    textSymbol.innerHTML=symstr;
            textSymbol.className.baseVal="nuclide nuclide_text_symbol"+extraClass;
            textSymbol.setAttribute("dy","0.15em");
	    text.appendChild(textSymbol);
	    
            let textValue = document.createElementNS(this.svgns,"tspan");
	    textValue.innerHTML=valstr;
            textValue.className.baseVal="nuclide nuclide_text_value"+extraClass;
            textValue.setAttribute("x",x);
            textValue.setAttribute("dy","2.0em");
	    text.appendChild(textValue);
	    
    	    // Set event handlers 
    	    //group.ondblclick=selectNuclide.bind(this,Nuc[i].a,Nuc[i].z);

        }

	// Element names
	let lightness=document.getElementById("rangeBackgroundLightness").value;
        let backgroundColour=colour.hsltorgb(0,0,lightness);
	let textColour=colour.textColour(backgroundColour);
	for(let z=0; z<Math.min(data.sym.length,Z_MAX); z++) {
            let x=this.nToPixel(property.minN[z])-this.size/2-0.1*this.size;
            let y=this.zToPixel(z);

	    // Skip an z not in this data set;
	    if(property.minN[z]>property.maxN[z]) { continue; }
	    
            let outerElement = document.createElementNS(this.svgns,"text");
            outerElement.setAttribute("x",x.toString());
            outerElement.setAttribute("y",y.toString());
	    outerElement.id="z"+z.toString();
	    
            let textElement = document.createElementNS(this.svgns,"tspan");
	    textElement.innerHTML=data.sym[z].lname;
            textElement.className.baseVal="nuclide nuclide_text_symbol nuclide_text_element";
    	    textElement.setAttribute("text-anchor","end");
    	    textElement.setAttribute("x",x.toString());
    	    textElement.setAttribute("transform-origin",x.toString()+" "+y.toString());
    	    textElement.setAttribute("dominant-baseline","auto");
	    outerElement.appendChild(textElement);

            textElement = document.createElementNS(this.svgns,"tspan");
	    textElement.innerHTML="Z="+z.toString();
            textElement.className.baseVal="nuclide nuclide_text_symbol nuclide_text_element";
    	    textElement.setAttribute("text-anchor","end");
    	    textElement.setAttribute("x",x.toString());
    	    textElement.setAttribute("transform-origin",x.toString()+" "+y.toString());
    	    textElement.setAttribute("dy",parseFloat(this.getFontSize(".nuclide_text_symbol")).toString());
	    outerElement.appendChild(textElement);

	    this.svg.appendChild(outerElement);
	}

	// Magic numbers
        let magicGroup = document.createElementNS(this.svgns, "g");
        magicGroup.id="magicNumbers";
    	this.svg.appendChild(magicGroup);
        	
        // Do a manual resize
	this.resizeContainer();
	$("#chartSVG").css("width",window.innerWidth+"px");
	$("#chartSVG").css("height",window.innerHeight+"px");
	
	// Load from cookie - note these need translating into the viewbox
	// Something is still not quite right in the viewbox.
	if(gui.isCookie("nCenter")&&gui.isCookie("zCenter"))
	{
	    this.nCenter=parseFloat(gui.getCookie("nCenter"));
	    this.zCenter=-parseFloat(gui.getCookie("zCenter"));
	    if(!isNaN(this.nCenter)&&!isNaN(this.zCenter)) {
                let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
                let svgHeight=parseFloat(this.svg.getBoundingClientRect().height);
                let dn=svgWidth/cookieSize;
                let dz=svgHeight/cookieSize;
	        let x=((this.nCenter-dn/2)*this.size).toString();
	        let y=((this.zCenter-dz/2)*this.size).toString();
	        this.svg.setAttribute("viewBox",x+" "+y+" "+(dn*this.size).toString()+" "+(dz*this.size).toString());
	    }
	}


	// Highlight numbers
        let highlightGroup = document.createElementNS(this.svgns, "g");
        highlightGroup.id="highlightNuclides";
    	this.svg.appendChild(highlightGroup);
	// Handle highlights
	for(let k=0; k<this.highlights.length; k++) {
    	    let x=((this.highlights[k][0]-this.highlights[k][1])*this.size).toString();
    	    let y=-(this.highlights[k][1]*this.size).toString();
            let highlightCircle = document.createElementNS(this.svgns, "circle");
	    let lineWidth=this.stableLineWidth*this.size;
            highlightCircle.setAttribute("fill","yellow");
            highlightCircle.setAttribute("stroke","black");
            highlightCircle.setAttribute("stroke-width",(lineWidth).toString());
            highlightCircle.setAttribute("cx", (parseFloat(x)+borderWidth).toString());
            highlightCircle.setAttribute("cy", (parseFloat(y)+borderWidth).toString());
            highlightCircle.setAttribute("r", (1.5*(this.size/2-borderWidth-lineWidth)).toString());
	    highlightCircle.className.baseVal="nuclide nuclide_highlight";
            highlightGroup.appendChild(highlightCircle);
	}


        // Set the initial viewBox
	window.addEventListener("resize",this.resize.bind(this));
        this.resize();
	
	// Key - this is a problem. Updating the key doesn't change this one.
        $("#keySVG").css("z-index",2);		
    }

    update() {

        gui.debug("FUNCTION ChartSVG.update");
	
	// We need to update the styles. This should now be fine as
	// this function ONLY does that.

	// Update text colours according to background
	let background=colour.getBackgroundColour();
	$("#keySVG, .nuclide_text_element").each(function() {
	    $(this).css("fill",background[1]);
	});
	$("#chartSVG").css("background",background[0]);
	
	// Update nuclides
        let property=gui.getCurrentProperty();
        let code=property["code"];
        let dataMode=gui.getDataMode();
	let t=0;
    	let Nuc = data.table[code][t];
	let checkStable=$("#checkStable").prop("checked");
	let checkValue=$("#checkShowValue").prop("checked");
	let checkNuclideLabel=$("#checkShowNuclideLabels").prop("checked");
        for(let i=0; i<Nuc.length; i++) {
	    $("#"+Nuc[i].id+" rect.nuclide_square").css("fill",Nuc[i].colour);
	    $("#"+Nuc[i].id+" text.nuclide_square").css("fill",Nuc[i].textColour);
	    $("#"+Nuc[i].id+" text tspan")[2].innerHTML=String(Nuc[i]["string"+dataMode]);
	    // Value
	    if(checkValue) { $("#"+Nuc[i].id+" text tspan.nuclide_text_value").show(); }
	    else { $("#"+Nuc[i].id+" text tspan.nuclide_text_value").hide(); }
	    // Nuclide label
	    if(checkNuclideLabel) {
		$("#"+Nuc[i].id+" text tspan.nuclide_text_symbol").show();
		$("#"+Nuc[i].id+" text tspan.nuclide_text_mass").show();
	    }
	    else {
		$("#"+Nuc[i].id+" text tspan.nuclide_text_symbol").hide();
		$("#"+Nuc[i].id+" text tspan.nuclide_text_mass").hide();
	    }	    
	    // Visible
	    if(Nuc[i].visible) { $("#"+Nuc[i].id).show(); }
	    else { $("#"+Nuc[i].id).hide(); }
	    // Stable
	    if(Nuc[i].stable) {
                if(checkStable) { $("#"+Nuc[i].id+" rect").eq(1).show(); }
		else { $("#"+Nuc[i].id+" rect").eq(1).hide(); }
	    }
	    // Highlights
	    //$("#"+Nuc[i].id+" circle.nuclide_highlight").css("stroke","green");
	}
	// Update element and positions
	let NZRange=gui.getNZRanges();
        let Zmin=NZRange[2];
        let Zmax=NZRange[3];
        for(let z=0; z<Math.min(data.sym.length,Z_MAX); z++) {
	    // Skip an z not in this data set;
	    if((z<Zmin || z>Zmax) || property.minN[z]>property.maxN[z] ) {
                $("#z"+z.toString()).hide();
		continue;
		console.log("hiding element",z);
	    }
	    else {
                if($("#checkShowElementLabels").prop("checked") ) {
                    $("#z"+z.toString()).show();
	        }
	        else {
                    $("#z"+z.toString()).hide();
		}
	    }
		
            let x=this.nToPixel(property.minN[z])-this.size/2-0.1*this.size;
            let y=this.zToPixel(z);
	    document.getElementById("z"+z.toString()).setAttribute("x",x.toString());
	    document.getElementById("z"+z.toString()).childNodes[0].setAttribute("x",x.toString());
	    document.getElementById("z"+z.toString()).childNodes[1].setAttribute("x",x.toString());
	    
	}

        // Update magic numbers
	if(!$("#checkShowMagic").prop("checked") ) {
	    
            $("#magicNumbers").each( function() { $(this).hide(); } );
	}
	else {
	    $("#magicNumbers").each( function() { $(this).show(); } );
	
            let borderWidth=this.border*this.size;
	    let offset=0.5;// This is a curio - actually just for getting top and bottom of isotope chains.
	    let lineWidth=this.stableLineWidth*this.size; 
            let magicGroup = document.getElementById("magicNumbers");
	    magicGroup.innerHTML="";
	    
            // We need to handle these limits ina more sensible way.  They
            // should depend on the min and max values defined by the
            // user, but also on the ranges (e.g. MinN, MaxZ) used below.
            // Needs to be cleverer.
                	

            let NZRange=gui.getNZRanges();
            let Nmin=NZRange[0];
            let Nmax=NZRange[1];
            let Zmin=NZRange[2];
            let Zmax=NZRange[3];
	    
            /* Fix the below! */
            for(var i=0; i<this.zmag.length; i++)
            {
        	if(this.zmag[i]<Zmin||this.zmag[i]>Zmax) { continue; }
        	if((this.zmag[i]<property.minZ[Nmin]||this.zmag[i]>property.maxZ[Nmax])&&(property.minZ[Nmin]!=Z_MAX&&property.maxZ[Nmax]!=Z_MIN)) { continue; }
        	if(property.minN[this.zmag[i]]==N_MAX) { continue; }

		let x1=this.nToPixel(Math.max(property.minN[this.zmag[i]],Nmin)-1*offset);
		let x2=this.nToPixel(Math.min(property.maxN[this.zmag[i]],Nmax)+1*offset);
		let y=this.zToPixel(this.zmag[i]+offset);
    	        
		let line = document.createElementNS(this.svgns,"line");
                line.className.baseVal="magic_line";
    	        line.setAttribute("text-anchor","end");
                line.setAttribute("stroke","#000000");
                line.setAttribute("stroke-width",(lineWidth).toString());
		line.setAttribute("x1",x1.toString());
		line.setAttribute("x2",x2.toString());
		line.setAttribute("y1",y.toString());
		line.setAttribute("y2",y.toString());
	        magicGroup.appendChild(line);

		line = document.createElementNS(this.svgns,"line");
                line.className.baseVal="magic_line";
    	        line.setAttribute("text-anchor","end");
                line.setAttribute("stroke","#000000");
                line.setAttribute("stroke-width",(lineWidth).toString());
		line.setAttribute("x1",x1.toString());
		line.setAttribute("x2",x2.toString());
		line.setAttribute("y1",(y+this.size).toString());
		line.setAttribute("y2",(y+this.size).toString());
	        magicGroup.appendChild(line);
		
            }

	    for(var i=0; i<this.nmag.length; i++)
            {
                if(this.nmag[i]<Nmin||this.nmag[i]>Nmax) { continue; }
                if((this.nmag[i]<property.minN[Zmin]||this.nmag[i]>property.maxN[Zmax])&&(property.minN[Zmin]!=N_MAX&&property.maxN[Zmax]!=N_MIN)) { continue; }
                if(property.minZ[this.nmag[i]]==Z_MAX) { continue; }

	        let x=this.nToPixel(this.nmag[i]-offset);
		let y1=this.zToPixel(Math.max(property.minZ[this.nmag[i]],Zmin)-1*offset);
		let y2=this.zToPixel(Math.min(property.maxZ[this.nmag[i]],Zmax)+1*offset);
    	        
		let line = document.createElementNS(this.svgns,"line");
                line.className.baseVal="magic_line";
    	        line.setAttribute("text-anchor","end");
                line.setAttribute("stroke","#000000");
                line.setAttribute("stroke-width",(lineWidth).toString());
		line.setAttribute("x1",x.toString());
		line.setAttribute("x2",x.toString());
		line.setAttribute("y1",y1.toString());
		line.setAttribute("y2",y2.toString());
	        magicGroup.appendChild(line);

		line = document.createElementNS(this.svgns,"line");
                line.className.baseVal="magic_line";
    	        line.setAttribute("text-anchor","end");
                line.setAttribute("stroke","#000000");
                line.setAttribute("stroke-width",(lineWidth).toString());
		line.setAttribute("x1",(x+this.size).toString());
		line.setAttribute("x2",(x+this.size).toString());
		line.setAttribute("y1",y1.toString());
		line.setAttribute("y2",y2.toString());
	        magicGroup.appendChild(line);
		
            }
        }
	
	// Update background colours and element labels
	// Update font size
        let textFontSize=parseFloat(this.getFontSize(".nuclide_text")).toString();	
        this.svg.setAttribute("font-size",textFontSize);
	this.svg.style.fontSize=textFontSize+"px";

    }

    draw() {
        this.key.move();
    }

    saveChartCookies() {
	let vb=chart.svg.getAttribute("viewBox").split(" ");
	let vbWidth=parseFloat(vb[2]);
        // Need to convert size, ncenter, zcenter to viewbox
        let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
	let cookieSize=svgWidth/(vbWidth/this.size);
	gui.addCookie("size",cookieSize.toString());
	gui.addCookie("nCenter",this.pixelToN(this.svg.getBoundingClientRect().width/2));
	gui.addCookie("zCenter",-this.pixelToZ(this.svg.getBoundingClientRect().height/2));
    }
    
    mouseDown(event) {
        /* SVG element */
        let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
        let svgHeight=parseFloat(this.svg.getBoundingClientRect().height);
        /* View box */
        let vb=this.svg.getAttribute('viewBox').split(/\s+|,/);
        let vbX=parseFloat(vb[0]);
        let vbY=parseFloat(vb[1]);
        let vbWidth=parseFloat(vb[2]);
        let vbHeight=parseFloat(vb[3]);
        /* Mouse */
        this.mouseStartX=event.clientX;
        this.mouseStartY=event.clientY;
        this.vbMouseStartX=vbX;
        this.vbMouseStartY=vbY;
        /* Set mouse callback */
	this.svg.onmousemove=this.mouseMove.bind(this);
    }
    
    mouseUp(event) {
        let property=gui.getCurrentProperty();
        let code=property["code"];
        let dataMode=gui.getDataMode();

	this.svg.onmousemove=null;
        /* Show all text */
        $("text").each(function() {
            $(this).show();
	});
	// Toggle nuclide text if required
	if(!$("#checkShowElementLabels").prop("checked")) {
	    $("tspan.nuclide_text_symbol, tspan.nuclide_text_mass").each(function() {
	        $(this).hide();
	    });
	}
	// Nuclide value
	if(!$("#checkShowValue").prop("checked")) {
	    $("tspan.nuclide_text_value").each(function() {
	        $(this).hide();
	    });
	}
        // Element labels
	let NZRange=gui.getNZRanges();
        let Zmin=NZRange[2];
        let Zmax=NZRange[3];
        for(let z=0; z<Math.min(data.sym.length,Z_MAX); z++) {
	    // Skip an z not in this data set;
	    if((z<Zmin || z>Zmax) || property.minN[z]>property.maxN[z] ) {
                $("#z"+z.toString()).hide();
	    }
	    else {
                if($("#checkShowElementLabels").prop("checked") ) {
                    $("#z"+z.toString()).show();
	        }
	        else {
                    $("#z"+z.toString()).hide();
		}
	    }
	}
	this.saveChartCookies();
    }
    
    mouseMove(event) {
	// If there's no button down, cancel the move
        if(event.buttons==0) {
	    this.mouseUp();
	    return;
	}
        /* SVG element */
        let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
        let svgHeight=parseFloat(this.svg.getBoundingClientRect().height);
        /* View box */
        let vb=this.svg.getAttribute('viewBox').split(/\s+|,/);
        let vbWidth=parseFloat(vb[2]);
        let vbHeight=parseFloat(vb[3]);
        /* Mouse */
        let mouseX=event.clientX;
        let mouseY=event.clientY;
        /* Changes */
        let mouseDX=-(mouseX-this.mouseStartX);
        let mouseDY=-(mouseY-this.mouseStartY);
        let vbX=(this.vbMouseStartX+mouseDX*vbWidth/svgWidth);
        let vbY=(this.vbMouseStartY+mouseDY*vbHeight/svgHeight);
        this.svg.setAttribute("viewBox",vbX.toString()+" "+vbY.toString()+" "+vbWidth.toString()+" "+vbHeight.toString());
        if(Math.abs(mouseDX)>20.0||Math.abs(mouseDY)>20.0) {
            /* Hide all text */
            $("text").each(function(index) {
                $(this).hide();
            });
        }
    }

    select(event) {
	let id=event.target.parentElement.id;
	if(id=="chart-container") { return; }
	let z=parseInt(id.replace("z"," ").replace("n"," ").split(" ")[1]);
	let n=parseInt(id.replace("z"," ").replace("n"," ").split(" ")[2]);
        gui.showNuclide(z,n);
    }
    
    wheel(event) {
        /* Event */
        let mouseX=event.clientX;
        let mouseY=event.clientY;
        /* SVG element */
        let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
        let svgHeight=parseFloat(this.svg.getBoundingClientRect().height);
        /* View box */
        let vb=this.svg.getAttribute('viewBox').split(/\s+|,/);
        let vbX=parseFloat(vb[0]);
        let vbY=parseFloat(vb[1]);
        let vbWidth=parseFloat(vb[2]);
        let vbHeight=parseFloat(vb[3]);
        /* Work out next mouse wheel */
        if(event.wheelDelta) {
            let delta=event.wheelDelta;
    	    let speed=1.25;
    	    if(delta>1) { speed=1.0/speed; }
            let vbWidthNew=vbWidth*speed;   
            let vbHeightNew=vbHeight*speed;
            let vbXNew=(vbX+mouseX/svgWidth*vbWidth) - (mouseX/svgWidth*vbWidth*speed);
    	    let vbYNew=(vbY+mouseY/svgHeight*vbHeight) - (mouseY/svgHeight*vbHeight*speed);
            this.svg.setAttribute("viewBox",vbXNew.toString()+" "+vbYNew.toString()+" "+vbWidthNew.toString()+" "+vbHeightNew.toString());
        }
	this.saveChartCookies();
    }

    resize() {
	// Resize
	this.resizeContainer();
	$("#chartSVG").css("width",window.innerWidth+"px");
	$("#chartSVG").css("height",window.innerHeight+"px");

        if(this.svg.getAttribute('viewBox')===null) {
            let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
            let svgHeight=parseFloat(this.svg.getBoundingClientRect().height);
            this.svg.setAttribute("viewBox","0  "+(-20*this.size*svgHeight/svgWidth).toString()+" "+(20*this.size).toString()+" "+(20*this.size*svgHeight/svgWidth).toString());
        }
        else {
            let svgWidth=parseFloat(this.svg.getBoundingClientRect().width);
            let svgHeight=parseFloat(this.svg.getBoundingClientRect().height);
            let vb=this.svg.getAttribute('viewBox').split(/\s+|,/);
            let vbX=parseFloat(vb[0]);
            let vbY=parseFloat(vb[1]);
            let vbWidth=parseFloat(vb[2]);
            let vbHeight=parseFloat(vb[3]);
            this.svg.setAttribute("viewBox",vbX+" "+vbY+" "+vbWidth+" "+(vbWidth*svgHeight/svgWidth).toString());
        }
	this.draw();
    }

    createSVGHTML() {
        this.svg.setAttribute("viewBox",(-4*this.size).toString()+" "+(-this.size*(Z_MAX-1)).toString()+" "+(this.size*N_MAX).toString()+" "+(this.size*Z_MAX).toString());
	let svgHTML=gui.prepareSVGHTML(document.getElementById("chartSVG"));
	let svgKeyHTML=gui.prepareSVGHTML(document.getElementById("keySVG"));
	svgKeyHTML=svgKeyHTML.replace(/\<.*?\>/,'');
	svgKeyHTML=svgKeyHTML.replace('</svg>','');
	svgKeyHTML="<g transform='translate("+(2*this.size).toString()+","+(-this.size*(Z_MAX-4)).toString()+")'>"+svgKeyHTML+"</g>";
	console.log(svgKeyHTML);
	
	svgHTML=svgHTML.replace('</svg>','');
	svgHTML+=svgKeyHTML+"</svg>";
	svgHTML=svgHTML.replace("<svg","<svg xmlns='"+this.svgns+"' ");
	return svgHTML;
    }
    
    saveSVG() {
	gui.showLoading("Creating SVG file...");
        requestAnimationFrame(() => requestAnimationFrame(function(){
                let oldViewBox=chart.svg.getAttribute("viewBox");
	        let svgHTML=chart.createSVGHTML();
                let svgBlob = new Blob([svgHTML], {type:"image/svg+xml;charset=utf-8"});
                let svgURL=URL.createObjectURL(svgBlob);
                let downloadLink = document.createElement("a");
                downloadLink.href = svgURL;
                downloadLink.download = "chart2d_"+chart.filename()+".svg";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
	        chart.svg.setAttribute("viewBox",oldViewBox);
	        gui.hideLoading();
            })
         );
    }

    /*
    savePDF() {

        gui.showLoading("Creating PDF file...");
        requestAnimationFrame(() => requestAnimationFrame(function(){

            var doc = new PDFDocument({autoFirstPage: true, bufferPages: true, margin: 2*chart.size,
        			       info:{Title:"The CAU Nuclide LEOMEOGEO ©°hÅ℞T"}});
            var stream = doc.pipe(blobStream());
	    let svgHTML=chart.createSVGHTML();
	    SVGtoPDF(doc,svgHTML,0,0);
           
            stream.on("finish", function() {
              // get a blob you can do whatever you like with
              let blob = stream.toBlob("application/pdf");
              const a = document.createElement("a");
              document.body.appendChild(a);
              a.style = "display: none";
              let url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = 'ColourfulNuclideChart.pdf';
              a.click();
              window.URL.revokeObjectURL(url);          
            });
	    
            // finalize the PDF and end the stream
            doc.end();
	    
	}));
	
    }
    */
    
    savePNG() {

	Promise.all([createImageBitmap(document.getElementById("chartSVG"))
        ]).then(function(sprites) {
            console.log(sprites);
	});

	/*
	// Embed styles and get link
        let domURL = window.URL || window.webkitURL || window;
	let svgHTML=this.prepareSVGHTML();
	svgHTML=svgHTML.replace("<svg","<svg xmlns='"+this.svgns+"' ");
        let svgBlob = new Blob([svgHTML], {type:"image/svg+xml"});
        let svgURL=domURL.createObjectURL(svgBlob);
	console.log(svgURL);

	// Create image
	this.imagePNG.width=window.innerWidth;
	this.imagePNG.height=window.innerHeight;
	this.imagePNG.onload=function() {
	    console.log("second");
	    // Create dummy canvas
	    let imageCanvas = document.createElement("canvas");
	    document.body.appendChild(imageCanvas);
	    imageCanvas.style.display="none";
	    imageCanvas.width=window.innerWidth;
	    imageCanvas.height=window.innerHeight;
            imageCanvas.getContext("2d").drawImage(chart.imagePNG,0,0);
	    console.log(chart.imagePNG);
	    
	    // Save image
            let pngDataURL = imageCanvas.toDataURL('image/png');    
            let blob=dataURItoBlob(pngDataURL);
            let a=document.createElement("a");
            document.body.appendChild(a);
            a.style="display: none";
            let url=window.URL.createObjectURL(blob); 
            a.href=url;
            a.download="ColourfulNuclideChart.png";
            a.click();
	    
            console.log(url);
	    
	    // Clean up
            //window.URL.revokeObjectURL(url);
	    //document.body.removeChild(image);
	    //document.body.removeChild(imageCanvas);
	}
	this.imagePNG.src=svgURL;
        */
    }
}

// Work around for modules
window.ChartSVG=ChartSVG;
