(function(){
	
function loadObjModel(modelURL, callb){
   
   fetch(modelURL)
   .then(function(response) {
     console.log(response.headers.get('Content-Type')); // application/json; charset=utf-8
     console.log(response.status); // 200
	 //console.dir(response);
    return response.text();
   })
   .then(function(text) {
     //console.log(text); 
	
	 
	return  OBJparser(text);
	 
   })
   
   .then(function(mod) {
     console.log(mod); 
	 
	 
	 callb(mod);
	 
   })
  .catch(function(err){
    console.log("произошла ошибка при загрузке модели - "+modelURL);
    console.dir(err);
  });

}


function OBJparser(str){

//найти совпадение v после ктоорой пробел после которого любые 25 или больше символов

var regexpVertices = /v\s.{25,}/g;
var regexpFaces = /f\s.{12,}/g;



function parseModel(regexp, type, num){
var num = num || 0;

console.log('начало разбора модели');
var atributes = [];

var atributesArr = str.match(regexp);

var typeAt = type;

//var splConcat = [];
    //перебор групп по три значения
	for(var i=0; i<atributesArr.length; i++){
		
	
	 var splConcat = []; 
	 var  split = atributesArr[i].split(" "); 
	 	 
     split.shift();

	 
	 //console.dir(typeAt);
	 
     if(typeAt=='f'){
	 
	   // перебор каждого значения в 1/2/2
	   for(var j=0; j<split.length; j++ ){
	    
	   var vert = split[j].split('/');
	  
	   split[j] = Number(vert[num])-1;
	  
	   
	   atributes.push(split[j]);
	    
	   }

	 }else{
		
		split.forEach(function(item){atributes.push(Number(item));});
	 }
	}
	return atributes;
}
var Model = { vertices: parseModel(regexpVertices, "v"),
              facesV: parseModel(regexpFaces, "f"),
              facesT: parseModel(regexpFaces, "f", 1)			  
             }
			 
//Model.facesV.map(function(item, index){
	
	
});			 
//console.dir(parseModel(regexpVertices, "v"));

console.dir(Model);
return Model;

}	
	
window.loadObjModel = loadObjModel;	
	
})();