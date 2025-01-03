const DEBUG=true;

class GUI {

    constructor() {
        this.propertyCombo=document.getElementById("selectProperty");
        this.sourceCombo=document.getElementById("selectSource");

        this.cooks = [ { "selector":"#selectSource",          "type":"prop",  "property":"value",   "name":"source" },
		       { "selector":"#selectProperty",        "type":"prop",  "property":"value",   "name":"property" },
		       { "selector":"input[name='datamode']", "type":"radio", "property":"",        "name":"datamode" },
		       { "selector":"input[name='showwhat']", "type":"radio", "property":"",        "name":"showwhat" },
		       { "selector":"#checkEvenEven",         "type":"prop",  "property":"checked", "name":"eveneven" },
		       { "selector":"#checkPlotLogarithmic",  "type":"prop",  "property":"checked", "name":"plotlog" },
		       { "selector":"#rangeColourRange",      "type":"prop",  "property":"value",   "name":"colourrange" },
		       { "selector":"#rangeColourSaturation", "type":"prop",  "property":"value",   "name":"coloursaturation" },
		       { "selector":"#rangeColourLightness",  "type":"prop",  "property":"value",   "name":"colourlightness" },
		       { "selector":"#rangeColourHueOffset",  "type":"prop",  "property":"value",   "name":"colourhueoffset" },
		       { "selector":"#checkColourDirection",  "type":"prop",  "property":"checked", "name":"colourdirection" },
		       { "selector":"#checkYorkMode",         "type":"prop",  "property":"checked", "name":"yorkmode" },
		       { "selector":"#checkFlipBetaHue",      "type":"prop",  "property":"checked", "name":"flipbetahue" },
		       { "selector":"#checkStable",           "type":"prop",  "property":"checked", "name":"outlinestable" },
		       { "selector":"#checkShowMagic",        "type":"prop",  "property":"checked", "name":"showmagic" },
		       { "selector":"#checkShowValue",        "type":"prop",  "property":"checked", "name":"showvalue" },
		       { "selector":"#checkShowElementLabels",  "type":"prop",  "property":"checked", "name":"showelementlabels" },
		       { "selector":"#rangeBackgroundLightness",      "type":"prop",  "property":"value",   "name":"backgroundlightness" },
		       { "selector":"#checkBackgroundTransparent",  "type":"prop",  "property":"checked", "name":"backgroundtransparent" },
		       { "selector":"#selectFont",            "type":"prop", "property":"value",        "name":"typeface" },
		       { "selector":"#checkFontBold",         "type":"prop", "property":"checked", "name":"fontbold" },
		       { "selector":"#checkFontItalic",      "type":"prop", "property":"checked", "name":"fontitalic" },
		       { "selector":"#checkFontSmallCaps",   "type":"prop", "property":"checked", "name":"fontsmallcaps" },
		       { "selector":"#rangeFontSize",        "type":"prop", "property":"value",   "name":"fontsize" },
		       { "selector":"#checkKey",             "type":"prop", "property":"checked", "name":"showkey" },
		       { "selector":"#checkKeyBackground",   "type":"prop", "property":"checked", "name":"keybackground" },
		       { "selector":"#rangeKeySize",         "type":"prop", "property":"value",   "name":"keysize" },
		       { "selector":"#rangeKeyX",         "type":"prop", "property":"value",   "name":"keyx" },
		       { "selector":"#rangeKeyY",         "type":"prop", "property":"value",   "name":"keyy" },
		       { "selector":"#rangeHeightScale",         "type":"prop", "property":"value",   "name":"heightscale" },
		       { "selector":"#rangeLightLongitude",         "type":"prop", "property":"value",   "name":"lightlong" },
		       { "selector":"#rangeLightLatitude",         "type":"prop", "property":"value",   "name":"lightlat" },
		       { "selector":"#rangeLight",         "type":"prop", "property":"value",   "name":"lightbrightness" },
		       { "selector":"#rangeLightAmbient",         "type":"prop", "property":"value",   "name":"lightambient" },
		       { "selector":"#rangeShininess",         "type":"prop", "property":"value",   "name":"shininess" },
		       { "selector":"#selectEngine",        "type":"prop",  "property":"value",   "name":"engine" } ];

    }

//
    
    hideLoading(message="") { $("#message").html(message); $("#loading").hide(); gui.debug("FUNCTION GUI.hideLoading"); }
	
    showLoading(message="") { $("#message").html(message); $("#loading").show(); }

    setLoadingMessage(message="") { $("#message").html(message); }
    
    getCurrentProperty() {
        for(let i=0; i<data.properties.length; i++) {
            if(data.properties[i]['code']==document.getElementById("selectProperty").value) {
    	    return data.properties[i];
    	}
        }
        return data.properties[0];
    }

    getPropertyByCode(code) {
        for(let i=0; i<data.properties.length; i++) {
            if(data.properties[i]['code']==code) {
    	    return data.properties[i];
    	}
        }
        return data.properties[0];
    }
    
    getCurrentSource() {
        for(let i=0; i<data.sources.length; i++) {
            if(data.sources[i]['code']==document.getElementById("selectSource").value) {
    	    return data.sources[i];
    	}
        }
        return data.sources[0];
    }
    
    getDataMode() {
        let currentDataMode="";
        /* Basic differences */
	//$("input[name='DataMode']).val()
        if      (document.getElementById("radioValue").checked)          { currentDataMode="x";  }
        else if (document.getElementById("radioMinusValue").checked)     { currentDataMode="minusx";  }
        else if (document.getElementById("radioError").checked)          { currentDataMode="dx"; }
        else if (document.getElementById("radioGradientSingle").checked) { currentDataMode="ds"; }
        else if (document.getElementById("radioGradientDouble").checked) { currentDataMode="dd"; }
        /* Logarithmic */
        if (document.getElementById("checkPlotLogarithmic").checked) { currentDataMode="log"+currentDataMode; }
        /* Change the GUI options or add difference mode */
        if (document.getElementById("radioValue").checked || document.getElementById("radioMinusValue").checked || document.getElementById("radioError").checked) {
            document.getElementById("radioGradientN").disabled=true;
            document.getElementById("radioGradientZ").disabled=true;
            document.getElementById("radioGradientNZ").disabled=true;
        }
        else {
            if (document.getElementById("radioGradientN").checked)  { currentDataMode=currentDataMode+"hor"; }
            if (document.getElementById("radioGradientZ").checked)  { currentDataMode=currentDataMode+"ver"; }
            if (document.getElementById("radioGradientNZ").checked) { currentDataMode=currentDataMode+"dia"; }
            document.getElementById("radioGradientN").disabled=false;
            document.getElementById("radioGradientZ").disabled=false;
            document.getElementById("radioGradientNZ").disabled=false;
        }
        return currentDataMode;
    }
	
    updateCombo() {
	this.debug("FUNCTION GUI.updateCombo");
	this.debug(document.cookie);
        // Get the dom elements         
        let sourceValue=this.sourceCombo.options[this.sourceCombo.selectedIndex].value; 
	this.debug(this.getCurrentProperty());
	this.debug(sourceValue);
        // Make sure the appropriate elements are hidden
        let children=this.propertyCombo.children;
        for(let i=0; i<children.length; i++) {
            let child=children[i];
            for(let j=0; j<data.properties.length; j++) {
                if(child.value!=data.properties[j]["code"]) { continue; }
                if((data.properties[j]["srcid"]=="jeff"||data.properties[j]["srcid"]=="frldm")&&sourceValue=="all") {
                    child.style.display = "none";
         	}
                else if(data.properties[j]["srcid"]!=sourceValue && sourceValue!="all") {
        	    child.style.display = "none";
        	}
                else {
        	    child.style.display = "block";
        	}
            }
        }
    }

    updateStyles() {
	this.debug("FUNCTION GUI.updateStyles");	
	$("svg, .nuclide, .nuclide_text, .nuclide_text_mass, .nuclide_text_symbol, .nuclide_text_value, .nuclide_text_element").each(function() {
	    $(this).css("font-family",$("#selectFont").val());
	    if($("#checkFontBold").prop("checked")) {
	        $(this).css("font-weight","bold");
	    }
	    else {
	        $(this).css("font-weight","normal");
	    }
	    if($("#checkFontItalic").prop("checked")) {
	        $(this).css("font-style","italic");
	    }
	    else {
	        $(this).css("font-style","normal");
	    }
	    if($("#checkFontSmallCaps").prop("checked")) {
	        $(this).css("font-variant","small-caps");
	    }
	    else {
	        $(this).css("font-variant","normal");
	    }
	});
    }
	
    createCombo() {    
        // Add the all option
        let option = document.createElement("option");
        option.value = "all";
        option.label = "All Basic Properties";
        option.textContent = "All Basic Properties";
        option.selected=true;
        this.sourceCombo.appendChild(option);
        // Add the sources to the combo
        for(let j=0; j<data.sources.length; j++) {
            let option = document.createElement("option");
            option.value = data.sources[j]["code"];
            option.name = "sourceSelect";
            option.label = data.sources[j]["longname"];
            option.textContent = data.sources[j]["longname"];
            this.sourceCombo.appendChild(option);
	    //if(j==0) { option.selected="selected"; }
	    if(this.isCookie("source")) {
                if(option.value==this.getCookie("source")) {
                    option.selected="selected";
		}
	    }
        }
    
        // Add the properties to the combo
        for(let j=0; j<data.properties.length; j++) {
	    if(!parseBool(data.properties[j].isPlot)) { continue; }
            let option = document.createElement("option");
            option.value = data.properties[j]["code"];
            option.label = data.properties[j]["longname"];
            option.name = "propertySelect";
            option.textContent = data.properties[j]["longname"]+" ["+data.properties[j]["srcid"]+"]";
            this.propertyCombo.appendChild(option);	    
	    if(j==0) { option.selected="selected"; }
	    if(this.isCookie("property")) {
                if(option.value==this.getCookie("property")) {
                    option.selected="selected";
		}
	    }
        }

	if(this.isCookie("source")) {
	    $("input[name='sourceSelect']").val([gui.getCookie("source")]);

	}
	if(this.isCookie("property")) {
	    $("input[name='propertySelect']").val([gui.getCookie("property")]);
	}
        
        // Now add the options
        this.updateCombo();
    }
    
    getNZRanges() {
        let Zmin=document.getElementById("inputZmin").value;
        let Zmax=document.getElementById("inputZmax").value;
        let Nmin=document.getElementById("inputNmin").value;
        let Nmax=document.getElementById("inputNmax").value;
        return [Nmin,Nmax,Zmin,Zmax];
    }
        
    resetNZRanges() {
        document.getElementById("inputZmin").value = document.getElementById("inputZmin").min;
        document.getElementById("inputZmax").value = document.getElementById("inputZmax").max;
        document.getElementById("inputNmin").value = document.getElementById("inputNmin").min;
        document.getElementById("inputNmax").value = document.getElementById("inputNmax").max;
	// May need to convert this to promises
	data.setVisible();
	colour.setAllColours();
	chart.draw();
    }

    changeMinMaxValue()
    {
        let property=this.getCurrentProperty();
        property.userDataMin=document.getElementById("rangeMinValue").value;
        property.userDataMax=document.getElementById("rangeMaxValue").value;
	data.setVisible();
	colour.setAllColours();
	chart.draw();
    }

    resetMinMaxValue() {
	this.debug("FUNCTION resetMinMaxMaxValue");
	
        let t=0;
        let property=this.getCurrentProperty();
        let dataMode=this.getDataMode();
        let code=property["code"];
        
        if(property["isNumeric"]==false) { return; }
        let DataMin=1e100;
        let DataMax=-1e100;
        
        for(let i=0;i<data.table[code][t].length;i++) {
    	let Nuc = data.table[code][t][i];
    	if(Nuc[dataMode]==undefined||Nuc[dataMode]==-Infinity||Nuc[dataMode]==Infinity) { continue; }
    	if(dataMode.indexOf("log")!=-1&&parseFloat(Nuc[dataMode])==0) { continue; }
            if(DataMin>parseFloat(Nuc[dataMode])) { DataMin=parseFloat(Nuc[dataMode]); }
            if(DataMax<parseFloat(Nuc[dataMode])) { DataMax=parseFloat(Nuc[dataMode]); }
        }
        // Extend by 0.1% then round
        DataMin=(DataMin*0.999).toPrecision(5);
        DataMax=(DataMax*1.001).toPrecision(5);
        property.dataMin=DataMin;
        property.dataMax=DataMax;
        property.userDataMin=DataMin;
        property.userDataMax=DataMax;
        document.getElementById("rangeMinValue").value=property.userDataMin;
        document.getElementById("rangeMaxValue").value=property.userDataMax;
	
	// Finish up
	data.setVisible();
	colour.setAllColours();
    }
        
    setGUI() {
        this.debug("FUNCTION GUI.setGUI");
        let property=this.getCurrentProperty();
        let dataMode=this.getDataMode();
        let code=property["code"];
    
        let DataMin=property.userDataMin;
        let DataMax=property.userDataMax;
        
        // GUI for min/max
        if(property["isNumeric"]==false) {
            document.getElementById("checkPlotLogarithmic").disabled=true;
            document.getElementById("rangeColourRange").disabled=true;
            //document.getElementById("rangeColourSaturation").disabled=true;
            //document.getElementById("rangeColourLightness").disabled=true;
            //document.getElementById("rangeColourHueOffset").disabled=true;
            document.getElementById("rangeMinValue").disabled=true;
            document.getElementById("rangeMaxValue").disabled=true;
            document.getElementById("selectColourMode").disabled=true;
            document.getElementById("selectColourMode").value="varyHue";
        }
        else {
            document.getElementById("checkPlotLogarithmic").disabled=false;
            document.getElementById("rangeColourRange").disabled=false;
            document.getElementById("rangeColourSaturation").disabled=false;
            document.getElementById("rangeColourLightness").disabled=false;
            document.getElementById("rangeColourHueOffset").disabled=false;
            document.getElementById("selectColourMode").disabled=false;
            document.getElementById("rangeMinValue").disabled=false;
            document.getElementById("rangeMaxValue").disabled=false;
            document.getElementById("rangeMinValue").min=DataMin*0.9;	
            document.getElementById("rangeMinValue").max=DataMax*1.1;	
            document.getElementById("rangeMinValue").value=DataMin;
            document.getElementById("rangeMinValue").step=(DataMax-DataMin)/100;
            document.getElementById("rangeMaxValue").min=DataMin*0.9;	
            document.getElementById("rangeMaxValue").max=DataMax*1.1;	
            document.getElementById("rangeMaxValue").value=DataMax;
            document.getElementById("rangeMaxValue").step=(DataMax-DataMin)/100;
        }
	
        // Renable for dm
        if(property["code"]=="dm") {
            document.getElementById("checkFlipBetaHue").disabled=false;
            document.getElementById("rangeColourSaturation").disabled=false;
            document.getElementById("rangeColourLightness").disabled=false;
            document.getElementById("rangeColourHueOffset").disabled=false;
            document.getElementById("rangeColourLightness").value=0.7;
            document.getElementById("rangeColourSaturation").value=1.0;
            document.getElementById("rangeColourHueOffset").value=0;
        }
	else {
            document.getElementById("checkFlipBetaHue").disabled=true;
	}
        
        // GUI for mode
        if(property["isNumeric"]==false) {
            document.getElementById("radioValue").checked="checked";
            document.getElementById("radioMinusValue").disabled=true;
            document.getElementById("radioError").disabled=true;
            document.getElementById("radioGradientSingle").disabled=true;
            document.getElementById("radioGradientDouble").disabled=true;
        }
        else {
            document.getElementById("radioValue").checked="checked";
            document.getElementById("radioMinusValue").disabled=false;
            document.getElementById("radioValue").disabled=false;
            document.getElementById("radioError").disabled=false;
            document.getElementById("radioGradientSingle").disabled=false;
            document.getElementById("radioGradientDouble").disabled=false;
        }
    
        // GUI for error mode
        if(property["hasError"]==false) {
            document.getElementById("radioError").checked=false;
            document.getElementById("radioError").disabled=true;
        }
        else {
            document.getElementById("radioError").disabled=false;
        }
    
        // Specify the units where we can easily
        if(dataMode=="x"||dataMode=="dx") {
            document.getElementById("MinUnit").innerHTML = " "+property["unit"];
            document.getElementById("MaxUnit").innerHTML = " "+property["unit"]; 
        }
        else {
            document.getElementById("MinUnit").innerHTML = "";
            document.getElementById("MaxUnit").innerHTML = ""; 
        }
    
        // Set the descriptive text
        for(var i=0; i<data.sources.length; i++) {
    	    if(data.sources[i]["code"]==property["srcid"]) {
                document.getElementById("propertyLongname").innerHTML=property["longname"];
                document.getElementById("sourceLongname").innerHTML=data.sources[i]["longname"];
                document.getElementById("sourceReference").innerHTML="<a href='"+data.sources[i]["url"]+"' target='_blank'>"+data.sources[i]["ref"]+"</a>";
    	    }
        }
        
        // Set default log plotting
        if(property["srcid"]!="jeff") {
            if(property["isNumeric"]==true&&property["isLog"]==true) {
    	        document.getElementById("checkPlotLogarithmic").checked=true;
    	    }
            else {
    	        document.getElementById("checkPlotLogarithmic").checked=false;
    	    }
        }
        // Set even-even plotting
        if(property["isEvenEven"]) {
	    document.getElementById("checkEvenEven").checked=true;
        }
        else {
    	    document.getElementById("checkEvenEven").checked=false;
        }
	return 0;
    }
    
    createChart() {
	this.showLoading("Preparing chart...");
	// Attempt to get information from the present chart
	if(chart!=="undefined") {
            let size=1;
	    // chart.destroy();
	}
	// Engine
	gtag("event","createChart",{ "engine" : $("#selectEngine").val() });
	// Create the new engine
	$(".is2D").each( function(){ $(this).hide(); });
	$(".isCanvas").each( function(){ $(this).hide(); });
	$(".is3D").each( function(){ $(this).hide(); });
	$(".isSVG").each( function(){ $(this).hide(); });
	if($("#selectEngine").val()=="canvas") {
	    this.debug("FUNCTION GUI.creatChart Canvas");
            chart = new ChartCanvas();
	    $(".is2D").each( function(){ $(this).show(); });
	    $(".isCanvas").each( function(){ $(this).show(); });
	}
	else if($("#selectEngine").val()=="svg") {
	    this.debug("FUNCTION GUI.creatChart SVG");
            chart = new ChartSVG();
	    $(".is2D").each( function(){ $(this).show(); });
	    $(".isSVG").each( function(){ $(this).show(); });
	}
	else if($("#selectEngine").val()=="threejs") {
	    this.debug("FUNCTION GUI.creatChart Threejs");
            chart = new ChartThreejs();
	    $(".is3D").each( function(){ $(this).show(); });
        }
	// Now do the hardwork with request animation frame to ensure loading is displayed.
        requestAnimationFrame(() => requestAnimationFrame(function(){
	        gui.updateStyles();	  
	        chart.build();
	        chart.update();
	        chart.key.update();
                chart.draw();
	        gui.hideLoading(); 
            })
         );
	
    }

    changeData() {

	gtag("event","changeData",{ "code" : this.getCurrentProperty()['code'] });
	this.showLoading("Changing data...");
        requestAnimationFrame(() => requestAnimationFrame(function(){
	    let promise = new Promise((resolve,reject) => {
	        resolve();
	    })
	    .then(() => gui.setGUI())
            .then(() => data.processData())
            .then(() => data.setVisible())
            .then(() => gui.resetMinMaxValue())
	    .then(() => colour.setAllColours())
            .then(() => chart.build())	
	    .then(() => chart.update())
	    .then(() => chart.draw())
	    .then(() => gui.saveGUICookies())
	    .then(() => gui.hideLoading());
	    return promise;
            })
        );

    }

    changeDataMode() {
        this.debug("FUNCTION GUI.changeDataMode");
	let promise = new Promise((resolve,reject) => {
	    resolve();
	})
        .then(() => gui.resetMinMaxValue())
	.then(() => colour.setAllColours())
        .then(() => data.setVisible())
	.then(() => chart.update())
	.then(() => chart.draw())
	.then(() => gui.saveGUICookies());
    }
    
    changeDataOption() {
        this.debug("FUNCTION GUI.changeDataOption");
	let promise = new Promise((resolve,reject) => {
	    resolve();
	})
        .then(() => data.setVisible())
	.then(() => chart.update())
	.then(() => chart.draw())
	.then(() => gui.saveGUICookies());
    }
    
    // This is where we load things needed from cookies to set the gui
    loadCookies() {
	if(this.isCookie("datamode")) {
            $("input[name='DataMode']").val([gui.getCookie("datamode")]);
	}
    }

    changeColourMode() {
	if(document.getElementById("selectColourMode").value=="varyHue") {
            document.getElementById("rangeColourLightness").disabled=false;
	}
	else if(document.getElementById("selectColourMode").value=="varyLightness") {
            document.getElementById("rangeColourLightness").disabled=true;
	}
    }

    debug(message) {
        if(DEBUG) { console.log(message); }
    }
    
    setGUIFirstTime() {
	this.debug("FUNCTION GUI.setGUIFirstTime");

	// Set from cookie
	for(let i=0; i<this.cooks.length; i++) {
	    if(this.isCookie(this.cooks[i].name)) {
		let x=this.getCookie(this.cooks[i].name);
		if(this.cooks[i].type=="prop") {
                    $(this.cooks[i].selector).prop(this.cooks[i].property,x);
		}
                else if(this.cooks[i].type=="radio") {
                    $(this.cooks[i].selector).val([x]);
		}
	    }
	}

	// Handle mobile devices
        if(this.isMobile()) {
	    // Constrain the engine options
            $("#selectEngine").children().each( function() {
                if($(this).prop("value")=="canvas") {
		    $(this).attr("selected",true);
		}
		else {
                    $(this).attr("disabled",true);
		    $(this).hide();
		}
	    });
	    // If the keysize is not set by a cookie, make it smaller
	    if(!this.isCookie("keysize")) {
                $("#rangeKeySize").prop("value",0.5)
	    }
        }

	if(this.isCookie("cookiewarning")) {
            $("#cookiewarning").css("display",this.getCookie("cookiewarning"));
	}

	if(this.isCookie("newmessage")) {
            $("#newmessage").css("display",this.getCookie("newmessage"));
	}

	
        return;
    }

    isMobile() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	    return true;
	}
	return false;
    }

    saveGUICookies() {
	for(let i=0; i<this.cooks.length; i++) {
	    if(this.cooks[i].type=="prop") {
                this.addCookie(this.cooks[i].name,$(this.cooks[i].selector).prop(this.cooks[i].property));
	    }
	    else if(this.cooks[i].type=="radio") {
                this.addCookie(this.cooks[i].name,$(this.cooks[i].selector+":checked").val());
	    }
	}
	this.updateShareURL();
    }

    // Philosophy around cookies is a bit different.  Objects (GUI,
    // Chart) are responsible for managing their own cookies. They get
    // them as needed using the below. Objects may need saveCookie
    // methods. The GUI should have a loadCookie method. The Chart
    // will probably loadCookies in build routines. Saving will
    // probably need to be done regularly.
    
    clearCookie() {
	//this.debug("FUNCTION GUI.clearCookie");
        let c=document.cookie.split(";");
        for(let i=0; i<c.length; i++) {
            this.removeCookie(c[i].split("=")[0].trim());
	}
	//return false;
    }
    
    addCookie(name,value,expires="") {
	//gui.debug("FUNCTION gui.addCookie "+name+value);
	//if(expires!="") { expires=expires+";"; }
	if(typeof value === 'number') {
            document.cookie=name+"="+value.toString()+";"+expires+";path=/";
	}
	else {
            document.cookie=name+"="+value+";"+expires+";path=/";
	}
        this.updateShareURL();
    }

    removeCookie(name) {
	let expiration="expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        let c=document.cookie.split(";");
	for(let i=0; i<c.length; i++) {
	    if(name==c[i].split("=")[0].trim()) {
		document.cookie=c[i]+";"+expiration;
		return;
	    }
	}
    }

    getCookie(name) {
        let c=document.cookie.split(";");
	let result="";
	for(let i=0; i<c.length; i++) {
            if(name==c[i].split("=")[0].trim()) { result=c[i].split("=")[1]; }
	}
	// Return logical values if we can
	if(result=="true")  { result=true; }
	if(result=="false") { result=false; }
	return result;
    }

    isCookie(name) {
        let c=document.cookie.split(";");
	for(let i=0; i<c.length; i++) {
            if(name==c[i].split("=")[0].trim()) { return true; }
	}
	return false;
    }

    getShareURL() {
	//        return document.cookie.replace(";","&");
	let url=window.location.href.split("?")[0]+"?";
	let params=document.cookie.split("; ");
	for(let i=0; i<params.length; i++) {
	    if(params[i].search("_")==-1&&params[i].search("ELOQUA")==-1&&params[i].search("anuSearch")==-1) {
                url+=params[i];
                if(i<params.length-1) { url+="&"; }
	    }
	}
	return url;
    }

    parseURL() {
	gui.debug("FUNCTION gui.parseURL");
	if(window.location.href.search("chart3d")!=-1) {
            this.addCookie("engine","threejs");
	}
	try {
            let items=window.location.href.split("?")[1].split("&");
	    console.log(items);
    	    for(let i=0; i<items.length; i++) {
		if(!items[i]=="") {
                    this.addCookie(items[i].split("=")[0],items[i].split("=")[1]);
		}
            }
	}
	catch(e) {
            ;
	}
	// Use this place to set defaults relating to the GUI
      	if(!this.isCookie("source")&&!this.isCookie("property")) {
            this.addCookie("source","all");
	    this.addCookie("property","dm");
	}
    }

    updateShareURL() {
        document.getElementById("shareurl").href=this.getShareURL();
    }

    // This creates an object URL with CSS styles inlined.
    prepareSVGHTML(node) {
	this.debug("FUNCTION GUI.prepareSVGHTML");
	// We need to inline styles.
	let svgCopy=node.cloneNode(true);
	svgCopy.style.zIndex="-1";
	document.body.appendChild(svgCopy);
	// Get rid of anything that is not displayed
	let children=$(svgCopy).find("*");
	for(let i=0; i<children.length; i++) {
            if(children[i].style.display=="none") {
                children[i].remove();
	    }
            if(i==0) { console.log(i+"  "+children[i]); }
	}
	// Embed css values
	let selectors=[".nuclide_text_element",".nuclide_text_symbol",".nuclide_text_value",".nuclide_text_mass"];
	for(let j=0; j<selectors.length; j++) {
	    $(svgCopy).find(selectors[j]).each( function() {
	        let style=window.getComputedStyle($(this).get()[0]);
	        let props=["font-family","font-size","font-variant","font-style","font-weight","display"];
	        for(let i=0; i<props.length; i++) {
	    	if(style[props[i]]=="") { continue; }
                    $(this).get()[0].setAttribute(props[i],style[props[i]]);
                }
	    });
	}
	// Ready the export
	let html=svgCopy.outerHTML;
	document.body.removeChild(svgCopy);
	return html;
    }

    // Sets the cookie warning done (expires in six months?)
    cookieWarning() {
        $("#cookiewarning").hide();
	let expires=(new Date(Date.now()+86400*60*1e3)).toUTCString();
	this.addCookie("cookiewarning","none",expires);
    }

    // Sets the cookie warning done (expires in six months?)
    newMessage() {
        $("#newmessage").hide();
	let expires=(new Date(Date.now()+86400*6000*1e3)).toUTCString();
	this.addCookie("newmessage","none",expires);
    }

    
    showNuclide(z,n) {
	// Work the gui
	if($("#accordion-wrapper").is(":hidden")) {
            $("#imageMenu").click();
	}
	if($("#nuclideInfo").is(":hidden")) {
            $("#nuclideInfoTab").click();
	}
	// Get the info
	let wrapper=document.getElementById("nuclideInfo");
	let nuclide=data.getNuclide(z,n);
	gtag("event","showNuclide",{ "z" : z, "n" : n, "nuclide" : nuclide.sym.sym+"-"+(z+n).toString()});

	let xhtml="";
	xhtml+="<h4>"+nuclide.sym.lname+"-"+nuclide.a+" (Z="+nuclide.z+", N="+nuclide.n+")</h4>";
	if(!isNaN(nuclide.year.x)) {
            xhtml+="Discovered "+parseInt(nuclide.year.x).toString();
	    xhtml+="&nbsp;&nbsp;<a href='"+nuclide.year.source.url+"'>["+nuclide.year.source.index+"]</a><br/>";
	}

	/* Natural abundance */
        if(nuclide.abu.x!=0&&!isNaN(nuclide.abu.x)) {
             xhtml += "Natural abundance " + nuclide.abu.x + "%";
	     xhtml+="&nbsp;&nbsp;<a href='"+nuclide.abu.source.url+"'>["+nuclide.abu.source.index+"]</a><br/>";
        }
	/*
        else {
             xhtml += "Does not naturally occur " + "<br/>";
        }
        */
                
         /* Half life */
        if(!nuclide.hl.est&&!isNaN(nuclide.hl.x)) {
             let factor=RebaseHalfLifeFactor(nuclide.hl.x);
             let hl=nuclide.hl.x/factor;
             let hld=nuclide.hl.dx/factor;
             hl=TwoZeroTruncate(hl);
             hld=TwoZeroTruncate(hld);
             if(nuclide.hl.est==1||nuclide.hl.dx==""||nuclide.hl.dx==0)
             {
                 xhtml += "t<sub>1/2</sub> = " + hl + " " + RebaseHalfLifeFactorUnit(factor) + " #";
                 Estimated=true;
             }
             else
             {
                 xhtml += "t<sub>1/2</sub> = " + hl + "&#177;" + hld + " " + RebaseHalfLifeFactorUnit(factor);
             }	    
             xhtml+="&nbsp;&nbsp;<a href='"+nuclide.hl.source.url+"'>["+nuclide.hl.source.index+"]</a><br/>";
         }
         else if (nuclide.dm.length==1&&nuclide.hl.x!="") {
             xhtml += "Stable " + "<br/>";
         }

         /* Ground state spin */
        if(nuclide.spin!=0) {
             xhtml += "J<sup>&#960;</sup> = ";
             if(nuclide.spin.tentative==1) { xhtml += "("; }
             xhtml += FormatAsHalfInteger(nuclide.spin.x);
             if(nuclide.spin.tentative==1) { xhtml += ")"; }
             if(nuclide.pi.ext!=0) {
                 xhtml += "<sup>";
                 if(nuclide.pi.tentative) { xhtml += "("; }
                 if(nuclide.pi.x==1) { xhtml += "+"; }
                 if(nuclide.pi.x==-1) { xhtml += "-"; }
                 if(nuclide.pi.tenative) { xhtml += ")"; }
                 xhtml += "</sup>";
             }
      	    if(nuclide.spin.est==1) { xhtml += "<sup>*</sup>"; }
	     xhtml+="&nbsp;&nbsp;<a href='"+nuclide.spin.source.url+"'>["+nuclide.spin.source.index+"]</a><br/>";
        }

        /* Decay modes */
	if(nuclide.dm.x.length>0) {
	    if(nuclide.dm.x[0]['mode']!="IS"||nuclide.dm.x.length>1) {
                xhtml+="<h5>Decay modes</h5>";
	    }
	}
        for(var i=0; i<nuclide.dm.x.length; i++)
        {
            if(nuclide.dm.x[i]['mode']=="IS") { continue; }
	    
             //if(dm[i]['op']=="?"||dm[i]['x']==0.0)
             //{
             //    xhtml += GetFormattedDecayMode(dm[i]['mode']) + " " + "=" + " ?" + "<br/>";
             //}
             if(nuclide.dm.x[i]['op']=="<")
             {
                 xhtml += GetFormattedDecayMode(nuclide.dm.x[i]['mode']) + " " + "&#60;" + " " + (nuclide.dm.x[i]['x']*1.0).toPrecision(3) + "%";
             }
             else if(nuclide.dm.x[i]['op']==">")
             {
                 xhtml += GetFormattedDecayMode(nuclide.dm.x[i]['mode']) + " " + "&#62;" + " " + (nuclide.dm.x[i]['x']*1.0).toPrecision(3) + "%";
             }
             else if(nuclide.dm.x[i]['op'].length>1)
             {
                 xhtml += GetFormattedDecayMode(nuclide.dm.x[i]['mode']) + " " + nuclide.dm.x[i]['op'];
             }
             else
             {
                 xhtml += GetFormattedDecayMode(nuclide.dm.x[i]['mode']) + " " + nuclide.dm.x[i]['op'] + " " + (nuclide.dm.x[i]['x']*1.0).toPrecision(3) + "%";
             }
	     xhtml+="&nbsp;&nbsp;<a href='"+nuclide.dm.source.url+"'>["+nuclide.dm.source.index+"]</a><br/>";
        
         }
	       
	xhtml+="<h5>Mass properties</h5>";
	xhtml+="<div class='grid_wrapper_eight'>";
	let skips=["a","n","z","sym","dm","hl","year","spin","abu","pi"];
	keyloop:
            for(let key in nuclide) {
	        for(let j=0; j<skips.length; j++) {
	    	    if(key==skips[j]) { continue keyloop; }
	        }
	        if(nuclide[key].source.code=="jeff") { continue; }
	        if(nuclide[key].source.code=="frldm") { continue; }
	        if(isNaN(nuclide[key].x)) { continue; }

		let property=nuclide[key].property;
                xhtml+="<span>"+property.shortname+"</span>";
                xhtml+="<span>=</span>";
                xhtml+="<span>"+maxPrecision(nuclide[key].x,6)+"</span>";
	        if(property.hasError=="1") {
                    xhtml+="<span>&#177;</span>";
                    xhtml+="<span>"+maxPrecision(nuclide[key].dx,6)+"</span>";
	        }
	        if(property.hasUnit=="1") {
                    xhtml+="<span>"+property.unit+"</span>";
	        }
	        else {
                    xhtml+="<span>&nbsp;</span>";
	        }
	        if(nuclide[key].est=="1") {
                    xhtml+="<span><sup>*</sup></span>";
	        }
	        else {
                    xhtml+="<span>&nbsp;</span>";
	        }
	        xhtml+="<a href='"+nuclide[key].source.url+"'>["+nuclide[key].source.index+"]</a>";
	    }
	xhtml+="</div>";
	
	xhtml+="<sup>*</sup>=Estimated";

	/* References */
        xhtml += "<h5>References</h5>";
	xhtml += "<p>When using data, please always refer to the relevant sources.</p>";
	for(let i=0; i<data.sources.length; i++) {
            xhtml+="<a href='"+data.sources[i].url+"'>["+parseInt(i+1)+"]</a>"
	    xhtml+="&nbsp;"+data.sources[i].longname+"<br/>";

	}
	

	
        /* Hyperlinks for the nuclide */
        xhtml += "<h5>Further Links</h5>";
//ht    /www.nndc.bnl.gov/chart/decaysearchdirect.jsp?nuc=99ZR&unc=nds
        		
        xhtml += "<a href='http://www.nndc.bnl.gov/nudat3/getdataset.jsp?nucleus="+nuclide.a+rtrim(nuclide.sym.sym)+"&amp;unc=nds' target='_blank'>NNDC Brookhaven Adopted Levels</a><br/>";
        xhtml += "<a href='http://www.nndc.bnl.gov/nudat3/decaysearchdirect.jsp?nuc="+nuclide.a+rtrim(nuclide.sym.sym)+"&amp;unc=nds' target='_blank'>NNDC Brookhaven Decay Radiation</a><br/>";
        //xhtml += "<a href='http://ie.lbl.gov/toi2003/Mass.asp?sql=&amp;A1="+nuclide.a+"&amp;A2="+nuclide.a+"&amp;Zmin="+nuclide.z+"&amp;Zmax="+nuclide.z+"&amp;sortby1=A&amp;sortby2=Z&amp;sortby3=N' target='_blank'>Berkeley Lab Table of Atomic Masses</a><br/>";
        xhtml += "<a href='http://cdfe.sinp.msu.ru/cgi-bin/muh/radcard.cgi?z="+nuclide.z+"&amp;a="+nuclide.a+"&amp;td=123456' target='_blank'>CDFE nucleus size and shape</a><br/>";
        if(nuclide.a<20)
        {
            var alabel=nuclide.a;
            if(alabel<10)
            {
                alabel="0"+alabel;
            }
            xhtml += "<a href='http://nucldata.tunl.duke.edu/HTML/A="+nuclide.a+"/"+alabel+rtrim(nuclide.sym.sym)+"_main.shtml' target='_blank'>TUNL NDP Summary</a>";
        }
	
	wrapper.innerHTML=xhtml;
	
        return;
	
        if(xhtml=="") {
        	
            let Nuc=Nuclide[code][0][index];
        	document.getElementById("nuclideBox").innerHTML =  "<sup>"+Nuc.a+"</sup>"+sym[Nuc.z].sym;
        	document.getElementById("nuclideBox").style.backgroundColor = Nuclide[property["code"]][0][index].colour;
        	document.getElementById("nuclideBox").style.color = Nuclide[property["code"]][0][index].textcolour;
        	document.getElementById("nuclideBox").onclick=function(){logCurrentNuclide();};
        	
            xhtml = sym[Nuc.z].lname +"-"+Nuc.a+" (Z="+Nuc.z+", N="+Nuc.n+")<br/>";
        
            /* Discovery year */
            if(nuclide["year.ext"]==1) {
                xhtml += "Discovered in " + nuclide["year.x"] + "<br/>";
            }
        
            /* Title */
            xhtml += "<h3>Ground state properties</h3>";
        
        
        
            /* Loop for nuclear mass properties */
            xhtml += "<h3>Mass and related properties</h3>";
            var p=["m","mex","bpn","sp","s2p","sn","s2n","qa","eb","qbn","q2b","q4b"];
            var pindex = Array();
            /* Generate an index lookup */
            for (var i=0; i<p.length; i++)
            {
                for (var j=0; j<properties.length; j++)
                {
                    if(p[i] == properties[j]["code"]) { pindex[i]=j; break; }
                }
            }       
        
            /* Now write the properties */
            var Estimated=false;
            xhtml += "<table>";
            for (var i=0; i<p.length; i++)
            {
                if(NuclideData[0][p[i]+".ext"]!=0&&NuclideData[0][p[i]+".x"]!="")
                {
                    xhtml += "<tr>";
                    xhtml += "<td>" + properties[pindex[i]]["shortname"] + "</td>";
                    xhtml += "<td>" + "=" + "</td>";
                    xhtml += "<td>" + NuclideData[0][p[i]+".x"] + "</td>";
                    xhtml += "<td>" + "&#177;" + "</td>";
                    xhtml += "<td>" + NuclideData[0][p[i]+".dx"] + "</td>";
                    xhtml += "<td>" + ParseForSpecialCharacters(properties[pindex[i]]["unit"]) + "</td>";
                    if(NuclideData[0][p[i]+".est"]==1)
                    {
                        xhtml += "<td>" + "#" + "</td>";
                        Estimated=true;
                    }
                    else
                    {
                        xhtml += "<td>" + "" + "</td>";
                    }
                    xhtml += "</tr>";
                }
            }
            xhtml += "</table>";
            if(Estimated)
            {
                xhtml += "<p># Estimated</p>";
            }
        
            /* References */
        	xhtml += "<h3>Links</h3>";
        	xhtml += "<p>The above data are taken from:</p>"
            xhtml += "<p>NUBASE2020</br><a href='https://doi.org/10.1088/1674-1137/abddae' target='_blank'> Chinese Physics C45, 030001 (2021)</a></p>";
            xhtml += "<p>AME2020<br/> <a href='https://doi.org/10.1088/1674-1137/abddb0' target='_blank'>Chinese Physics C45, 030002 (2021)</a><p/>";
        
        	

        }
        
        document.getElementById("infoNuclide").innerHTML = xhtml;
        setTimeout(stopLinkBubble,200);
        $("#infoNuclide").show();

    }

}

function maxPrecision(x,n) {
    if(x.toString().length<x.toPrecision(n).length) { return x.toString(); }
    return x.toPrecision(n);
}
