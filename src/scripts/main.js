
/******************************************* HELPERS ****************************************/

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

		// leur attacher un événement au click
		onIconEvents( $this );
	});
}

function filterProjectIcons( $that ){

	var $this = $that;
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

}

function loadNewProject( $that ) {

	/****************************************************************************
		charger les variables du projet à partir de la vignette
	 ***************************************************************************/

	var projectColor = $that.css("color");
	var projectStroke = $that.css("stroke");
	var projectCategorie = $that.data("categorie");
	var projectDashOffset = parseFloat( $that.data("dashoffset") );
	var projectlink = $that.attr('href');
	var projecttitle = $that.find('title').text();

	//console.log( "projectColor : " + projectColor + " projectStroke : " + projectStroke + " projectCategorie : " + projectCategorie + " projectDashOffset : " + projectDashOffset );

	if ( isBodyBusy() ) {
		return false;
	}

	/****************************************************************************
		CAS SPECIAUX : un projet deja ouvert
	 ***************************************************************************/
	if($('.is-current').length){
		closeProject();
		$('.is-current').removeClass('is-current');
	}

	/****************************************************************************
		Avant le chargement
	 ***************************************************************************/

	// prevenir qu'on le charge
	$('body').addClass('is-loading is-project');
	$that.addClass('is-current is-viewed');

	// vider ce qui est déjà en place
	$(".conteneurProjet svg").remove();
	$(".conteneurProjet article.projet").empty();
	$('.offscreenDump').empty();

	// changer l'historique et le titre, récupérer la categorie et l'attribuer au conteneur du projet complet
	history.pushState( projectlink, document.title, projectlink);
	$("head > title").html('Émilie Coquard | ' + projecttitle);
	$(".conteneurProjet article.projet").attr("data-categorie", projectCategorie);

	// copierle svg, le placer dn le conteneur
	var $thisSVGClone = $that.find("svg").clone();
	$(".conteneurProjet").prepend( $thisSVGClone );

	/****************************************************************************
		Animer le SVG
	 ***************************************************************************/

	d3.select( ".conteneurProjet svg" ).selectAll(".pointsLignes, .polygones")
		.style("fill", "transparent")
		.style("stroke", "transparent");

	$(".conteneurProjet svg").css("background-color", projectColor );
	$(".conteneurProjet .border").css("border-color", projectColor );
	$("#entete .conteneurEntete").css("border-color", projectColor );

	$(".conteneurProjet").addClass("is-loading");
	$(".conteneurProjet svg").css("opacity", 1);

	polygonStrokeAnimation();

	function polygonStrokeAnimation() {
		d3.select( ".conteneurProjet svg" ).select(".polygones")
			.style("stroke", "#fff")
			.style("stroke-width", 1.2)
			.attr("stroke-dasharray", projectDashOffset )
			.attr("stroke-dashoffset", projectDashOffset )
			.transition()
			.duration( 800)
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
						.duration( 800)
						.attr("stroke-dashoffset", -projectDashOffset )
						.each( "end", function() {
							polygonStrokeAnimation();
				    });

				}
	    });
  }

	function polygonesFillAnimation() {
		d3.select( ".conteneurProjet svg" ).select(".polygones")
			.style("fill", "rgba(255,255,255,0)")
			.transition()
			.duration( 600)
			.style("fill", "rgba(255,255,255,1)")
			.each( "end", function() {
				loadProjectContent();
			});
	}

	function loadProjectContent() {

		var contents = $('.offscreenDump article.is-ready').html();
		$(".conteneurProjet article.projet").append(contents);

		$(".conteneurProjet").removeClass("is-loading").addClass("is-filling").find("svg")
			.transition(
				{ y : -200 },
				400,
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

			console.log( "init settimeout");
			var posScrollPage = window.pageYOffset;
			$(".conteneurProjet article.projet img.is-first").removeClass("is-hidden");
			//revealImages( posScrollPage );

			// updater les positions des borders
			borderTopPos = $(".conteneurProjet").offset().top;
			borderBottomPos = $(".conteneurProjet").offset().top + $(".conteneurProjet").height();

			$borderTop.css("width", $(".conteneurProjet").width() );

		}, 400);

	}

	/****************************************************************************
		Chargement AJAX
	 ***************************************************************************/

	var urlToLoad = "./projets-contents/" + projectlink;

	if ( window.pageYOffset > 0 ) {
		gotoByScroll( $("body") );
	}

	$.get( urlToLoad, function( data ) {

		var dataWithoutImages = data.replace(/src/ig, 'data-src');
		$data = $(dataWithoutImages);

		// retirer la class projet à l'article qui sera chargé
		$data.find('article').removeClass("projet");

		// compter le nombre d'images à charger
		//console.log( $data.find("img").length );

		console.log( $data );

		// récupérer le 3 premières image
		var $imagesToLoad = $data.find("img").slice(0,3);
		// ... au cas où il y en aurait moins de 3 dans l'article
		var $remainingImages = $imagesToLoad.length;

		// pour chaque, redonner la bonne source à partir de data-src, et attacher un événement "au chargement de l'image"
		if( $remainingImages > 0 ) {

			$imagesToLoad.each( function() {

				$(this).attr("src", $(this).data("src") );

				imagesLoaded ( $(this) , function() {

					// pour chaque image, réduire le compteur d'images restantes à charger
					$remainingImages--;
					//console.log( "$remainingImages : "+ $remainingImages );

					// si on atteint 0 (plus d'images à charger donc)
					if ( $remainingImages === 0 ) {

						//console.time("Image manipulation");

						// charger toutes les autres images
						$data.find("img").each(function( index ) {
							$this = $(this);

							if( index < 3 ) {
								// annoter la première (pour animation dans CSS)
								$this.addClass("is-first");
								$this.addClass("is-hidden");
							}

							// les passer en invisibles (désactiver car trop couteux en performance)
							//$this.addClass("is-hidden");

							// les charger en remettant leur source
							if ( $this.attr("src") === undefined ) {
								$this.attr("src", $this.data("src") );
							}

						});

						// placer le contenu dans offscreenDump
						$('.offscreenDump').html($data);

						// say it's ready, pour indiquer à l'animation d3 de démarrer quand elle veut
						$('.offscreenDump article').addClass("is-ready");

						//console.timeEnd("Image manipulation");

					}
				});
			});
		} else {
			// placer le contenu dans offscreenDump
			$('.offscreenDump').html($data);

			// say it's ready, pour indiquer à l'animation d3 de démarrer quand elle veut
			$('.offscreenDump article').addClass("is-ready");
		}
	});

}


function onIconEvents( $this ) {

	$this.on('mouseenter', function(e) {

		$that = $(this);
		$that.addClass("is-active");


		link = $that;
		//create .ink element if it doesn't exist
		if(link.find(".ink").length == 0)
			link.append("<span class='ink'></span>");

		ink = link.find(".ink");
		//incase of quick double clicks stop the previous animation
		ink.removeClass("animate");

		//set size of .ink
		if(!ink.height() && !ink.width())
		{
			//use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
			d = Math.max(link.outerWidth(), link.outerHeight());
			ink.css({height: d, width: d});
		}

		//get click coordinates
		//logic = click coordinates relative to page - parent's position relative to page - half of self height/width to make it controllable from the center;
		x = e.pageX - link.offset().left - ink.width()/2;
		y = e.pageY - link.offset().top - ink.height()/2;

		//set the position and add class .animate
		ink.css({top: y+'px', left: x+'px'}).addClass("animate");

	});

	$this.on('mouseleave', function(e) {
		$that = $(this);
		$that.removeClass("is-active");

		$that.find(".ink");
	});

	$this.on('click', function(e) {

		$that = $(this);
		e.preventDefault();

		// envoyer à google analytics l'info de chargement
		ga('send', 'pageview', $that.attr("href") );
		loadNewProject( $that );


	});
}

function onPropos() {

	$("#entete .tagline a").on('click', function(e) {

		$that = $(this);
		e.preventDefault();

		// load la case invisible
		var $projetIconDemande = $(".grilleIcones .item#apropos");
		// si il y en a un qui correspond, on le charge
		if ( $projetIconDemande.length ) {

			// envoyer à google analytics l'info de chargement
			ga('send', 'pageview', $that.attr("href") );
			loadNewProject( $projetIconDemande );
		}


	});

}

function revealImages( scrollfromtop ) {

	if ( $(".conteneurProjet").hasClass("is-filled") ) {

		// position : le scroll + la hauteur de la fenêtre = position dans la page en bas de la fenêtre
		scrollfromtop += $(window).height();

		//console.log( titreProche( $(".conteneurProjet article.projet img"), scrollfromtop) );
		var $closestTitre = titreProche( $(".conteneurProjet article.projet img"), scrollfromtop );

		if ( $closestTitre !== false && $closestTitre !== undefined ) {
			$closestTitre.removeClass("is-hidden");
		}
	}
}

function titreProche(selector, modwscrollTop) {
	var dist = 0;
	var pDist = 10000000000;
	//optimisation : stocker le numéro d'article plutôt que l'article : http://jsperf.com/jquery-each-this-vs-eq-index
	var numTitre = -1;
	var $titres = selector;
	var moreThanOne = false;
	$titres.each(function(index) {
		dist = modwscrollTop - $(this).offset().top;
		if (dist > 0 && dist < pDist) {
			pDist = dist;
			numTitre = index;
		} else
		// si plusieurs à la même distance
		if ( dist === pDist ) {
			moreThanOne = true;
			pDist = dist;
			numTitre = index;
		}
		//console.log( "this.offsetTop : " + $(this).offset().top);
	});
	if ( numTitre !== -1 ) {

		if ( !moreThanOne ) {
			var titreactif = $titres.eq(numTitre);
			return titreactif;
		} else {
			var titresactifs = $titres.slice(0, numTitre + 1);
			return titresactifs;
		}
	}
	return false;
}



function isBodyBusy() {
	if ( $("body").hasClass("is-busy") ) {
		return true;
	}
	return false;
}

function closeProject() {

	$(".conteneurProjet article").empty();
	$(".conteneurProjet").removeClass("is-loading is-filled is-filling");
	$('body').removeClass("is-busy is-project");

	$("#entete .conteneurEntete").css({ y: 0 });
	$("#entete .conteneurEntete").css({ paddingBottom: 100 });

}

function fixedBorderTop(scrollfromtop) {

	if ( $(".conteneurProjet").hasClass("is-filled") ) {

		borderBottomPos = $borderBottom.offset().top;
		enteteBottom = $entete.offset().top + $entete.height();

		//console.log( " scrollfromtop : " + scrollfromtop +  " borderBottomPos : " + borderBottomPos );

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
			//console.log( " — scrollUpEntete : " + scrollUpEntete );

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

// fonction scroll vers le projet au click dans le header ou au clavier
var gotoByScroll = function ( $eles ) {
    $('html, body').animate({
	        scrollTop: $eles.offset().top
	    }, 400, 'easeInOutQuint');
}

function checkHash() {

	var path = window.location.pathname.substring( window.location.pathname.lastIndexOf("/") + 1 );
	if(path !== '' && path !== '/'){
		return path;
	}

	return false;
}


$("document").ready( function() {

	/****************************************************************************
		INITIALISATION de la page
	 ***************************************************************************/

	console.time("Init page");

	// faire rentrer le texte dans l'entete
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
			filterProjectIcons( $(this) );
		});
	});

	onPropos();

	/****************************************************************************
		ANIMATE ALL THE THINGS!
	 ***************************************************************************/

	$("body").addClass("is-loaded");

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

	/**************************** pour chaque icone de la grille ***************************************/
	setTimeout( fadeIconsToView(), 800 );

	console.timeEnd("Init page");

	/* ==========================================================================
									VU PROJET
	   ========================================================================== */
	var posScrollPage = window.pageYOffset;
	fixedBorderTop(posScrollPage);

	$(window).scroll(function() {
		var posScrollPage = window.pageYOffset;
		fixedBorderTop(posScrollPage);
		revealImages( posScrollPage );

	});

	$(window).resize(function() {

	});

	/****************************************************************************
		HASH Check : si il y a un projet réquisitionné, le charger de 0 en ajax
	 ***************************************************************************/

	// quel lien a été demandé ?
	var lienDemande = checkHash();
	// y en a t'il un ?
	if ( lienDemande ) {
		// chercher dns les icones le projet qui correspond
		var $projetIconDemande = $(".grilleIcones .item[href='" + lienDemande + "']");
		// si il y en a un qui correspond, on le charge
		if ( $projetIconDemande.length ) {
			loadNewProject( $projetIconDemande );
		}
	}

});

