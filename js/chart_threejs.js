import * as THREE from 'https://cdn.skypack.dev/three@0.133.1';
import { MapControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls'
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/utils/BufferGeometryUtils'
import { GLTFExporter } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/exporters/GLTFExporter'

class ChartThreejs extends Chart {

    constructor() {
        super();

	// Threejs objects
	this.camera="";
	this.controls="";
	this.scene="";
	this.renderer="";
	this.light="";
	this.lightAmbient="";

        // Model scale
	this.size=1.0;
	
        // Picking
	this.pickingScene="";
	this.pickingTexture="";
        this.pickingData = [];
        this.mouse={};
	this.indexMap=[];
	
	// Meshes
	this.meshChart="";
	this.meshGround="";
	this.meshLabelsBlack="";
	this.meshLabelsWhite="";
	this.meshPick="";

	// Materials

        // Parameters
        this.lightDistance=200.0*this.size;

	// Base
        this.baseCanvas = document.createElement("canvas");
        this.baseContext = this.baseCanvas.getContext("2d", { alpha: true });
        this.baseCanvas.id = "basecanvas";
        this.baseCanvas.width = 2048;
        this.baseCanvas.height = 2048;
        this.container.appendChild(this.baseCanvas);

	// Key canvas
	this.keyCanvas = document.createElement("canvas");
        this.keyContext = this.keyCanvas.getContext("2d");
	this.keyCanvas.id = "keycanvas";

	// Sprite sheet
	this.spriteSheetNumberWidth=[];
	this.spriteSheetNumberIndex=[];
	this.spriteSheetSymbolWidth=[];
	this.spriteSheetSymbolIndex=[];
	this.spriteSheetStableIndex=0;
	this.spriteSheetEstimatedIndex=0;
        this.spriteSheetSize=3072;
        this.spriteHeight=72;
        this.spriteWidth=128;
        this.nSpriteX=parseInt(this.spriteSheetSize/this.spriteWidth);
        this.nSpriteY=parseInt(this.spriteSheetSize/this.spriteHeight);
	this.spriteSheetWhite={};
	this.spriteSheetBlack={};

	// Sprite sheet canvases
	this.whiteCanvas=document.createElement("canvas");
	this.whiteContext=this.whiteCanvas.getContext("2d");
	this.whiteCanvas.id="whitecanvas";
        this.whiteCanvas.width = this.spriteSheetSize;
        this.whiteCanvas.height = this.spriteSheetSize;
        this.blackCanvas = document.createElement("canvas");
        this.blackContext = this.blackCanvas.getContext("2d");
        this.blackCanvas.id = "blackcanvas";
        this.blackCanvas.width = this.spriteSheetSize;
        this.blackCanvas.height = this.spriteSheetSize;

    }

    build() {

	// Build the key
	this.key.build();
	
        // Clear container
	this.container.innerHTML="";

	// Create the renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	this.renderer.domElement.style.position="absolute";
        this.container.append( this.renderer.domElement );

        // Key canvas
 	this.container.append( this.keyCanvas );
	this.keyCanvas.style.position="absolute";
	this.keyCanvas.style.pointerEvents="none";
        this.keyContext.clearRect(0,0,this.keyCanvas.width,this.keyCanvas.height);
	
	// Camera
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
        this.camera.position.set(10*this.size,10*this.size,10*this.size);	
	
        // Set camera position
        let cameraRelativeX=this.camera.position.x;
        let cameraRelativeY=this.camera.position.y;
        let cameraRelativeZ=this.camera.position.z;

	// Now set the camera position, remebering that it's relative to target.
	if(gui.isCookie("cameraRelativeX")) {
            cameraRelativeX=parseFloat(gui.getCookie("cameraRelativeX"));
	    if(isNaN(cameraRelativeX)||cameraRelativeX==0.0) { cameraRelativeX=this.camera.x; }
	}
	if(gui.isCookie("cameraRelativeY")) {
            cameraRelativeY=parseFloat(gui.getCookie("cameraRelativeY"));
	    if(isNaN(cameraRelativeY)||cameraRelativeY==0.0) { cameraRelativeY=this.camera.y; }
	}
	if(gui.isCookie("cameraRelativeZ")) {
            cameraRelativeZ=parseFloat(gui.getCookie("cameraRelativeZ"));
	    if(isNaN(cameraRelativeZ)||cameraRelativeZ==0.0) { cameraRelativeZ=this.camera.z; }
	}

        // Set controls target
        let targetX=0.0;
        let targetY=0.0;
        let targetZ=0.0;
	if(gui.isCookie("nCenter")) {
            targetX=parseFloat(gui.getCookie("nCenter"));
	}
	if(gui.isCookie("targetY")) {
            targetY=parseFloat(gui.getCookie("targetY"));
	}
	if(gui.isCookie("zCenter")) {
            targetZ=-parseFloat(gui.getCookie("zCenter"));
	}
	this.camera.position.set(cameraRelativeX+targetX,cameraRelativeY+targetY,cameraRelativeZ+targetZ);
	
	// Controls
        this.controls = new MapControls(this.camera,this.renderer.domElement );
	this.controls.target.set(targetX,targetY,targetZ);
	this.controls.update();

	// Other control parameters
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.3;
        this.controls.maxPolarAngle = Math.PI/2;
        this.controls.addEventListener('change',this.draw.bind(this));
	console.log("controls target", this.controls.target);

	// Scenes
        this.scene = new THREE.Scene();

        // Scene background
	let background=colour.getBackgroundColour();
        this.scene.background = new THREE.Color(background[0]);


        // Picking scene
        this.pickingScene = new THREE.Scene();
        this.pickingTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
        this.pickingTexture.texture.minFilter = THREE.LinearFilter;
	
	// Directional light
        this.light = new THREE.DirectionalLight( 0xffffff,1.0 );
	this.light.name = "Directional Light";
        this.light.castShadow = true;
        this.light.shadow.camera.left   =  this.lightDistance;
        this.light.shadow.camera.right  = -this.lightDistance;
        this.light.shadow.camera.top    =  this.lightDistance;
        this.light.shadow.camera.bottom = -this.lightDistance;
        this.light.shadow.camera.far    =  1.5*this.lightDistance;
	this.light.shadow.bias=-0.005;
        this.light.shadow.mapSize.width = 2048;//renderer.capabilities.maxTextureSize;
        this.light.shadow.mapSize.height = 2048;//renderer.capabilities.maxTextureSize;
	//this.light.target.position.set((N_MAX-N_MIN)/2*this.size,0.0,-(Z_MAX-Z_MIN)/2*this.size);
	this.light.target.position.set(0,0,0);
        this.scene.add(this.light);
	this.scene.add(this.light.target);

	// Directional light
        this.lightAmbient = new THREE.AmbientLight( 0xffffff,1.0 );
	this.lightAmbient.name = "Ambient Light";
        this.scene.add(this.lightAmbient);
	
	
        this.light.shadowCameraHelper = new THREE.CameraHelper(this.light.shadow.camera);
        //this.scene.add(this.light.shadowCameraHelper);

        // Spriatesheets
	
	// Create the sprite sheet and base texture
        //CreateSpriteSheet();
	//CreateBaseTexture();

	// Actual builds
	this.buildSpriteSheet();
	this.buildGround();
	//this.buildBase();
	this.buildNuclides();

	this.resize();
	// Event handlers
	window.addEventListener("resize",this.resize.bind(this));
        this.renderer.domElement.addEventListener("mousemove",this.mouseMove.bind(this));
        this.renderer.domElement.addEventListener("dblclick",this.select.bind(this));
        
	this.changeLight();
	this.draw();
	
	console.log("build end");

    }

    draw() {
	this.pick();
	this.renderer.setRenderTarget( null );
        this.renderer.render( this.scene, this.camera );
	// Now draw key
        if(document.getElementById("checkKey").checked==true) {
            let w=parseFloat(this.key.img.width);
            let h=parseFloat(this.key.img.height);
            let fx=document.getElementById("rangeKeyX").value;
            let fy=document.getElementById("rangeKeyY").value;
            let x=fx*(this.keyCanvas.width-w);
            let y=fy*(this.keyCanvas.height-h);
            this.keyContext.clearRect(0,0,this.keyCanvas.width,this.keyCanvas.height);
            this.keyContext.drawImage(this.key.img,x,y);
	}
	else {
            this.keyContext.clearRect(0,0,this.keyCanvas.width,this.keyCanvas.height);
	}
	this.saveChartCookies();	
        return;
    }

    update() {
        this.build();
	return;    }

    resize() {
	this.resizeContainer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.keyCanvas.width = window.innerWidth;
	this.keyCanvas.height = window.innerHeight;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
	this.pickingTexture.setSize( window.innerWidth, window.innerHeight);
	this.draw();
    }

    mouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
	this.draw();
    }

    // Not clear why this doubling is required. Seems not to work
    // correctly the first time.
    changeLight() {
	this.changeLightTwice();
	this.changeLightTwice();
    }
    
    changeLightTwice() {

	let intensity=document.getElementById("rangeLight").value;
	let balance=document.getElementById("rangeAmbient").value;
	let lightTheta=document.getElementById("rangeLightLatitude").value*Math.PI/180;
	let lightPhi=document.getElementById("rangeLightLongitude").value*Math.PI/180;
        let x=this.lightDistance*Math.sin(lightTheta)*Math.cos(lightPhi);
        let y=this.lightDistance*Math.cos(lightTheta);
        let z=this.lightDistance*Math.sin(lightTheta)*Math.sin(lightPhi);
        this.light.position.set(x+this.light.target.position.x,y,z+this.light.target.position.z);
	this.light.shadow.camera.updateProjectionMatrix();
	
	this.light.intensity=intensity*balance;
	this.lightAmbient.intensity=intensity*(1-balance);
	// Now update shadow box

        // Reset camera before fitting box
        this.light.shadow.camera.left   = -this.lightDistance;
        this.light.shadow.camera.right  = this.lightDistance;
        this.light.shadow.camera.top    = this.lightDistance;
        this.light.shadow.camera.bottom = -this.lightDistance;
        this.light.shadow.camera.far    = this.lightDistance;
	this.light.shadow.camera.updateProjectionMatrix();
	
	let box= new THREE.Box3().setFromObject(this.scene.getObjectByName("Chart"));
	let p=[];
	let key=["min","max"];
	let top=0;
	let bottom=0;
	let left=0;
	let right=0;
	let far=0;
	for(let ix in key) {
	    for(let iy in key) {
		for(let iz in key) {
                    p.push(new THREE.Vector3(box[key[ix]].x,box[key[iy]].y,box[key[iz]].z));
		    //console.log("vector",p[p.length-1]);
		    p[p.length-1].project(this.light.shadow.camera);
		    //console.log("project",p[p.length-1]);
		    if(p[p.length-1].x>left)   { left=p[p.length-1].x; }
		    if(p[p.length-1].x<right)  { right=p[p.length-1].x; }
		    if(p[p.length-1].y>top)    { top=p[p.length-1].y; }
		    if(p[p.length-1].y<bottom) { bottom=p[p.length-1].y; }
		    if(p[p.length-1].z>far) { far=p[p.length-1].z; }
		}
	    }
	}
	//console.log(top,bottom,left,right);
	//console.log(p);
	//console.log("target",this.light.target.position);

	let margin=1.1;
        this.light.shadow.camera.left   = margin*left*this.lightDistance;
        this.light.shadow.camera.right  = margin*right*this.lightDistance;
        this.light.shadow.camera.top    = margin*top*this.lightDistance;
        this.light.shadow.camera.bottom = margin*bottom*this.lightDistance;
        this.light.shadow.camera.far    = margin*2*far*this.lightDistance;
	this.light.shadow.camera.updateProjectionMatrix();
	this.light.shadowCameraHelper.update();
	
	this.draw();
    }

    
    buildGround()
    {
        // Things to use
        let position = new THREE.Vector3();
        let rotation = new THREE.Euler();
        let matrix = new THREE.Matrix4();
        let scale = new THREE.Vector3(1.0,1.0,1.0);
        let quaternion = new THREE.Quaternion();
    
        // Create ground material
        let geometry = new THREE.PlaneBufferGeometry( 100*this.lightDistance, 100*this.lightDistance );
        rotation.x = -Math.PI/2;
        quaternion.setFromEuler( rotation, false );
        matrix.compose( position, quaternion, scale );
        geometry.applyMatrix4( matrix );
    
        // Create the material and mesh
        //let material = new THREE.ShadowMaterial();
        let material = new THREE.ShadowMaterial( );
	material.name = "Ground Plane Material";
	
        let mesh = new THREE.Mesh( geometry, material );
	mesh.name="Ground Plane"
        this.scene.add( mesh );
        mesh.geometry = geometry;
	mesh.position.x=(N_MAX+N_MIN)/2;
        mesh.position.y = -0.0;
	mesh.position.z=-(Z_MAX+Z_MIN)/2;
        mesh.receiveShadow = true;
        mesh.material = material;
        mesh.needsUpdate = true;
    
        // Dispose of anything we don't need
        geometry.dispose();
        material.dispose();
    }


    getSpriteX(index) { return (index%this.nSpriteX)*this.spriteWidth; }
    getSpriteY(index) { return (index-(index%this.nSpriteX))/this.nSpriteX * this.spriteHeight; }
    
    buildSpriteSheet() {

        gui.debug("FUNCTION ChartThreejs.buildSpriteSheet")
	
        // Each sprite is 128 wide by 72 high
        // 16 columns, 28 rows, 448 sprites.
        // 118 elements, mass to 295 gives 413 sprites required
                        
        let font = this.getFont(".nuclide_text_symbol");
	let pxIndex=font.indexOf("px");
	let lastSpace=font.substr(0,pxIndex).lastIndexOf(" ");
	font=font.substr(0,lastSpace)+" "+(0.9*this.spriteHeight).toString()+"px "+font.substr(pxIndex+3);	
        this.blackContext.font = font; //[0]+" "+font[1]+" "+font[2]+" "+(0.9*this.spriteHeight).toString()+"px"+" "+font[4];
	this.blackContext.textBaseline="top";
        this.blackContext.clearRect(0, 0, this.blackCanvas.width, this.blackCanvas.height);
	this.blackContext.fillStyle = "#000000";
	
        this.spriteSheetNumberWidth=[];
        this.spriteSheetSymbolWidth=[];

	let test="Ni";
	console.log(this.blackContext.measureText(test).width);
	console.log(this.blackContext.measureText(test).actualBoundingBoxLeft);
	console.log(this.blackContext.measureText(test).actualBoundingBoxRight);
        
        // Loop to maximum mass black
        let SpriteIndex=0;
        for(let a=0; a<N_MAX+Z_MAX; a++) {
        	// Calculate width for later use
        	let Text = a.toString();
        	this.spriteSheetNumberWidth[a]=this.blackContext.measureText(Text).actualBoundingBoxRight;
        	// Draw the canvas for black text
                this.blackContext.fillText(Text,this.getSpriteX(SpriteIndex),this.getSpriteY(SpriteIndex));
        	this.spriteSheetNumberIndex[a]=SpriteIndex;
        	SpriteIndex+=1;
        }
        
        // Loop symbols black
        for(let i=0; i<data.sym.length; i++) {
        	// Write to the canvas
        	let Text = data.sym[i].sym;
        	this.spriteSheetSymbolWidth[i]=this.blackContext.measureText(Text).actualBoundingBoxRight;
        	// Draw the canvas for black text
                this.blackContext.fillText(Text,this.getSpriteX(SpriteIndex),this.getSpriteY(SpriteIndex));
        	this.spriteSheetSymbolIndex[i]=SpriteIndex;
        	SpriteIndex+=1;
        }
	
	// Stable square
    	let borderWidth=this.stableBorder*this.spriteHeight;
	let lineWidth=this.stableLineWidth*this.spriteHeight;
    	let x=this.getSpriteX(SpriteIndex)+borderWidth;
    	let y=this.getSpriteY(SpriteIndex)+borderWidth;
	let boxWidth=this.spriteHeight-2*borderWidth
        this.blackContext.strokeStyle=this.stableColour;
    	this.blackContext.lineWidth=lineWidth;
        this.blackContext.strokeRect(x,y,boxWidth,boxWidth);
        this.spriteSheetStableIndex=SpriteIndex;
        SpriteIndex+=1;

	// Estimated square
    	borderWidth=this.estimatedBorder*this.spriteHeight;
	lineWidth=this.estimatedLineWidth*this.spriteHeight;
    	x=this.getSpriteX(SpriteIndex)+borderWidth;
    	y=this.getSpriteY(SpriteIndex)+borderWidth;
	boxWidth=this.spriteHeight-2*borderWidth
	this.blackContext.strokeStyle=this.estimatedColour;
    	this.blackContext.lineWidth=lineWidth;
        this.blackContext.strokeRect(x,y,boxWidth,boxWidth);
        this.spriteSheetEstimatedIndex=SpriteIndex;
        SpriteIndex+=1;
    
        // Now that we've done this create a white text version
        this.whiteContext.clearRect(0, 0, this.whiteCanvas.width, this.whiteCanvas.height);
	this.whiteContext.filter="invert(1)";
	this.whiteContext.drawImage(this.blackCanvas,0,0);

	// Now upadte the sprite sheets if possible.
	this.spriteSheetBlack.needsUpdate=true;
	this.spriteSheetWhite.needsUpdate=true;
	    
        
    }
    
    buildNuclides() {

        function applyVertexColors( geometry, color ) {
            let position = geometry.attributes.position;
            let colors = [];
            for (let i = 0; i < position.count; i ++ ) { colors.push( color.r, color.g, color.b ); }
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        }

	// Prepare textures
	let anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(),2);
        this.spriteSheetBlack = new THREE.Texture();
        this.spriteSheetBlack.image = this.blackCanvas;
        this.spriteSheetBlack.anisotropy = anisotropy;
	this.spriteSheetBlack.needsUpdate = true;
        this.spriteSheetWhite = new THREE.Texture();
        this.spriteSheetWhite.image = this.whiteCanvas;
        this.spriteSheetWhite.anisotropy = anisotropy;
        this.spriteSheetWhite.needsUpdate = true;
                
        //let shininess = parseFloat(document.getElementById("rangeShininess").value);

        // Reset data
	this.pickingData=[];
	this.indexMap=[];
	
        // Define the Symbol and Number geom arrays
        let geomCube = [];
        let geomPick = [];
        let geomLabelsBlack = [];
        let geomLabelsWhite = [];
        let geomStable = [];
        let geomEstimated = [];
        let material = new THREE.MeshStandardMaterial( { color: 0xffffff, flatShading: true, vertexColors: true } );
        material.name = "Chart Material";
	
        let matrix = new THREE.Matrix4();
        let quaternion = new THREE.Quaternion();
        let color = new THREE.Color();
        
        // New data format
        let t=0;
	let property=gui.getCurrentProperty();
        let code=property["code"];
	let dataMode=gui.getDataMode();
        let Nuc=data.table[code][t];
        
        for ( var i = 0; i < Nuc.length; i++ ) {

            if(!Nuc[i].visible) { continue; }
	    
	    /*
                if(document.getElementById("checkEvenEven").checked && (Nuc[i].z%2==1||Nuc[i].n%2==1)) { continue; }
         
                if(!CheckNuclideInRange(Nuc[i].z,Nuc[i].n)) { continue; }
        
        	if(properties[currentPropertyIndex]["isNumeric"]==1) {
                if(document.getElementById("checkHideOutOfRange").checked) {
                    if(Nuc[i].x<DataMin) { continue; } 
                    if(Nuc[i].x>DataMax) { continue; } 
        	    }
        	    if(document.getElementById("radioHideUnknown").checked&&(isNaN(Nuc[i].x)||Nuc[i].x=="")) {
                    continue;
        	    }
        	    if(document.getElementById("radioHideEstimated").checked&&(isNaN(Nuc[i].x)||Nuc[i].x==""||Nuc[i].est==true)) {
                    continue;
                }
        	}
        	else {
        	    if(document.getElementById("radioHideUnknown").checked&&(Nuc[i].x=="")) {
                    continue;
        	    }
        	    if(document.getElementById("radioHideEstimated").checked&&(Nuc[i].x==""||Nuc[i].est==true)) {
                    continue;
                }
        	}	
        */
        	
        	
            let position = this.nuclideTop(Nuc[i]);

            let rotation = new THREE.Euler();
            rotation.x = 0.0;
            rotation.y = 0.0;
            rotation.z = 0.0;
            
            let scale = new THREE.Vector3();
            scale.x = 1.0;
            scale.y = 1.0;
            scale.z = 1.0;
	    
            let y=position.y;
            if(false) { position.y=y-this.size/2; }
            else { position.y=y/2; }
            
            let xBoxSize=this.size;
            let zBoxSize=this.size;
	    if(document.getElementById("checkEvenEven").checked) {
                xBoxSize*=2;
                zBoxSize*=2;
	    }
            let yBoxSize=y;
            
            if(true) {
                geomCube.push(new THREE.BoxBufferGeometry(xBoxSize,yBoxSize,zBoxSize));
            }
            let Index=geomCube.length-1;
            this.indexMap.push(i);
            
            let positionPick = new THREE.Vector3();
            positionPick.x = position.x;
            positionPick.z = position.z;
            positionPick.y = y;
	    
            this.pickingData.push ( {
            	position: positionPick,
                rotation: rotation,
            	scale: scale
            });
	        	        
            quaternion.setFromEuler( rotation, false );
            matrix.compose( position, quaternion, scale );
            
            geomCube[Index].applyMatrix4( matrix );
            
            // give the geometry's vertices a random color, to be displayed
            applyVertexColors(geomCube[Index], new THREE.Color(Nuc[i].colour) );
            
            geomPick.push(geomCube[Index].clone());
            
            // give the geometry's vertices a color corresponding to the "id"
            applyVertexColors( geomPick[Index], color.setHex( Index ) );
	    
	    
	    // Create all our wonderful labels
            // For now, we don't group them, but we will!
            let OrigX=position.x;
            let OrigZ=position.z;
            
            let GlobalFontScale=1.0;
            
            // We should be OK with a single square geometry?
            let FontScale=GlobalFontScale * 0.4 * document.getElementById("rangeFontSize").value;
            let SuperScale=GlobalFontScale * 0.2 * document.getElementById("rangeFontSize").value;
	    if(document.getElementById("checkEvenEven").checked) {
                FontScale*=2;
		SuperScale*=2;
	    }
            
            // Test if new textures

	    // This is the size of the desired sprite, not the full sprite area.
            let spriteNumberWidth=parseFloat(this.spriteSheetNumberWidth[Nuc[i].a]);
            let spriteSymbolWidth=parseFloat(this.spriteSheetSymbolWidth[Nuc[i].z]);
            let spriteHeight=parseFloat(this.spriteHeight);
            
            // Geometry sizes
            let GSW=FontScale*this.size*spriteSymbolWidth/spriteHeight;
            let GSH=FontScale*this.size;
            let GNW=SuperScale*this.size*spriteNumberWidth/spriteHeight;
            let GNH=SuperScale*this.size;
                      
            let SuperOffset=GSH*0.3;
            
            let YOff=0.002;//1.5*parseFloat(this.spriteheight-fontHeight)/spritesheetsize;//(spritesheetsize%spriteheight)/parseFloat(spritesheetsize);
            let XStep=spriteSymbolWidth/this.spriteSheetSize;
            let YStep=1.0/this.nSpriteY;	
            Index=this.spriteSheetSymbolIndex[Nuc[i].z];
            // These give the top left corner, converted to fractions
            let X=this.getSpriteX(Index)/parseFloat(this.spriteSheetSize);
            let Y=1-this.getSpriteY(Index)/parseFloat(this.spriteSheetSize)+YOff;
            let XTopLeft=X;
            let YTopLeft=Y;
            let XTopRight=X+XStep;
            let YTopRight=Y;
            let XBottomLeft=X;
            let YBottomLeft=Y-YStep;
            let XBottomRight=X+XStep;
            let YBottomRight=Y-YStep;

	    let delta=0.001*this.size;
            
            position.y = position.y*2+3*delta;
            position.x = OrigX + GNW/2
            rotation.x = -Math.PI/2;
            quaternion.setFromEuler( rotation, false );
            matrix.compose( position, quaternion, scale );

            if($("#checkShowNuclideLabels").prop("checked")) {
                if(Nuc[i].textColour=="#000000") {
                    geomLabelsBlack.push( new THREE.PlaneBufferGeometry( GSW , GSH  ) );
                    geomLabelsBlack[geomLabelsBlack.length-1].applyMatrix4(matrix);
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[0]=XTopLeft;            // x top left  0
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[1]=YTopLeft;   // y top left  1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[2]=XTopRight;        // x top right 1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[3]=YTopRight;   // y top left  1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[4]=XBottomLeft;            // x bottom left 0
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[5]=YBottomLeft;         // y bottom left 0
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[6]=XBottomRight;       // x bottom right 1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[7]=YBottomRight;       // y bottom right 0
                }
                else {
                    geomLabelsWhite.push( new THREE.PlaneBufferGeometry( GSW , GSH  ) );
                    geomLabelsWhite[geomLabelsWhite.length-1].applyMatrix4(matrix);
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[0]=XTopLeft;            // x top left  0
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[1]=YTopLeft;   // y top left  1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[2]=XTopRight;        // x top right 1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[3]=YTopRight;   // y top left  1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[4]=XBottomLeft;            // x bottom left 0
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[5]=YBottomLeft;         // y bottom left 0
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[6]=XBottomRight;       // x bottom right 1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[7]=YBottomRight;       // y bottom right 0
                }
	    }
            
            XStep=spriteNumberWidth/this.spriteSheetSize;
            Index=this.spriteSheetNumberIndex[Nuc[i].a];
	    
            // These give the top left corner, converted to fractions
            X=this.getSpriteX(Index)/parseFloat(this.spriteSheetSize);
            Y=1-this.getSpriteY(Index)/parseFloat(this.spriteSheetSize)+YOff;
            XTopLeft=X;
            YTopLeft=Y;
            XTopRight=X+XStep;
            YTopRight=Y;
            XBottomLeft=X;
            YBottomLeft=Y-YStep;
            XBottomRight=X+XStep;
            YBottomRight=Y-YStep;
            
            position.y = position.y-delta;
            position.x = OrigX - GSW/2;
            position.z = OrigZ - SuperOffset;
            rotation.x = -Math.PI/2;
            quaternion.setFromEuler( rotation, false );
            matrix.compose( position, quaternion, scale );

            if($("#checkShowNuclideLabels").prop("checked")) {
                if(Nuc[i].textColour=="#000000") {
                    geomLabelsBlack.push( new THREE.PlaneBufferGeometry( GNW,GNH ) );
                    geomLabelsBlack[geomLabelsBlack.length-1].applyMatrix4(matrix);
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[0]=XTopLeft;            // x top left  0
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[1]=YTopLeft;   // y top left  1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[2]=XTopRight;        // x top right 1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[3]=YTopRight;   // y top left  1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[4]=XBottomLeft;            // x bottom left 0
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[5]=YBottomLeft;         // y bottom left 0
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[6]=XBottomRight;       // x bottom right 1
                    geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[7]=YBottomRight;       // y bottom right 0
                }
                else {
                    geomLabelsWhite.push( new THREE.PlaneBufferGeometry( GNW,GNH ) );
                    geomLabelsWhite[geomLabelsWhite.length-1].applyMatrix4(matrix);
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[0]=XTopLeft;            // x top left  0
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[1]=YTopLeft;   // y top left  1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[2]=XTopRight;        // x top right 1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[3]=YTopRight;   // y top left  1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[4]=XBottomLeft;            // x bottom left 0
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[5]=YBottomLeft;         // y bottom left 0
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[6]=XBottomRight;       // x bottom right 1
                    geomLabelsWhite[geomLabelsWhite.length-1].attributes.uv.array[7]=YBottomRight;       // y bottom right 0
                
                }
	    }

            // Now mapping for stable labels and estiamted
	    if(Nuc[i].stable&&$("#checkStable").prop("checked")) {
                Index=this.spriteSheetStableIndex;
                // These give the top left corner, converted to fractions
                X=this.getSpriteX(Index)/parseFloat(this.spriteSheetSize);
                Y=1-this.getSpriteY(Index)/parseFloat(this.spriteSheetSize);
		X=X;
                XTopLeft=X;
                YTopLeft=Y;
                XTopRight=X+YStep;
                YTopRight=Y;
                XBottomLeft=X;
                YBottomLeft=Y-YStep;
                XBottomRight=X+YStep;
                YBottomRight=Y-YStep;
                
                position.y = position.y-delta;
                position.x = OrigX;
                position.z = OrigZ;
                rotation.x = -Math.PI/2;
                quaternion.setFromEuler( rotation, false );
                matrix.compose( position, quaternion, scale );

		let stableSize=this.size;
   		if(document.getElementById("checkEvenEven").checked) {
		    stableSize*=2;
		}
                geomLabelsBlack.push( new THREE.PlaneBufferGeometry(stableSize,stableSize) );
                geomLabelsBlack[geomLabelsBlack.length-1].applyMatrix4(matrix);
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[0]=XTopLeft;            // x top left  0
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[1]=YTopLeft;   // y top left  1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[2]=XTopRight;        // x top right 1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[3]=YTopRight;   // y top left  1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[4]=XBottomLeft;            // x bottom left 0
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[5]=YBottomLeft;         // y bottom left 0
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[6]=XBottomRight;       // x bottom right 1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[7]=YBottomRight;
	    }

	    if(Nuc[i].est==true) {
                Index=this.spriteSheetEstimatedIndex;
                // These give the top left corner, converted to fractions
                X=this.getSpriteX(Index)/parseFloat(this.spriteSheetSize);
                Y=1-this.getSpriteY(Index)/parseFloat(this.spriteSheetSize);
		X=X;
                XTopLeft=X;
                YTopLeft=Y;
                XTopRight=X+YStep;
                YTopRight=Y;
                XBottomLeft=X;
                YBottomLeft=Y-YStep;
                XBottomRight=X+YStep;
                YBottomRight=Y-YStep;
                
                position.y = position.y-delta;
                position.x = OrigX;
                position.z = OrigZ;
                rotation.x = -Math.PI/2;
                quaternion.setFromEuler( rotation, false );
                matrix.compose( position, quaternion, scale );

		
		let estSize=this.size;
   		if(document.getElementById("checkEvenEven").checked) {
		    estSize*=2;
		}
		
                geomLabelsBlack.push( new THREE.PlaneBufferGeometry(estSize,estSize) );
                geomLabelsBlack[geomLabelsBlack.length-1].applyMatrix4(matrix);
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[0]=XTopLeft;            // x top left  0
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[1]=YTopLeft;   // y top left  1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[2]=XTopRight;        // x top right 1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[3]=YTopRight;   // y top left  1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[4]=XBottomLeft;            // x bottom left 0
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[5]=YBottomLeft;         // y bottom left 0
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[6]=XBottomRight;       // x bottom right 1
                geomLabelsBlack[geomLabelsBlack.length-1].attributes.uv.array[7]=YBottomRight;
	    }
	    
        }

	    
	let meshChart = new THREE.Mesh( mergeBufferGeometries( geomCube ), material );
        meshChart.name="Chart";
	this.scene.add( meshChart );
        meshChart.geometry.needsUpdate = true;
	material.name = "Chart Material";
        meshChart.material = material;
        meshChart.castShadow = true;
        meshChart.receiveShadow = true;

        //const box = new THREE.BoxHelper( meshChart, 0xffff00 );
        //this.scene.add( box );
	 
        // New isotope labels
        let meshLabelsBlack = new THREE.Mesh();
        if(geomLabelsBlack.length>0) {
            let material = new THREE.MeshStandardMaterial( { map: this.spriteSheetBlack, transparent: true });
            meshLabelsBlack.geometry = mergeBufferGeometries( geomLabelsBlack );
            meshLabelsBlack.material = material;
            meshLabelsBlack.geometry.needsUpdate = true;
            meshLabelsBlack.visible = true;
            material.dispose();
        }
        else {
            meshLabelsBlack.visible = false;
            meshLabelsBlack.geometry = new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 );
        }
        meshLabelsBlack.receiveShadow = true;
	meshLabelsBlack.name="Labels Black";
        this.scene.add(meshLabelsBlack);

	let meshLabelsWhite = new THREE.Mesh();;
        if(geomLabelsWhite.length>0) {
            let material = new THREE.MeshStandardMaterial( { map: this.spriteSheetWhite, transparent: true });
            meshLabelsWhite.geometry = mergeBufferGeometries( geomLabelsWhite );
            meshLabelsWhite.material = material;
            meshLabelsWhite.geometry.needsUpdate = true;
            meshLabelsWhite.visible = true;
            material.dispose();
        }
        else {
            meshLabelsWhite.visible = false;
            meshLabelsWhite.geometry = new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 );
        }
        meshLabelsWhite.receiveShadow = true;
	meshLabelsWhite.name="Labels White";
        this.scene.add(meshLabelsWhite);

        material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
	let meshPick = new THREE.Mesh();
        meshPick.geometry = mergeBufferGeometries( geomPick );
        meshPick.material = material;
        meshPick.geometry.needsUpdate = true;
        this.pickingScene.add(meshPick);

        // Sort out picking
	let highlightSize=this.size;
        if(document.getElementById("checkEvenEven").checked) {
            highlightSize*=2;
	}
        let geometry = new THREE.BoxBufferGeometry(highlightSize,highlightSize,highlightSize/4);
        material = new THREE.MeshPhongMaterial( { color: 0xffffff, opacity: 0.3, transparent: true, side: THREE.DoubleSide } );
	let meshHighlight = new THREE.Mesh();
	meshHighlight.name = "Highlight";
        meshHighlight.geometry = geometry;
        meshHighlight.material = material;
        meshHighlight.geometry.needsUpdate = true;
	this.scene.add(meshHighlight);
	
    }
    
    buildBase() {
	
	let property=gui.getCurrentProperty();
        let resolution=20;
	let width=(N_MAX-N_MIN)*resolution;
	let height=(Z_MAX-Z_MIN)*resolution;
	
        // Draw on the base canvas
	this.baseCanvas.width=width;
	this.baseCanvas.height=height;
	// Reset

        this.baseContext.clearRect(0,0,width,height);
        this.baseContext.lineWidth=2;
        

        
        let offset=0.5;
	let excess=5;
        if(document.getElementById("checkShowMagic")) {

            /* Fix the below! */
            for(var i=0; i<this.zmag.length; i++)
            {
                if(this.zmag[i]<Z_MIN|this.zmag[i]>Z_MAX) { continue; }
                if((this.zmag[i]<property.minZ[N_MIN]||this.zmag[i]>property.maxZ[N_MAX])&&(property.minZ[N_MIN]!=Z_MAX&&property.maxZ[N_MAX]!=Z_MIN)) { continue; }
                if(property.minN[this.zmag[i]]==N_MAX) { continue; }
                this.baseContext.beginPath();
                this.baseContext.moveTo(resolution*(Math.max(property.minN[this.zmag[i]],N_MIN)-offset-excess),height-resolution*(this.zmag[i]+offset));
                this.baseContext.lineTo(resolution*(Math.min(property.maxN[this.zmag[i]],N_MAX)+offset+excess),height-resolution*(this.zmag[i]+offset));
                this.baseContext.moveTo(resolution*(Math.max(property.minN[this.zmag[i]],N_MIN)-offset-excess),height-resolution*(this.zmag[i]-offset));
                this.baseContext.lineTo(resolution*(Math.min(property.maxN[this.zmag[i]],N_MAX)+offset+excess),height-resolution*(this.zmag[i]-offset));
                this.baseContext.stroke();
                this.baseContext.closePath();
            }
            
            for(var i=0; i<this.nmag.length; i++)
            {
                if(this.nmag[i]<N_MIN||this.nmag[i]>N_MAX) { continue; }
                if((this.nmag[i]<property.minN[Z_MIN]||this.nmag[i]>property.maxN[Z_MAX])&&(property.minN[Z_MIN]!=N_MAX&&property.maxN[Z_MAX]!=N_MIN)) { continue; }
                if(property.minZ[this.nmag[i]]==Z_MAX) { continue; }
                this.baseContext.beginPath();
                this.baseContext.moveTo(resolution*(this.nmag[i]-offset),height-resolution*(Math.max(property.minZ[this.nmag[i]],Z_MIN)-1*offset-excess));
                this.baseContext.lineTo(resolution*(this.nmag[i]-offset),height-resolution*(Math.min(property.maxZ[this.nmag[i]],Z_MAX)+1*offset+excess));
                this.baseContext.moveTo(resolution*(this.nmag[i]+offset),height-resolution*(Math.max(property.minZ[this.nmag[i]],Z_MIN)-1*offset-excess));
                this.baseContext.lineTo(resolution*(this.nmag[i]+offset),height-resolution*(Math.min(property.maxZ[this.nmag[i]],Z_MAX)+1*offset+excess));
                this.baseContext.stroke();
                this.baseContext.closePath();
            }
        }
	
	// Create the texture itself
        //let anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),2);
        let texture = new THREE.Texture();
        texture.image = this.baseCanvas;
	texture.needsUpdate = true;
        //texture.anisotropy = anisotropy;

        // Things to use
        let position = new THREE.Vector3();
        let rotation = new THREE.Euler();
        let matrix = new THREE.Matrix4();
        let scale = new THREE.Vector3(1.0,1.0,1.0);
        let quaternion = new THREE.Quaternion();
        
        // Create ground material
        let geometry = new THREE.PlaneBufferGeometry( (N_MAX-N_MIN)*this.size, (Z_MAX-Z_MIN)*this.size );
	console.log(geometry);
	position.x = (N_MAX+N_MIN)/2*this.size;
        position.y = 0.0;
	position.z = -(Z_MAX+Z_MIN)/2*this.size;
        rotation.x = -Math.PI/2;
        quaternion.setFromEuler( rotation, false );
        matrix.compose( position, quaternion, scale );
        geometry.applyMatrix4( matrix );
        
        // Create the material
	// Why should this be transparent?
        let material = new THREE.ShadowMaterial( { map: texture });
        material.opacity =  0.7;

	// Create the mesh
	let mesh = new THREE.Mesh( geometry, material );
        mesh.geometry = geometry;
        mesh.receiveShadow = true;
        mesh.material = material;
        mesh.needsUpdate = true;
	console.log(mesh);
	mesh.name="Base Plate";
	this.scene.add(mesh);
        
        // Dispose of anything we don't need
        geometry.dispose();
        material.dispose();
    }

    nuclideTop(Nuc) {
	let property=gui.getCurrentProperty();
        let code=property["code"];
	let dataMode=gui.getDataMode();
        let heightScale = parseFloat(document.getElementById("rangeHeightScale").value)*20; // This 20 is overall scale relative to size 
        let position = new THREE.Vector3();
	let minHeight=this.size/2;
        position.x = this.nuclideX(Nuc);
        position.z = this.nuclideY(Nuc);
        if(!property["isNumeric"]) {
            position.y = minHeight;    
        }
        else if(Nuc[dataMode]===null || Nuc[dataMode]===""||isNaN(Nuc[dataMode])) {
            position.y = minHeight*heightScale;
        }
        else {
            position.y = ((Nuc[dataMode]-property.userDataMin)/(property.userDataMax-property.userDataMin)) * this.size * heightScale;
        }
        if(isNaN(position.y)||position.y===undefined||position.y===null||position.y===""||position.y==-Infinity||position.y==0) { position.y=minHeight*heightScale; }
        position.y=position.y+minHeight;
        return position;
    }

    nuclideX(Nuc) {
        return Nuc.n*this.size;
    }

    nuclideY(Nuc) {
        return -Nuc.z*this.size;
    }

    saveChartCookies() {
        gui.addCookie("cameraRelativeX",(this.camera.position.x-this.controls.target.x).toString());
        gui.addCookie("cameraRelativeY",(this.camera.position.y-this.controls.target.y).toString());
        gui.addCookie("cameraRelativeZ",(this.camera.position.z-this.controls.target.z).toString());
        gui.addCookie("nCenter",this.controls.target.x.toString());
        gui.addCookie("targetY",this.controls.target.y.toString());
        gui.addCookie("zCenter",-this.controls.target.z.toString());
    }

    pick() {

        // Render the picking scene off-screen
	this.renderer.setRenderTarget(this.pickingTexture);
	this.renderer.render( this.pickingScene, this.camera );
	this.camera.clearViewOffset();

	// Create buffer for reading single pixel
	let pixelBuffer = new Uint8Array( 4 );

	//read the pixel under the mouse from the texture
	this.renderer.readRenderTargetPixels( this.pickingTexture, this.mouse.x, this.pickingTexture.height - this.mouse.y, 1, 1, pixelBuffer );

	// Interpret the pixel as an ID
        let id = ( pixelBuffer[ 0 ] << 16 ) | ( pixelBuffer[ 1 ] << 8 ) | ( pixelBuffer[ 2 ] );
        let data = this.pickingData[ id ];

	let meshHighlight = this.scene.getObjectByName("Highlight");
	if ( data && id!=0) {

		// Move our MeshHighlight so that it surrounds the picked object
		if ( data.position && data.rotation && data.scale ){

		    meshHighlight.position.copy( data.position );
		    meshHighlight.position.y = meshHighlight.position.y+this.size/4;
		    meshHighlight.rotation.copy( data.rotation );
		    meshHighlight.visible = true;
		}
	}
	else {
		meshHighlight.visible = false;
	}
        return id;
    }

    select() {
        let id=this.pick();
        let i=this.indexMap[id];
        let t=0;
        let property=gui.getCurrentProperty();
        let Nuc=data.table[property.code][t];
	gui.showNuclide(Nuc[i].z,Nuc[i].n);
    }

    saveGLTF() {
        let exporter = new GLTFExporter();
	let objectNames = [ "Directional Light", "Ambient Light", "Ground Plane", "Chart", "Labels Black", "Labels White" ];
	let objects = [ this.camera ];
	for(let i=0; i<objectNames.length; i++) {
            objects.push(this.scene.getObjectByName(objectNames[i]));
	}
        let options={ onlyVisible: false };
        // Parse the input and generate the glTF output
        exporter.parse(objects, function ( result ) {
            if (result instanceof ArrayBuffer ) {
                chart.saveArrayBuffer( result, 'scene.glb' );
            }
	    else {
                let output = JSON.stringify( result, null, 2 );
                chart.saveString( output, "chart3d_"+chart.filename()+".gltf" );
            }
        }, options );
    }

    saveObject( blob, filename ) {
        let link = document.createElement( 'a' );
        link.style.display = 'none';
        document.body.appendChild( link );
        link.href = URL.createObjectURL( blob );
    	link.download = filename;
    	link.click();
    }
    
    saveString( text, filename ) {
        this.saveObject( new Blob( [ text ], { type: 'text/plain' } ), filename );
    }
    
    saveArrayBuffer( buffer, filename ) {
    	this.saveObject( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
    }

    savePNG() {
	// The process here is to generate two dataurls and then write
	// them to a new canvas, then save that canvas.
	this.draw();
	// First do threejs scene
	let threejsDataURL = this.renderer.domElement.toDataURL('image/png');    
        let theejsBlob = dataURItoBlob(threejsDataURL);
	let image = document.createElement("img");
	image.id="save1";
	image.style.display="none";
	document.body.appendChild(image);
	image.width=window.innerWidth;
	image.height=window.innerHeight;
	// Load
	image.onload=function() {
	    // Now do key
	    let keyDataURL = chart.keyCanvas.toDataURL('image/png');       
            let keyBlob = dataURItoBlob(keyDataURL);
	    let image = document.createElement("img");
	    image.id="save2";
	    image.style.display="none";
	    document.body.appendChild(image);
	    image.width=window.innerWidth;
	    image.height=window.innerHeight;
	    // Load
	    image.onload=function() {
                // Now write on save canvas
	        let saveCanvas=document.createElement("canvas");
	        let saveContext=saveCanvas.getContext("2d");
	        saveCanvas.id="savecanvas";
                saveCanvas.width = window.innerWidth;
                saveCanvas.height = window.innerHeight;
	        saveContext.drawImage(document.getElementById("save1"),0,0);
                if(document.getElementById("checkKey").checked==true) {
	            saveContext.drawImage(document.getElementById("save2"),0,0);
	        }
                // Do the save
                let pngDataURL = saveCanvas.toDataURL('image/png');    
                let blob=dataURItoBlob(pngDataURL);
                let a=document.createElement("a");
                document.body.appendChild(a);
                a.style="display: none";
                let url=window.URL.createObjectURL(blob); 
                a.href=url;
                a.download="chart3d_"+chart.filename()+".png";
                a.click();
                window.URL.revokeObjectURL(url);
	    }
	    image.src=keyDataURL;
	}
	image.src=threejsDataURL;
    }
    
}

// Work around modules for now.
window.ChartThreejs=ChartThreejs;
