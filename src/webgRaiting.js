var gl;
var shaderProgram;

var glCanvArr = ["canvasStars"];
 
 
     function initShaders(canvId) {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);
		// переменная  цвет звезд от -3(все серые) до 3 (цветные)
		shaderProgram.CursorMouseX = gl.getAttribLocation(shaderProgram, "CursorMouseX");
		 gl.vertexAttrib3f(shaderProgram.CursorMouseX, 0.0, 1.0, -3.0);
		 
		 // цвет звезд
		 
		 var colorS = document.getElementById(canvId).getAttribute('data-stars-color').split("/");
		 shaderProgram.starsColor = gl.getAttribLocation(shaderProgram, "starsColor");
		 gl.vertexAttrib3f(shaderProgram.starsColor, parseFloat(colorS[0]), parseFloat(colorS[1]), parseFloat(colorS[2]));
        // получаем ссылку на атрибут-вектор позиции вершин
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		
		 shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		
		shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
		shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
        shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
    }
	
	
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

	
	function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		//console.dir(mvMatrix);
		
		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    }
	//перевод градусов в радианы
	  function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
	
	
	var triangleVertexPositionBuffer;
	var cubeVertexIndexBuffer;
	var cubeVertexNormalBuffer;
	
	
	
	function initBuffers(obj) {
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        /*var vertices = [
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];*/
		var vertices = obj.star.vertices;
		
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3; 
        triangleVertexPositionBuffer.numItems =obj.star.vertices.length/3;
		
		
    cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    var vertexNormals = obj.star.vertexNormals;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = obj.star.vertexNormals.length/3;
		
		
		
		
		
		
		    cubeVertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
			
            var cubeVertexIndices = obj.star.indices;
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
            cubeVertexIndexBuffer.itemSize = 1;
            cubeVertexIndexBuffer.numItems = obj.star.indices.length;
    }
	
	var rCube = 0; // поворот куба
	
	    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
       
        mat4.identity(mvMatrix);
        
      
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
          gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
	///////////свет  и  нормали	
        gl.uniform1i(shaderProgram.useLightingUniform, true);
		
       
            gl.uniform3f(
                shaderProgram.ambientColorUniform,
                parseFloat(0.2),
                parseFloat(0.2),
                parseFloat(0.2)
            );
			
	var lightingDirection = [
        parseFloat(-0.25),
        parseFloat(-0.25),
        parseFloat(-1)
      ];
      var adjustedLD = vec3.create();
      vec3.normalize(lightingDirection, adjustedLD);
      vec3.scale(adjustedLD, -1);
      gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);	
		
	   gl.uniform3f(
                shaderProgram.directionalColorUniform,
                parseFloat(0.8),
                parseFloat(0.8),
                parseFloat(0.8)
            );
        
		
		// рендер звезд
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		
		mat4.translate(mvMatrix, [-5.0, 0.0, -3.0]);
		// код вращения 
		mvPushMatrix();
        mat4.rotate(mvMatrix, degToRad(rCube), [0, 0, 1]);
		//------
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
      //  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
		mvPopMatrix();//возвращаем предыдущее состояние для матрици вращения
		//рисуем вторую звезду
		for(var i=0; i<4; i++){
		
		mat4.translate(mvMatrix, [2.5, 0.0, 0.0]);
		mvPushMatrix();
        mat4.rotate(mvMatrix, degToRad(rCube), [0, 0, 1]);
		
	    setMatrixUniforms();
       
		gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		mvPopMatrix();
		}

    }
	
	var lastTime = 0;

    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

           
           // rCube -= (75 * elapsed) / 1000.0;
		  // console.log(elapsed);
		   rCube -= (75 * 12) / 1000.0;
        }
        lastTime = timeNow;
    }
	
	 function tick() {
	    
		if(gl.go){
			
		
        drawScene();
        animate();
		return requestAnimFrame(tick);
	 }

    }
	
	    function webGLStart(obj, canvId) {
        var canvas = document.getElementById(canvId);
         gl = initGL(canvas);
        initShaders(canvId);
        initBuffers(obj);
        var colorS = document.getElementById(canvId).getAttribute('data-fone-color').split("/");
        gl.clearColor(parseFloat(colorS[0]), parseFloat(colorS[1]), parseFloat(colorS[2]), 1.0);
        gl.enable(gl.DEPTH_TEST);

       drawScene();
	  // tick();
    }
	

function test(obj){

 // console.dir(obj);
 glCanvArr.forEach(function(canvId){
	 webGLStart(obj, canvId);
	 eventHandle (canvId);
 });
  
}

window.onload = function(){
    OBJ.downloadMeshes({
    'star': 'models/estrellica-min-litle.obj' // located in the models folder on the server

  }, test);
}
	
	//webGLStart();
