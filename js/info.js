/*
    info.js
    Controls getting and filling of the info panel
*/


// ...
function ToggleNuclidePanel ()
{
    if(icurrent!=-1) {
        $("#panelNuclideWrapper").show();
        $("#panelNuclide").show();
    }
    else if(icurrent==-1) {
        $("#panelNuclideWrapper").hide();
        $("#panelNuclide").hide();
    }
}

function ShowNuclidePanel() {
        $("#panelNuclideWrapper").show();
        $("#panelNuclide").show();
}

// This needs fixing. It should be able to do everything without
// icurrent. The properties have been added to the php, so should be
// doable.
function SetInfoText (NuclideData) {
    console.log("[setInfoText] "+icurrent);

    let a=NuclideData[0]["a"];
    let z=NuclideData[0]["z"];
    
    let property=getCurrentProperty();
    let code=property["code"];
    let index=0;
    let xhtml=""; 
    try {
	index=property.NZIndex[z][a-z];
    }
    catch (e) {
        xhtml = "Double click on a nuclide for more information.";
    }
    
    if(xhtml=="") {
	
        let Nuc=Nuclide[code][0][index];
	document.getElementById("nuclideBox").innerHTML =  "<sup>"+Nuc.a+"</sup>"+sym[Nuc.z].sym;
	document.getElementById("nuclideBox").style.backgroundColor = Nuclide[property["code"]][0][index].colour;
	document.getElementById("nuclideBox").style.color = Nuclide[property["code"]][0][index].textcolour;
	document.getElementById("nuclideBox").onclick=function(){logCurrentNuclide();};
	
        xhtml = sym[Nuc.z].lname +"-"+Nuc.a+" (Z="+Nuc.z+", N="+Nuc.n+")<br/>";

        /* Discovery year */
        if(NuclideData[0]["year.ext"]==1) {
            xhtml += "Discovered in " + NuclideData[0]["year.x"] + "<br/>";
        }

        /* Title */
        xhtml += "<h3>Ground state properties</h3>";

        /* Ground state spin */
        if(NuclideData[0]["spin.ext"]!=0) {
            xhtml += "J<sup>&#960;</sup> = ";
            if(NuclideData[0]["spin.tentative"]==1) { xhtml += "("; }
            xhtml += FormatAsHalfInteger(NuclideData[0]["spin.x"]);
            if(NuclideData[0]["spin.tentative"]==1) { xhtml += ")"; }
            if(NuclideData[0]["pi.ext"]!=0) {
                xhtml += "<sup>";
                if(NuclideData[0]["pi.tentative"]==1) { xhtml += "("; }
                if(NuclideData[0]["pi.x"]==1) { xhtml += "+"; }
                if(NuclideData[0]["pi.x"]==-1) { xhtml += "-"; }
                if(NuclideData[0]["pi.tentative"]==1) { xhtml += ")"; }
                xhtml += "</sup>";
            }
	    if(NuclideData[0]["spin.est"]==1) { xhtml += "#"; }
            xhtml += "<br/>";
        }

        /* Natural abundance */
        if(NuclideData[0]["abu.x"]!=0) {
            xhtml += "Abundance " + NuclideData[0]["abu.x"] + "%" + "<br/>";
        }
        /*
        else {
            xhtml += "Does not naturally occur " + "<br/>";
        }
        */

        /* Half life */
        var dm=JSON.parse(NuclideData[0]["dm.x"]);
        if(NuclideData[0]["hl.ext"]!=0&&NuclideData[0]["hl.x"]!="") {
            var factor=RebaseHalfLifeFactor(NuclideData[0]["hl.x"]);
            var hl=NuclideData[0]["hl.x"]/factor;
            var hld=NuclideData[0]["hl.dx"]/factor;
            hl=TwoZeroTruncate(hl);
            hld=TwoZeroTruncate(hld);
            if(NuclideData[0]["hl.est"]==1||NuclideData[0]["hl.dx"]==""||NuclideData[0]["hl.dx"]==0)
            {
                xhtml += "t<sub>1/2</sub> = " + hl + " " + RebaseHalfLifeFactorUnit(factor) + " # <br/>";
                Estimated=true;
            }
            else
            {
                xhtml += "t<sub>1/2</sub> = " + hl + "&#177;" + hld + " " + RebaseHalfLifeFactorUnit(factor) + "<br/>";
            }
        }
        else if (dm.length==1&&NuclideData[0]["hl.x"]!="") {
            xhtml += "Stable " + "<br/>";
        }

        /* Decay modes */
        for(var i=0; i<dm.length; i++)
        {
            console.log(dm[i]);
            if(dm[i]['mode']=="IS") { continue; }
            console.log("OP" + dm[i]['op']);
            //if(dm[i]['op']=="?"||dm[i]['x']==0.0)
            //{
            //    xhtml += GetFormattedDecayMode(dm[i]['mode']) + " " + "=" + " ?" + "<br/>";
            //}
            if(dm[i]['op']=="<")
            {
                xhtml += GetFormattedDecayMode(dm[i]['mode']) + " " + "&#60;" + " " + (dm[i]['x']*1.0).toPrecision(3) + "%" + "<br/>";
            }
            else if(dm[i]['op']==">")
            {
                xhtml += GetFormattedDecayMode(dm[i]['mode']) + " " + "&#62;" + " " + (dm[i]['x']*1.0).toPrecision(3) + "%" + "<br/>";
            }
            else if(dm[i]['op'].length>1)
            {
                xhtml += GetFormattedDecayMode(dm[i]['mode']) + " " + dm[i]['op'] + "<br/>";
            }
            else
            {
                xhtml += GetFormattedDecayMode(dm[i]['mode']) + " " + dm[i]['op'] + " " + (dm[i]['x']*1.0).toPrecision(3) + "%" + "<br/>";
            }

        }        


        /* Loop for nuclear mass properties */
        xhtml += "<h3>Mass and related properties</h3>";
        var p=["m","mex","bpn","sp","s2p","sn","s2n","qa","eb","qbn","q2b","q4b"];
        var pindex = Array();
        /* Generate an index lookup */
        for (var i=0; i<p.length; i++)
        {
            for (var j=0; j<properties.length; j++)
            {
                //console.log(i+"  "+p[i]+"  "+properties[j]["code"]);
                if(p[i] == properties[j]["code"]) { pindex[i]=j; break; }
            }
        }       
 
        /* Now write the properties */
        var Estimated=false;
        xhtml += "<table>";
        for (var i=0; i<p.length; i++)
        {
            //console.log(i+"  "+pindex[i]);
            //console.log("HERE " + properties[pindex[i]]["shortname"]);
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
	xhtml += "<h3>References</h3>";
	xhtml += "<p>The above data are taken from:</p>"
        xhtml += "<p>NUBASE2020</br><a href='https://doi.org/10.1088/1674-1137/abddae' target='_blank'> Chinese Physics C45, 030001 (2021)</a></p>";
        xhtml += "<p>AME2020<br/> <a href='https://doi.org/10.1088/1674-1137/abddb0' target='_blank'>Chinese Physics C45, 030002 (2021)</a><p/>";

	
        /* Hyperlinks for the nuclide */
        xhtml += "<h3>Further Links</h3>";
//http://www.nndc.bnl.gov/chart/decaysearchdirect.jsp?nuc=99ZR&unc=nds
		
        xhtml += "<a href='http://www.nndc.bnl.gov/nudat2/getdataset.jsp?nucleus="+Nuc.a+rtrim(sym[Nuc.z].sym)+"&amp;unc=nds' target='_blank'>NNDC Brookhaven Adopted Levels</a><br/>";
        xhtml += "<a href='http://www.nndc.bnl.gov/nudat2/decaysearchdirect.jsp?nuc="+Nuc.a+rtrim(sym[Nuc.z].sym)+"&amp;unc=nds' target='_blank'>NNDC Brookhaven Decay Radiation</a><br/>";
        //xhtml += "<a href='http://ie.lbl.gov/toi2003/Mass.asp?sql=&amp;A1="+Nuc.a+"&amp;A2="+Nuc.a+"&amp;Zmin="+Nuc.z+"&amp;Zmax="+Nuc.z+"&amp;sortby1=A&amp;sortby2=Z&amp;sortby3=N' target='_blank'>Berkeley Lab Table of Atomic Masses</a><br/>";
        xhtml += "<a href='http://cdfe.sinp.msu.ru/cgi-bin/muh/radcard.cgi?z="+Nuc.z+"&amp;a="+Nuc.a+"&amp;td=123456' target='_blank'>CDFE nucleus size and shape</a><br/>";
        if(Nuc.a<20)
        {
            var alabel=Nuc.a;
            if(alabel<10)
            {
                alabel="0"+alabel;
            }
            xhtml += "<a href='http://nucldata.tunl.duke.edu/HTML/A="+Nuc.a+"/"+alabel+rtrim(sym[Nuc.z].sym)+"_main.shtml' target='_blank'>TUNL NDP Summary</a>";
        }
    }
    
    document.getElementById("infoNuclide").innerHTML = xhtml;
    setTimeout(stopLinkBubble,200);
    $("#infoNuclide").show();
}

function logCurrentNuclide() {
    let property=getCurrentProperty();
    let code=property["code"];
    let Nuc=Nuclide[code][0][icurrent];
    console.log(Nuc);
}


// Factors for formatting nuclide information
var HalfLifeFactors = [ 3.15576e31,3.15576e28,3.15576e25,3.15576e22,3.15576e19,3.15576e16,3.15576e13,3.15576e10,3.15576e7,86400,3600,60,1,1e-3,1e-6,1e-9,1e-12,1e-15,1e-18,1e-21,1e-24];
var HalfLifeUnits = [ "Yy","Zy","Ey","Py","Ty","Gy","My","ky","y","d","h","m","s","ms","&#956;s","ns","ps","fs","as","zs","ys" ];

/* Formatting for half lives */
function RebaseHalfLifeFactor ( hl )
{
    for (var i=0; i<HalfLifeFactors.length; i++) {
        if(HalfLifeFactors[i]==86400 || HalfLifeFactors[i]==3600 || HalfLifeFactors[i]==60)
        {
            if(hl>4*HalfLifeFactors[i]) { return HalfLifeFactors[i]; }
        }
        else if(hl>HalfLifeFactors[i])
        {
            return HalfLifeFactors[i];
        }
    }
    return 1;   
}

function RebaseHalfLifeFactorUnit ( factor )
{
    for (var i=0; i<HalfLifeFactors.length; i++) {
        if(factor==HalfLifeFactors[i]) { return HalfLifeUnits[i]; }
    }
    return "s";
}

function TwoZeroTruncate( x )
{
    var y=x.toPrecision(8).toString();
    var end;
    var bad=0;
    var start=false;
    var dpfound=false;
    var nbad=2;
    for(end=0; end<y.length; end++)
    {
        if(y[end]==".") { dpfound=true; }
        else if(y[end]=='0' && dpfound) { bad=bad+1; }
        else if(y[end]!='0') { bad=0; start=true; }
        if(bad==nbad && start) { break; }
    }
    if(bad==nbad)
    {
        if(y.indexOf(".")==0) { return Math.round(x); }
        else if (y[end-nbad]==".") { return y.substr(0,end-nbad); }
        else { return y.substr(0,end-nbad+1); }
    }
    else
    {
        if(y[y.length-1]==".") { return y.substr(0,y.length); }
        else { return y; }
    }
}

function GetFormattedDecayMode(x)
{
    if(x=="B-")  { return "&#946;<sup>-</sup>"; }
    if(x=="B-n")  { return "&#946;<sup>-</sup>n"; }
    if(x=="B-2n")  { return "&#946;<sup>-</sup>2n"; }
    if(x=="B-3n")  { return "&#946;<sup>-</sup>3n"; }
    if(x=="B-d")  { return "&#946;<sup>-</sup>d"; }
    if(x=="B-A")  { return "&#946;<sup>-</sup>&#945;"; }
    if(x=="B-t")  { return "&#946;<sup>-</sup>t;"; }
    if(x=="2B-") { return "2&#946;<sup>-</sup>"; }
    if(x=="n")   { return "n"; }
    if(x=="2n")  { return "2n"; } 
    if(x=="e+")  { return "e<sup>+</sup>"; }
    if(x=="B+")  { return "&#946;<sup>+</sup>"; }
    if(x=="B+p")  { return "&#946;<sup>+</sup>p"; }
    if(x=="B+2p")  { return "&#946;<sup>+</sup>2p"; }
    if(x=="B+3p")  { return "&#946;<sup>+</sup>3p"; }
    if(x=="B+A")  { return "&#946;<sup>+</sup>&#945;"; }
    if(x=="B+pA")  { return "&#946;<sup>+</sup>p&#945;"; }
    if(x=="2B+") { return "2&#946;<sup>+</sup>"; }
    if(x=="p")   { return "p"; } 
    if(x=="2p")  { return "2p"; } 
    if(x=="A")   { return "&#945;"; }
    if(x=="SF")  { return "Spontaneous fission"; }
    if(x=="EC")  { return "&#949;"; }
    return x;
}


function FormatAsHalfInteger(x)
{
    if(Math.abs(x-parseInt(x))>0.01) { return parseInt(2*x)+"/2"; }
    return parseInt(x);
}
