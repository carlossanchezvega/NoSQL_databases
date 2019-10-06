/* creamos dos índices, uno para las publicaciones de los autores y otro para los autores de las publicaciones */
db.authors.createIndex({“publications”:1})
db.pulications.createIndex({“authors”:1})

/*1. Listado de todas las publicaciones de un autor determinado.*/
var sanjeev= db.authors.findOne({name: "Sanjeev Saxena"});
db.publications.find({_id: {$in: sanjeev.publications}})

/* 2) Número de publicaciones de un autor determinado.*/
db.authors.aggregate([
    { $match: { name: "Sanjeev Saxena" } },
    {$project: {"_id": 0, count: { $size:"$publications" }}}
   ])
 
/* 3) Número de artículos en revista para el año 2017.*/
    db.publications.aggregate([
                   { 
                     /* seleccionamos los tipos de campos que nos interesan */  
                     $match: {
                          $and: [ 
                              {type: "article"}, 
                              {year: "1997"}
                          ]
                     }
                   }, 
                   /* contamos los campos filtrados */
                   {
                        $count: "number_of_articles_2017"
                   }
                  ])
 
/* 4) Número de autores ocasionales, es decir, que tengan menos de 5 publicaciones en total. */                  
/* primera forma de obtener la query con js */ 
db.authors.find( {publications : {$exists:true}, $where:'this.publications.length<5'} )
                   
/* segunda forma de calcular la query (con concultas nativas de Mongo*/                   
db.publications.aggregate([

    /* se guarda el id para futuras consultas */
    {$project: {'authors': 1}},
    
    /* para cada uno de los autores*/     
    {$unwind : '$authors' },
    
    /* para cada uno de esos autores, se calcula el conteo total de publicaciones*/
    {$group: {_id: '$authors', total_publicaciones : { $sum : 1 }}},
    
    /* del calculo se seleccionan solo las que el conteo sea menor que 5 publicaciones */    
    {$match:{'total_publicaciones': {'$lt': 5}}}
    ,
   
    /* se cuenta el numero de autores */   
    {$count: "numero_autores_ocasionales"}
    ]
) 
    

/*5. Número de artículos de revista (article) y número de artículos en congresos
(inproceedings) de los diez autores con más publicaciones totales.*/
db.publications.aggregate([
    /* para cada uno de los autores */
    {$unwind: "$authors"}, 
    
    /* se realizan las siguientes acciones */
    {$group: {
         '_id': '$authors',
        
         /* se suman todas las publicaciones */
         count_total: {$sum:1},
         
         /* se suman las publicaciones de tipo articulo */
         numero_articulos: {
             /* se realiza la operacion de suma */
                $sum: { 
                        
                        /* dependiendo de la siguiente condicion (tipo de publicacion "articulo")*/
                        $cond :  [
                                    /* si el tipo de publicacion es de articulo se suma, sino no  */
                                    {$eq : ["$type", "article"]}, 1, 0]
                      } 
          }, 
          
         /* se suman las publicaciones de tipo "inproceedings" */ 
         numero_inproceedings: {
             /* se realiza la operacion de suma */
                $sum: { 
                        
                        /* dependiendo de la siguiente condicion (tipo de publicacion) "inproceedings" */
                        $cond :  [
                                    /* si el tipo de publicacion es de articulo se suma, sino no  */
                                    {$eq : ["$type", "inproceedings"]}, 1, 0]
                      } 
                  }                                                             
                  }},
        /* se ordena de mayor a menor */
        {$sort: 
            {count_total: -1}
        },
        
        /* se toman los 10 primeros */
        {$limit: 10}
    ])
   
       
/*6. Número medio de autores de todas las publicaciones que tenga en su conjunto de datos.*/ 
  db.publications.aggregate([
  /* puede haber publicaciones que no tengan autores */
   {'$match':                                         
     {'authors': {'$exists': true}}
   },
   
   /* se guarda la variable para futuras consultas */
   {'$project': 
       {'numero_de_autores': { '$size': '$authors' }}
   },
        
   /* se calcula el porcentaje */
   {'$group':
       {
           _id: 0,
           
            /* se calcula la media del numero de autores (operacion anterior) */
           'avg_autores': {'$avg': '$numero_de_autores'}
       }
   }
   ,
   /* solo queremos el campo del porcentaje */
    {$project: {'_id': 0, 'avg_autores': 1}},
  
])
     

/*7. Listado de coautores de un autor (Se denomina coautor a cualquier persona que haya
firmado una publicación). */
/*entiendo que se refiere a los coautores de una publicacion concreta
por ejemplo la del titulo ""Parallel Integer Sorting and Simulation Amongst CRCW Models."*/
   
var publication =  db.publications.findOne({title:"Parallel Integer Sorting and Simulation Amongst CRCW Models."});
db.authors.find ({_id:{$in:publication.authors}})


/*8.  Edad de los 5 autores con un periodo de publicaciones más largo (Se considera la Edad
de un autor al número de años transcurridos desde la fecha de su primera publicación
hasta la última registrada).*/

db.publications.aggregate([
    /*selecciono las partes del documento que me seran utiles para consultas posteriores */
    {$project: {'authors': 1, 'year': 1}},
    
    /* para cada uno de los autores de una publicacion*/
    {$unwind : '$authors' },
    
    /* reagrupo y para cada uno obtengo*/
    {$group: 
        
        {_id: '$authors', 
         ultimaFecha: { $max: '$year' }, 
         primeraFecha: { $min: '$year' } 
         }
    }, 
    
    /* se almacena la diferencia de años entre las publicaciones */
    {$project: 
        /*{diferenciaAnios: {$subtract: ['$ultimaFecha', '$primeraFecha']}}*/
        {diferenciaAnios: {$subtract: ['$ultimaFecha', '$primeraFecha']}}
    }, 
    
    /* se ordenan los documentos en orden descendente */
    { $sort: { 'diferenciaAnios': -1} },

    /* se toman los cinco primeros */
    { $limit : 5 },                 
    ])
    
    
    
/*9. Número de autores novatos, es decir, que tengan una Edad menor de 5 años. Se
considera la Edad de un autor al número de años transcurridos desde la fecha de su
primera publicación hasta la última registrada*/

db.publications.aggregate([
    /*selecciono las partes del documento que me seran utiles para consultas posteriores */
    {$project: {'authors': 1, 'year': 1}},
    
    /* para cada uno de los autores de una publicacion*/
    {$unwind : '$authors' },
    
    /* reagrupo y para cada uno obtengo*/
    {$group: 
        
        {_id: '$authors', 
         ultimaFecha: { $max: '$year' }, 
         primeraFecha: { $min: '$year' } 
         }
    }, 
    
    /* se almacena la diferencia de años entre las publicaciones */
    {$project: 
        /*{diferenciaAnios: {$subtract: ['$ultimaFecha', '$primeraFecha']}}*/
        {diferenciaAnios: {$subtract: ['$ultimaFecha', '$primeraFecha']}}
    }, 
    
    /* de los anteriores, se seleccionan aquellos cuya diferencia de años sea menor de cinco */
    {$match:{'diferenciaAnios': {'$lt': 5}}}
    ,
   
    /* se cuentan respecto a los que quedan del paso anterior */
    {$count: "numero_autores_novatos"}
    ])
    
    
/* 10. Porcentaje de publicaciones en revistas con respecto al total de publicaciones. */
db.publications.aggregate([
    /*selecciono las partes del documento que me seran utiles para consultas posteriores */
    
    {$project: {'type': 1}},   
    /* para cada uno de los autores de una publicacion*/
    {$unwind : '$type' },
    {$group: 
        { 
            /* se pone el _id a nulo para que sume todas las publicaciones*/
            /* independientemente del tipo */
            _id: null,
            
            /* se guarda un contador parcial para los articulos */
            numero_articulos: {
                /* se realiza la operacion de suma */
                $sum: { 
                        /* dependiendo de la siguiente condicion */
                        $cond :  [
                                    /* si el tipo de publicacion es de articulo se suma, sino no  */
                                    {$eq : ["$type", "article"]}, 1, 0]
                      } 
            }, 
            /* se guarda en la variable el numero de publicaciones en total */
            numero_publicaciones: { $sum: 1 }                                           
        } 
    }

    ,
    { $project: {_id:0,
                "porcentaje": {
                    /* usamos este operador para concatenar al resultado el signo del % */
                    "$concat": [{
                                    /* usamos este operador para sacar solo los dos primeros decimales */    
                                "$substr": [ { 
                                    /* El resultado de la division, lo multiplicare por 100 para ponerlo en "formato" porcentaje" */
                                        "$multiply": [ { "$divide": [ "$numero_articulos", "$numero_publicaciones"] }, 100 ] },
                                            0,2 ] },
                                "", "%" 
                               ]}
            }
       
        } 
    ])
    