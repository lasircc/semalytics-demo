
// var SPARQLendpoint = {

//     query: function (endpoint, query, callback) {


//             settings = {
//                 headers: { Accept: 'application/sparql-results+json' },
//                 data: { query: query },
//             };

//         $.ajax(endpoint, settings).then(function (data) {

//             callback(data);
//         });

//     }


// }

/* Example: SPARQLendpoint.query(endpoint, treeQuery, function (res) { console.log(res) } */



var SPARQLendpoint2 = {

    query: function (endpoint, query) {


            settings = {
                headers: { Accept: 'application/sparql-results+json' },
                data: { query: query },
            };

       

            return $.ajax(endpoint, settings);
    

    }


}