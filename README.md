*************************************************************
*********** BASES DE DATOS NO CONVENCIONALES ****************
*************************************************************

** Autores: Javier LLorente Mañas y Carlos Sánchez Vega
** Fuente de datos: se ha partido de la fuente de datos completa
** Objetivo: esta primera parte consta de dos ficheros python:

	- parseXMLToJSON.py: tiene como objetivo parsear un xml de entrada, generando dos documentos JSON con el formato adecuado
			     (uno para publicaciones y otro para autores) .
	- insertRecords.py: tiene como objetivo leer los json generados tras la ejecución del fichero anterior (parseXMLToJSON.py) 
			     para insertarlos en la base de datos Mongo
** Requisitos: 

	- tener instalada la ibrería lxml de python.
	- tener instalado pymongo en python.
	- tener el fichero dblp en el mismo directorio que el fichero xml de entrada (dblp.xml).
	- poner el fichero xml de entrada en la ruta correspondiente (mirar el apartado siguiente)

** Ruta de los ficheros de entrada y salida:
    -	xml_input_path = "./FicherosBBDD/XML/dblp.xml"
    - 	xml_output_path_publications = "./FicherosBBDD/JSON/publications.json"
    -	xml_output_path_authors = "./FicherosBBDD/JSON/authors.json"



	(Por tanto, el árbol de directorios que se tenía en local es el siguiente):
		FicherosBBDD
			|
			|-- XML---> dblp.xml y dblp.dtd
			|
			|-- JSON 

** NOTA: tal y como se ha facilitado el proyecto, se podría ejecutar sin necesidad de crear el árbol de directorios
