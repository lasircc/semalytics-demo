var endpoint = 'http://localhost:7200/repositories/annotationDB',

    bioQuery =
        "PREFIX : <http://las.ircc.it/ontology/annotationplatform#>\n" +
        "select ?type (count(?type) as ?c) where { \n" +
        "	?bio a :Bioentity ;\n" +
        "         sesame:directType ?type .\n" +
        "} \n" +
        "group by ?type\n" +
        "order by desc(?c)",

    annotationQuery = "PREFIX : <http://las.ircc.it/ontology/annotationplatform#>\n" +
        "select (count(?n) as ?c) ?type ?type2 where { \n" +
        "	?n a :kb_node ;\n" +
        "       sesame:directType ?type .\n" +
        "    ?a :has_reference ?n .\n" +
        "    ?bio a :Bioentity ;\n" +
        "         :has_annotation ?a ;\n" +
        "         sesame:directType ?type2 .\n" +
        "         \n" +
        "    FILTER NOT EXISTS {?n  sesame:directType :SNP . }\n" +
        "} group by ?type ?type2\n" +
        "order by ?type";

//SPARQLendpoint.query(endpoint, bioQuery, function (res) {
$.when(SPARQLendpoint2.query(endpoint, bioQuery)).done(function(res) {

    $('#bioLoad').hide();

    var labels = [],
        dataSet = [];

    var results = res.results.bindings;

    for (let index = 0; index < results.length; index++) {
        labels.push(results[index].type.value.replace('http://las.ircc.it/ontology/annotationplatform#', ''));
        dataSet.push(results[index].c.value);

    }


    var ctx = document.getElementById("bioChart").getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataSet,
                backgroundColor: palette('tol-dv', dataSet.length).map(function (hex) {
                    return '#' + hex;
                })
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'left',
            },

        }
    });

});


//SPARQLendpoint.query(endpoint, annotationQuery, function (res) {
$.when(SPARQLendpoint2.query(endpoint, annotationQuery)).done(function(res) {

    $('#annotLoad').hide();

    // temporary resultset
    var resultSet = {};

    // chart labels
    var labels = [];

    // chart datasets
    var datasets = [];

    var results = res.results.bindings;


    for (let index = 0; index < results.length; index++) {
        var dataSet = results[index].type2.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
        var annotationType = results[index].type.value.replace('http://las.ircc.it/ontology/annotationplatform#', '');
        var cardinality = results[index].c.value;

        // add element to labels list
        if (!(labels.indexOf(annotationType) >= 0)) {
            labels.push(annotationType);
        }

        if (!(dataSet in resultSet)) {
            resultSet[dataSet] = {};
        }

        resultSet[dataSet][annotationType] = cardinality;


    }

    // Prepare the color palette


    var colors = palette('tol-rainbow', Object.keys(resultSet).length).map(function (hex) {
        return '#' + hex;
    })


    // Building the radar datasets
    var i = 0;
    for (var property in resultSet) {
        if (resultSet.hasOwnProperty(property)) {
            d = {};
            d['label'] = property;
            d['data'] = [];
            d['backgroundColor'] = colors[i];

            i++;


            for (let index = 0; index < labels.length; index++) {
                label = labels[index];
                if (label in resultSet[property]) {
                    d['data'].push(parseInt(resultSet[property][label]));
                } else {
                    d['data'].push(0);
                }

            }
            datasets.push(d);
        }
    }



    var ctx = document.getElementById("annotChart").getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            scales: {
                xAxes: [{
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        //stepSize: 1,
                        //min: 0,
                        autoSkip: false
                    }
                }],

                yAxes: [{
                    display: true,
                    type: 'logarithmic',
                }]
            }
        }
    });

});




