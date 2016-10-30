//обработка событий

function eventHandle (canvId){

	

 gl.go = false;



var canvas = document.getElementById(canvId);

var longCanv = parseFloat(getComputedStyle(canvas).width);

var widthConst = 6;
// старый рейтинг в долях
var oldRaiting  = 0.5;
//перевод старого рейтинга в скрол
var oldNum = oldRaiting*widthConst-(widthConst/2);

var numGlobalClick = 3;
// округленное значение рейтинга;
//var numFloor;

var obj ={};

obj.numFloor = 0;


//console.log("width "+ longCanv);

	canvas.addEventListener("mouseover", mouseOnCanvas);
	canvas.addEventListener("mouseout", mouseOutFromCanvas);
	canvas.addEventListener("mousemove", mouseMoveOnCanvas.bind(null,obj));
	canvas.addEventListener("click", mouseClickOnCanvas.bind(null, obj, numGlobalClick, oldNum,  canvas, mouseOnCanvas, mouseOutFromCanvas, mouseMoveOnCanvas ));
	
	function mouseOnCanvas(  e){
	  
	  gl.go = true;
	
	  tick();
	}
	
	function mouseOutFromCanvas( e){
	 //  setTimeout(function(){
	    gl.go = false;
		
	   gl.vertexAttrib2f(shaderProgram.CursorMouseX, -3.0, -3.0);
	   drawScene();
	   
	  // }, 500);
	   
	}
	
	function mouseMoveOnCanvas( obj, e){
	
	var mouseCoord = e.pageX - canvas.offsetLeft;
	
	var num = parseFloat((parseFloat(mouseCoord)/longCanv*widthConst)-(widthConst/2));
	//numFloor;
	switch(true){
				case num < -3.0:
				obj.numFloor = -3.0;
				break;
				case num < -2.0:
				obj.numFloor = -2.0;
				break;
				case num < -0.5:
				obj.numFloor = -0.5;
				break;
				case num < 0.5:
				obj.numFloor = 0.5;
				break;
				case num < 1.5:
				obj.numFloor = 1.5;
				break;
				case num < 3.0:
				obj.numFloor = 3.0;
				break;
				default:
				num = 1;
			}
	
	//console.log(mouseCoord);
	
	gl.vertexAttrib2f(shaderProgram.CursorMouseX, num, 1.0);
	gl.vertexAttrib3f(shaderProgram.CursorMouseX, num, 1.0, obj.numFloor);
	}
	
    function mouseClickOnCanvas(obj, numGlobalClick, oldNum,   canvas, mouseOnCanvas, mouseOutFromCanvas, mouseMoveOnCanvas, e){
	  gl.go = false;
	  console.log(obj.numFloor);
	   	var dole = 1/numGlobalClick*oldNum;
			
	   var newReit = oldNum - dole + 1/numGlobalClick*obj.numFloor;
	   
	   
	gl.vertexAttrib3f(shaderProgram.CursorMouseX, newReit, 0.0, 0.0);
    //gl.vertexAttrib3f(shaderProgram.starsColor, 1.0, 0.2, 0.0);	
	canvas.removeEventListener("mouseover", mouseOnCanvas);
	canvas.removeEventListener("mouseout", mouseOutFromCanvas);
	canvas.removeEventListener("mousemove", mouseMoveOnCanvas);
	 drawScene();
	    
	}
}	