(function () {
	"use strict";

	var treeviewMenu = $('.app-menu');

	// // Toggle Sidebar
	// $('[data-toggle="sidebar"]').click(function(event) {
	// 	event.preventDefault();
	// 	$('.app').toggleClass('sidenav-toggled');
	// });

	// // Activate sidebar treeview toggle
	// $("[data-toggle='treeview']").click(function(event) {
	// 	event.preventDefault();
	// 	if(!$(this).parent().hasClass('is-expanded')) {
	// 		treeviewMenu.find("[data-toggle='treeview']").parent().removeClass('is-expanded');
	// 		console.log('ciao');
	// 	}
	// 	$(this).parent().toggleClass('is-expanded');
	// });


	// Include html snippets
	$(function () {
		var includes = $('[data-include]');
		jQuery.each(includes, function () {
			var file = 'inc/' + $(this).data('include') + '.html';
			$(this).load(file);
		});
	});


	// Toggle Sidebar
	$(document).on('click', '[data-toggle="sidebar"]', function () {
		event.preventDefault();
		$('.app').toggleClass('sidenav-toggled');
	});


	// Activate sidebar treeview toggle
	$(document).on('click', "[data-toggle='treeview']", function () {
		event.preventDefault();
		if (!$(this).parent().hasClass('is-expanded')) {
			treeviewMenu.find("[data-toggle='treeview']").parent().removeClass('is-expanded');
			console.log('ciao');
		}
		$(this).parent().toggleClass('is-expanded');
	});


	// Set initial active toggle
	$("[data-toggle='treeview.'].is-expanded").parent().toggleClass('is-expanded');

	//Activate bootstrip tooltips
	$("[data-toggle='tooltip']").tooltip();




	// Toggle Sidebar
	$(document).on('focus', '#tags', function () {

		$(function () {

			$('#tags').val('');

			$("#tags").autocomplete({
				source: function (request, response) {
					$.ajax({
						url: 'https://www.wikidata.org/w/api.php',
						type: 'GET',
						dataType: 'jsonp', // essentially a consensual cross-site scripting hack
						data: {
							action: 'wbsearchentities',
							search: request.term,
							format: 'json',
							language: 'en',
							uselang: 'en',
							type: 'item',
						},
						error: function () {
							console.log('error');
						},
						success: function (res) {
							res.search.push({ label: 'More...', description:'Search in Wikidata', url: 'https://www.wikidata.org/w/index.php?search=' + res.searchinfo.search });
							response($.map(res.search, function (item) {
								return {
									label: item.label + ' ('+ item.description+')',
									description: item.description,
									url: item.url,
								}
							}));
						}
					});
				},

				minLength: 2,
				select: function (event, ui) {
					var url = ui.item.url;
					window.open(url);
					// if (url != '#') {
					// 	location.href = '/blog/' + url;
					// }
				},
			});

		});



	});





	// $('#select-movie').selectize({
	// 	valueField: 'title',
	// 	labelField: 'id',
	// 	searchField: 'concepturi',
	// 	// options: [],
	// 	create: false,
	// 	render: {
	// 		option: function(item, escape) {
	// 			return '<div>' +
	// 				'<span class="title">' +
	// 					'<span class="name"><i class="icon ' + (item.title ? 'fork' : 'source') + '"></i>' + escape(item.id) + '</span>' +
	// 					'<span class="by">' + escape(item.concepturi) + '</span>' +
	// 				'</span>' +
	// 				'<span class="description">' + escape(item.id) + '</span>' +
	// 				'<ul class="meta">' +
	// 					(item.id ? '<li class="language">' + escape(item.title) + '</li>' : '') +
	// 					'<li class="watchers"><span>' + escape(item.title) + '</span> watchers</li>' +
	// 					'<li class="forks"><span>' + escape(item.forks) + '</span> forks</li>' +
	// 				'</ul>' +
	// 			'</div>';
	// 		}
	// 	},
	// 	load: function (query, callback) {
	// 		if (!query.length) return callback();
	// 		$.ajax({
	// 			url: 'https://www.wikidata.org/w/api.php',
	// 			type: 'GET',
	// 			dataType: 'jsonp', // essentially a consensual cross-site scripting hack
	// 			data: {
	// 				action: 'wbsearchentities',
	// 				search: query,
	// 				format: 'json',
	// 				language: 'en',
	// 				uselang: 'en',
	// 				type: 'item',
	// 			},
	// 			error: function () {
	// 				callback();
	// 			},
	// 			success: function (res) {
	// 				console.log(res)
	// 				callback(res.search);
	// 			}
	// 		});
	// 	}
	// });


})();



