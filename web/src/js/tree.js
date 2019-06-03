var globalRoot = {};

var genePanel = "'KRAS' 'EGFR' 'BRAF' 'ERBB2'"

// possible root type for summarizing a tree
var summarizeRootTypes = ['Case', 'Tissue', 'Biomouse'];

// a list of tissue types. Really ugly...
var tissueTypes = ["LM", "NL", "NM", "PR", "PM", "CM", "BL", "TM", "AM", "LY", "HL", "MM", "NN", "AF", "TR", "LQ", "UR", "00", "OM", "UM", "SM", "BM", "TX"];

// Aliquots Icon function. It returns the relative config object
var aliquotIcon = function (type) {

    var types = {
        Case: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf2be',
                size: 100,
                color: 'blue'
            }
        },
        Tissue: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf069',
                size: 70,
                color: 'white'
            }
        },
        RNALater: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf192',
                size: 50,
                color: 'grey'
            }
        },
        SnapFrozen: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf2dc',
                size: 50,
                color: 'grey'
            }
        },
        Viable: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf0c3',
                size: 50,
                color: 'grey'
            }
        },
        DNA: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf1fb',
                size: 50,
                color: 'grey'
            }
        },
        Biomouse: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf019',
                size: 70,
                color: 'grey'
            }
        },
        // PlasmaIsolation: {},
        FormalinFixed: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf02a',
                size: 50,
                color: 'grey'
            }
        },
        Cellline: {},
        RNA: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf040',
                size: 50,
                color: 'grey'
            }
        },
        //Paraffin_section: {},
        //Labeled_section: {},
        //cRNA: {},
        cDNA: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf0ec',
                size: 50,
                color: 'grey'
            }
        },
        //Frozen: {},
        //OCTFrozen: {},
        //Protein: {},
        //FrozenSediment: {},
    };


    if (type in types) {
        return types[type];
    } 

    if (tissueTypes.indexOf(type) > -1) {
        return types['Tissue']
    }

    // if we get there, no type options are available. An empty object is returned
    return {};



}

var responseColor = function(response) {
    var responses = { 
        DRCl_OR : 'lime',
        DRCl_SD : 'yellow',
        DRCl_PD : 'red',
    };

    if (response in responses) {
        return responses[response];
    }

    // if we get there, no type options are available. An null value is returned
    return null;
}


// SPARQL Endpoint URL
var endpoint = 'http://localhost:7200/repositories/annotationDB',

    // function for creating query for case selector form
    createCaseQuery = function (filter_status, input, limit) {
        if (filter_status == true) {
            return `PREFIX : <http://www.ontotext.com/connectors/lucene#>
        PREFIX inst: <http://www.ontotext.com/connectors/lucene/instance#>
        PREFIX las: <http://las.ircc.it/ontology/annotationplatform#>
        PREFIX sesame: <http://www.openrdf.org/schema/sesame#>
        SELECT ?entity ?genID ?type {
            ?search a inst:bioentity_index ;
                    :query "case:*`+ input + `*" ;
                    :entities ?entity .
             ?entity las:caseID ?genID .
            BIND('root' AS ?type)
          } limit `+ limit
        } else {
            return `PREFIX : <http://www.ontotext.com/connectors/lucene#>
        PREFIX inst: <http://www.ontotext.com/connectors/lucene/instance#>
        PREFIX las: <http://las.ircc.it/ontology/annotationplatform#>
        PREFIX sesame: <http://www.openrdf.org/schema/sesame#>
        SELECT ?entity ?genID ?type {
            ?search a inst:bioentity_index ;
                    :query "genealogyID:*`+ input + `*" ;
                    :entities ?entity .
            ?entity las:identifier ?genID ;
                    sesame:directType ?type .
          } limit `+ limit
        }
    }



$('#js-case-selector').select2({
    placeholder: 'Search for a Geneaology ID...',
    minimumInputLength: 3,
    ajax: {
        url: endpoint,
        dataType: 'json',
        data: function (params) {
            var query = {
                query: createCaseQuery(filter_status = $('#filter').prop('checked'), input = params.term.toLowerCase(), limit = 10),
            }

            // Query parameters will be ?search=[term]&type=public
            return query;
        },

        processResults: function (data) {
            //console.log(data);

            var formdata = $.map(data.results.bindings, function (obj) {
                var renderedObject = {};
                renderedObject.id = obj.entity.value //|| obj.pk; // replace pk with your identifier
                renderedObject.text = obj.genID.value + ' (' + obj.type.value.replace('http://las.ircc.it/ontology/annotationplatform#', '') + ')'
                return renderedObject;
            });
            // Tranforms the top-level key of the response object from 'items' to 'results'
            return {
                results: formdata,
            };
        },




    }
});



// empty the selctor when filter status changes
$('#filter').click(function () {
    $('#js-case-selector').empty()
});



var renderTree = function (bioentityID, summarize) {


    if (summarize) {

        var nodesQ = `
        PREFIX : <http://las.ircc.it/ontology/annotationplatform#>
        # return Root and Biomice nodes
        select ?node ?nodeType ?nodeGeneID ?respType where { 
            values ?nodeType { :Biomouse :Case :Tissue }
            <`+ bioentityID + `> :generates* ?node .
            ?node a ?nodeType  .
            OPTIONAL {?node :identifier ?nodeGeneID}
            OPTIONAL {
                ?node :has_annotation ?ann .
                ?ann :has_reference ?ref ;
                     a :annotation .
                ?ref a :drug_response .
                ?ref sesame:directType ?respType
            }
        }`,
            topologyQ = `
        PREFIX : <http://las.ircc.it/ontology/annotationplatform#>

        select ?node ?nodeType ?nodeGeneID ?parent ?parentType ?parentGeneID where {
            # For each node, search all its parents of type :Biomouse, :Case or :Tissue
            ?parentP :generates* ?node .
            values ?parentTypeP { :Biomouse :Case :Tissue }
            ?parentP a ?parentTypeP .
            OPTIONAL {?parentP :identifier ?parentGeneID}

            # Subtract from previous step all the <:node, :parent> couples with an intermediary :mid of type :Biomouse, :Case or :Tissue
            FILTER NOT EXISTS {
                ?parentP :generates+ ?mid .
                ?mid :generates+ ?node .
                values ?midType { :Biomouse :Case :Tissue }
                ?mid a ?midType .
            }

            # this is just a way for visualizing the root case with empty ?parent and ?parentType 
            bind( if(?node = ?parentP,?null,?parentP) as ?parent )
            bind( if(?node = ?parentP,?null,?parentTypeP) as ?parentType )

            # since we use :generates* we need to remove duplicates except for :Case node, if any
            FILTER (?node != ?parentP || ?nodeType = :Case)

            {
                # inner query
                # return nodes of types :Biomouse :Case :Tissue
                select * where { 
                    values ?nodeType { :Biomouse :Case :Tissue }
                    <`+ bioentityID + `> :generates* ?node .
                    ?node a ?nodeType  .
                    OPTIONAL {?node :identifier ?nodeGeneID}
                }
            }

        } 
        `

    } else {

        var nodesQ = `
        PREFIX : <http://las.ircc.it/ontology/annotationplatform#>
        PREFIX sesame: <http://www.openrdf.org/schema/sesame#>
        PREFIX onto: <http://www.ontotext.com/>
        select ?node ?nodeType ?nodeGeneID ?respType (group_concat(?symbol) as ?variants)
        FROM onto:disable-sameAs
        where {
        
            <`+ bioentityID + `> :generates* ?node .
            ?node sesame:directType ?nodeType .
            OPTIONAL {?node :identifier ?nodeGeneID }
            OPTIONAL {
                ?node :has_annotation ?ann .
                ?ann :has_reference ?ref ;
                     a :annotation .
                ?ref a :drug_response .
                ?ref sesame:directType ?respType
            }
            OPTIONAL {
                ?node :has_annotation ?annotation .
                ?annotation :has_reference ?variant .
                ?gene :has_variant ?variant .
                ?gene :symbol ?symbol
                values ?symbol {` + genePanel + `}
            }
        }
        group by ?node ?nodeType ?nodeGeneID ?respType
        `,
            topologyQ = `
        PREFIX : <http://las.ircc.it/ontology/annotationplatform#>
        PREFIX sesame: <http://www.openrdf.org/schema/sesame#>
        select ?node ?nodeType ?nodeGeneID ?parent ?parentType ?parentGeneID
        where {
        
            <`+ bioentityID + `> :generates* ?node .
            ?node sesame:directType ?nodeType .
            OPTIONAL {?node :identifier ?nodeGeneID }
            OPTIONAL {?parent :generates ?node ;
                            sesame:directType ?parentType 
                OPTIONAL {?parent :identifier ?parentGeneID}
            }
        }`

    }

    // empty the selctor when rendering
    $('#js-case-selector').empty()

    // init basicInfo object
    /* 
        - treequery gets the edges
        - leavesquery gets nodes with no redundancy 
    */
    var basicInfo = {},


        uniqueNodesQuery = nodesQ,



        uniqueNodesSPARQL = SPARQLendpoint2.query(endpoint, uniqueNodesQuery),
        topologyQuery = topologyQ,
        topologySPARQL = SPARQLendpoint2.query(endpoint, topologyQuery);


    $.when(uniqueNodesSPARQL, topologySPARQL).done(

        function (uniqueNodesData, topologyData) {

            //console.log(uniqueNodesData, topologyData);


            var nodesData = uniqueNodesData[0].results.bindings,    // just a list of nodes with no duplicates
                topologyData = topologyData[0].results.bindings,    // parent child relations dataset
                nodes = [],
                edges = [],
                groups = {};



            // set nodes
            for (let index = 0; index < nodesData.length; index++) {


                // set node
                var shortURI = nodesData[index].node.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                var bioentityType = nodesData[index].nodeType.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');

                if ('nodeGeneID' in nodesData[index]) {
                    var bioentityGenID = nodesData[index].nodeGeneID.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                } else {

                    var bioentityGenID = nodesData[index].node.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                    // if (bioentityType == 'Case') {
                    //     var bioentityGenID = 'Root Case'
                    // } else {
                    //     var bioentityGenID = 'Tissue'
                    // }

                }

                // init node
                var node = {};
                node.id = shortURI;
                node.title = bioentityGenID + ' (' + bioentityType + ') - las:' + shortURI;
                node.group = bioentityType;

                // add group info to options
                if (!(bioentityType in groups)) {
                    groups[bioentityType] = aliquotIcon(bioentityType);

                }

                // set response color, if any
                if ('respType' in nodesData[index]) {
                    var responseType = nodesData[index].respType.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                    node.icon = { color : responseColor(responseType) };
                }

                // set variant color, if any
                if ('variants' in nodesData[index] && nodesData[index].variants.value != '') {
                    //var responseType = nodesData[index].respType.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                    node.title += '<br>variant(s) ' + nodesData[index].variants.value;
                    node.icon = { color : 'red',   size: 100};
                }

                // set root tree info
                if (nodesData[index].node.value == bioentityID) {
                    // save bioentityID in global scope
                    globalRoot.id = bioentityID;
                    globalRoot.type = bioentityType;

                    // set text to render as tree div title

                    var bioentityText = bioentityGenID + ' (' + bioentityType + ', las:' + shortURI + ')';

                    if (bioentityType == 'Case') {
                        basicInfo.path = shortURI.slice(0, 3);
                        basicInfo.case = shortURI.slice(3, 7);
                    } else if (bioentityType == 'Tissue') {
                        basicInfo.path = shortURI.slice(0, 3);
                        basicInfo.case = shortURI.slice(3, 7);
                        basicInfo.tissue = shortURI.slice(7, 9);
                    } else {
                        basicInfo.path = bioentityGenID.slice(0, 3);
                        basicInfo.case = bioentityGenID.slice(3, 7);
                        basicInfo.tissue = bioentityGenID.slice(7, 9);
                    }

                }

                // Add current node to the node list
                nodes.push(node);


            }

            for (let index = 0; index < topologyData.length; index++) {

                // set edge
                if ('parent' in topologyData[index]) {
                    edges.push({
                        from: topologyData[index].parent.value.replace('http://las.ircc.it/ontology/annotationplatform#', ''),
                        to: topologyData[index].node.value.replace('http://las.ircc.it/ontology/annotationplatform#', '')
                    });

                    // set root parent, if any
                    if (topologyData[index].node.value == bioentityID && 'parent' in topologyData[index]) {

                        if ('upper' in basicInfo) { // more than one father

                            basicInfo.upper.more = true;

                        } else {

                            if ('parentGeneID' in topologyData[index]) {
                                var text = topologyData[index].parentGeneID.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                            } else {
                                var text = topologyData[index].parent.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
                            }

                            basicInfo.upper = {
                                id: topologyData[index].parent.value,
                                text: text,
                            };
                        }

                    }
                }

            }

            var nodesSet = new vis.DataSet(Array.from(nodes));
            var edgesSet = new vis.DataSet(edges);

            // create a network
            var container = document.getElementById('mynetwork');

            // provide the data in the vis format
            var data = {
                nodes: nodesSet,
                edges: edgesSet
            };

            var options = {
                autoResize: true,
                height: '400px',
                clickToUse: false,
                layout: {
                    hierarchical: {
                        direction: 'UD',
                        sortMethod: 'directed',
                    }
                },
                nodes: {
                    shape: 'dot',
                    color: 'grey',
                    size: 20,
                    font: {
                        size: 15,
                        color: '#ffffff'
                    },
                    borderWidth: 2
                },
                physics: { // just for rendering issue with huge trees
                    stabilization: false,
                    barnesHut: {
                        gravitationalConstant: -8000000,
                        springConstant: 0.001,
                        springLength: 200
                    }
                },
                groups: groups,
            };

            // initialize your network!
            var network = new vis.Network(container, data, options);

            network.on("doubleClick", function () {
                var nodeID = this.getSelection().nodes[0];
                var node = nodesSet.get(nodeID);
                if (nodeID) {
                    renderTree('http://las.ircc.it/ontology/annotationplatform#' + node.id, $('#summarize').prop('checked'));
                } else {
                    console.log('Please, click on a node')
                }
            });

            // render dynamic values

            $('#bioentity').text(bioentityText);
            $('.treediv').fadeIn();
            $('#pathBadge').text(basicInfo.path);
            $('#caseBadge').text(basicInfo.case);
            $('#tissueBadge').text(basicInfo.tissue);

            console.log(basicInfo);

            $('#upperBadge').removeClass();
            if ('upper' in basicInfo) {
                $('#generated').show();
                $('#tissueBadge').show();
                $('#upperBadge').addClass("badge badge-success").text(basicInfo.upper.text);
                if ('more' in basicInfo.upper) {
                    console.log('ciao')
                    $('#upperBadgeMore').show().text('...');
                } else {
                    $('#upperBadgeMore').hide();
                }


                // manage dblclick event
                $(document).unbind('dblclick').on('dblclick', '#upperBadge', function () {
                    console.log('click');
                    renderTree(basicInfo.upper.id, $('#summarize').prop('checked'));
                });

            } else {
                $(document).unbind('dblclick');
                $('#generated').hide();
                $('#tissueBadge').hide();
                $('#upperBadgeMore').hide();
                $('#upperBadge').addClass("badge badge-danger").text('Root Case');

            }



        });


}

// build the tree
$('#js-case-selector').change(function () {
    var val = $(this).val();
    //var text = $(this).noderen("option").filter(":selected").text();
    renderTree(val, $('#summarize').prop('checked'));
});


// summarize the tree
$('#summarize').change(function () {
   console.log(globalRoot);
    // avoid tree summarization if the current root is not in summarizeRootTypes
    if ($('#summarize').prop('checked') == true && summarizeRootTypes.indexOf(globalRoot.type) == -1 && tissueTypes.indexOf(globalRoot.type) == -1) {
        swal("Oooops", "Your current root is a "+globalRoot.type+".\nPlease, select a "+summarizeRootTypes+" as root node for starting summarization", "error");
        $('#summarize').prop('checked', false); // Unchecks it
    } else {
        renderTree(globalRoot.id, $('#summarize').prop('checked'));
    }

});