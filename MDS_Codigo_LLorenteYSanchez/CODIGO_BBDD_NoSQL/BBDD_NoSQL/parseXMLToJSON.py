import time
from lxml import etree
from bson import ObjectId
import json

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

""""
we have created a dictionnary in order to store the features from each author.
 Say we have the next dictionnary correspondi   ng to one of the authors:
 "Hans Ulrich Simon": {
    "_id": "5ad369fc8726e36f64367cfe",
    "name": "Hans Ulrich Simon",
    "publications": [
        "5ad369fc8726e36f64367cfd"
    ]
 }
 As we can see, we have the name of the author as the key of a dictionnary and then, we have another one embedded.
 It is the content what we do want to output in a file """
def get_nice_nice_structure_authors (author_publications_dict):
    authors = []
    for key in author_publications_dict:
        authors.append(author_publications_dict[key])
    return authors


# Dumps the content from "dic" to the path of "json_path"
def create_output_file(json_path, dic):
    with open(json_path, 'w') as outfile:
        json.dump(dic, outfile, cls=JSONEncoder, indent=4)


# Parses a xml file to a json one
def parse_publications(xml_input_path, json_output_path_publications, json_output_path_authors):

    valid_publications = {'article', 'inproceedings', 'incollection' }
    not_valid_tags = {'dblp'}

    """
    It is necessary to load the dtd file. Otherwise, when trying to parse text containing special characters,
    such as the text "Arnold Sch&ouml;nhage", an execution is thrown
    """
    context = etree.iterparse(source = xml_input_path, events=("start", "end"),dtd_validation=True, load_dtd=True)

    # we initialize the variables to store the content of our input file
    publications_dict = {}
    publications = []
    author_publications_dict = {}
    for action, elem in context:

            # It is the openning tag
            if elem.tag not in not_valid_tags:
                if action =='start':
                    if len(elem):
                        text = "None"
                        # If the tag does not have any attribute, it means it is the root node
                        # we create an id for that publication
                        id_publication  = ObjectId()
                        publications_dict["_id"] = id_publication

                        # it the publication has not been stored yet, we have to initialize its list of authors
                        nodo_authors = []
                    else:
                        # If the author existed previously in the dictionnary
                        text = elem.text

                    ########## code snippet corresponding to the list of publications by an author
                    # Each publication may have several authors
                    if elem.tag == "author":
                        if elem.text in author_publications_dict:

                                # we add the publication to the list of its publications
                                # we create a dictionnay in order to store the features from each author (the key is
                                # the name)
                                author_publications_dict[elem.text]["publications"].append(id_publication)

                                # we get the associated id to be included to the list of author of a publication
                                id_author = author_publications_dict[elem.text]["_id"]
                        else:
                            # if the author did not exist previously, we have to create the structure to store it in the list
                            # of publications from that author
                            id_author = ObjectId()
                            nodo_publications ={}
                            nodo_publications["_id"] = id_author
                            nodo_publications["name"] = elem.text
                            nodo_publications["publications"] = []
                            nodo_publications["publications"].append(id_publication)
                            author_publications_dict[elem.text] =  nodo_publications

                        # we add that authot to the list of author of a publication
                        nodo_authors.append(id_author)

                    else:
                        # In case of a publication tag, we get the type
                        if elem.tag in valid_publications:
                            publications_dict["type"] = elem.tag
                        # if we find a digit, we need to convert it to integer as we have to do some arithmetic operations
                        # in our queries
                        elif elem.text.isdigit():
                            publications_dict[elem.tag] = int(text)
                        else:
                            publications_dict[elem.tag] = text


                # if it is the closing tag of a publication
                if elem.tag in valid_publications and action =='end':
                    publications_dict["authors"] = nodo_authors
                    publications.append(publications_dict)
                    publications_dict = {}

    create_output_file(json_output_path_publications, publications)
    authors = get_nice_nice_structure_authors(author_publications_dict)
    create_output_file(json_output_path_authors, authors)
    return publications


if __name__ == "__main__":
    xml_input_path = "./FicherosBBDD/XML/dblp.xml"
    xml_output_path_publications = "./FicherosBBDD/JSON/publications.json"
    xml_output_path_authors = "./FicherosBBDD/JSON/authors.json"

    start_time = time.time()
    parse_publications(xml_input_path, xml_output_path_publications,xml_output_path_authors )
    print("The execution took: {0:0.2f} seconds".format(time.time() - start_time))