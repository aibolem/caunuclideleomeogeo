class Chart {

    // This should also include the search capability.
    // And setting the nuclide info panel.
    
    constructor() {

        gui.debug("FUNCTION Chart.constructor");
	gui.setLoadingMessage("Building chart...");

	// Container
        this.container=document.getElementById("chart-container");
	this.container.style.position="absolute";
	this.container.innerHTML="";
	this.container.style.width="100%";
	this.container.style.height="100%";

        // Stats
	$("#stats").remove();
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	this.stats.dom.id="stats";
        document.body.appendChild(this.stats.dom );
	$("#stats").hide();
	this.stats.dom.firstElementChild.style.position="fixed";
	this.stats.dom.firstElementChild.style.bottom="0px";
	this.stats.dom.firstElementChild.style.right="0px";

        // Key
	this.key = new Key();
	
	// Dummy canvas and context for text measurements
	this.dummyCanvas=document.createElement("canvas");
        this.dummyContext=this.dummyCanvas.getContext("2d");

	// General properties - only the most general!
	this.size=50.0;
	
        // Position variables
	this.nCenter=12;
	this.zCenter=12;

        this.zmag=[2,8,20,28,50,82];
        this.nmag=[2,8,20,28,50,82,126];

	this.highlights=[];
	
	// Display variables
	this.border=0.005;
	this.stableBorder=0.08;
	this.stableLineWidth=0.04;
	this.estimatedBorder=0.12;
	this.estimatedLineWidth=0.12;
	this.stableColour="#000000";
	this.estimatedColour="#FFFFFFA0";
	
        this.setMassFont = function() {
            return 0;
	}

        this.setSymbolFont = function() {
            return 0;
	}

	this.setValueFont = function() {
            return 0;
	}

	this.getFontSize = function(c) {
	    let fontScale=document.getElementById("rangeFontSize").value;
            return (parseFloat($(c).css("font-size"))/parseFloat($(".nuclide_text").css("font-size"))*this.size*fontScale).toString();
	}
	
	this.getFont = function(c) {
	    let fontSize=this.getFontSize(c);
            return $(c).css("font-style")+" "+$(c).css("font-variant")+" "+$(c).css("font-weight")+" "+fontSize+"px "+$(c).css("font-family");
	}

	this.getFontFamily = function(c) {
            return $(c).css("font-family");
	}

	this.getFontWeight = function(c) {
            return $(c).css("font-weight");
	}

	this.getFontVariant = function(c) {
            return $(c).css("font-variant");
	}

	this.getFontStyle = function(c) {
            return $(c).css("font-style");
	}

	
	this.getFontNotSize = function(c) {
            return $(c).css("font-style")+" "+$(c).css("font-variant")+" "+$(c).css("font-weight")+" "+$(c).css("font-family");
	}
	
	/* Measure all the text widths */
        this.measureText = function() {

            gui.debug("FUNCTION Chart.measureText");
	    
            let t=0;
            let property=gui.getCurrentProperty();
            let code=property["code"];
            let dataMode=gui.getDataMode();

            let massWidth  = new Array();
            let symbolWidth  = new Array();
            let massHeight  = new Array();
            let symbolHeight  = new Array();

            let textFontSize=parseFloat(this.getFontSize(".nuclide_text")).toString();
    	    let massFontSize=parseFloat(this.getFontSize(".nuclide_text_mass")).toString();
    	    let symbolFontSize=parseFloat(this.getFontSize(".nuclide_text_symbol")).toString();
    	    let valueFontSize=parseFloat(this.getFontSize(".nuclide_text_value")).toString();
	    
            /* Masses */
            this.dummyContext.font = this.getFont(".nuclide_text_mass");
            for(let i=0;i<N_MAX+Z_MAX;++i) {
                let metric = this.dummyContext.measureText(i.toString());
                massWidth[i] = metric.actualBoundingBoxRight;
                massHeight[i] = massFontSize;
            }
        
            /* Symbols */
            this.dummyContext.font = this.getFont(".nuclide_text_symbol");
            for(let i=0;i<data.sym.length;++i) {
                let metric = this.dummyContext.measureText(rtrim(data.sym[i].sym));
                symbolWidth[i] = metric.actualBoundingBoxRight;
                symbolHeight[i] = symbolFontSize
            }

	    /* Assign to the table, by just calculating offsets! These are with respect to centre. */
            for(let i=0;i<data.table[code][t].length;i++) {
		let Nuc=data.table[code][t][i];
	        let offset = (this.size-symbolHeight[Nuc.z]-parseFloat(valueFontSize))/2.0/this.size;
		offset=offset-(this.size/2-symbolHeight[Nuc.z])/this.size;
		if(!$("#checkShowValue").prop("checked")) { offset=symbolHeight[Nuc.z]/2.0/this.size; }
                Nuc.massOffsetX = parseFloat((this.size - massWidth[Nuc.a] - symbolWidth[Nuc.z])/2 -this.size/2 )/this.size;
                Nuc.massOffsetY = -0.45*symbolHeight[Nuc.z]/this.size + offset;
                Nuc.symbolOffsetX = parseFloat(Nuc.massOffsetX*this.size + massWidth[Nuc.a])/this.size;
                Nuc.symbolOffsetY = offset;
                Nuc.valueOffsetX = 0;
                Nuc.valueOffsetY = valueFontSize/this.size + offset;
            }
        
        }

    }

    
    // To be overwritten in daughter classes
    draw() {
        return;
    }

    build() {
        return;
    }

    update() {
	return;
    }

    resize() {
        return;
    }

    resizeContainer() {
        $("#chart-container").css("width",window.innerWidth+"px");
	$("#chart-container").css("height",window.innerHeight+"px");
    }

    search() {

    }

    toggleStats() {
        $("#stats").toggle();
    }

    // Save data
    saveData()
    {
        function nts(x,len) {
            if(x==undefined) { return "*"; }
            return x.toString();
        }

	let source=gui.getCurrentSource();
	let property=gui.getCurrentProperty();
        let code=property["code"];
	let mode=gui.getDataMode();
        let t=0;

	let nz=gui.getNZRanges();
	let nMin=nz[0];
	let nMax=nz[1];
	let zMin=nz[2];
	let zMax=nz[3];
	
        // Work out the property title. Should combine this with key.
        let Title = property['longname'];
        if(document.getElementById("radioGradientSingle").checked)
        {
            Title=Title+" Single Difference";
    	}
        if(document.getElementById("radioGradientDouble").checked)
        {
            Title=Title+" Double Difference";
    	}
        if(property['hasUnit']==true)
        {
            Title=Title+" ["+property["unit"]+"]";
        }
    
        let dc=mode.replace("log","").replace("dx","x");
        
        /* Disclaimer */
        let Disclaimer="# This data was taken from Ed Simpson's CAU Nuclide LEOMEOGEO ©°hÅ℞T:<br/>#<br/>";
        Disclaimer+="# people.physics.anu.edu.au/~ecs103/chartnew<br/>#<br/>";
        Disclaimer+="# Booleans are represented by 1=True and 0=False<br/>";
        Disclaimer+="# Missing (or irrelevant) data is replaced by a '*'.<br/>";
        Disclaimer+="# Note that errorbars on derivative quantities are incorrect and should not be used.<br/>#<br/>";
        Disclaimer+="# Any use of this data should cite the relevant publication for this data set.<br/>#<br/>";
	Disclaimer+="# Property: "+property["longname"]+"<br/>";
        Disclaimer+="# Source: "+source["longname"]+"<br/>";
        Disclaimer+="# Reference: <a href='"+source["url"]+"' target='_blank'>"+source["ref"]+"</a><br/>#<br/>";
        Disclaimer +="# Though all data should be consistent with the above publications<br/>";
        Disclaimer +="# it is provided as with no warranty whatsoever.<br/>";
        Disclaimer +="# Please send any feedback/corrections to: <br/>#<br/>";
        Disclaimer +="# edward.simpson@anu.edu.au<br/><br/>";
        
        /* Write the header */
        let Header="<td>#&nbsp;</td>";
        Header+="<td>A</td>";
        Header+="<td>Z</td>";
        Header+="<td>N</td>";
        Header+="<td>"+Title+"</td>";
        if(dc=="x"&&code!="dm") {
            Header+="<td>Error      </td>";
            Header+="<td>Estimated  </td>";
            Header+="<td>Tentative  </td>";
            Header+="<td>LowerLimit </td>";
            Header+="<td>UpperLimit </td>";
        }
        
        let Result =Disclaimer;
        Result+="<table><tr>";
        Result+=Header;
        Result+="</tr>";
        let Col=15;
        
        /* Write the data */
        let num=0;
        for(var z=zMin; z<=zMax; ++z) {
            for(var n=nMin; n<=nMax; ++n) {
                if(!(property.NZIndex[z] instanceof Array)) { continue; }
                if(property.NZIndex[z][n]===undefined) { continue; }
    	        let i=property.NZIndex[z][n];
                let Nuc=data.table[code][t];
    	        if(i==undefined) { continue; }
    	        if(i==-1) { continue; }
    	        if(Nuc[i].x==undefined) { continue; }
    	        num=num+1;
    	        //if(num%30==0) { Result+=Header; }
    	        Result+="<tr><td></td>";
                Result+="<td>"+nts(Nuc[i].a,4)+"</td>";
                Result+="<td>"+nts(Nuc[i].z,4)+"</td>";
                Result+="<td>"+nts(Nuc[i].n,4)+"</td>";
    	        if(code!="dm") {
                    Result+="<td>"+nts(Nuc[i][dc],15)+"</td>";
    	            if(dc=="x") {
                        Result+="<td>"+nts(Nuc[i].dx,15)+"</td>";
                        Result+="<td>"+nts(Nuc[i].est,15)+"</td>";
                        Result+="<td>"+nts(Nuc[i].tentative,15)+"</td>";
                        Result+="<td>"+nts(Nuc[i].lower,15)+"</td>";
                        Result+="<td>"+nts(Nuc[i].upper,15)+"</td>";
    	            }
    	        }
    	        else if(dc=="x") {
    		    for(var j=0; j<Nuc[i][dc].length; j++) {
                        Result+="<td>"+nts(Nuc[i][dc][j]["mode"],15)+Nuc[i][dc][j]["op"]+Nuc[i][dc][j]["x"]+"</td>";
    		    }
                }
                Result+="</tr>";
    	    }
        }
        Result+="</table>";
        let newwindow = window.open("_blank","");
        newwindow.document.write(Result);
         
    }

    filename() {
	let property=gui.getCurrentProperty();
	let d=new Date();
	let str=d.toISOString();
	console.log("datestring",str);
	str = str.replace(/:/g,"-").substring(0,str.lastIndexOf("."));
	return property.code+"_"+str;
    }

}
