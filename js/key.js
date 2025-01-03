class Key {

    // The logic here is to build the key as an svg then render it to Canvas elements as required.
    constructor() {

        gui.debug("FUNCTION Key.constructor");
	
        this.svgns = "http://www.w3.org/2000/svg";
	$("#keySVG").remove();
	this.keySVG=document.createElementNS(this.svgns,"svg");
	this.keySVG.id="keySVG";
	document.body.appendChild(this.keySVG);
	this.blob="";

	// Image for the canvas
	this.img = document.createElement("img");
	document.body.appendChild(this.img);
	this.img.style.display="none";

        // Key parameters
	this.keySteps=10;
	this.size=100;
	this.margin=0.1*this.size;
	this.border=this.size/2.0;
	this.textScale=0.6;
	
        return;
    }

    build() {

        // Log
        gui.debug("FUNCTION Key.build");
	
	// Data properties etc.
	let property=gui.getCurrentProperty();
        let code=property["code"];
        let dataMode=gui.getDataMode();
	let t=0;
        let Nuc=data.table[code][t];
	
	// Clear any current SVG
        this.keySVG.innerHTML="";
	this.keySVG.xmlns=this.svgns;
	this.keySVG.setAttribute("width","2000");
	this.keySVG.setAttribute("height","2000");
	this.keySVG.style.fontFamily=chart.getFontFamily(".nuclide_text");

        // Background and text colour
	let background=colour.getBackgroundColour();
	
	// We have decided not to apply these to the key
	//this.keySVG.style.fontStyle=chart.getFontStyle(".nuclide_text");
	//this.keySVG.style.fontVariant=chart.getFontVariant(".nuclide_text");
	//this.keySVG.style.fontWeight=chart.getFontWeight(".nuclide_text");
	
        // Write title
        let title=property['longname'];
	if(dataMode.indexOf("minus")!=-1) { title="Negative of "+title; }
	// No longer need this as we have changed the colour scale for logs
        //if(dataMode.indexOf("log")!=-1) { title="Log of "+title; }
        if(dataMode.indexOf("dx")!=-1) { title=title+" error"; }
        if(dataMode.indexOf("ds")!=-1) { title=title+" single difference"; }
        if(dataMode.indexOf("dd")!=-1) { title=title+" double difference"; }
        if(property['hasUnit']==true) { title=title+" ["+property["unit"]+"]"; }

	let y=0;
	let textTitle = document.createElementNS(this.svgns,"text");
        textTitle.setAttribute("x","0");  
        textTitle.setAttribute("y",y.toString());
	textTitle.setAttribute("font",chart.getFontNotSize(".nuclide_text"));
        textTitle.setAttribute("font-size",this.size);
    	textTitle.setAttribute("dominant-baseline","hanging");
    	textTitle.innerHTML=title;
	this.keySVG.appendChild(textTitle);

	y=y+this.size+2*this.margin;
	if(dataMode.indexOf("log")!=-1) {
	    y=y+2*this.margin;
	}
	if(property.isNumeric==true) {
	    // Text
	    let points=[0.0,0.25,0.5,0.75,1.0];
	    for(let fx in points) {
		let textNumber = document.createElementNS(this.svgns,"text");
		textNumber.setAttribute("x",points[fx]*(this.size+this.margin)*(this.keySteps-1)+this.size/2);
		textNumber.setAttribute("y",y.toString());
                textNumber.setAttribute("font",chart.getFontNotSize(".nuclide_text"));
                textNumber.setAttribute("font-size",this.size*this.textScale);
    	        textNumber.setAttribute("dominant-baseline","hanging");
    	        textNumber.setAttribute("text-anchor","middle");
    	        let n=points[fx]*parseFloat(property.userDataMax-property.userDataMin)+parseFloat(property.userDataMin);
		let str=parseFloat(n.toPrecision(3)).toString(); //n.toExponential(0).toString();
		if(str.length>5) {
		    str=n.toExponential(1).toString();
		}
		if(dataMode.indexOf("log")!=-1) {
                    textNumber.innerHTML="10<tspan dy='-0.8em' font-size='0.6em'>"+str+"</tspan>";
		}
		else {
                    textNumber.innerHTML=str;
		}
		this.keySVG.appendChild(textNumber);
	    }
	    y=y+this.size*this.textScale+this.margin;
	    // Coloured boxes
            for(let i=0; i<this.keySteps; i++) {
	        let rect = document.createElementNS(this.svgns, "rect");
                rect.setAttribute("x",(i*(this.size+this.margin)).toString());
                rect.setAttribute("y",y);
                rect.setAttribute("width", this.size.toString());
                rect.setAttribute("height",this.size.toString());
                rect.setAttribute("fill",colour.interpolateColour(i/this.keySteps));
	        this.keySVG.appendChild(rect);
	    }
	}
	else {
	    y=y-this.size;
            let listText=[];
            let listFill=[];
	    for (let val in colour.col[property['code']])
            {
		listText.push(GreekDecayMode(val));
		listFill.push(colour.colourList(val));
            }
	    for(let i=0; i<Math.ceil(listText.length/3); i++) {
    	        y=y+this.size+this.margin;
		
		for(let j=0; j<3; j++) {
    		    let index=j*Math.ceil(listText.length/3)+i;
		    if(index>=listText.length) { continue; }
		    let x=j*this.size*4;
		    
                    let rect = document.createElementNS(this.svgns, "rect");
                    rect.setAttribute("x",x.toString());
                    rect.setAttribute("y",y.toString());
                    rect.setAttribute("width", this.size.toString());
                    rect.setAttribute("height",this.size.toString());
                    rect.setAttribute("stroke","none");
                    rect.setAttribute("fill",listFill[index]);
                    this.keySVG.appendChild(rect);
                    
                    let text = document.createElementNS(this.svgns,"text");
                    text.setAttribute("x",(x+this.size+2*this.margin).toString());
                    text.setAttribute("y",(y+this.size/2).toString());
                    text.setAttribute("font",chart.getFontNotSize(".nuclide_text"));
                    text.setAttribute("font-size",this.size*this.textScale);
                    text.setAttribute("dominant-baseline","middle");
                    text.setAttribute("text-anchor","left");
    	            text.className.baseVal="nuclide_text_key";
                    text.innerHTML=listText[index];
                    this.keySVG.appendChild(text);
		}
	    }
	}

	// Long-lived, estimated and unknown
	let label=["Long-lived","Estimated","Unknown"];
	let stroke=["#000000","#999999","none"];
	let fill=["#FFFFFF","#FFFFFF",colour.undefinedColour];
	y=y+2*this.margin;
	for(let i=0;i<label.length;i++) {
	    
            y=y+this.size+this.margin;

	    let rect = document.createElementNS(this.svgns, "rect");
            rect.setAttribute("x","0");
            rect.setAttribute("y",y.toString());
            rect.setAttribute("width", this.size.toString());
            rect.setAttribute("height",this.size.toString());
            rect.setAttribute("stroke",stroke[i]);
            rect.setAttribute("stroke-width",(chart.stableLineWidth*this.size).toString());
            rect.setAttribute("fill",fill[i]);
            this.keySVG.appendChild(rect);
            
            let text = document.createElementNS(this.svgns,"text");
            text.setAttribute("x",(this.size+2*this.margin).toString());
            text.setAttribute("y",(y+this.size/2).toString());
            text.setAttribute("font-size",this.size*this.textScale);
            text.setAttribute("dominant-baseline","middle");
            text.setAttribute("text-anchor","left");
            text.innerHTML=label[i];
            this.keySVG.appendChild(text);
	}

	// Background
        let box=this.keySVG.getBBox({ stroke : true });
	let x=box.x;
	y=box.y;
	let w=box.width;
	let h=box.height;
        let rect = document.createElementNS(this.svgns, "rect");
        rect.setAttribute("x",(x-this.border).toString());
        rect.setAttribute("y",(y-this.border).toString());
        rect.setAttribute("width", (w+2*this.border).toString());
        rect.setAttribute("height",(h+2*this.border).toString());
        rect.setAttribute("fill",background[0]);
	rect.id="keyBackground";
        this.keySVG.prepend(rect);
	
	// Run update
        this.update();
	
        return;
    }

    update() {

	$("#keySVG").show();
	
        let box=this.keySVG.getBBox({ stroke : true });
	let x=box.x;
	let y=box.y;
	let w=box.width;
	let h=box.height;	
	let wClient=this.keySVG.getBoundingClientRect().width;
	let hClient=this.keySVG.getBoundingClientRect().height;
	let scale=document.getElementById("rangeKeySize").value;
	let imageWidth=300.0*scale;
	let imageHeight=imageWidth*h/w;
	
        // Adjust background
      	let background=colour.getBackgroundColour();
	try {
    	    if(document.getElementById("checkKeyBackground").checked==true) {
                document.getElementById("keyBackground").setAttribute("fill",background[0]);
    	    }
    	    else {
                document.getElementById("keyBackground").setAttribute("fill","none");
            }
	}
	catch (error) {
            gui.debug("Key not yet built.");
	}
	 
	// Do this.
        this.keySVG.setAttribute("viewBox",x.toString()+" "+y.toString()+" "+w.toString()+" "+h.toString());
	this.keySVG.setAttribute("width",imageWidth.toString());
	this.keySVG.setAttribute("height",imageHeight.toString());

	// Update image data
        let domURL = window.URL || window.webkitURL || window;
	let html=gui.prepareSVGHTML(this.keySVG);
	html=html.replace("<svg","<svg xmlns='"+this.svgns+"' ");
        let blob = new Blob([html], {type: 'image/svg+xml'});
	let url = domURL.createObjectURL(blob);
	
	// Do image
	this.img.width=imageWidth;
	this.img.height=imageHeight;
        this.img.src=url;
	this.img.onload=function(){ chart.draw(); };
	
	if(document.getElementById("checkKey").checked==true) {
            $("#keySVG").show();
	}
	else {
            $("#keySVG").hide();
	}
    }

    move() {
        let box=this.keySVG.getBBox({ stroke : true });
	let w=this.keySVG.getBoundingClientRect().width;
	let h=this.keySVG.getBoundingClientRect().height;
	let fx=document.getElementById("rangeKeyX").value;
	let fy=document.getElementById("rangeKeyY").value;
	let x=fx*(window.innerWidth-w);
	let y=fy*(window.innerHeight-h);
        $("#keySVG").css("left",x);
        $("#keySVG").css("top",y);
    }
    
}
