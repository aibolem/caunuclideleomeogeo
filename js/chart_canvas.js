class ChartCanvas extends Chart {

    constructor() {

        /* Call parent constructor */
	super();

	/* Log */
	gui.debug("FUNCITON ChartCanvas.constructor");
	
	/* HTML elements */
	this.canvas=document.createElement("canvas");
        this.context=this.canvas.getContext("2d");
	this.container.appendChild(this.canvas);
	this.canvas.style.backgroundColor="#FFFFFF";

	/* Stores variables for event handling*/
	this.previousTouchEvent="";
	this.isMove=false;

	// Stores the mouse coordinates for highlight
	this.mouse={};

        /* Interactivity parameters */
	this.zoomSpeed=1.5;
	
	/* Load cookies */
	if(gui.isCookie("size")) { this.size=parseFloat(gui.getCookie("size")); }
	if(gui.isCookie("nCenter")) { this.nCenter=parseFloat(gui.getCookie("nCenter")); }
	if(gui.isCookie("zCenter")) { this.zCenter=parseFloat(gui.getCookie("zCenter")); }


	this.nMin = function() {
            return this.nCenter-parseFloat(this.canvas.width)/2.0/this.size;
	}

	this.nMax = function() {
            return this.nCenter+parseFloat(this.canvas.width)/2.0/this.size;
	}

	this.zMin = function() {
            return this.zCenter-parseFloat(this.canvas.height)/2.0/this.size;
	}

	this.zMax = function() {
            return this.zCenter+parseFloat(this.canvas.height)/2.0/this.size;
	}

	this.zToPixel = function(z) {
            return (this.zCenter-z)*this.size + this.canvas.height/2.0;
	}

	this.nToPixel = function(n) {
            return (n-this.nCenter)*this.size + this.canvas.width/2.0;
	}

	this.pixelToZ = function(y) {
            return (this.canvas.height/2.0-y)/this.size + this.zCenter;
	}

	this.pixelToN = function(x) {
            return (x-this.canvas.width/2.0)/this.size + this.nCenter;
	}

        this.setCenter = function(n,z) {
            this.nCenter=n;
	    this.zCenter=z;
	}

        this.setBottomLeft = function(n,z) {
            this.nCenter=n+this.canvas.width/2.0/this.size;
            this.zCenter=z+this.canvas.height/2.0/this.size;
	}

	this.setArbitraryPoint = function(n,z,x,y) {
            this.nCenter=n+(this.canvas.width/2.0-x)/this.size;
            this.zCenter=z+(y-this.canvas.height/2.0)/this.size;
	}


	// Find the range we need to actually plot
        this.determineIndexRange = function() {
        
            let property=gui.getCurrentProperty();
            let code=property["code"];
            let dataMode=gui.getDataMode();
	    let t=0;
            
            let Nuc=data.table[code][t];
            
            let indexMin=10000;
            let indexMax=0
            let zMinimum=this.pixelToZ(this.canvas.height)-1;
            let zMaximum=this.pixelToZ(0)+1;
            let nMinimum=this.pixelToN(0)-1;
            let nMaximum=this.pixelToN(this.canvas.width)+1;
            
            for(var i=0; i<Nuc.length; ++i) {
        	if(!Nuc[i].visible) { continue; }
                if( Nuc[i].z<=zMaximum && Nuc[i].z>=zMinimum &&  Nuc[i].n<=nMaximum && Nuc[i].n>=nMinimum ) {
                    if(i<indexMin) { indexMin = i; }
                    if(i>indexMax) { indexMax = i; }
                }
            }
            return [indexMin,indexMax+1];
        }
	
	this.test = async function() {
	    this.isMove=true;
	    for(let i=0; i<500; i++) {
                await this.draw();
	        //await console.log(i);
	    }
	    this.isMove=false;
	}
	
	this.draw = function() {

            //TWEEN.update();
	    
	    this.stats.begin();
   
            let t=0;
            let property=gui.getCurrentProperty();
            let code=property["code"];
            let dataMode=gui.getDataMode();
            let Nuc=data.table[code][t];
            let background=colour.getBackgroundColour();
            
	    // Index range
	    let indexRange=this.determineIndexRange();
	    let indexMin=indexRange[0];
	    let indexMax=indexRange[1];

	    this.clearCanvas();

            // Base colours
	    let borderWidth=this.border*this.size;
	    let x=0;
	    let y=0;
            let n=parseInt(this.pixelToN(this.mouse.x)+0.5);
	    let z=parseInt(this.pixelToZ(this.mouse.y)+0.5);
	    for(let i=indexMin; i<indexMax; i++) {
                if(!Nuc[i].visible) { continue; }
		if(Nuc[i].n<this.nMin()-1||Nuc[i].n>this.nMax()+1||Nuc[i].z<this.zMin()-1||Nuc[i].z>this.zMax()+1) { continue; }
		x=this.nToPixel(Nuc[i].n)+borderWidth-this.size/2;
		y=this.zToPixel(Nuc[i].z)+borderWidth-this.size/2;
		this.context.fillStyle=Nuc[i].colour;
                this.context.fillRect(x,y,this.size-2*borderWidth,this.size-2*borderWidth);
                // Highlight
	        if(Nuc[i].n==n&&Nuc[i].z==z&&!gui.isMobile()) {
		    this.context.fillStyle="#FFFFFF88";
                    this.context.fillRect(x,y,this.size-2*borderWidth,this.size-2*borderWidth);
	        }
            }

	    // Stable stroke
	    if($("#checkStable").prop("checked")) {
    		let borderWidth=this.stableBorder*this.size;
		let lineWidth=this.stableLineWidth*this.size;
		let x=0;
		let y=0;
    		this.context.strokeStyle=this.stableColour;
    		this.context.lineWidth=lineWidth;
                this.context.beginPath();
                for(let i=indexMin; i<indexMax; i++) {
                    if(!Nuc[i].visible||!Nuc[i].stable) { continue; }
    		    x=this.nToPixel(Nuc[i].n)-this.size/2+borderWidth;
    		    y=this.zToPixel(Nuc[i].z)-this.size/2+borderWidth;
                    this.context.rect(x,y,this.size-2*borderWidth,this.size-2*borderWidth);
                }
                this.context.stroke();
	    }

	    // Estimated
    	    borderWidth=this.estimatedBorder*this.size;
            let lineWidth=this.estimatedLineWidth*this.size;
    	    this.context.strokeStyle=this.estimatedColour;
    	    this.context.lineWidth=lineWidth;
            this.context.beginPath();
            for(let i=indexMin; i<indexMax; i++) {
                if(!Nuc[i].visible||Nuc[i].est==0) { continue; }
    		    x=this.nToPixel(Nuc[i].n)-this.size/2+borderWidth;
    		    y=this.zToPixel(Nuc[i].z)-this.size/2+borderWidth;
                    this.context.rect(x,y,this.size-2*borderWidth,this.size-2*borderWidth);
	    }
            this.context.stroke();    
	    
	    // Symbols
	    if($("#checkShowNuclideLabels").prop("checked")) {
                this.context.textBaseline = "bottom";
                this.context.textAlign = "left";
	        this.context.font=this.getFont(".nuclide_text_symbol");
	        if(!this.isMove) {
                    for(let i=indexMin; i<indexMax; i++) {
                        if(!Nuc[i].visible) { continue; }
                        let x=this.nToPixel(Nuc[i].n)+Nuc[i].symbolOffsetX*this.size;
                        let y=this.zToPixel(Nuc[i].z)+Nuc[i].symbolOffsetY*this.size;
                        this.context.fillStyle=Nuc[i].textColour;
                        this.context.fillText(data.sym[Nuc[i].z].sym,x,y);
	        	}
	        }
	        
	        // Mass numbers
	        this.context.font=this.getFont(".nuclide_text_mass");
	        if(!this.isMove) {
                    for(let i=indexMin; i<indexMax; i++) {
                        if(!Nuc[i].visible) { continue; }
                        let x=this.nToPixel(Nuc[i].n)+Nuc[i].massOffsetX*this.size;
                        let y=this.zToPixel(Nuc[i].z)+Nuc[i].massOffsetY*this.size;
                        this.context.fillStyle=Nuc[i].textColour;
	        	    this.context.fillText(Nuc[i].a.toString(),x,y);
	        	}
	        }

	    }
	    // Values
	    this.context.font=this.getFont(".nuclide_text_value");
            this.context.textAlign = "center";
	    if(!this.isMove&&$("#checkShowValue").prop("checked") ) {
                for(let i=indexMin; i<indexMax; i++) {
                    if(!Nuc[i].visible) { continue; }
                    let x=this.nToPixel(Nuc[i].n)+Nuc[i].valueOffsetX*this.size;
                    let y=this.zToPixel(Nuc[i].z)+Nuc[i].valueOffsetY*this.size;
                    this.context.fillStyle=Nuc[i].textColour;
                    this.context.fillText(Nuc[i]["string"+dataMode],x,y);
	    	}
	    }

	    // Element names
            this.context.textAlign = "right";
	    this.context.font=this.getFont(".nuclide_text_symbol");	    
            this.context.fillStyle=background[1];
	    if(!this.isMove&&$("#checkShowElementLabels").prop("checked") ) {
	        for(let z=Math.max(0,parseInt(this.pixelToZ(this.canvas.height)-1)); z<Math.min(parseInt(this.pixelToZ(0)+1),data.sym.length); z++) {
                    let nMin=this.pixelToN(0)-1;
	            if(property.minN[z]>nMin&&property.minN[z]<property.maxN[z]) {
                        let x=this.nToPixel(property.minN[z])-this.size/2-0.1*this.size;
                        let y=this.zToPixel(z);
                        this.context.fillText(data.sym[z].lname,x,y);
	                y=y+parseFloat(this.getFontSize(".nuclide_text_symbol"));
                        this.context.fillText("Z="+(z).toString(),x,y);	    
	            }
	        }
	    }
	    
            
	    // Magic numbers
            if( $("#checkShowMagic").prop("checked") ) {
            		
                borderWidth=this.border*this.size;
                let w=10*borderWidth;
                this.context.strokeStyle="#000000";
		this.context.lineCap="round";
                this.context.lineWidth = w;
            
            	let offset=0.5;
            
            	/* We need to handle these limits ina more sensible way.  They
            	 * should depend on the min and max values defined by the
            	 * user, but also on the ranges (e.g. MinN, MaxZ) used below.
            	 * Needs to be cleverer.*/
            
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
                    this.context.beginPath();
                    this.context.moveTo(this.nToPixel(Math.max(property.minN[this.zmag[i]],Nmin)-1*offset),this.zToPixel(this.zmag[i]+offset));
                    this.context.lineTo(this.nToPixel(Math.min(property.maxN[this.zmag[i]],Nmax)+1*offset),this.zToPixel(this.zmag[i]+offset));
                    this.context.moveTo(this.nToPixel(Math.max(property.minN[this.zmag[i]],Nmin)-1*offset),this.zToPixel(this.zmag[i]-offset));
                    this.context.lineTo(this.nToPixel(Math.min(property.maxN[this.zmag[i]],Nmax)+1*offset),this.zToPixel(this.zmag[i]-offset));
                    this.context.stroke();
                    this.context.closePath();
                }
            
                for(var i=0; i<this.nmag.length; i++)
                {
            	    if(this.nmag[i]<Nmin||this.nmag[i]>Nmax) { continue; }
            	    if((this.nmag[i]<property.minN[Zmin]||this.nmag[i]>property.maxN[Zmax])&&(property.minN[Zmin]!=N_MAX&&property.maxN[Zmax]!=N_MIN)) { continue; }
            	    if(property.minZ[this.nmag[i]]==Z_MAX) { continue; }
                    this.context.beginPath();
                    this.context.moveTo(this.nToPixel(this.nmag[i]-offset),this.zToPixel(Math.max(property.minZ[this.nmag[i]],Zmin)-1*offset));
                    this.context.lineTo(this.nToPixel(this.nmag[i]-offset),this.zToPixel(Math.min(property.maxZ[this.nmag[i]],Zmax)+1*offset));
                    this.context.moveTo(this.nToPixel(this.nmag[i]+offset),this.zToPixel(Math.max(property.minZ[this.nmag[i]],Zmin)-1*offset));
                    this.context.lineTo(this.nToPixel(this.nmag[i]+offset),this.zToPixel(Math.min(property.maxZ[this.nmag[i]],Zmax)+1*offset));
                    this.context.stroke();
                    this.context.closePath();
                }
            }

	    
	    // Key
	    if(document.getElementById("checkKey").checked==true) {
                let w=parseFloat(this.key.img.width);
                let h=parseFloat(this.key.img.height);
                let fx=document.getElementById("rangeKeyX").value;
                let fy=document.getElementById("rangeKeyY").value;
                x=fx*(this.canvas.width-w);
                y=fy*(this.canvas.height-h);
                this.context.drawImage(this.key.img,x,y);
	    }

	    // Stats
	    this.stats.end();
	}

	/* Resize canvas */
	this.resize = function() {
	    this.resizeContainer();
            this.canvas.width=parseInt(window.innerWidth);
            this.canvas.height=parseInt(window.innerHeight);
            this.canvas.style.width = this.canvas.width + "px";
            this.canvas.style.height = this.canvas.height + "px";
        }
        this.resize();
	
        this.wheel = function(event)
        {
            let mouseX=event.clientX;
            let mouseN=this.pixelToN(mouseX);
            let mouseY=event.clientY;
            let mouseZ=this.pixelToZ(mouseY);
            if(event.wheelDelta>0) { this.size=this.size*this.zoomSpeed; }
            else { this.size=this.size/this.zoomSpeed; }
	    // Maximum zoom out
	    if(this.canvas.width/(N_MAX-N_MIN)>this.canvas.height/(Z_MAX-Z_MIN)) {
                if(this.size*(Z_MAX-Z_MIN)<this.canvas.height) {
                    this.size=this.canvas.height/(Z_MAX-Z_MIN);
		}
	    }
	    else {
                if(this.size*(N_MAX-N_MIN)<this.canvas.width) {
                    this.size=this.canvas.width/(N_MAX-N_MIN);
		}
	    }
	    this.setArbitraryPoint(mouseN,mouseZ,mouseX,mouseY);
            this.draw();
        }

        this.mousedown = function(event)
	{
            this.isMove=true;
	}

        this.mouseup = function(event)
	{
            this.isMove=false;
	    this.saveChartCookies();
	    this.draw();
	}
	
	this.mousemove = function(event)
	{
            if(event.buttons==1) {
                let dx=event.movementX;
		let dy=event.movementY;
		let margin=5;
		if(this.pixelToN(0)<N_MIN-margin&&dx>0) { dx=0; }
		if(this.pixelToN(this.canvas.width)>N_MAX+margin&&dx<0) { dx=0; } 
		if(this.pixelToZ(this.canvas.height)<Z_MIN-margin&&dy<0) { dy=0; }
		if(this.pixelToZ(0)>Z_MAX+margin&&dy>0) { dy=0; } 
		this.nCenter-=dx/this.size;
		this.zCenter+=dy/this.size;
                this.draw();
	    }
	    this.mouse.x=event.clientX;
	    this.mouse.y=event.clientY;
	    this.draw();
	}

	// In the below, use the event type
	this.touchStart = function(event)
	{
	    this.isMove=true;
            this.previousTouchEvent=event;
	}

	this.touchEnd = function(event)
	{
	    if(this.previousTouchEvent.type=="touchstart") {
                this.select(this.previousTouchEvent);
	    }
	    this.isMove=false;
            this.previousTouchEvent=event;
	    this.draw();
	}
	
	this.touchMove = function(event)
	{
	    if(this.previousTouchEvent.type=="touchend") {
		;
	    }
            else if(event.touches.length==1&&this.previousTouchEvent.touches.length==1) {
                let dx=event.touches[0].clientX-this.previousTouchEvent.touches[0].clientX;
                let dy=event.touches[0].clientY-this.previousTouchEvent.touches[0].clientY;
		if(Math.abs(dx)>50||Math.abs(dy)>50) {
		    this.touchEnd();
		}
		else {
		    let margin=5;
		    if(this.pixelToN(0)<N_MIN-margin&&dx>0) { dx=0; }
		    if(this.pixelToN(this.canvas.width)>N_MAX+margin&&dx<0) { dx=0; } 
		    if(this.pixelToZ(this.canvas.height)<Z_MIN-margin&&dy<0) { dy=0; }
		    if(this.pixelToZ(0)>Z_MAX+margin&&dy>0) { dy=0; } 
                    this.nCenter-=dx/this.size;
		    this.zCenter+=dy/this.size;
		}
	    }
	    else if(event.touches.length==2&&this.previousTouchEvent.touches.length==2) {
		/* Work out center */
                let midX=(event.touches[0].clientX+event.touches[1].clientX)/2.0;
                let midN=this.pixelToN(midX);
                let midY=(event.touches[0].clientY+event.touches[1].clientY)/2.0;
		let midZ=this.pixelToZ(midY);

		/* Work out scale factors */
                let r=Math.sqrt((event.touches[1].clientX-event.touches[0].clientX)**2+(event.touches[1].clientY-event.touches[0].clientY)**2);
		let oldr=Math.sqrt((this.previousTouchEvent.touches[1].clientX-this.previousTouchEvent.touches[0].clientX)**2+(this.previousTouchEvent.touches[1].clientY-this.previousTouchEvent.touches[0].clientY)**2);

		/* Change size */
		this.size=this.size*r/oldr;
		
	        /* Maximum zoom out */
	        if(this.canvas.width/(N_MAX-N_MIN)>this.canvas.height/(Z_MAX-Z_MIN)) {
                    if(this.size*(Z_MAX-Z_MIN)<this.canvas.height) {
                        this.size=this.canvas.height/(Z_MAX-Z_MIN);
	            }
	        }
	        else {
                    if(this.size*(N_MAX-N_MIN)<this.canvas.width) {
                        this.size=this.canvas.width/(N_MAX-N_MIN);
	            }
	        }
	        this.setArbitraryPoint(midN,midZ,midX,midY);
	    }
            this.previousTouchEvent=event;
            this.draw();		

	}

        this.select = function(event)
	{
	    console.log(event);
	    let n=0;
	    let z=0;
	    try {
                n=parseInt(this.pixelToN(event.clientX)+0.5);
	        z=parseInt(this.pixelToZ(event.clientY)+0.5);
	    }
	    catch (e) { ; }
	    try {
                n=parseInt(this.pixelToN(event.touches[0].clientX)+0.5);
	        z=parseInt(this.pixelToZ(event.touches[0].clientY)+0.5);
	    }
	    catch (e) { ; }
	    console.log(z,n,event);
	    gui.showNuclide(z,n);
	    
	}
	
        /* Event handlers */
        this.canvas.addEventListener("wheel",this.wheel.bind(this));
        this.canvas.addEventListener("mouseup",this.mouseup.bind(this));
        this.canvas.addEventListener("mouseout",this.mouseup.bind(this));
        this.canvas.addEventListener("focusout",this.mouseup.bind(this));
        this.canvas.addEventListener("mousedown",this.mousedown.bind(this));
        this.canvas.addEventListener("mousemove",this.mousemove.bind(this));
        this.canvas.addEventListener("touchstart",this.touchStart.bind(this));
        this.canvas.addEventListener("touchend",this.touchEnd.bind(this));
        this.canvas.addEventListener("touchcancel",this.touchEnd.bind(this));
        this.canvas.addEventListener("touchmove",this.touchMove.bind(this));
        this.canvas.addEventListener("dblclick",this.select.bind(this));
	
        window.addEventListener("resize",this.resize.bind(this));
        window.addEventListener("focus",this.draw.bind(this));
	
    }

    build() {
        this.key.build();
    }
    
    update() {
	this.key.build();
        this.measureText();
    }

    moveTo(n=this.nCenter,z=this.zCenter,size=this.size,time=3000){
        /* Tweener */
	/*
        var params = { n:chart.nCenter, z:chart.zCenter, size:chart.size };
        var tweener = new TWEEN.Tween(params);
	tweener.onUpdate(function(position) {
	    chart.nCenter=position.n;
	    chart.zCenter=position.z;
	    chart.size=position.size;
	});
	tweener.onComplete(function(position) { clearInterval(updateInterval); });
	tweener.to({n:n,z:z,size:size},time);
	tweener.start();
	var updateInterval=setInterval(this.draw.bind(this),16.6667);
        */
    }

    /* Clear the canvas */
    clearCanvas() {
        this.context.save();
        let background=colour.getBackgroundColour();
        this.context.fillStyle=background[0];
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.rect(0,0,this.canvas.width,this.canvas.height);
        this.context.fill();
        this.context.restore();
    }

    savePNG() {
        let pngDataURL = this.canvas.toDataURL('image/png');    
        let blob=dataURItoBlob(pngDataURL);
        let a=document.createElement("a");
        document.body.appendChild(a);
        a.style="display: none";
        let url=window.URL.createObjectURL(blob); 
        a.href=url;
        a.download="chart2d_"+this.filename()+".png";
        a.click();
        window.URL.revokeObjectURL(url);	
    }
    
    saveChartCookies() {
        gui.addCookie("size",this.size.toString());
        gui.addCookie("nCenter",this.nCenter.toString());
        gui.addCookie("zCenter",this.zCenter.toString());
    }
  
}
