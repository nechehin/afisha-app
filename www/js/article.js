// ==ClosureCompiler==

/**
 * Init article elements
 * @param {element} articleBox
 * @returns {element}
 */
function initArticle(articleBox) {
        
    // if allready inited, return
    if (!!$(articleBox).data('inited')) {
        return articleBox;
    }
    
    
    initGalleries(articleBox);
//    initImages(articleBox);
    initEmbeds(articleBox);
    initTags(articleBox);
    initRelatedBlock(articleBox);
    initNumberedLists(articleBox);
    
    $(articleBox).data('inited', true);
    
    return articleBox;
};


/**
 * Init article galeries
 * @param {element} articleBox
 */
function initGalleries(articleBox) {
    
    var d = document, w = window;
    
    var bannerBox = d.createElement('div');
    var imagesHeightLimited = false;
    

    /**
     * Fix images height after resize window
     * @param {HTMLElement} galleryBox
     * @param {swiper object} swiper
     * @returns {void}
     */
    function resizeGallery(galleryBox, swiper) {
        
        fastdom.read(function(){
        
            var windowWidth = Tochka.winWidth();

            fastdom.write(function(){
            
                if (windowWidth < 1020) {
                    $('.gallery-image', galleryBox).css('max-height', Math.ceil(windowWidth * 0.75) + 'px');
                    imagesHeightLimited = true;
                } else if (imagesHeightLimited) {
                    $('.gallery-image', galleryBox).css('max-height', '100%');
                    imagesHeightLimited = false;
                }

                var isFullscreen = $(galleryBox).data('fullscreen') || false;

                if (isFullscreen) {
                    loadFullScreenImage(swiper);
                }
            });
        });
    }
    
    
    /**
     * Get index of active slide
     * @param {swiper object} swiper
     * @returns {numeric}
     */
    function getActiveIndex(swiper) {
        return parseInt(swiper.slides[ swiper.activeIndex ].getAttribute('data-swiper-slide-index'));
    }
    
    /**
     * 
     * @param {HTMLElement} galleryBox
     * @param {object} swiper
     * @returns {void}
     */
    function showDescription(galleryBox, swiper) {
                
        var descriptionBox = $('.description', galleryBox);
        var slideDescription = $('.slide-description', swiper.slides[ swiper.activeIndex ]).html().trim();

        var description = '<b>Фото ' + (parseInt(getActiveIndex(swiper)) + 1) + ' из ';
            description += $(galleryBox).data('countSlides') + (slideDescription ? ':' : '') + '</b> ';
            description += slideDescription;
            
        descriptionBox.html( description );
    }
    
    /**
     * Active thumb and scroll to it
     * @param {HTMLElement} thumbsBox
     * @param {element} thumbsWrapper
     * @param {object} swiper
     * @returns {void}
     */
    function activateThumb(thumbsBox, thumbsWrapper, swiper) {

        $('.active', thumbsWrapper).removeClass('active');
        
        var activeThumb = $('.thumb', thumbsWrapper)
                                .eq( getActiveIndex(swiper) )
                                .addClass('active');

        fastdom.read(function(){
            
            var centeredPadding = (thumbsWrapper.width()/2);
            var activeThumbPosLeft = activeThumb.position().left;
            var twScrollLeft = thumbsWrapper.scrollLeft();
                
            thumbsWrapper.animate( {
                scrollLeft: activeThumbPosLeft - centeredPadding + twScrollLeft
            }, 300, function(){
                checkThumbsNavigationState(thumbsBox, thumbsWrapper);
            });
        });
    }
    
    
    /**
     * Enable or disable thumbs navigation buttons
     * @param {HTMLElement} thumbsBox
     * @param {element} thumbsWrapper
     * @returns {void}
     */
    function checkThumbsNavigationState(thumbsBox, thumbsWrapper) {
        
        var prev = $('.thumb-button-prev', thumbsBox);
        var next = $('.thumb-button-next', thumbsBox);
        
        fastdom.read(function() {
            
            var twScrollLeft = thumbsWrapper.scrollLeft();
            
            if (!twScrollLeft) {

                prev.addClass('disabled');
                
            } else if (prev.hasClass('disabled')) {

                prev.removeClass('disabled');
            }

            if ( (thumbsWrapper[0].scrollWidth - twScrollLeft) <=  $(thumbsBox).width()) {

                next.addClass('disabled');
                
            } else if (next.hasClass('disabled')) {

                next.removeClass('disabled');
            }
        });
    }
    
    
    /**
     * Run fullscreen mode
     * @param {HTMLElement} galleryBox
     * @param {swiper object} swiper
     * @returns {void}
     */
    function togglePopupMode(galleryBox, swiper) {
        
        var isFullscreen = $(galleryBox).data('fullscreen') || false;
        
        if (!isFullscreen) {
 
            $(galleryBox).data('scrolltop', w.pageYOffset);
            
            Tochka.addClass(galleryBox, 'fullscreen');
            Tochka.addClass(d.documentElement, 'noscroll fullscreen');
            Tochka.addClass(d.body, 'noscroll fullscreen');
                        
            loadFullScreenImage(swiper);
            
            swiper.enableKeyboardControl();
            
            loadBanner(galleryBox);
            
            isFullscreen = true;
            
            var FShandler = function(){ 
            
                resizeGallery(galleryBox, swiper);
                swiper.onResize();
   
                d.removeEventListener("fullscreenchange", FShandler);
                d.removeEventListener("webkitfullscreenchange", FShandler);
                d.removeEventListener("mozfullscreenchange", FShandler);
                d.removeEventListener("msfullscreenchange", FShandler);
            };
            
            d.addEventListener("fullscreenchange", FShandler);
            d.addEventListener("webkitfullscreenchange", FShandler);
            d.addEventListener("mozfullscreenchange", FShandler);
            d.addEventListener("msfullscreenchange", FShandler);
            
            enableFullscreen(galleryBox);

        } else {
            
            var FShandler = function(){ 
            
                resizeGallery(galleryBox, swiper);
                swiper.onResize();
            
                $(d).scrollTop($(galleryBox).data('scrolltop'));

                d.removeEventListener("fullscreenchange", FShandler);
                d.removeEventListener("webkitfullscreenchange", FShandler);
                d.removeEventListener("mozfullscreenchange", FShandler);
                d.removeEventListener("msfullscreenchange", FShandler);
            };
            
            d.addEventListener("fullscreenchange", FShandler);
            d.addEventListener("webkitfullscreenchange", FShandler);
            d.addEventListener("mozfullscreenchange", FShandler);
            d.addEventListener("msfullscreenchange", FShandler);

            disableFullscreen();
            
            Tochka.rmClass(galleryBox, 'fullscreen');
            Tochka.rmClass(d.documentElement, 'noscroll fullscreen');
            Tochka.rmClass(d.body, 'noscroll fullscreen');

            $(d).scrollTop($(galleryBox).data('scrolltop'));
            
            swiper.disableKeyboardControl();
                        
            isFullscreen = false;    
        }

        $(galleryBox).data('fullscreen', isFullscreen);   
        
        resizeGallery(galleryBox, swiper);
        swiper.onResize();
    }
    
    
    /**
     * Enable gallery fullscreen mode
     * @param {HTMLElement} galleryBox
     * @returns {void}
     */
    function enableFullscreen(galleryBox) {
        if (!d.fullscreenElement && // alternative standard method
                !d.mozFullScreenElement && !d.webkitFullscreenElement && !d.msFullscreenElement) {  // current working methods
                            
            if (galleryBox.requestFullscreen) {
                galleryBox.requestFullscreen();
            } else if (galleryBox.msRequestFullscreen) {
                galleryBox.msRequestFullscreen();
            } else if (galleryBox.mozRequestFullScreen) {
                galleryBox.mozRequestFullScreen();
            } else if (galleryBox.webkitRequestFullscreen) {
                galleryBox.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
    }
    
    
    /**
     * Disable gallery fullscreen mode
     * @returns {void}
     */
    function disableFullscreen() {
        if (d.exitFullscreen) {
            d.exitFullscreen();
        } else if (d.msExitFullscreen) {
            d.msExitFullscreen();
        } else if (d.mozCancelFullScreen) {
            d.mozCancelFullScreen();
        } else if (d.webkitExitFullscreen) {
            d.webkitExitFullscreen();
        }
    }
    
    
    /**
     * Lazy load big fullscreen images
     * @param {HTMLElement} galleryBox
     * @param {object} swiper
     * @returns {void}
     */
    function loadFullScreenImage(swiper) {
        $('.fs-image', $([ swiper.slides[swiper.activeIndex], swiper.slides[swiper.activeIndex + 1] ])).each(function(){
            
            var windowWidth = Tochka.winWidth();
            
            if (windowWidth <= 660 && Tochka.hasClass(this, 'big')) {
                return;
            } else if (windowWidth > 660 && Tochka.hasClass(this, 'sm')) {
                return;
            }
            
            if (!Tochka.hasClass(this, 'loaded')) {

                this.src = this.getAttribute('data-src');
                this.removeAttribute('data-src');
                Tochka.addClass(this, 'loaded');
            }
        });
    }
    

    /**
     * Load banner holder
     * @param {HTMLElement} galleryBox
     * @returns {void}
     */
    function loadBanner(galleryBox) {

        if (Tochka.winWidth() < 1020) {
            return;
        }
        
        if (!bannerBox.innerHTML) {
            $(bannerBox).load('/gallery-popup/', function(){
                $('.banner', galleryBox).append(bannerBox);
            });
        } else {
            $(bannerBox).detach().appendTo( $('.banner', galleryBox) );
        }
        
    }
    
    
    var bannerLoading = false;
    
    /**
     * Refresh banner on gallery navigation
     * @param {HTMLElement} galleryBox
     * @returns {boolean}
     */
    function refreshBanner(galleryBox, withThumbs) {
        
        if (bannerLoading || Tochka.winWidth() < 1020) {
            return false;
        }
        
        if (!$(galleryBox).data('fullscreen')) {
            
            if (withThumbs) {
                
                $('.refreshedBanner > div').each(function(){
                    reloadBanner.load( this.id );
                });
            }
            
        } else {

            $('.refreshedBanner > div', galleryBox).each(function(){
                reloadBanner.load( this.id );
            });
        }
        
        bannerLoading = true;
        
        setTimeout(function() {
            bannerLoading = false;
        }, 3000);
        
        return true;
    }
    
    
    /**
     * Set current progress on progressBar
     * @param {HTMLElement} galleryBox
     * @param {jQuery object} progressBar
     * @param {object} swiper
     * @returns {void}
     */
    function setProgress(galleryBox, progressBar, swiper) {
        
        var progress = 0;
        var countSlides = $(galleryBox).data('countSlides');
        var activeIndex = getActiveIndex(swiper);

        if (countSlides) {
            progress = Math.ceil( (100/countSlides) * (activeIndex + 1) );
        }
        
        if (progress > 100) {
            progress = 100;
        }
                
        progressBar.css('transform', 'translateX(-' + (100 - progress) + '%)');
    }
    
    
    /**
     * Show virtual slide with banner 
     * @param {HTMLElement} galleryBox
     * @returns {void}
     */
    function showBannerSlide(galleryBox) {
        
        var bannerBox = $(galleryBox.getElementsByClassName('banner-slide'));
        bannerBox.removeClass('hidden');
        
        $('.banner', bannerBox).each(function(){
            
            if ( $(this).data('inited') ) {
                reloadBanner.load( this.id );
            } else {
                new holder(this, { block: parseInt($(this).data('block')) });
                $(this).data('inited', true);
            }
        });
    }
    
 
    /**
     * Apply for all galeries in article
     */
    console.log(articleBox);
    [].forEach.call(articleBox.getElementsByClassName('gallery'), function(galleryBox) {

        // store real count of slides
        $(galleryBox).data('countSlides', galleryBox.getElementsByClassName('swiper-slide').length );
        
        var withThumbs = false,
            thumbsBox = galleryBox.querySelector('.thumbs'),
            progressBar = $(galleryBox.getElementsByClassName('progress')),
            slided = false;

        if (!!thumbsBox) {
            withThumbs = true;
            var thumbsWrapper = $(thumbsBox.getElementsByClassName('wrapper'));
        }
        

        // Rating
        var withRating = false;
        var ratingBox = galleryBox.getElementsByClassName('rating');
        
        if (ratingBox.length) {
            
            withRating = true;
            
            var likeWord = ( _LANG === 'ru' ? 'нравится' : 'подобається' );

            $(ratingBox).rating({
                skin: '',
                progress: false,
                ajax: {
                    data: {
                        object_id: 0,
                        object_type: 'photo',
                        section: galleryBox.getAttribute('data-section')
                    }
                },
                rating : {
                    0 : {
                        eButtonText: '<span class="glyph icon-like"></span><span class="text">' + likeWord + '</span>'
                    },
                    1 : {
                        eButtonText: '<span class="glyph icon-dislike"></span><span class="text">не ' + likeWord + '</span>'
                    }
                }
            });

            var ratingAsyncStorage = new preloadStorage();

            ratingAsyncStorage.getAjaxConfig = function (keys) {
                return {
                    type: 'post',
                    url: '/rating/get/',
                    data: {
                        object_id: keys,
                        object_type: 'photo',
                        section: galleryBox.getAttribute('data-section')
                    }
                }
            };

            ratingAsyncStorage.onGetValue(function(key, value){
                $(ratingBox).rating('option',  {
                        setRating : value,
                        setObjectId: key
                });
            });

            [].forEach.call(galleryBox.getElementsByClassName('swiper-slide'), function(slide) {
                ratingAsyncStorage.addKey(slide.getAttribute('data-image-id'));
            }); 
        }
        
        // Enable mobile size images
            
          
        if (Tochka.winWidth() < 361) {
            [].forEach.call(galleryBox.getElementsByClassName('gallery-image'), function(image){
                var smallSrc = image.getAttribute('data-src-m');
                if (smallSrc) {
                    image.setAttribute( 'data-src', image.getAttribute('data-src-m') );
                }
            });
        }
                
        var viewsCounterForBanner = 0;
 
        // init swiper
        var swiper = new Swiper( galleryBox.getElementsByClassName('swiper-container'), {
            
            nextButton: galleryBox.getElementsByClassName('swiper-button-next'),
            prevButton: galleryBox.getElementsByClassName('swiper-button-prev'),
            
            preloadImages: false,

            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            
            loop: true,
            
            onInit: function(swiper){

                if (withThumbs) {
                    activateThumb(thumbsBox, thumbsWrapper, swiper);
                }
                
                showDescription(galleryBox, swiper);
            },
            
            onSlideChangeStart: function(swiper) {
                
                if (withThumbs && !$(galleryBox).data('fullscreen')) {
                    activateThumb(thumbsBox, thumbsWrapper, swiper);
                } else {
                    setProgress(galleryBox, progressBar, swiper);
                }
                
                if ($(galleryBox).data('fullscreen')) {
                    loadFullScreenImage(swiper);
                }
                
                showDescription(galleryBox, swiper);                
            },

            onSlideChangeEnd: function(swiper) {
                
                if (withRating) {
                    ratingAsyncStorage.getValue(swiper.slides[swiper.activeIndex].getAttribute('data-image-id'));
                }
                
                if (slided) {

                    refreshBanner(galleryBox, withThumbs);
                    
                    // track slide
                    var index = getActiveIndex(swiper);
                    Tochka.analytics.trackPageView(w.location.pathname + 'img_' + (index < 10 ? '0' + index : index));
                    
                    if (Tochka.winWidth() > 1019 || location.search.indexOf('adg') >= 0) {
                        if (!$(galleryBox).data('fullscreen') && viewsCounterForBanner++ === 5) {
                            showBannerSlide(galleryBox);
                            viewsCounterForBanner = 0;
                        }
                    }
                    
                } else {
                    
                    slided = true;
                }

            }
            
        });

        
        // next slide on click image
        $(galleryBox.querySelectorAll('.gallery-image, .fs-image')).on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            swiper.slideNext();
        });


        // resize page handler
        resizeGallery(galleryBox, swiper);
        
        w.addEventListener('resize', function(){
            resizeGallery(galleryBox, swiper);
        });
        
        
        // thumbs init
        if (withThumbs) {
            
            checkThumbsNavigationState(thumbsBox, thumbsWrapper);
            
            thumbsWrapper.on('scroll', function() {
                checkThumbsNavigationState(thumbsBox, thumbsWrapper);
            });
            
            
            $('.lazy', galleryBox).lazyload({
                container: thumbsWrapper,
                skip_invisible: true
            });
            // fix for mobile chrome
            $(thumbsWrapper).scroll();
            
            
            $(thumbsBox.getElementsByClassName('thumb')).on('click', function(){
   
                swiper.slideTo( $(this).index()+1 );
              
                return false;
            });
            
            
            $(thumbsBox.querySelectorAll('.thumb-button-prev, .thumb-button-next')).on('click', function(){
                
                var self = this;
                
                fastdom.read(function(){
                    
                    var twScrollLeft = thumbsWrapper.scrollLeft();
                    var tbWidth = $(thumbsBox).width();
                    
                    if (Tochka.hasClass(self, 'thumb-button-prev')) {
                        var newScrollLeft = twScrollLeft - tbWidth;
                    } else {
                        var newScrollLeft = twScrollLeft + tbWidth;
                    }
                    
                    fastdom.write(function(){
                        
                        thumbsWrapper.animate( {
                            scrollLeft: newScrollLeft
                        }, 300, function(){ 
                            checkThumbsNavigationState(thumbsBox, thumbsWrapper); 
                        });
                    });
                    
                });
                                
                return false;
            });
            
        }
        
        // fullscreen mode
        $(galleryBox.getElementsByClassName('fs-button')).on('click', function(e){
            
            e.preventDefault();
            e.stopPropagation();
  
            togglePopupMode(galleryBox, swiper);
            
            if (!$(galleryBox).data('fullscreen')) {
                if (withThumbs) {
                    activateThumb(thumbsBox, thumbsWrapper, swiper);
                }
            } else {
                setProgress(galleryBox, progressBar, swiper);
            }
        });
        
        // close fullscreen on key press ESC
        $(d).on('keyup', function(event){
            if (event.keyCode === 27 && $(galleryBox).data('fullscreen')) {
                togglePopupMode(galleryBox, swiper);
            }
        });
        
        
        $(galleryBox.getElementsByClassName('btn-banner-close')).on('click', function(){
            Tochka.addClass(this.parentNode, 'hidden');
        });
        
    });
    
}


/**
 * Init images in articles
 * @param {element} articleBox
 * @returns {void}
 */
//function initImages(articleBox) {
//        
//    [].forEach.call(articleBox.getElementsByClassName('imgInsideArticle'), function(image){
//  
//        if (Tochka.hasClass(image, 'wrapped')) {
//            return;
//        }
//        
//        var titleBox = image.nextSibling;
//        var wrapper = document.createElement('figure');
//        var caption = document.createElement('figcaption');
//
//        image.parentNode.appendChild(wrapper);
//
//        wrapper.appendChild(image);
//
//        // description
//        if (image.getAttribute('data-description')) {
//            
//            var descBox = document.createElement('span');
//                descBox.innerHTML = image.getAttribute('data-description') + ' ';
//                
//            caption.appendChild(descBox);
//        }
//
//        // author and sources
//        if (titleBox && titleBox.className === 'phototitle' && !!titleBox.innerHTML) {
//            titleBox.style.display = 'inline-block';
//            Tochka.addClass(titleBox, 'copyrights');
//            caption.appendChild(titleBox);
//        }
//
//        wrapper.appendChild(caption);
//        
//        Tochka.addClass(image, 'wrapped');
//    });
//  
//}


/**
 * Init tags block
 * @param {HTMLElement} articleBox
 * @returns {void}
 */
function initTags(articleBox) {
    
    var tagsBox = $(articleBox.getElementsByClassName('tags'));
    var seoTags = $('.seotags', tagsBox);
    
    $('.toggle-tags', tagsBox).click(function(){
        seoTags.toggle();
        $(this).toggleClass('toggled');
        return false;
    });
}


function initRelatedBlock() {
    $(document.querySelectorAll('.related-articles .lazy')).lazyload({
        skip_invisible: true
    });
}


function initNumberedLists(articleBox) {
    
    [].forEach.call(articleBox.getElementsByTagName('ol'), function(ol) {
        
        var start = ol.getAttribute('start');
        
        if (start) {
            start = parseInt(start) - 1;
            ol.style["counter-reset"] = 'list ' + start;
        }
    });
}


function initEmbeds(articleBox) {
    
    // Load instagram embed script
    if (articleBox.getElementsByClassName('embed-instagram').length) {
        var s = document.createElement('script');
        s.async = s.defer = true;
        s.src = '//platform.instagram.com/en_US/embeds.js';
        document.head.appendChild(s);
    }
    
}



/**
 * Init article after load
 */
$(function(){
    
    [].forEach.call(document.getElementsByTagName('article'), initArticle);
      
});




