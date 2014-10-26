
/******************************************* HELPERS ****************************************/


function onIconEvents( $this ) {

	$this.on('mouseenter', function(e) {
		$this.addClass("is-active");
	});


	$this.on('mouseleave', function(e) {
		$this.removeClass("is-active");
	});

	$this.on('click', function(e) {

		var projectColor = $(this).css("color");
		var projectStroke = $(this).css("stroke");

		if ( isBodyBusy() ) {
			return false;
		}

		// Ajax request
		e.preventDefault();
		console.log("preventDefault()");

		// s'il y en a un d'ouvert
		if($('.is-current').length){
/*
			$('body').removeClass('is-loading');
			$(".conteneurProjet").removeClass("is-filled");
*/
			closeProject();
			$('.is-current').removeClass('is-current');
		}

		$('body').addClass('is-loading is-project');
		$this.addClass('is-current is-viewed');

		$(".conteneurProjet svg").remove();
		$(".conteneurProjet article.projet").empty();
		$('.offscreenDump').empty();

		var $thisSVGClone = $this.find("svg").clone();

		var thisSVGCloneDashOffset = parseFloat( $this.data("dashoffset") );

		$(".conteneurProjet").prepend( $thisSVGClone );
		var $thispoly = d3.select( ".conteneurProjet svg .polygones" );

		d3.select( ".conteneurProjet svg" ).selectAll(".pointsLignes, .polygones")
			.style("fill", "transparent")
			.style("stroke", "transparent");

/*
		d3.select( ".conteneurProjet svg" ).node()
			.appendChild( d3.select('.conteneurProjet svg .polygones').node().cloneNode(true) );
*/

/*
		d3.select( ".conteneurProjet svg" )
			.insert( "rect", ":first-child" )
			.attr("height", "200px")
			.attr("width", "200px")
			.style("fill", projectColor )
			.transition()
			.duration(200)
			.attr("width", function (d) { return $(".conteneurProjet svg").width(); })
			.attr("x", 0);
*/

		(function polygonStrokeAnimation() {
			d3.select( ".conteneurProjet svg" ).select(".polygones")
				.style("stroke", "#fff")
				.style("stroke-width", 1.2)
				.attr("stroke-dasharray", thisSVGCloneDashOffset )
				.attr("stroke-dashoffset", thisSVGCloneDashOffset )
				.transition()
				.duration(1000)
				.ease("in-out")
				.attr("stroke-dashoffset", 0 )
				.each( "end", function() {

					// si l'ajax a finit, alors animation de Fill puis l'afficher
					// si les 3 premières images sont chargées
					if ( $('.offscreenDump article.is-ready').length ) {
						polygonesFillAnimation();
						return;
					} else {
						d3.select(this).transition()
							.duration(1000)
							.attr("stroke-dashoffset", -thisSVGCloneDashOffset )
							.each( "end", function() {
								polygonStrokeAnimation();
						    });

					}
		    });
	    })();

		function polygonesFillAnimation() {
			d3.select( ".conteneurProjet svg" ).select(".polygones")
				.style("fill", "rgba(255,255,255,0)")
				.transition()
				.duration(800)
				.style("fill", "rgba(255,255,255,1)")
				.each( "end", function() {

					var contents = $('.offscreenDump article.is-ready').html();
					$(".conteneurProjet article.projet").append(contents);

					$(".conteneurProjet").removeClass("is-loading").addClass("is-filling").find("svg")
						.transition(
							{ y : -200 },
							600,
							'ease',
							function() {
								$(this).remove();
							}
						);

					$("#entete").addClass("is-sticky");

					setTimeout(function() {
						$('body').removeClass('is-loading is-busy');
						$(".conteneurProjet").removeClass("is-filling").addClass("is-filled");
						$('.offscreenDump article').removeClass("is-ready");

						$(".conteneurProjet img").removeClass("is-hidden");

						// updater les positions des borders
						borderTopPos = $(".conteneurProjet").offset().top;
						borderBottomPos = $(".conteneurProjet").offset().top + $(".conteneurProjet").height();

						$borderTop.css("width", $(".conteneurProjet").width() );

					}, 400)

				});


		}

		//$(".conteneurProjet").css("background-color", projectColor );
		$(".conteneurProjet svg").css("background-color", projectColor );
		$(".conteneurProjet .border").css("border-color", projectColor );
		$("#entete .conteneurEntete").css("border-color", projectColor );

		$(".conteneurProjet").addClass("is-loading");
		$(".conteneurProjet svg").css("opacity", 1);

		var urlToLoad = "./projets-contents/" + $this.attr('href');

		if ( window.pageYOffset > 0 ) {
			gotoByScroll( $("body") );
		}

		// chargement du projet
		$.get( urlToLoad, function( data ) {
// 		$('.offscreenDump').load(urlToLoad, "", function(){

			var dataWithoutImages = data.replace(/src/ig, 'data-src');

			$data = $(dataWithoutImages);

			// préparer le bloc offscreenDump
			$data.find('article').removeClass("projet");

			// compter le nombre d'images à charger
			console.log( $data.find("img").length );

			var $imagesToLoad = $data.find("img").slice(0,3);
			var $remainingImages = $imagesToLoad.length;

			console.log( "$remainingImages  " + $remainingImages );

			$imagesToLoad.each( function() {
				$(this).attr("src", $(this).data("src") );
				imagesLoaded ( $(this) , function() {
					$remainingImages--;

					console.log( "$remainingImages : "+ $remainingImages );

					if ( $remainingImages === 0 ) {

						// charger les autres images
						$data.find("img").each(function() {
							$this = $(this);
							$this.addClass("is-hidden");

							if ( $this.attr("src") === undefined ) {
								$this.attr("src", $this.data("src") );
							}

						});

						// placer le contenu dans offscreenDump
						$('.offscreenDump').html($data);

						// say it's ready
						$('.offscreenDump article').addClass("is-ready");

					}
				});
			});

		});

	});
}

function titreProche(selector, modwscrollTop) {
	var dist = 0;
	var pDist = 10000000000;
	var titreactif;
	//optimisation : stocker le numéro d'article plutôt que l'article : http://jsperf.com/jquery-each-this-vs-eq-index
	var numTitre = -1;
	var $titres = selector;
	$titres.each(function(index) {
		dist = modwscrollTop - $(this).offset().top;
		if (dist > -10 && dist < pDist) {
			pDist = dist;
			numTitre = index;
		}
		//console.log( "this.offsetTop : " + $(this).offset().top);
	});
	if ( numTitre !== -1 ) {
		titreactif = $titres.eq(numTitre);
		return titreactif;
	}
	return false;
}



// fonction scroll vers le projet au click dans le header ou au clavier
var gotoByScroll = function ( $eles ) {
    $('html, body').animate({
	        scrollTop: $eles.offset().top
	    }, 400, 'easeInOutQuint');
}


$("document").ready( function() {

	console.time("Init page");

	$("#entete .tagline").fitText(1.60);

	// création du .offscreenDump pour stocker l'ajax
	$("main").after("<div class='offscreenDump'></div>");

	// création d'un encart pour l'article s'il y en y a pas déjà
	if ( !$("article.projet").length ) {
		$("main").prepend("<article class='projet'></article>");
	}
	$("article.projet").wrap("<div class='conteneurProjet'></div>").before("<div class='border borderTop'></div>").after("<div class='border borderBottom'></div>");

	window.$borderTop = $(".conteneurProjet .borderTop");
	window.$borderBottom = $(".conteneurProjet .borderBottom");
	window.$entete = $("#entete");

	borderTopPos = $borderTop.offset().top;
	borderBottomPos = $borderBottom.offset().top;

	listCategoriesULPos = $(".listCategories").offset().top;

	var grilleOrder = 1000;
	$(".grilleIcones .apercu").css("order", grilleOrder-- );

	// pour chaque filtre du menu
	$(".listCategories .categorie").each(function() {
		var $this = $(this);
		$this.on("click", function() {

			var $this = $(this);
			var thisfilter = $this.data("filter");

			if ( isBodyBusy() ) {
				return false;
			}

			// s'il est déjà sélectionné
			if ( $this.hasClass("is-selected") ) {

				console.log("X - project is-selected > closeProject and return");
				$(".listCategories .categorie").removeClass("is-selected");
				$(".grilleIcones .apercu").removeClass("is-filtered");
				closeProject();
				return;

			}

			// s'il y a un projet visible
			if ( $(".conteneurProjet").hasClass("is-filled") ) {
				console.log("X - conteneurProject is-filled > closeProject");
				closeProject();
			}

			console.log( '$this.data("filter") : ' + $this.data("filter") );

			$(".grilleIcones .apercu").removeClass("is-filtered");
			$(".grilleIcones .apercu").each(function() {
			});

			$this.siblings().removeClass("is-selected");
			$this.addClass("is-selected");

			gotoByScroll( $("body") );

			var thisfilter = $this.data("filter");

			var $projetFiltres = $(".grilleIcones .apercu").filter(function(){
				return $(this).data('categorie').match(thisfilter);
			});

			var $projetFiltresSVG = $projetFiltres.find("svg");
 			var originalApercuWidth = $projetFiltres.eq(0).css("width");

 			// cloner les cases
 			var $projetFiltresClones = $projetFiltres.clone();

 			// placer les clones à width = 0
 			$projetFiltresClones.css("width", 0);

 			var $listOrder = $("<div/>");
 			$listOrder.html( $projetFiltresClones );

 			// les intégrer	en début de liste
			$(".grilleIcones").prepend(
	 			$listOrder.find(" > .apercu.is-viewed")
			);
			$(".grilleIcones").prepend(
	 			$listOrder.find(" > .apercu:not(.is-viewed)")
			);

 			// passer leur width à Original
 			$projetFiltresClones
				.addClass("is-filtered")
				.transition(
					{ width : originalApercuWidth },
					1200,
					'ease',
					function() {
						$projetFiltresClones.each(function() {
						 	onIconEvents( $(this) );
					 	});
					}
				);
 			// en même temps, passer la width des autres à 0
 			$projetFiltres
				.transition(
					{ width : 0 },
					1200,
					'easeOutQuint',
					function() {
						// supprimer les anciennes
						$projetFiltres.remove();
					}
				);
/*
			projetFiltresSVG
				.transition(
					{ scale: 0 },
					500,
					'easeOutQuint',
					function () {
						projetFiltresSVG
							.delay(50)
							.transition(
								{ scale: 1 },
								300,
								'easeOutQuint'
							 );
				}
			);
*/
		});

	});



	/* ==========================================================================
								ANIMATE ALL THE THINGS!!!!
	   ========================================================================== */

	$("body").addClass("is-loaded");


/*
	d3.selectAll( "#logo svg" ).selectAll("polygon, path, rect")
	    .attr("opacity", "0")
		.transition()
		.delay(function(d, i) { return i * 20; })
		.duration(200)
	    .attr( "transform", "translate( 0 " + 0 + " )")
	    .attr( "opacity", "1");
*/

	$("#logo").transition({
		opacity: 1,
		duration: 300,
		easing: 'ease' });


	$(".tagline").transition({
		opacity: 1,
		delay: 200,
		duration: 600,
		easing: 'ease' });
	$(".containerLogoTagline").transition({
		'borderBottomColor': '#dcdcdc',
		delay: 400,
		duration: 400,
		easing: 'ease' });
	$(".listCategories .item").each( function(i) {
		$(this).transition({
			opacity: 1,
			delay: 400,
			duration: 800,
			easing: 'ease',
			});
	});

	setTimeout( fadeIconsToView(), 800 );

	// pour chaque icone de la grille, l'animer

	function fadeIconsToView() {
		$(".grilleIcones .apercu").each(function() {

			var $this = $(this);
			var projectColor = $(this).css("color");
			var projectStroke = $(this).css("stroke");
			var transitions = 0;

			var polygonPoints = [];

			var svg = d3.selectAll( $(this).find("svg").toArray() );
			var pointsLignes = svg.selectAll( ".pointsLignes" );
			var polygons = svg.select( ".polygones" );

			//console.log("pointsLignes ");
			//console.log( pointsLignes );

			pointsLignes.selectAll("circle").transition()
				.duration(800)
				.each( "start", function() { transitions++; })
				.delay(function(d, i) { return i * 30; })
				.style("fill", function(d) { return projectColor; })
				.each( "end", function() {
			        if( --transitions === 0 ) {
		        	//console.log( "transitions = " + transitions );
			            callbackWhenAllIsDone( this, arguments);
			        }
			    });

			function callbackWhenAllIsDone( d, i ) {
	        	//console.log( d );
				//console.log( $(d).siblings("line") );
				pointsLignes.selectAll( "line" )
					.attr("stroke-dasharray", "150")
					.attr("stroke-dashoffset", "150")
					.style("stroke", function(d) { return projectStroke; })
					.transition()
					.duration( 900 )
					.attr("stroke-dashoffset", "0");
			}

			onIconEvents( $this );
		});
	}


	console.timeEnd("Init page");

	/* ==========================================================================
									VU PROJET
	   ========================================================================== */
	var posScrollPage = window.pageYOffset;
	fixedBorderTop(posScrollPage);

	$(window).scroll(function() {
		var posScrollPage = window.pageYOffset;
		fixedBorderTop(posScrollPage);
	});

	$(window).resize(function() {

	});

});


function isBodyBusy() {
	if ( $("body").hasClass("is-busy") ) {
		return true;
	}
	return false;
}

function closeProject() {

	$(".conteneurProjet article").empty();
	$(".conteneurProjet").removeClass("is-filled is-filling");
	$('body').removeClass("is-busy is-project");

	$("#entete .conteneurEntete").css({ y: 0 });
	$("#entete .conteneurEntete").css({ paddingBottom: 100 });

}

function fixedBorderTop(scrollfromtop) {

	if ( $(".conteneurProjet").hasClass("is-filled") ) {

		borderBottomPos = $borderBottom.offset().top;
		enteteBottom = $entete.offset().top + $entete.height();

		console.log( " scrollfromtop : " + scrollfromtop +  " borderBottomPos : " + borderBottomPos );

		var enteteHeight = 350;
		var paddingBottomEntete = 100;
		var startAt = 30;
		var translateYcollapsed = -205;
		var borderHeight = 4 * 1.5;


		if ( scrollfromtop < borderTopPos - 60 ) {

			$("#entete").addClass("is-sticky");

 			var scrollUpEntete = scrollfromtop.map( 0, borderTopPos - 60, 0, translateYcollapsed );
			$("#entete.is-sticky .conteneurEntete").css({ y: scrollUpEntete });

			var paddingEntete = scrollfromtop.map( 0, borderTopPos - 60, 100, 5 );
			$("#entete.is-sticky .conteneurEntete").css({ paddingBottom: paddingEntete });

		} else
		// si on est entre le haut et le bas
		if ( scrollfromtop < borderBottomPos - enteteHeight ) {

			$("#entete").addClass("is-sticky");

			var scrollUpEntete = scrollfromtop.map( borderBottomPos - (enteteHeight * 2), borderBottomPos - enteteHeight, translateYcollapsed, 0 );
			console.log( " — scrollUpEntete : " + scrollUpEntete );

			$("#entete.is-sticky .conteneurEntete").css({ y: scrollUpEntete });

			var paddingEntete = scrollfromtop.map( borderBottomPos - (enteteHeight * 2), borderBottomPos - enteteHeight, 5, paddingBottomEntete + borderHeight );

			$("#entete.is-sticky .conteneurEntete").css({ paddingBottom: paddingEntete });

		} else

		if (  scrollfromtop >= borderBottomPos - enteteHeight + borderHeight ) {

			$("#entete .conteneurEntete").css({ y: borderBottomPos - enteteHeight });
			$("#entete .conteneurEntete").css({ paddingBottom: paddingBottomEntete + borderHeight });
			$("#entete").removeClass("is-sticky");


		}

	}
}

