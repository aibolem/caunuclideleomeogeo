var stream;
var recorder;
var recordedChunks = [];

function StartVideo(fps=60) {
    recordedChunks = [];
    
    stream = renderer.domElement.captureStream(fps);    
    var options;
    var bits=document.getElementById("rangeVideoBitrate").value;
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
		options = {mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond: bits};
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
       options = {mimeType: 'video/webm; codecs=vp8', videoBitsPerSecond: bits};
    }
    recorder = new MediaRecorder(stream, options);
    recorder.ondataavailable = handleDataAvailable;
    recorder.start();
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    } else {
        return;
    }
}

function StopVideo() {
    recorder.stop();
}

function SaveVideo() {
    var blob = new Blob(recordedChunks, { type: 'video/webm' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'chart3d.webm';
    a.click();
    window.URL.revokeObjectURL(url);
}

function CheckVideoCommands() {
    // Get some elements
    var video = document.getElementById("textareaVideo");
    var number = document.getElementById("textareaVideoLineNumber");
    var error = document.getElementById("textareaVideoError");
    // Get the lines
    var lines = video.value.split('\n');
    // Write the line numbers
    number.value="";
    for(var i=0; i<lines.length; i++) { number.value+=parseInt(i+1)+"\n";}
    // Now check lines and write errors
    error.value="";
    for(var i=0; i<lines.length; i++) {
        error.value+=ValidVideoLine(lines[i])+"\n";
    }
    // Set the scrolls
    $('#textareaVideoLineNumber').scrollTop($("#textareaVideo").scrollTop());
    $('#textareaVideoError').scrollTop($("#textareaVideo").scrollTop());
}

function ValidVideoLine(line) {
	var args=line.split(/[\s,]+/);
	if(args[0]=="") { return ""; }
    else if(args[0]=="kf") {
        if(args.length==2 && isNumber(args[1])) { return "OK"; }
		else { return "Argument error"; }
	}
	else if(args[0]=="targ"||args[0]=="pos") {
		console.log(args);
        if(args.length==4 && isNumber(args[1]) && isNumber(args[2]) && isNumber(args[3])) { return "OK"; }
		else { return "Argument error"; }
	}
	return "Keyword error";
}

function VideoUseView() {
	var video = document.getElementById("textareaVideo");
	video.value+=document.getElementById("divCameraPosition").innerHTML+"\n";
	video.value+=document.getElementById("divCameraTarget").innerHTML+"\n";
	CheckVideoCommands();
}

function VideoAddKeyframe() {
	var video = document.getElementById("textareaVideo");
	video.value+="kf 3.0\n";
    CheckVideoCommands();
}

function PreviewKeyframes() {
	var video = document.getElementById("textareaVideo");
    var lines = video.value.split('\n');
	for(var i=0; i<lines.length; i++) {
		if(ValidVideoLine(lines[i])=="OK") {
            var args=lines[i].split(/[\s,]+/);
            if(args[0]=="pos")  { px=parseFloat(args[1]); py=parseFloat(args[2]); pz=parseFloat(args[3]); }
            else if(args[0]=="targ") { tx=parseFloat(args[1]); ty=parseFloat(args[2]); tz=parseFloat(args[3]); }
			else if(args[0]=="kf") {
                camera.position.set(px,py,pz);
                controls.target.set(tx,ty,tz);
				controls.update();
             	setTimeout("render()",100);
				alert("Keyframe (line "+i+") ");
			}
		}
	}
}


var dpx=[];
var dpy=[];
var dpz=[];
var dtx=[];
var dty=[];
var dtz=[];

var fps=25.0;

function MakeVideo(Preview) {

    // Set the resolution
	var v=document.getElementById("divRes").elements["radioRes"].value;
	var w=v.split("x")[0];
	var h=v.split("x")[1];
	if(w!=0&&h!=0) {
        chart3dResize(w,h);
	}
	
	// Keyframes
	dpx=[];
	dpy=[];
	dpz=[];
	dtx=[];
	dty=[];
	dtz=[];
	var video = document.getElementById("textareaVideo");
        var lines = video.value.split('\n');
	// Identify the key frames
	var keyframes = [];
	for(var i=0; i<lines.length; i++) {
		if(ValidVideoLine(lines[i])=="OK") {
            var args=lines[i].split(/[\s,]+/);
            if(args[0]=="kf") { keyframes.push(i); }
		}
	}
    // Start video
    StartVideo(0);

    // Get keyframe values
	var px=[],py=[],pz=[],tx=[],ty=[],tz=[];
	var t=[];
	var firstkf=true;
    for(var i=0; i<lines.length; i++) {
        var args=lines[i].split(/[\s,]+/);
        if(args[0]=="pos") {
			px.push(parseFloat(args[1]));
			py.push(parseFloat(args[2]));
			pz.push(parseFloat(args[3]));
		}
        else if(args[0]=="targ") {
			tx.push(parseFloat(args[1]));
			ty.push(parseFloat(args[2]));
			tz.push(parseFloat(args[3]));
		}
		else if(args[0]=="kf" && firstkf) {
			firstkf=false;
			t.push(0);
		}
		else if (args[0]=="kf" && !firstkf) {
            t.push(parseFloat(args[1]));
            t[t.length-1] += t[t.length-2];
		}
	}

    for(var j=1; j<keyframes.length; j++) {
        var args=lines[keyframes[j]].split(/[\s,]+/);
		var n=args[1]*fps;
		for(var k=0; k<n; k++) {
			var tcurrent=(t[j-1]+(t[j]-t[j-1])*parseFloat(k)/n)/t[t.length-1];
            dpx.push(TWEEN.Interpolation.CatmullRom(px,tcurrent));
            dpy.push(TWEEN.Interpolation.CatmullRom(py,tcurrent));
            dpz.push(TWEEN.Interpolation.CatmullRom(pz,tcurrent));
            dtx.push(TWEEN.Interpolation.CatmullRom(tx,tcurrent));
            dty.push(TWEEN.Interpolation.CatmullRom(ty,tcurrent));
            dtz.push(TWEEN.Interpolation.CatmullRom(tz,tcurrent));
		}
	}
	
    
    renderer.domElement.removeEventListener( 'mousemove', onMouseMove );
    RenderFrame(0,Preview);
}

    function RenderFrame(k,Preview) {
	if(k==dpx.length) {
		StopVideo();
                if(!Preview) { setTimeout("SaveVideo()",1000); }
                renderer.domElement.addEventListener('mousemove',onMouseMove);
		chart3dResize();
		return;
	}
	// Set and render
        camera.position.set(dpx[k],dpy[k],dpz[k]);
        controls.target.set(dtx[k],dty[k],dtz[k]);
	controls.update();
	renderer.setRenderTarget( null );
	renderer.render( scene, camera );
	var l=recordedChunks.length;
	console.log(stream);	
        if(stream instanceof CanvasCaptureMediaStreamTrack) { stream.requestFrame(); }
        else { stream.getTracks()[0].requestFrame(); }
	stream.getTracks()[0].requestFrame();
	console.log("Frame ",k,recordedChunks.length,dpx.length);
	setTimeout(RenderFrame,33.3,k+1,Preview);
}

function isNumber(n) { return !isNaN(parseInt(n)) && !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function TweenTest() {
	var x=[0,1,2];
	var y=[0,1,4];
	for(var i=0; i<11; i++) {
		z=TWEEN.Interpolation.CatmullRom(y,i*0.1);
        console.log("TWEEN ",i*0.1,z);
	}
}
