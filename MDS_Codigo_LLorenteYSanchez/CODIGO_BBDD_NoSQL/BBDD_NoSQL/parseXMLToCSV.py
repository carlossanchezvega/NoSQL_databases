import time
from lxml import etree
import csv

# Parses a xml file to a csv one
def parsePublications(xmlFile,csv_output_path):

    valid_publications = {'article', 'inproceedings', 'incollection' }
    not_valid_tags = {'dblp'}

    header_publications = [ "type", "title", "pages","year", "url", "author"]
    valid_fields_publications =  [ "article", "inproceedings", "incollection", "title", "pages","year", "url", "author"]

    """
    It is necessary to load the dtd file. Otherwise, when trying to parse text containing special characters,
    such as the text "Arnold Sch&ouml;nhage", an execution is thrown
    """
    context = etree.iterparse(source = xmlFile, events=("start", "end"),dtd_validation=True, load_dtd=True)

    # we initialize the variables to store the content of our input file
    publications_dict = {}
    with open(csv_output_path,'w') as f:
        writer_to_csv = csv.DictWriter(f, fieldnames = header_publications)
        writer_to_csv.writeheader()
        for action, elem in context:

                # It is the openning tag
                if elem.tag not in not_valid_tags:
                    if action =='start':
                        if elem.text:
                            text = elem.text
                        ########## code snippet corresponding to the list of publications by an author
                        # Each publication may have several authors
                        if elem.tag in valid_fields_publications:
                            # In case of a publication tag, we get the type
                            if elem.tag in valid_publications:

                            # i                                publications_dict["type"] = elem.tagf we find a digit, we need to convert it to integer as we have to do some arithmetic operations
                            # in our queries
                            elif elem.text.isdigit():
                                publications_dict[elem.tag] = int(text)
                            else:
                                publications_dict[elem.tag] = text

                    # if it is the closing tag of a publication
                    if elem.tag in valid_publications and action == 'end':
                        writer_to_csv.writerow(publications_dict)
                        publications_dict = {}



if __name__ == "__main__":
    xml_input_path = "./FicherosBBDD/XML/dblp.xml"
    csv_output_path = "./FicherosBBDD/CSV/dblp.csv"

    start_time = time.time()
    parsePublications(xml_input_path, csv_output_path)
    print("The execution took: {0:0.2f} seconds".format(time.time() - start_time))