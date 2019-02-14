from pandas.io.json import json_normalize
from SPARQLWrapper import SPARQLWrapper, JSON
import pandas as pd

 # SPARQL_ENDPOINT = 'http://localhost:7200/repositories/annotationDB'

class Analysis:
    """
    The analysis class
    """

    def __init__(self, scope, cases_per_gene, cases_per_response, variants_occurrences):
        self.scope = scope
        self.variants = self._get_variants(cases_per_gene)
        self.responses = self._get_responses(cases_per_response)
        self.matching = self._get_matching(variants_occurrences, cases_per_gene, cases_per_response)

    def _get_variants(self, cases_per_gene):
        df = pd.DataFrame([['Annotated',len(self.scope)],
                   ['BRAF',len(cases_per_gene['BRAF'] & self.scope)],
                   ['EGFR',len(cases_per_gene['EGFR'] & self.scope)],
                   ['ERBB2',len(cases_per_gene['ERBB2'] & self.scope)],
                   ['KRAS',len(cases_per_gene['KRAS'] & self.scope)],
                   ], columns=['gene','cases'])
        return df

    def _get_responses(self, cases_per_response):
        df = pd.DataFrame([ ['response',len(cases_per_response['DRCl_OR'] & self.scope)],
                            ['neutral',len(cases_per_response['DRCl_SD'] & self.scope)],
                            ['progression',len(cases_per_response['DRCl_PD'] & self.scope)],
                   ], columns=['response_type','cases'])
        return df


    def _get_matching(self, variants_occurrences, cases_per_gene, cases_per_response):

        data = []

        for vo in variants_occurrences:
            if vo != ():
                    a = [vo]
                    sets = [self.scope]
                    for gene in list(vo):
                        sets.append(cases_per_gene[gene])
                        
                    cases = set.intersection(*sets)            
                    for r in ['DRCl_PD','DRCl_SD','DRCl_OR']:              
                        a.append(len(cases & cases_per_response[r]))
                    data.append(a)
            

        df = pd.DataFrame(data, columns=['genes','DRCl_PD','DRCl_SD','DRCl_OR'])

        df['tot'] = df['DRCl_PD']+df['DRCl_SD']+df['DRCl_OR']
        df['progression'] = df['DRCl_PD'] / df['tot']
        df['neutral'] = df['DRCl_SD'] / df['tot']
        df['response'] = df['DRCl_OR'] / df['tot']

        return df
        

    def plot_variants(self):
        # create chart
        chart = self.variants.plot.bar(x='gene', 
                    y='cases',
                    rot=0,
                    logy=True,
                    ylim=(0.1,1000),
                    title = 'Annotated cases per variant (Panel)',
                    legend=False,
                    color=gene_colors(self.variants['gene']))#.set_xlabel('') # remove before flight : )
        return chart

    def plot_responses(self):
        # create chart
        chart = self.responses.plot.pie(y = 'cases',
            rot=0,
            labels = self.responses['response_type'], # labels
            #labels = None,
            legend = False,
            figsize=(5, 5),
            colors=response_colors(self.responses['response_type']),
            title ='Response fractions' # title
            ).set_ylabel('')
        return chart

    def plot_matching(self):
        # create chart
        chart = self.matching[['genes','progression','neutral','response']].plot.bar(x='genes',
                stacked=True,
                legend=True, # legend
                #legend = False,
                rot=-90,
                color=['#dd3941','#fdde55','#75ba42'],
                ylim=(0,1))
        return chart
        


def query(sparql_service_url, sparql_query, method = 'GET'):
    """
    Query the endpoint with the given query string and return the results as a pandas Dataframe.
    This code has been grabbed from the Su Lab
    """
    
    # create the connection to the endpoint
    sparql = SPARQLWrapper(sparql_service_url)

    # set HTTP method
    sparql.method = method
    
    sparql.setQuery(sparql_query)
    sparql.setReturnFormat(JSON)

    # ask for the result
    result = sparql.query().convert()

    if method == 'GET':
        return json_normalize(result["results"]["bindings"])
    else:
        print ('Query executed\n')
        return result


def powerset(s):
    """ Get powerset of a set """
    powerset = set()
    for i in range(2**len(s)):
        subset = tuple([x for j,x in enumerate(s) if (i >> j) & 1])
        powerset.add(subset)
    return powerset


# color maps for charts (responses)
def response_colors(labels):
    responses_colors_map = {'response':'#75ba43',
                            'neutral':'#fdde55',
                            'progression':'#de3942'}
    colors_list = list()
    for item in labels:
        colors_list.append(responses_colors_map[item])
    return colors_list


# color maps for charts (gene)
def gene_colors(labels):
    responses_colors_map = {'Annotated':'#166ba8',
                            'BRAF':'#00a389',
                            'EGFR':'#78bd8f',
                            'ERBB2':'#beeba0',
                            'KRAS':'#feffa3'}
    colors_list = list()
    for item in labels:
        colors_list.append(responses_colors_map[item])
    return colors_list  


# filter prefixes in URIs
def filter_prefixes(dataframe):
    dataframe.replace({'http://las.ircc.it/ontology/annotationplatform#': ''}, inplace=True, regex=True)
    dataframe.replace({'http://www.wikidata.org/entity/': ''}, inplace=True, regex=True)
    return dataframe  


def main():

    print('Testing library against Wikidata endpoint\n')
    print('Getting some cats... ^..^\n')
    
    my_query = """
                PREFIX wdt: <http://www.wikidata.org/prop/direct/>
                PREFIX wd: <http://www.wikidata.org/entity/>

                #Cats
                SELECT ?itemLabel 
                WHERE 
                {
                    ?item wdt:P31 wd:Q146.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
                } LIMIT 10

                """
    
    
    # get data
    result_table = query('https://query.wikidata.org/sparql',my_query)

    # there you go!
    print(result_table)

    print('\nMeow!\n')

    print('Testing Powerset of {1,2,3}\n')
    powerset_result = powerset({1,2,3})
    print(powerset_result)
    
    
if __name__ == '__main__':
    main()
