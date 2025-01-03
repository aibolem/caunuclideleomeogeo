/**************************************************************************************************/
// colour.js
// contains functions for setting the background colour of isotopes
/**************************************************************************************************/

// object containing colours for defined-colour modes

class Colour {

    constructor() {

        this.undefinedColour="#cccccc";
        this.col={};
        this.yorkdm = { "IS":"#000000", 
                        "SF" :this.rgbToHex(0,159,60), 
                        "A"  :this.rgbToHex(247,227,0), 
                        "B-" :this.rgbToHex(68,182,230),
                        "2B-":this.rgbToHex(68,182,230),
                        "n"  :this.rgbToHex(0,109,161), 
                        "2n" :this.rgbToHex(0,109,161), 
                        "B+" :this.rgbToHex(207,2,38), 
                        "2B+":this.rgbToHex(207,2,38), 
                        "e+" :this.rgbToHex(207,2,38),
                        "EC" :this.rgbToHex(207,2,38),
                        "p"  :this.rgbToHex(239,156,0), 
                        "2p" :this.rgbToHex(239,156,0), 
                        "3p" :this.rgbToHex(239,156,0) };

    }

    setDecayModeColours() {
    
        let s=parseFloat(document.getElementById("rangeColourSaturation").value);
        let l=parseFloat(document.getElementById("rangeColourLightness").value);
        
        console.log("setdecaymodecolours",s,l);

	if(document.getElementById("checkFlipBetaHue").checked)
	{
            this.col = { 
                "dm":{ "IS" :this.hsltohex(255,0.0,0.2), 
                       "SF" :this.hsltohex(120,s,l), 
                       "A"  :this.hsltohex(60,s,l), 
                       "B-" :this.hsltohex(190,s,l),
                       "2B-":this.hsltohex(200,s,l),
                       "n"  :this.hsltohex(220,s,l), 
                       "2n" :this.hsltohex(255,s,l), 
                       "B+" :this.hsltohex(15,s,l),
                       "2B+":this.hsltohex(-5,s,l),
                       "e+" :this.hsltohex(-15,s,l), 
                       "EC" :this.hsltohex(-25,s,l*0.95), 
                       "p"  :this.hsltohex(-50,s,l*0.8), 
                       "2p" :this.hsltohex(-60,s,l*0.7), 
                       "3p" :this.hsltohex(-70,s,l*0.6)}
	    };
	}
	else
	{
            this.col = { 
                "dm":{ "IS" :this.hsltohex(255,0.0,0.2), 
                       "SF" :this.hsltohex(120,s,l), 
                       "A"  :this.hsltohex(60,s,l), 
                       "B-" :this.hsltohex(15,s*0.8,l),
                       "2B-":this.hsltohex(0,s,l*0.95),
                       "n"  :this.hsltohex(-20,s,l*0.85), 
                       "2n" :this.hsltohex(-40,s,l*0.75), 
                       "B+" :this.hsltohex(190,s,l),
                       "2B+":this.hsltohex(200,s,l),
                       "e+" :this.hsltohex(160,s,l), 
                       "EC" :this.hsltohex(165,s,l*0.8), 
                       "p"  :this.hsltohex(220,s,l), 
                       "2p" :this.hsltohex(255,s,l), 
                       "3p" :this.hsltohex(270,s,l)}
	    };
	}
    }

    /* Works out the colour for isotope i */
    colour(Nuc)
    {
        
        let property=gui.getCurrentProperty();
        let code=property["code"];
        let dataMode=gui.getDataMode();
        
        let DataMin=property.userDataMin;
        let DataMax=property.userDataMax;
        // Flag for out of range
        Nuc.OutOfRange=false;
    
        // Process Numeric
        
        if (property["code"]=="dm")
        {
            if(Nuc["x"][0]===null || Nuc["x"][0]==="" || Nuc["x"][0]===undefined ) { return this.undefinedColour; } 
    	//if(Nuc.a<20) { console.log("Colour check ",Nuc["x"],Nuc["x"][0]["mode"],yorkdm[Nuc["x"][0]["mode"]],colourList(Nuc["x"][0]["mode"])); }
    	// Catch nubase decay mode having stable also to include the abundance
    	if(Nuc["x"][0]["mode"]=="IS"&&Nuc["x"].length>1) {
                if(Nuc["x"][1]["op"]!="?") {
                    return this.colourList(Nuc["x"][1]["mode"]);
                }
                else {
                    return this.colourList(Nuc["x"][0]["mode"]);
                }
    	}
    	else {
                return this.colourList(Nuc["x"][0]["mode"]);
    	}
        }
        else if(property["isNumeric"]) {
    
            if(Nuc[dataMode]===null || Nuc[dataMode]==="" || isNaN(Nuc[dataMode]) || Nuc[dataMode]===undefined || Nuc[dataMode]===-Infinity ) { return this.undefinedColour; } 
            else {
                if( Nuc[dataMode]<DataMin ) { return this.colourNumeric(DataMin); }
                if( Nuc[dataMode]>DataMax ) { return this.colourNumeric(DataMax); } 
                return this.colourNumeric(Nuc[dataMode]);
            }
        }
        else if (!property["isNumeric"]) { return this.colourList(Nuc[dataMode]); }
        else { return this.undefinedColour; }
    }

    // Numeric properties
    colourNumeric(x)
    {
        let property=gui.getCurrentProperty();
        let DataMin=property.userDataMin;
        let DataMax=property.userDataMax;
        return this.interpolateColour((x-DataMin)/(DataMax-DataMin));
    }

    // Colour list
    colourList(x,code="")
    {
        if(code=="") { code=gui.getCurrentProperty()['code']; }
        if(document.getElementById("checkYorkMode").checked)
        {
            if(this.yorkdm[x] !== undefined) { return this.yorkdm[x]; }
            else { return this.undefinedColour; }
        }
        else if(this.col[code][x] !== undefined) { return this.col[code][x]; }
        else { return this.undefinedColour; } 
    }

    /* Set all the colours */
    setAllColours ()
    {

        gui.debug("FUNCTION Colour.setAllColours");
	
        let property=gui.getCurrentProperty();
	let dmproperty=gui.getPropertyByCode("dm");
        let code=property["code"];
        let dataMode=gui.getDataMode();

        this.setDecayModeColours();
        
        console.log("Colour setAllColours ",dataMode,dmproperty);
        console.log(document.getElementById("checkPlotLogarithmic").checked);
        var t=0;
    	    
        /* Set all the required values */
        if(document.getElementById("checkYorkMode").checked && data.table["dm"]!==undefined) {
	    console.log("Binding Blocks Colours");
            for(let i=0; i<data.table[code][t].length; i++) {
    	        try {
                    let j=dmproperty.NZIndex[data.table[code][t][i].z][data.table[code][t][i].n];
		    let Nucdm=data.table["dm"][t][j];
		    if(Nucdm["x"][0]["mode"]=="IS"&&Nucdm["x"].length>1) {
                        if(Nucdm["x"][1]["op"]!="?") {
                            data.table[code][t][i]["colour"] = this.colourList(Nucdm["x"][1]["mode"]);
                        }
                        else {
                            data.table[code][t][i]["colour"] = this.colourList(Nucdm["x"][0]["mode"]);
                        }
    	            }
    	            else {
                            data.table[code][t][i]["colour"] = this.colourList(Nucdm["x"][0]["mode"]);
    	            }
    	        }
                catch (e) {
    	            data.table[code][t][i]["colour"] = this.undefinedColour;
		    //console.log(e);
    	        }
    	    }
        }
        else {
            for(let i=0; i<data.table[code][t].length; i++) {
		data.table[code][t][i]["colour"] = this.colour(data.table[code][t][i]);
		if(i==60) { console.log(data.table[code][t][i],data.table[code][t][i]["colour"]); }
    	    }
        }
        
        for(let i=0; i<data.table[code][t].length; i++) { 
            data.table[code][t][i]["textColour"]=this.textColour(data.table[code][t][i]["colour"]);
        }
    }

    /* Generate an RGB colour from HSL */
    hsltorgb (h,s,l)
    {
        let hueoffset=parseFloat(document.getElementById("rangeColourHueOffset").value);
        var r,g,b,c,hp,x,m;
        h=this.hconvert(h);
        h=h+hueoffset;
        if(h>360) h=h-360;
        if(h<0) h=h+360;
        h=360-h;
        hp=h/60;
        c = (1-Math.abs(2*l-1))*s;
        x = c*(1-Math.abs((hp%2)-1));
        if(hp>=0&&hp<1) {r=c;g=x;b=0;}
        if(hp>=1&&hp<2) {r=x;g=c;b=0;}
        if(hp>=2&&hp<3) {r=0;g=c;b=x;}
        if(hp>=3&&hp<4) {r=0;g=x;b=c;}
        if(hp>=4&&hp<5) {r=x;g=0;b=c;}
        if(hp>=5&&hp<=6) {r=c;g=0;b=x;}
        m=l-c/2;
        r=intpad(parseInt((r+m)*255));
        g=intpad(parseInt((g+m)*255));
        b=intpad(parseInt((b+m)*255));
        return "rgb("+r+","+b+","+g+")";
    }
    
    
    /* Convert hue to angle */
    hconvert(h)
    {
        return h;
        var x=h;
        x=x*Math.PI/360;
        x=x + 0.333*Math.sin(3*x);
        return x*360/Math.PI;
    }
    
    hsltohex(h,s,l) {

        if(s>1) {
	    s=1;
	}
	if(l>1) {
	    l=1;
	}
	
	
        let sign=1;
	if(document.getElementById("checkColourDirection").checked) {
            sign=-1;
	}
	
        let hueoffset=parseFloat(document.getElementById("rangeColourHueOffset").value);
        
        h=hueoffset+sign*h;
        while(true) {
            if(h<0) {
    	    h=h+360;
    	}
    	else if(h>360) {
    	    h=h-360;
    	}
    	else { break; }
        }
        
    
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;
        
        if (0 <= h && h < 60) {
          r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
        }
        // Having obtained RGB, convert channels to hex
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);
        
        // Prepend 0s, if necessary
        if (r.length == 1)
          r = "0" + r;
        if (g.length == 1)
          g = "0" + g;
        if (b.length == 1)
          b = "0" + b;
        let result="#" + r + g + b;
        
        return result;
    }
    
    
    textColour(colour) {
        if(colour.search("#")!=-1) {
            try{ let r = parseInt(colour.substring(1,3),16);
                 let g = parseInt(colour.substring(3,5),16);
    	     let b = parseInt(colour.substring(5,7),16);
    	     var total=r+g+b;
    	   }
    	   catch (err) { return "#000000"; }
    	   if(total/(3*255.0)>=0.25) { return "#000000"; }
    	   else { return "#FFFFFF"; }
        }
        else if(colour.search("rgb")!=-1) {
            try{ var total = parseInt(parseInt(colour.substring(4,7))+parseInt(colour.substring(8,11))+parseInt(colour.substring(12,15))); }
    	catch (err) { return "#000000"; }
    	if(total/(3*255.0)>0.25) { return "#000000"; }
    	else { return "#FFFFFF"; }
        }
        else if(colour=="black") {
            return "#FFFFFF";
        }
        else {
            return "#000000";
        }
            
    }
    
    /* Using the define colour points this returns a particular colour for a particular fraction */
    interpolateColour(x)
    {
        if(x==undefined) { return this.undefinedColour; }
        // Get the colour properties
	if(document.getElementById("selectColourMode").value=="varyHue") {
            let range=360*parseFloat(document.getElementById("rangeColourRange").value);
            let saturation=parseFloat(document.getElementById("rangeColourSaturation").value);
            let lightness=parseFloat(document.getElementById("rangeColourLightness").value);
            // Work out the colour
            if(x<0) { x=0.0; }
            else if(x>1) { x=1.0; }
            return this.hsltohex(x*range,saturation,lightness);
	}
	else if(document.getElementById("selectColourMode").value=="varyLightness") {
            let range=parseFloat(document.getElementById("rangeColourRange").value);
            let saturation=parseFloat(document.getElementById("rangeColourSaturation").value);
            let hue=parseFloat(document.getElementById("rangeColourHueOffset").value);
	    let minLightness=(1-range)/2;
	    range=range-2*minLightness;
            //let lightness=parseFloat(document.getElementById("rangeColourLightness").value);
            // Work out the colour
            if(x<0) { x=0.0; }
            else if(x>1) { x=1.0; }
            return this.hsltohex(hue,saturation,minLightness+x*range);
	}
    }
    
    
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // MOVE THIS TO COLOUR, BUT DEFINITELY MAKE USE OF!
    getBackgroundColour() {
        let backgroundColour;
	let textColour;
        if(document.getElementById("checkBackgroundTransparent").checked) {
            backgroundColour="rgba(255,255,255,0)";
	    textColour="#000000";
        }
        else {
	    let lightness=document.getElementById("rangeBackgroundLightness").value;
            backgroundColour=colour.hsltorgb(0,0,lightness);
            textColour=colour.textColour(backgroundColour);
        }
	return [backgroundColour,textColour];
    }
    
}  // End of class

