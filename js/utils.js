/**************************************************************************************************/
// removes spaces from a string
function rtrim(str) {
        //    ^\s+|\s+$
        var txt = new String(str);
	return txt.replace(/ /g,"");
}

/**************************************************************************************************/
// provides rounding to the nearest integer
function roundNumber(num, dec) {
        var sign=1;//num/Math.abs(num);
        //num=Math.abs(num);
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return sign*result;
}


/* Pad an integer */
function intpad (x)
{   
    if(x<10) return "00"+x;
    if(x<100) return "0"+x;
    return x;
}


function RoundToString(x) {
    n = Math.floor(Math.log10(x));
    y = roundNumber(x/Math.pow(10,n),2);
    return y + "&#215;10";
}

var FullString="";
var TextBoxTimeout;

function GreekDecayMode(x) {
    x=x.replace("A","α");
    x=x.replace("B","β");
    x=x.replace("IS","Stable");
    x=x.replace("EC","e- capture");
    x=x.replace("SF","Fission");
    return x;
}

/* This should be generalised to work for the 3d version also. */
function AddCharacterToParse(event) {

    if(selectedTab!=-1) { return; }

    let property=getCurrentProperty();
    var code=property["code"];
    
    // Add letter
     if(event.key.length==1) {
	document.getElementById("SearchBox").style.display="block";
        var patt = RegExp("[a-zA-Z0-9]");
        if(patt.test(event.key)) { FullString+=event.key; }
     }
    // Go back
    else if(event.keyCode==8) {
        FullString=FullString.slice(0, -1);
    }
    // Parse the string
    else if(event.keyCode==13) {
	/* Determine values from the string */
	let symlc = new Array();
	for(var i=0; i<sym.length; i++) { symlc[i]=sym[i].sym.toLowerCase(); }
	let SymbolString="";
	let NumberString="";
	try {
	    SymbolString=FullString.match(/[a-zA-Z]+/g)[0];
	}
	catch(e) {;}
	try {
	    NumberString=FullString.match(/[0-9]+/g)[0];
	}
	catch(e) {;}

	/* Convert to N and Z */
	z=symlc.indexOf(SymbolString.toLowerCase());
	a=parseFloat(NumberString);
	console.log(FullString,a,z,property.NZIndex[z],property.NZIndex[z][a-z]);
        FullString="";
	if(property.NZIndex[z]!==undefined) {
            if(property.NZIndex[z][a-z]!==undefined) {
		console.log(a,z);
	        setcorner(z,a-z);
		drawChart();
		SetInfoPanel(z,a-z);
                $("#SearchBox").hide();
	    }
	}
    }
    
    document.getElementById("SearchBox").innerHTML=FullString+" [press enter]";

    try { clearTimeout(TextBoxTimeout); }
    catch(e) { ; }
    TextBoxTimeout=setTimeout("$('#SearchBox').fadeOut();",5000);
    SaveCookie();
}

function ValueToString(x) {
    var pow=Math.log10(Math.abs(x));
    pow=Math.floor(pow);
    if(Math.abs(pow<2)) { return roundNumber(x,2); }
    else { return roundNumber(x/Math.pow(10,pow),2)+"e"+pow; }
}

function ParseForSpecialCharacters(x) {
    if (typeof x === 'string' || x instanceof String) {
        x=x.replace("<sup>","").replace("</sup>","").replace("<sub>","").replace("</sub>","");
        x=x.replace("&#956;","\u03BC");
        x=x.replace("micro-","\u03BC");
    }
    return x;
}

function parseBool(x) {
    if(x==true) { return true; }
    if(x==false) { return false; }
    if(x=="true"||x=="1"||x==1)  { return true; }
    if(x=="false"||x=="0"||x==0) { return false; }
    return false;
}

function GetRGBTotal(x) {
    if(x=="black") { return 1; }
    try {
        y=x.replace("rgb(","").replace(")","").split(",");
        z=(parseFloat(y[0])+parseFloat(y[1])+parseFloat(y[2]))/(3*255);
        if(z<0.5) { return 1; }
	else { return 0; }
    }
    catch(e) {
	return 0;
    }
}


/**************************************************************************************************/
/* Credit: https://gist.github.com/davoclavo/4424731 */
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);
 
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
 
    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }
 
    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
}


var RangeZmin=-1,RangeZmax=-1,RangeNmin=-1,RangeNmax=-1;
function UpdateNuclideInRange() {
    RangeZmin=document.getElementById("inputZmin").value;
    RangeZmax=document.getElementById("inputZmax").value;
    RangeNmin=document.getElementById("inputNmin").value;
    RangeNmax=document.getElementById("inputNmax").value;
}


function CheckNuclideInRange(Z,N) {
    if(RangeZmin==-1&&RangeZmax==-1&&RangeNmin==-1&&RangeNmax==-1) { UpdateNuclideInRange(); }
    if(Z>=RangeZmin&&Z<=RangeZmax&&N>=RangeNmin&&N<=RangeNmax) { return true; }
    return false;
}
