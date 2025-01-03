const USE_GA=true;
//export { USE_GA };

/* Limits on N and Z */
const Z_MIN=0;
const Z_MAX=130;
const N_MIN=0;
const N_MAX=200;
//export { Z_MIN, Z_MAX, N_MIN, N_MAX }

/* Data table */
/*
var stable;
var sym;
var sources;
var properties;
export { stable, sym, sources, properties }
*/

/* This is a work around to expose things globally as we transition to
 * using modules. Once modules are properly implemented, these can be
 * deleted. */

//window.DEBUG=DEBUG;
//window.USE_GA=USE_GA;
//
//window.Z_MIN=Z_MIN;
//window.Z_MAX=Z_MAX;
//window.N_MIN=N_MIN;
//window.N_MAX=N_MAX;

/*
window.stable=stable;
window.sym=sym;
window.sources=sources;
window.properties=properties;
*/


/* Data structure:

This SHOULD be:

table[code][t][i]

Where i is an indexed list with:

a,z,n,x.logx,dx,xdshor etc...

*/

class Data {

    constructor() {
        this.stable;
        this.sym;
        this.sources;
        this.properties;
	this.table={};
    }

    init() {
	gui.setLoadingMessage("Fetching data...");
        let result=Promise.all([
            fetch("php/getProperties.php"),
        	fetch("php/getSources.php"),
        	fetch("php/getStable.php"),
        	fetch("php/getSymbols.php")
        ]).then(function (responses) {
        	// Get a JSON object from each of the responses
        	return Promise.all(responses.map(function (response) {
        		return response.json();
        	}))
        }).then((data) => this.extractData(data))
	  .then(() => this.getAllTableData())
	  .then((data) => this.extractAllTableData(data))
          .catch(function (error) {
            // if there's an error, log it
            console.log(error);
        });
	return result;
    }

    // For extracting the information tables
    extractData(data) {
	gui.debug("FUNCTION Data.extractData");
	/* Extract the properties and then fix bools right at the start */
    	this.properties=data[0];
	for(let j=0; j<this.properties.length; j++) {
            let bools=["hasUnit","hasError","isEvenEven","isNumeric","isLog","isPlot"];
            for(let i=0; i<bools.length; i++) {
                this.properties[j][bools[i]] = parseBool(this.properties[j][bools[i]]);
            }
	}
    	this.sources=data[1];
    	this.stable=data[2];
    	this.sym=data[3];
	for(let z=this.sym.length; z<Z_MAX; z++) {
            this.sym.push({ z: z.toString(), sym:z.toString(), lname:z.toString() });
	}
    	for(let i=0; i<this.properties.length; i++) {
    	    this.properties[i].processed=false;        
    	}
    }

    // For getting the nuclide information
    getTableData()
    {
	gui.debug("FUNCTION Data.getTableData");
        let promises=[];
        for(let i=0; i<this.properties.length; i++) {
            promises.push(fetch("php/GetDataNew.php?"+"property="+this.properties[i]["code"]));
        }
        return Promise.all(promises
        ).then(function (responses) {
        	// Get a JSON object from each of the responses
        	return Promise.all(responses.map(function (response) {
        		return response.json();
        	}));
    	}).catch(function (error) {
            console.log(error);
        });	      
    }
    
    // This does a first pass - it does not calculate differences, so
    // we can't rely on them being available. processData gets called
    // again when the data is switched, and the differences are
    // calculated then. However, we can use the data to look up the
    // core properties (x and dx).
    processAllData() {
	gui.setLoadingMessage("Processing data...");
	// Process lots of things, skipping commonly unused
        for(let i=0; i<this.properties.length; i++) {
	    if(this.properties[i].srcid=="flrdm") { continue; }
	    if(this.properties[i].srcid=="jeff") { continue; }
	    this.processData(this.properties[i],true);
	}
	// Make sure we do the one stored in the cookie
	if(gui.isCookie("property")) {
	    this.processData();
	}
    }
    
    // For extracting nuclide information
    async extractTableData(data) {
	console.log(data);
    	// Sort out the data. Processing it here gets a bit slow.
        for(let i=0; i<this.properties.length; i++) {
            let code=this.properties[i]["code"];
            if(this.table[code]===undefined) {
                this.table[code]={};
            }
            this.table[code][0]=data[i];
    	}
    }

    
    // For getting the nuclide informationv
    getAllTableData()
    {
	gui.debug("FUNCTION Data.getAllTableData");
        let promises=[];
//        promises.push(fetch("php/GetDataAll.php"));
	//promises.push(fetch("cached_data/data_2023-09-29.json"));
        promises.push(fetch("php/EchoData.php"));
        return Promise.all(promises
        ).then(function (responses) {
        	// Get a JSON object from each of the responses
            return Promise.all(responses.map(function (response) {
		console.log(response);
	                return response.json();
        	}));
    	}).catch(function (error) {
            console.log(error);
        });	      
    }

    async extractAllTableData(data) {
	data=data[0];
	for(let i=0; i<data.length; i++) {
            let code=data[i][0].code;
            if(this.table[code]===undefined) {
                this.table[code]={};
            }
	    this.table[code][0]=data[i];
            
	}
    }

    /* Sets some properties for the data.  This also needs to properly
     * handle time series data.  This is all horribly wrong.  The php
     * should return a properly organised json object.  This will not be
     * exactly Nuclide, as we want not to overwrite data we've already
     * got.  So it will still have to be parsed.  But it probably ought to
     * have a different structure to isotope...? */
    processData(property=gui.getCurrentProperty(),skipDifferences=false) {

	gui.debug("FUNCTION data.processData "+property.longname);
	gui.setLoadingMessage("Processing "+property.longname+"...");
	
        let t=0;
        let code=property["code"];
	
        if(property.processed) { return; }
        else if(!skipDifferences||!property["isNumeric"]) { property.processed=true; }
    
        /* Reset the NZIndex */
        property.NZIndex={};
        if(!(property.NZIndex instanceof Array)) { property.NZIndex = new Array(); }
        else { property.NZIndex = new Array();  }
        
        for(let i=0;i<this.table[code][t].length;i++) {
            // Set the Nuclide neutron number
    	    let Nuc = this.table[code][t][i];
    	    Nuc.z=parseInt(Nuc.z);
    	    Nuc.n=parseInt(Nuc.n);
    	    Nuc.a=parseInt(Nuc.a);
	    Nuc.id="z"+Nuc.z.toString()+"n"+Nuc.n.toString();
	    Nuc.est=parseBool(Nuc.est);
            let z = Nuc.z;
            let n = Nuc.n;
    	
            // tabulate the ordering by z and n
            if(!(property.NZIndex[z] instanceof Array)) { property.NZIndex[z] = new Array(); }
            property.NZIndex[z][n] = i;
            for(let j=0;j<this.stable.length;++j) {
                if(this.stable[j].n==n && this.stable[j].z==z) {
                    Nuc.stable = true;
		    break;
                }
		else {
                    Nuc.stable = false;
		}
            }
            // Temporary colour to avoid warnings
            Nuc.colour=colour.undefinedColour;
            Nuc.textColour=colour.undefinedColour;
            Nuc.drawn = false;
            // For decay mode, parse json
            if(code=="dm") { Nuc["x"]=JSON.parse(Nuc["x"]); }
            else {
                Nuc["x"] = parseFloat(Nuc["x"]);
                Nuc["dx"] = parseFloat(Nuc["dx"]);
                Nuc["logx"]  = Math.log10(Nuc["x"]);
                Nuc["logdx"] = Math.log10(Nuc["dx"]);
            }
        }

	
        // Calculate all the derived values we might need
        if(property["isNumeric"]==true&&!skipDifferences) {
    	    let Base = this.table[code][t];
            for(let i=0;i<this.table[code][t].length;i++) {
                // Set the Nuclide neutron number
                let Nuc = this.table[code][t][i];
                let z = Nuc.z;
                let n = Nuc.n;
    	        if(Base[i]==undefined) { continue; }
                if(Base[i]["x"]==undefined) {
                    Nuc["minusx"]=undefined;
		    continue; }
		else {
                    Nuc["minusx"]=-Base[property.NZIndex[z][n]]["x"];
		}
    	        try {
                    Nuc["logminusx"]=Math.log(Nuc["minusx"]);
                } catch(e) { Nuc["logminusx"]=undefined; }
    	        try {
                    Nuc["dshor"]=(Base[property.NZIndex[z][n+1]]["x"]-Base[property.NZIndex[z][n-1]]["x"])/2.0;
                    Nuc["logdshor"]=Math.log(Nuc["dshor"]);
                } catch(e) { Nuc["dshor"]=undefined; Nuc["logdshor"]=undefined; }
          	try {
                    Nuc["dsver"]=(Base[property.NZIndex[z+1][n]]["x"]-Base[property.NZIndex[z-1][n]]["x"])/2.0;
                    Nuc["logdsver"]=Math.log(Nuc["dsver"]);
        	} catch(e) { Nuc["dsver"]=undefined; Nuc["logdsver"]=undefined; }
        	try {
                    Nuc["dsdia"]=(Base[property.NZIndex[z+1][n+1]]["x"]-Base[property.NZIndex[z-1][n-1]]["x"])/4.0;
                    Nuc["logdsdia"]=Math.log(Nuc["dsdia"]);
        	} catch(e){ Nuc["dsdia"]=undefined; Nuc["logdsdia"]=undefined; }
    	        if(n>2&&z>2) {
                    try {
                        Nuc["ddhor"]=(Base[property.NZIndex[z][n+2]]["x"]+Base[property.NZIndex[z][n-2]]["x"]-2*Base[property.NZIndex[z][n]]["x"])/4.0;
                        Nuc["logddhor"]=Math.log(Nuc["ddhor"]);
       	            } catch(e) { Nuc["ddhor"]=undefined; Nuc["logddhor"]=undefined; }
                    try {
                        Nuc["ddver"]=(Base[property.NZIndex[z+2][n]]["x"]+Base[property.NZIndex[z-2][n]]["x"]-2*Base[property.NZIndex[z][n]]["x"])/4.0;
                        Nuc["logddver"]=Math.log(Nuc["ddver"]);
    		    } catch(e) { Nuc["ddver"]=undefined; Nuc["logddver"]=undefined; }
                    try {
    		        Nuc["dddia"]=(Base[property.NZIndex[z+2][n+2]]["x"]+Base[property.NZIndex[z-2][n-2]]["x"]-2*Base[property.NZIndex[z][n]]["x"])/Math.sqrt(32.0);
                        Nuc["logdddia"]=Math.log(Nuc["dddia"]);
    		    } catch(e){ Nuc["dddia"]=undefined; Nuc["logdddia"]=undefined; }
	        }
      	    }
        }

	// Set all the value strings

	if(!skipDifferences||!property["isNumeric"]) {
            let dataModes=["x","minusx","dx","logx","logdx","dshor","logdshor","dsver","logdsver","dsdia","logdsdia","ddhor","logddhor","ddver","logddver","dddia","logdddia" ];
	    
            for(let i=0; i<this.table[code][t].length; ++i) {
            	let Nuc=this.table[code][t][i];
                if(property["isNumeric"]==false) {
                    let string="";
                    if(code=="dm") {
                        if(Nuc["x"][0]["mode"]=="IS"&&Nuc["x"].length>1) {
                            if(Nuc["x"][1]["op"]!="?") {
                                string = GreekDecayMode(Nuc["x"][1]["mode"]);
                            }
                            else {
                                string = GreekDecayMode(Nuc["x"][0]["mode"]);
                            }
                        }
                        else {
                            string = GreekDecayMode(Nuc["x"][0]["mode"]);
                        }
                    }
                    string=ParseForSpecialCharacters(string);
                    this.table[code][t][i]["string"+"x"]=string;
                }
                else {    
                    for(let k=0; k<dataModes.length; k++) {
            	        let string="";
    	    	        let dataMode=dataModes[k];
    	    	        let dataModeNoLog=dataMode.replace("log","");
    	    	        if(this.table[code][t][i][dataMode]===undefined) { string=""; }
                        else if ( (dataMode=="dx"||dataMode=="logdx") && property.hasError==true) { string = Nuc["dx"]; }
    	                else { string = Nuc[dataModeNoLog]; }
                        if(string===undefined||string==null||isNaN(string)) { string=""; }
                        if(code=="hl" && string!="") {
                            var factor=RebaseHalfLifeFactor(string);
                            var hl=string/factor;
                            hl=TwoZeroTruncate(hl);
                            string=ParseForSpecialCharacters(hl + " " + RebaseHalfLifeFactorUnit(factor));
                        }
                        else if(string!="") {
                            if(code!="year") { string=ValueToString(parseFloat(string)); }
                            if(property['hasUnit']==true) { string=string+" "+property["unit"];}
                            string=ParseForSpecialCharacters(string);
                        }
                        this.table[code][t][i]["string"+dataMode]=string;
    	    	    }
                }
            }
	}

	/* MinNZ and MaxNZ are now properties of the property. But they
         * may also vary (e.g., if we choose not to show estimated. So we
         * need a way to easily update. We could make them dependent on
         * the dataMode, but they would still need updating as plotting
         * options changed. The main advantage is to avoid more globals. */
        property.minN={};
        property.maxN={};
        property.minZ={};
        property.maxZ={};

    }

    /* Set which nulcides we can possible see. Only needs to be done at a data or mode change. */
    setVisible () {

        gui.debug("FUNCTION Data.setVisible");
	
	let property=gui.getCurrentProperty();
        let code=property["code"];
        let dataMode=gui.getDataMode();
        let t=0
        
        let Nuc=this.table[code][t];
    
        let NZRange=gui.getNZRanges();
        let Nmin=NZRange[0];
        let Nmax=NZRange[1];
        let Zmin=NZRange[2];
        let Zmax=NZRange[3];
        console.log(Nmin,Nmax,Zmin,Zmax);
        
        for(var i=0; i<Nuc.length; ++i) {
    	    Nuc[i].visible=true;
    	    if(property["isNumeric"]==1) {
    	        if(document.getElementById("radioHideUnknown").checked&&(isNaN(Nuc[i][dataMode])||Nuc[i][dataMode]===""))
	        {
                        Nuc[i].visible=false;
    	        }
    	        else if(document.getElementById("radioHideEstimated").checked&&(isNaN(Nuc[i][dataMode])||Nuc[i][dataMode]===""||Nuc[i].est==true)) {
                    Nuc[i].visible=false;
                }
    	    }
    	    else {
    	        if(document.getElementById("radioHideUnknown").checked&&(Nuc[i][dataMode]===""))
	        {
                    Nuc[i].visible=false;
    	        }
    	        else if(document.getElementById("radioHideEstimated").checked&&(Nuc[i][dataMode]===""||Nuc[i].est==true))
	        {
                    Nuc[i].visible=false;
                }
    	    }    
    	    if(document.getElementById("checkEvenEven").checked&&(Nuc[i].z%2==1||Nuc[i].n%2==1))
	    {
                Nuc[i].visible=false;
    	    }
    	    if(document.getElementById("checkStableOnly").checked&&Nuc[i].stable==false)
	    {
                Nuc[i].visible=false;
    	    }
    	    if(Nuc[i].z<Zmin||Nuc[i].z>Zmax||Nuc[i].n<Nmin||Nuc[i].n>Nmax) { Nuc[i].visible=false; }	
        }
        
        for(let Z=Z_MIN; Z<Z_MAX; Z++) {
            property.minN[Z]=N_MAX;
    	    property.maxN[Z]=N_MIN;
        }
        for(let N=N_MIN; N<N_MAX; N++) {
            property.minZ[N]=Z_MAX;
    	    property.maxZ[N]=Z_MIN;
        }
    
        // Redetermine min and max n,z
        for(let i=0;i<this.table[code][t].length;i++) {
    	    Nuc=this.table[code][t][i];
            if(!Nuc.visible) { continue; }
            if(property.minZ[Nuc.n]>Nuc.z) { property.minZ[Nuc.n]=Nuc.z; }
            if(property.maxZ[Nuc.n]<Nuc.z) { property.maxZ[Nuc.n]=Nuc.z; }
            if(property.minN[Nuc.z]>Nuc.n) { property.minN[Nuc.z]=Nuc.n; }
            if(property.maxN[Nuc.z]<Nuc.n) { property.maxN[Nuc.z]=Nuc.n; }
        }

	return true;
    }

    getNuclide(z,n) {
	let nuclide={};
	nuclide.a=z+n;
	nuclide.z=z;
	nuclide.n=n;
	nuclide.sym=this.sym[z];
        for(let i=0; i<this.properties.length; i++) {
	    if(this.properties[i].srcid=="frldm") { continue; }
	    if(this.properties[i].srcid=="jeff") { continue; }
	    if(this.properties[i].NZIndex[z][n]!=='undefined') {
	        let property=this.properties[i];
	        let code=property.code;
	        let index=this.properties[i].NZIndex[z][n];
                nuclide[code]=this.table[code][0][index];
		nuclide[code]["property"]=property;
		for(let k=0; k<this.sources.length; k++) {
	            if(this.sources[k].code==property.srcid) {
                        nuclide[code]["source"]=this.sources[k];
                        nuclide[code]["source"]["index"]=k+1;
		    }
		}
	    }
	}
	return nuclide;
    }

} // End of class





/*
function changeData() {

    console.log('change data');
    
    // This based solely on properties from database
    setGUIDataChange();
    
    changeDataOption();
    
    hideLoading();

}

function changeDataOption() {
    
    // Make sure the current data set is processed
    processData();
    
    // This determines from data
    resetMinMaxValue();
    
    // Set the min and max property values
    changeMinMaxValue();

    // Set those which are possibly visible
    setVisible();
    
    SetAllColours();

    SaveCookie();
}
*/
