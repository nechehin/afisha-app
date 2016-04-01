/*Alexey Pasikov*/

(function ($, undefined) {

    var _super = $.widget.prototype,
        horizontal = {
            pos: 'left',
            pos2: 'right',
            dim: 'width',
            transitionMode: false
        },
        vertical = {
            pos: 'top',
            pos2: 'bottom',
            dim: 'height',
            transitionMode: false
        };

    $.widget("tochka.gallery", {

        /* default options*/
        options:{

            /*global*/
            static : false,
            skin: '',
            track_name: 'gallery_main',
            infinity: true,
            auto_play: false,
            start_index: 0,
            clones: false,
            callbackAfterCreate: null,
            callbackTumbsClick: null,
            callbackNextPrevActions: null,
            callbackOpenPopup: null,
            callbackNextPrevActionsPopup: null,

            auto_scroll: false,
            auto_scroll_interval: 0,

            touchEvents: true,

            /*gallery options*/
            gallery: {
                _class  : 'elements',
                show    : true,
                step    : 1,
                size    : 3,
                speed   : 0,
                width   : '',
                height  : '',
                step_dim : 640,
                indent  : 0,
                start_index: 0,
                photo_index: false,
                carousel: true,
                orientation:'horizontal',
                navigation: true,
                cl_next:'btn-next middle',
                cl_prev:'btn-prev middle',
                zoom: false,
                zeropixel : false,
                bt_view:{
                    _class   : 'btn-view',
                    open    : false,
                    close   : false
                },

                /*pagination*/
                pagination:{
                    show    : false,
                    _class   : 'pagination',
                    toggle_view: false
                },
                template : '<li class="item">' +
                '<a href="#" class="image" onclick="return false;"><span src="{{src}}"></span></a>' +
                '<div class="description">{{description}}</div>' +
                '</li>',
                filters: {
                    show: false,
                    data: {}
                },
                counter: {
                    show : false,
                    size : 1,
                    type : 'page'
                },
                rating: {
                    show : false,
                    section: null,
                    ajax : function (keys) {
                        return {
                            type: 'post',
                            url: '/rating/get/',
                            data: {
                                object_id: keys,
                                object_type: 'photo'
                            }
                        }
                    }
                },
                socialpanel: {
                    show: false,
                    section_alias : ''
                }
            },

            /*thumbs options*/
            thumbs: {
                show    : true,
                _class   : 'thumbs',
                step    : 6,
                size    : 12,
                speed   : 500,
                width   : 82,
                height  : 82,
                step_dim : 82,
                indent  : 8,
                photo_index: true,
                start_index: 0,
                carousel: true,
                orientation:'horizontal',
                navigation: true,
                cl_next:'btn-next middle',
                cl_prev:'btn-prev middle',
                zoom: false,
                center: true,
                bt_view:{
                    _class: 'btn-view middle',
                    open    : true,
                    close   : true
                },

                /*pagination*/
                pagination:{
                    show    : false,
                    _class   : 'pagination',
                    toggle_view: false
                },

                template : '<li class="item"><a href="#" class="image" onclick="return false;"><span src="{{src_thumb}}"></span></a></li>'
            },

            /*popup*/
            popup:{
                show    : false,
                minWidth : 1024,
                minHeight : 620,
                visible : 0,
                loader_src: '',
                buttons  : {
                    zoom: '<em class="btn-zoom"></em>'
                },
                info_box : false,
                data: {
                    article_id: null,
                    gallery_id: null,
                    photo_id : null
                },

                cl_next:'btn-next middle',
                cl_prev:'btn-prev middle',
                track_name : 'gallery_popup'
            },

            /*see more*/
            ablock:{
                show: true,
                count: 0,
                block:{
                    _html: '',
                    _class  : 'ablock see-more',
                    ajax    :
                    {
                        url: '',
                        type: 'GET',
                        dataType : 'html',
                        data: {}
                    },
                    thumbs  : true,
                    item  : '<span><span>Смотри еще...</span></span>',
                    overlay : true
                }
            },

            /*data*/
            json:{
                data_   : false,
                url     : 'data/json.json',
                type    : 'GET',
                dataType: 'json',
                cache   : false
            }
        },

        startX: null,
        startY: null,
        isMoving: false,

        _create: function () {
            var _this = this;

            !this.options.static
                ? this._getElements()
                : this.initStaticObject();

            if(typeof this.gallery != 'undefined' && typeof this.gallery.item[0] != 'undefined') {
                var descriptions = this.gallery.item[0].getElementsByClassName('description');
                if (descriptions.length) {
                    for (n = 0; n < descriptions.length; ++n) {
                        if (descriptions[n].innerHTML == '') {
                            $(descriptions[n]).hide();
                        }
                    }
                }
            }

            if(this.options.auto_scroll) {
                this.initAutoScroll();
            }

            if (this.options.gallery.rating.show) {
                this.initRating();
            }

            this.initSkins(this.options.skin);

            if(null != _this.options.callbackAfterCreate) {
                this.options.callbackAfterCreate();
            }

            this.startPosition();

        },

        startPosition: function(){

            if(window.location.href.indexOf('img-') != -1){
                var str = window.location.href,
                    s_pos = window.location.href.indexOf('img-') + 4,
                    e_pos = window.location.href.indexOf('/', s_pos),
                    id_img = str.substring(s_pos, e_pos);

                for(var i in this.gallery.image){
                    if(this.gallery.image[i].id == id_img){
                        this.gallery.start_index = i;
                    }
                }
            }

            if(this.gallery.start_index != 0 && this.options.thumbs.show){
                this._appendElements(this.gallery, true);
                this._appendElements(this.thumbs, true);
                $(this.thumbs.mask).find('li').eq(this.gallery.start_index).click();
            }


            if(this.gallery.start_index != 0 && !this.options.thumbs.show){
                this._appendElements(this.gallery, true);
                this._go(this.gallery, this.gallery.start_index);
            }

        },

        initGallery: function(data){

            this.gallery = this.options.gallery;
            this.gallery.image = [];
            this._initObject(this.gallery, data);
            this.gallery.name = 'gallery';

            if (this.options.infinity && !this.options.clones && this.gallery.step == this.gallery.countPage) {
                this.disableBtnPrevNext(this.gallery, this.gallery.start_index);
            }

            if(this.options.clones && this.gallery.step != 1) {
                this.indexFirstPage(this.gallery);
            }

            if(this.options.clones && this.gallery.step == 1) {
                this.indexFirstPageStepOne(this.gallery);
            }

            /*filter*/
            if(this.options.gallery.filters.show) {
                this.initFilters(this.gallery, data);
            }

            /*counter*/
            if(this.options.gallery.counter.show) {
                this.initCounter();
            }

            /*zeropixel*/
            if(this.options.gallery.zeropixel) {
                this.initZeroPixel();
            }

            return this.gallery;
        },
        initThumbs: function(data){
            this.thumbs = this.options.thumbs;
            this.thumbs.name = 'thumbs';
            this._initObject(this.thumbs, data);
            this._addEventThumbs();

            return this.thumbs;
        },
        initPagination: function(obj){

            this._extendObject(obj.pagination);
            this._addPagination(obj);
        },
        initAjaxBlocks: function (){
            var _this = this;

            this.ablock = this.options.ablock;

            $.each(this.ablock, function(e, obj) {

                if (typeof obj == 'object' && obj.ajax.url != '') {
                    _this.getAjaxBlock(obj);
                }

                if (obj._html) {
                    _this._addAjaxBlock(obj, obj._html);
                }

                _this.ablock.count=+1;
            });

            this.thumbs.countPage = this.thumbs.countPage + this.ablock.count;
            this.gallery.countPage = this.gallery.countPage + this.ablock.count;

            return this.ablock;
        },

        _initObject: function (obj, data) {

            this._extendObject(obj);
            this._defineOrientation(obj);

            if(!this.options.static){
                this.options.clones
                    ? this.reCreateElements(obj, data, '')
                    : this.createElements(obj, data);
            }

            if (null != obj.item.length && obj.navigation)
                this._addNextPrevActions(obj);

            if (obj.bt_view.open && obj.bt_view.close)
                this._addViewsBtn(obj);

            if (this.options.start_index > 0) {
                this.goToPage(obj, this.options.start_index - 1, 0);
                this._activeItem(obj, this.options.start_index - 1);
            }

            if (!this.options.infinity && !this.options.clones) {
                this.disableBtnPrevNext(obj, this.options.start_index - 1);
            }

            return;
        },
        _extendObject: function(obj){
            obj.prevPage = 1;
            obj.activePage = 0;

            if(this.options.static) return;

            obj.group = document.createElement('div');
            obj.group.className = 'group ' + obj._class;

            if (this.element[0].firstChild) {
                this.element[0].insertBefore(obj.group, this.element[0].firstChild);
            } else {
                this.element[0].appendChild(obj.group);
            }

            obj.inner = document.createElement('div');
            obj.inner.className = 'inner';

            obj.group.appendChild(obj.inner);

            obj.mask = document.createElement('ul');
            obj.mask.className = 'mask';

            obj.inner.appendChild(obj.mask);
        },

        _setOption: function(key, value) {

            switch( key ) {
                case 'thumbs.carousel':
                    this.thumbs.carousel = value;

                    if(!value){
                        this.thumbs.bt_view.close.unbind().addClass('disable');
                        this.thumbs.bt_view.open.removeClass('disable');

                        this._removeNextPrevActions(this.thumbs);

                        if (this.thumbs.mask.length < this.thumbs.countPage) {
                            this._appendElements(this.thumbs, true);
                        }

                        $(this.thumbs.mask).stop();
                        this.thumbs.item[this.thumbs.step-1].style.marginRight = this.thumbs.width+'px';

                        this.thumbs.mask.style.width = 'auto';
                        this.thumbs.mask.style.left = 'auto';

                        this.thumbs.inner.style.width = '640px';
                        this.thumbs.inner.style.height = 'auto';
                        this.thumbs.inner.style.overflow = 'visible';

                        this.gallery.group.hide();
                        break;
                    }

                    this._addNextPrevActions(this.thumbs);

                    this.thumbs.bt_view.open.unbind().addClass('disable');
                    this.thumbs.bt_view.close.removeClass('disable');

                    this.thumbs.item[this.thumbs.step-1].css('margin-right', '0');

                    this.thumbs.inner.removeAttr('style').css({
                        overflow : 'hidden', height: '94px', width: '540px'
                    });

                    if(this.thumbs.indexClick < this.thumbs.step){
                        this.thumbs.indexClick = 0;
                    }

                    this._go(this.thumbs, this.thumbs.indexClick);

                    this.gallery.group.show();
                    break;
            }
        },
        _addViewsBtn: function(obj){

            if(obj.bt_view.open){
                obj.bt_view.open = $('<a href="#" onclick="return false" class="'+obj.bt_view._class+' open disable"><em></em></a>').appendTo(obj.group);
                this._addViewOpenAction(obj);
            }

            if(obj.bt_view.close){
                obj.bt_view.close = $('<a href="#" onclick="return false" class="'+obj.bt_view._class+' close"><em></em></a>').appendTo(obj.group);
                this._addViewCloseAction(obj);
            }

        },
        _defineOrientation: function (obj) {

            if (obj.orientation === 'horizontal') {
                obj.orientation = horizontal;
            } else {
                obj.orientation = vertical;
            }

            // If browser support - enable css animation
            if (this.supportsTransitions()) {

                obj.orientation.transitionMode = true;

                obj.mask.style[obj.orientation.pos] = 0;

                this._enableTransition(obj);
            }

            return;
        },

        _enableTransition: function(obj) {
            obj.mask.style.transition = obj.orientation.pos + ' ' + obj.speed + 'ms ease';
        },

        _disableTransition: function(obj) {
            obj.mask.style.transition = 'none';
        },

        _activeItem: function (obj, index){

            if(typeof obj == 'undefined') return;

            index = index < 0 ? 0
                : index > obj.countPage-1
                ? obj.countPage-1 : index;

            if(typeof obj.item[index] != 'undefined'){
                $(obj.mask).find('li').removeClass('selected');
                $(obj.item[index]).addClass('selected');

                if(typeof this.ablock != 'undefined')
                    if($(obj.item[index]).hasClass('ablock')){
                        $(this.ablock.block.group).show();
                    }
            }

            if(this.options.gallery.zeropixel)
                this.addZeroPixel(index);

            return;
        },

        /*btn view action*/
        _addViewOpenAction: function(obj){
            var _this = this;

            obj.bt_view.open.bind('click', function(){
                _this._addNextPrevActions(_this.thumbs);

                _this.thumbs.bt_view.open.unbind().addClass('disable');
                _this.thumbs.bt_view.close.removeClass('disable');
                _this.thumbs.inner.setAttribute('style', '');

                $(_this.thumbs.item[_this.thumbs.step-1]).css('margin-right', '0');

                $(_this.thumbs.inner).css({
                    overflow : 'hidden',
                    height: '94px',
                    width: '540px'
                });


                _this.thumbs.mask.style.width
                    = _this.thumbs.item.length * (2 * ((+_this.thumbs.step_dim) + (+_this.thumbs.indent))+((+_this.thumbs.step_dim) * (+_this.thumbs.size))) + 'px';

                if(_this.thumbs.indexClick < _this.thumbs.step || typeof _this.thumbs.indexClick == 'undefined')
                    _this.thumbs.indexClick = 0;

                if(_this.thumbs.countPage > _this.thumbs.step && !_this.thumbs.center)
                    _this._go(_this.thumbs, _this.thumbs.indexClick);

                if(_this.thumbs.countPage > _this.thumbs.step && _this.thumbs.center)
                    _this._go(_this.thumbs, _this.thumbs.indexClick - 2);


                _this.disableBtnPrevNext(_this.thumbs, _this.thumbs.indexClick);
                _this.thumbs.carousel = true;
                $(_this.gallery.group).show();
                _this._addViewCloseAction(_this.thumbs);
            });
            return;
        },
        _addViewCloseAction: function(obj){
            var _this = this;

            obj.bt_view.close.bind('click', function(e){
                e.preventDefault();

                _this.thumbs.bt_view.close.unbind().addClass('disable');
                _this.thumbs.bt_view.open.removeClass('disable');

                _this._removeNextPrevActions(_this.thumbs);

                if (_this.thumbs.mask.children.length < _this.thumbs.countPage) {
                    _this._appendElements(_this.thumbs, true);
                }

                $(_this.thumbs.mask).stop();
                $(_this.thumbs.item[_this.thumbs.step-1]).css('margin-right', _this.thumbs.width+'px');

                _this.thumbs.indexClick = _this.gallery.activePage;

                _this.thumbs.mask.style.width = 'auto';
                _this.thumbs.mask.style.left = 'auto';

                _this.thumbs.inner.style.overflow = 'visible';
                _this.thumbs.inner.style.height = 'auto';
                _this.thumbs.inner.style.width = '640px';

                $(_this.gallery.group).hide();

                _this.thumbs.carousel = false;

                _this._addViewOpenAction(_this.thumbs)
            });

            return;
        },

        /*thumbs*/
        _addEventThumbs: function(){
            var _this = this;

            $(this.thumbs.mask).on('click', 'li', function (e) {
                e.preventDefault();

                _this.thumbs.indexClick =  $(this).index();
                _this._activeItem(_this.thumbs, _this.thumbs.indexClick);

                _this._go(_this.gallery, _this.thumbs.indexClick);

                if (_this.options.gallery.rating.show) {
                    _this.updateRating(_this.thumbs.indexClick);
                }

                if (_this.options.gallery.socialpanel.show) {
                    _this.addSocialPanel(_this.thumbs.indexClick);
                }

                if (null != _this.options.callbackTumbsClick) {
                    _this.options.callbackTumbsClick();
                }

                if (!_this.thumbs.carousel) {
                    $(_this.thumbs.bt_view.open).click();
                }

                if (_this.options.popup.show && typeof _this.gallery.item[_this.gallery.activePage] != 'undefined') {
                    $(_this.gallery.item[_this.gallery.activePage]).find('.image').append(_this.popup.buttons.zoom);
                }


                if($('html,body').offset().top != $(_this.element[0]).offset().top - 83) {
                    $('html,body').animate({scrollTop: ($(_this.element[0]).offset().top - 83)}, 500);
                }

                if(_this.thumbs.center && _this.gallery.countPage > _this.thumbs.step) {
                    _this._go(_this.thumbs, _this.thumbs.indexClick - 2);
                }

            });

            return;
        },

        selectedThumb : function(index){
            if(this.gallery.countPage > this.thumbs.step)
                this._go(this.thumbs, index);
            return;
        },

        /*animation*/
        goToPage: function (obj, index, animate) {
            obj = obj;
            obj.prevPage = obj.activePage;
            obj.activePage = index;

            if(this.options.clones) {
                this.convertStepSpanToImg(obj);
            }

            if(obj._class != 'thumbs' && this.options.thumbs.show){
                this._activeItem(obj,  index);
                this._activeItem(this.thumbs, index);
            }

            if(this.gallery.counter.show && index != this.gallery.countPage) {
                this.eventCounter();
            }


            if(this.options.ablock.show) {
                this.gallery.activePage != this.gallery.countPage - 1
                    ? this._hideAjaxBlock()
                    : this._showAjaxBlock();
            }

            return this._slide(obj, animate);
        },
        _go: function(obj, index){

            if (obj.mask.children.length < obj.countPage && !this.options.clones && !this.options.static) {
                this._appendElements(obj, true);
            }

            //if(typeof obj.item[index] != 'undefined' && typeof obj.item[index].find('.description') != 'undefined' &&
            //obj.item[index].find('.description').html() == '')
            //obj.item[index].find('.description').hide();

            /*clones*/
            if (this.options.clones && this.options.gallery.step == 1) {
                return this.clonesAnimateStepOne(obj, index);
            }

            if (this.options.clones && this.options.gallery.step != 1) {
                return this.clonesAnimate(obj, index);
            }

            /*not infinity*/
            if (!this.options.infinity) {
                return this.notInfinityAnimate(obj, index);
            }

            /*infinity*/
            if(this.options.infinity) {
                return this.infinityAnimate(obj, index);
            }
        },
        _slide: function(obj, animate){
            var speed = (animate == 0) ?  animate : obj.speed,
                animateProps = {}, pos, dim;

            dim = (this.options.infinity && !this.options.clones)
                ? (obj.item.length + (+obj.step) + 1) * ((+obj.step_dim) + (+obj.indent))
                : (this.options.clones)
                ? (obj.item.length + 2 * (+obj.size) + 2) * ((+obj.step_dim) + (+obj.indent))
                : obj.item.length * ((+obj.step_dim) + (+obj.indent));

            pos = (-1) * obj.activePage * ((+obj.step_dim) + (+obj.indent));

            animateProps[obj.orientation.pos] = pos;

            if (obj.carousel) {

                if (obj.orientation.transitionMode) {

//                    if (animate === 0) {
//                        this._disableTransition(obj);
//                        console.log('disable');
//                    }

                    obj.mask.style[obj.orientation.pos] = pos + 'px';

//                    if (animate === 0) {
//                        var _this = this;
//                        setTimeout(function(){
//                            _this._enableTransition(obj);
//                            console.log('enable');
//                        }, obj.speed);
//                    }

                } else {

                    $(obj.mask).animate(animateProps, speed);

                }
            }

            return;
        },


        _supportsTransitions: null,

        /**
         * Browser support transitions ?
         * @returns {boolean}
         */
        supportsTransitions: function() {
            return false;
            if (this._supportsTransitions !== null) {
                return this._supportsTransitions;
            }

            var b = document.body || document.documentElement,
                s = b.style,
                p = 'transition';

            if (typeof s[p] == 'string') {
                this._supportsTransitions = true;
                return true;
            }

            // Tests for vendor specific prop
            var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
            p = p.charAt(0).toUpperCase() + p.substr(1);

            for (var i=0; i<v.length; i++) {
                if (typeof s[v[i] + p] == 'string') {
                    this._supportsTransitions = true;
                    return true;
                }
            }

            this._supportsTransitions = false;
            return false;
        },

        _getAjax: function(){
            var _this = this;
            $.ajax({
                url         : this.options.json.url,
                type        : this.options.json.type,
                dataType    : this.options.json.dataType,
                success     : function(data){_this._getData(data)},
                error    :function (data, textStatus) {

                },
                global:false
            });

        },

        _getData: function(d){

            if(null == d.data &&  typeof d.data == 'undefined' || d.data == '')
                return this.destroy();

            /*create gallery*/
            this.initGallery(d);

            /*create thumbs*/
            if(this.options.thumbs.show) this.initThumbs(d);

            /*create ajax block*/
            if(this.options.ablock.show) this.initAjaxBlocks();

            /*create socialpanel*/
            if (this.options.gallery.socialpanel.show) {
                this.initSocialPanel();
            }

            /*create popup*/
            if(this.options.popup.show){

                if($(window).height() < $('body').height())
                    this.options.popup.minWidth -= 20;

                if($(window).width() >= this.options.popup.minWidth && $(window).height() >= this.options.popup.minHeight){
                    this.initPopup();
                    this.addBtnPopupHover();
                }else{this.options.popup.show = false}
            }

        },

        _getElements: function () {

            !this.options.json.data_
                ? this._getAjax()
                : this._getData(this.options.json.data_);
            return;
        },

        createElements: function(obj, data){
            var _this = this;
            obj.item = [];

            if(null == data.data) return this.destroy();

            $.each(data.data, function (i, e) {

                if(typeof _this.gallery.image[i] == 'undefined'){
                    _this.gallery.image[i] = e;
                }

                // create item from template
                var proxyItem = document.createElement('div');
                proxyItem.innerHTML = _this.parserTemplate(obj.template, e);
                obj.item[i] = proxyItem.children[0];

                // Set width and height for all "span" images in template
                var imgSpans = obj.item[i].querySelectorAll('.image>span');
                for (n = 0; n < imgSpans.length; ++n) {
                    imgSpans[n].setAttribute('width', obj.width);
                    imgSpans[n].setAttribute('height', obj.height);
                }

                if (i < obj.size+_this.options.start_index){
                    _this._spanToImg(imgSpans);
                    obj.mask.appendChild(obj.item[i]);
                }

                if(obj.photo_index) {
                    var em = document.createElement('em');
                    em.className = 'photo-index';
                    em.innerHTML = (i+1);
                    $(obj.item[i]).find('a').append(em);
                }

                if (null != obj.item.length) {
                    obj.mask.style.width
                        = (obj.item.length * (2 * ((+obj.step_dim) + (+obj.indent)) + ((+obj.step_dim)*(+obj.size))) + ((+obj.size) * 2)) + 'px';
                }

                _this._activeItem(obj, obj.activePage);

                obj.countPage = i+1;

                // hide empty description
                var descriptions = obj.item[i].getElementsByClassName('description');
                if (descriptions.length) {
                    for (n = 0; n < descriptions.length; ++n) {
                        if (descriptions[n].innerHTML == '') {
                            $(descriptions[n]).hide();
                        }
                    }
                }

            });

            /*create pagination*/
            if(obj.pagination.show && !this.options.static) {
                _this.initPagination(obj);
            }
        },

        reCreateElements:function(obj, data, filter){
            var _this = this;

            obj.item = [];
            obj.item.length = 0;
            obj.countPage = 0;

            $.each(data.data, function (i, e) {

                if(typeof _this.gallery.image[i] == 'undefined'){
                    _this.gallery.image[i] = e;
                }

                if(e.filter == filter || filter==''){

                    var proxyItem = document.createElement('div');
                    proxyItem.innerHTML = _this.parserTemplate(obj.template, e);
                    obj.item[obj.countPage] = proxyItem.children[0];

                    var imgSpans = obj.item[obj.countPage].querySelectorAll('.image>span');
                    for (n = 0; n < imgSpans.length; ++n) {
                        imgSpans[n].setAttribute('width', obj.width);
                        imgSpans[n].setAttribute('height', obj.height);
                    }

                    if (obj.countPage < obj.size*2+1){
                        _this._spanToImg(obj.item[obj.countPage].querySelectorAll('.image>span'));
                    }

                    obj.mask.appendChild(obj.item[obj.countPage]);

                    if(obj.photo_index) {
                        $(obj.item[obj.countPage]).find('a')
                            .append('<em class="photo-index">'+(obj.countPage+1)+'</em>');
                    }

                    var emptyLinks = obj.item[obj.countPage].getElementsByTagName('a');
                    for (n = 0; n < emptyLinks.length; ++n) {
                        if (emptyLinks[n].href == '') {
                            emptyLinks[n].onclick = function(){return false;};
                            $(emptyLinks[n]).css({cursor:'default'});
                        }
                    }

                    obj.countPage = obj.countPage+1;

                    var descriptions = obj.item[i].getElementsByClassName('description');
                    if (descriptions.length) {
                        for (n = 0; n < descriptions.length; ++n) {
                            if (descriptions[n].innerHTML == '') {
                                $(descriptions[n]).hide();
                            }
                        }
                    }
                }
            });

            obj.mask.style.width
                = (obj.item.length * (obj.step_dim + obj.indent) + 2 * ((obj.step_dim + obj.indent) * (obj.size+1))) + 'px';

            /*create pagination*/
            if(obj.pagination.show) _this.initPagination(obj);
        },

        _appendElements : function (obj, convert) {
            var _this = this;

            if (typeof obj == 'undefined') return;

            $.each(obj.item, function(i, e){

                if (typeof obj.item[i] === 'undefined') {
                    return;
                }

                if (convert) {
                    _this._spanToImg(e.querySelectorAll('.image>span'));
                }

                obj.mask.appendChild(obj.item[i]);

                var descriptions = obj.item[i].getElementsByClassName('description');
                if (descriptions.length) {
                    for (n = 0; n < descriptions.length; ++n) {
                        if (descriptions[n].innerHTML == '') {
                            $(descriptions[n]).hide();
                        }
                    }
                }

            });

            return;
        },

        /**
         * Convert spans to images
         * @param {NodeList} spans
         * @returns {NodeList}
         */
        _spanToImg: function(spans){


            if (typeof spans.tagName != 'undefined') {
                var fragment = document.createDocumentFragment();
                fragment.appendChild(spans);
                spans = fragment.childNodes;
            }

            for (i = 0; i < spans.length; ++i) {

                var span = spans[i];

                var widthAttr = span.getAttribute("width");
                var heightAttr = span.getAttribute("height");
                var altAttr = span.getAttribute("alt");

                var img = document.createElement('img');

                if (widthAttr !== null && widthAttr != '') {
                    img.width = widthAttr;
                }

                if (heightAttr !== null && heightAttr != '') {
                    img.height = heightAttr;
                }

                if (altAttr !== null && altAttr != '') {
                    img.alt = altAttr;
                }

                img.src = span.getAttribute("src");

                span.parentNode.replaceChild(img, span);

            }

            return spans;
        },

        convertStepSpanToImg: function(obj){
            var _this = this, i = obj.activePage;


            if(obj.prevPage == 0){
                i = obj.countPage-1;
                while(i > obj.countPage-2*obj.size){
                    if(typeof obj.item[i] != 'undefined')
                        _this._spanToImg(obj.item[i].querySelectorAll('.image>span'));
                    i--;
                };
                return;
            }

            if(obj.prevPage <= obj.activePage && obj.prevPage != 0 && obj.activePage != 0){

                while(i <= (obj.activePage + obj.size)){
                    if(typeof obj.item[i] != 'undefined')
                        _this._spanToImg(obj.item[i].querySelectorAll('.image>span'));
                    i++;
                };
                return;
            }

            while( i >= (obj.activePage - obj.size)){
                if(typeof obj.item[i] != 'undefined')
                    _this._spanToImg(obj.item[i].querySelectorAll('.image>span'));
                i--;
            };

            return;
        },

        /*not infinity*/
        notInfinityAnimate: function(obj, index){

            this.disableBtnPrevNext(obj, index);

            if ((obj.countPage - index) < obj.step)
                return this.goToPage(obj, (obj.countPage - obj.step));

            if (index < 0)  return this.goToPage(obj, 0);

            return this.goToPage(obj, index);
        },

        disableBtnPrevNext: function (obj, index) {

            if(obj.countPage < obj.step || obj.countPage == 1) {
                $(obj.bt_next).addClass('disable');
                $(obj.bt_prev).addClass('disable');
                return;
            }

            index <= 0
                ? $(obj.bt_prev).addClass('disable')
                : $(obj.bt_prev).removeClass('disable');

            index >= (obj.countPage - obj.step)
                ? $(obj.bt_next).addClass('disable')
                : $(obj.bt_next).removeClass('disable');

            return;
        },

        /*infinity*/
        _removeClone: function(obj){
            $(obj.mask).children('.clone').remove();
        },
        infinityAnimate: function(obj, index){

            if (index < 0 && obj.activePage == 0 && this.options.infinity){console.log('f');
                this._goToFirst(obj);
                return false;
            }

            if (index == obj.countPage && this.options.infinity){console.log('l');
                this._goToLast(obj);
                return false;
            }

            if ((obj.countPage - index) < obj.step){console.log('3');
                this.goToPage(obj, (obj.countPage - obj.step));
                return false;
            }

            if (index < 0){console.log('4');
                this.goToPage(obj, 0);
                return false;
            }

            this.goToPage(obj, index);

            return;
        },
        _goToFirst: function(obj){
            var _this = this;
            var i = obj.countPage;
            while(i >= obj.countPage - obj.step){
                if (typeof obj.item[i] != 'undefined') {

                    var clone = obj.item[i].cloneNode(true);
                    $(clone).addClass('clone');

                    if (obj.mask.firstChild) {
                        obj.mask.insertBefore(clone, obj.mask.firstChild);
                    } else {
                        obj.mask.appendChild(clone);
                    }
                }
                i--;
            }

            this.goToPage(obj, obj.step, 0);
            this.goToPage(obj, 0);

            setTimeout(function(){
                _this._removeClone(obj);
                _this.goToPage(obj, obj.countPage - obj.step, 0);
            }, obj.speed+100);
        },
        _goToLast: function(obj){
            var _this = this, i = 0;
            while(i < obj.step){

                if (typeof obj.item[i] != 'undefined') {

                    var clone = obj.item[i].cloneNode(true);
                    $(clone).addClass('clone');

                    obj.mask.appendChild(clone);
                }
                i++;
            }

            this.goToPage(obj, obj.countPage-obj.step, 0);
            this.goToPage(obj, obj.countPage);

            this.gallery.activePage = -1;
            setTimeout(function(){
                _this._removeClone(obj);
                _this.goToPage(obj, 0, 0);
            }, obj.speed+100)
        },

        /*clones*/
        clonesAnimate: function(obj, index){
            var _this = this;

            /*goto next*/
            if (obj.activePage < index && $(obj.mask).children('li:first').hasClass('clone') && index > obj.countPage-obj.step-1){

                this.goToPage(obj, index);

                setTimeout(function(){
                    _this._removeClone(obj);
                    _this.addLastClone(obj);

                    _this.goToPage(obj, index - obj.step -1, 0);
                    obj.activePage = index - obj.step -1;
                    obj.prevPage = (index < 2*obj.step -1) ? 0 : (index-2*obj.step-1);
                }, obj.speed+100);

                return;
            }


            if (obj.activePage < index && $(obj.mask).children('li:first').hasClass('clone')){

                this.goToPage(obj, index);

                setTimeout(function(){
                    _this._removeClone(obj);
                    _this.goToPage(obj, index - obj.step -1, 0);
                    obj.activePage = index - obj.step -1;
                    obj.prevPage = (index < 2*obj.step -1) ? 0 : (index-2*obj.step-1);
                }, obj.speed+100);

                return;
            }

            if (obj.activePage < index && index == obj.countPage - obj.step && !$(obj.mask).children('li:last').hasClass('clone')){
                this.addLastClone(obj);
                this.goToPage(obj, index);
                obj.activePage = index;
                obj.prevPage = index-obj.step;
                return;
            }

            if (obj.countPage-1 < index && $(obj.mask).children('li:last').hasClass('clone')){
                this.goToLastClone(obj, index);
                return;
            }

            if (index > obj.countPage-obj.step-1 ){
                if(!$(obj.mask).children('li:last').hasClass('clone'))
                    this.addLastClone(obj);
                this.goToPage(obj, (obj.countPage - index)+obj.activePage);
                return;
            }


            /*goto prev*/
            if (index == 0){
                this._removeClone(obj);
                this.addFirstClone(obj);
                this.goToPage(obj, index+2*obj.step+1, 0);
                this.goToPage(obj, obj.step+1);
                return;
            }

            if (index == 1 && $(obj.mask).children('li:first').hasClass('clone')){
                this.goToFirstClone(obj, index);
                return;

            }

            if (index == (obj.activePage-obj.step) && $(obj.mask).children('li:last').hasClass('clone')){
                this.goToPage(obj, index);
                this._removeClone(obj);
                return
            }


            if (index < 0){
                this.addFirstClone(obj);
                this.goToPage(obj, obj.activePage+obj.step+1, 0);
                this.goToPage(obj, obj.step+1);
                return;
            }

            this.goToPage(obj, index);

            return;
        },

        goToFirstClone: function(obj, index){
            var _this = this;

            _this.goToPage(obj, index);

            setTimeout(function(){
                _this._removeClone(obj);
                _this.addLastClone(obj);
                _this.goToPage(obj, obj.countPage-obj.step, 0);
                obj.prevPage = 0;
                obj.activePage = obj.countPage-obj.step;
            }, obj.speed+100);
        },
        indexFirstPage:function(obj, index){

            this._removeClone(obj);
            this.addFirstClone(obj);

            if(obj.step == obj.countPage){
                this.goToPage(obj, obj.step, 0);
                this.addLastClone(obj);
                this.disableBtnPrevNext(this.gallery, this.gallery.start_index);
            }else{
                this.goToPage(obj, obj.step + 1, 0);
            }

            obj.prevPage = obj.step+1;
            obj.activePage = obj.step+1;
        },
        addFirstClone: function(obj){

            var _this = this, i = obj.countPage-1, clone;

            while(i >= obj.countPage - obj.step-1){
                if (typeof obj.item[i] != 'undefined') {

                    clone = obj.item[i].cloneNode(true);
                    $(clone).addClass('clone');

                    if (obj.mask.firstChild) {
                        obj.mask.insertBefore(clone, obj.mask.firstChild);
                    } else {
                        obj.mask.appendChild(clone);
                    }
                    _this._spanToImg(clone.querySelectorAll('.image>span'));
                }
                i--;
            };

            return;
        },

        goToLastClone: function(obj, index){
            var _this = this;

            this.goToPage(obj, index);

            setTimeout(function(){
                _this.goToPage(obj, 0, 0);
                _this._removeClone(obj);

                _this.addFirstClone(obj);
                _this.goToPage(obj, obj.step+1, 0);
                obj.activePage = obj.step+1;
                obj.prevPage = obj.countPage-1;


            }, obj.speed+100);
        },
        addLastClone: function(obj){
            var i = 0, _this = this, clone;

            while(i <= obj.step){
                if (typeof obj.item[i] != 'undefined') {

                    clone = obj.item[i].cloneNode(true);
                    $(clone).addClass('clone');

                    obj.mask.appendChild(clone);

                    _this._spanToImg(clone.querySelectorAll('.image>span'));
                }
                i++;
            }

            return;
        },

        /*clones step one*/
        clonesAnimateStepOne: function(obj, index){
            var _this = this;

            /*goto next*/
            if (obj.activePage < index && $(obj.mask).children('li:first').hasClass('clone')){

                this.goToPage(obj, index);

                setTimeout(function(){
                    _this._removeClone(obj);
                    _this.addLastCloneStepOne(obj);

                    _this.goToPage(obj, index - obj.size -1, 0);
                    obj.activePage = index - obj.size -1;
                    obj.prevPage = (index < 2*obj.size -1) ? 0 : (index-2*obj.size-1);

                    ////console.log('0: '+ obj.activePage)

                    if(_this.options.gallery.zeropixel && obj.name == 'gallery')
                        _this.addZeroPixel(obj.activePage);

                }, obj.speed+100);

                return;
            }

            if (obj.activePage < index && index == obj.countPage - obj.size && !$(obj.mask).children('li:last').hasClass('clone')){

                this.addLastCloneStepOne(obj);

                this.goToPage(obj, index);

                obj.activePage = index;
                obj.prevPage = index-obj.size;

                ////console.log('2: '+ obj.activePage)

                if(this.options.gallery.zeropixel && obj.name == 'gallery')
                    this.addZeroPixel(obj.activePage);

                return;
            }

            if (obj.countPage-1 < index && $(obj.mask).children('li:last').hasClass('clone')){

                this.goToLastCloneStepOne(obj, index);

                obj.activePage = index - obj.size -1;

                ////console.log('3: '+ obj.activePage)

                if(this.options.gallery.zeropixel && obj.name == 'gallery')
                    this.addZeroPixel(obj.activePage);

                return;
            }

            if (index > obj.countPage-obj.step-1 && obj.step > obj.size){

                if(!$(obj.mask).children('li:last').hasClass('clone'))
                    this.addLastCloneStepOne(obj);

                this.goToPage(obj, (obj.countPage - index)+obj.activePage);

                ////console.log('4: '+ obj.activePage)

                if(this.options.gallery.zeropixel && obj.name == 'gallery')
                    this.addZeroPixel(obj.activePage);

                return;
            }


            /*goto prev*/

            if (index == 0){
                this.addFirstCloneStepOne(obj);
                this.goToPage(obj, obj.size+2*obj.step, 0);
                this.goToPage(obj, obj.size+obj.step);

                ////console.log('5: '+ obj.activePage)

                if(_this.options.gallery.zeropixel && obj.name == 'gallery')
                    _this.addZeroPixel(0);

                return;
            }

            if (index == 1 && $(obj.mask).children('li:first').hasClass('clone')){

                this.goToFirstCloneStepOne(obj, index);

                ////console.log('6: '+ obj.activePage)
                return;
            }

            if (index < 0){

                this.addFirstCloneStepOne(obj);
                this.goToPage(obj, obj.activePage+obj.size+1, 0);
                this.goToPage(obj, obj.size+1);


                ////console.log('7: '+ obj.activePage)
                return;
            }

            ////console.log('8: '+ obj.activePage)

            this.goToPage(obj, index);


            if(_this.options.gallery.zeropixel && obj.name == 'gallery')
                _this.addZeroPixel(obj.activePage);

            return;
        },
        goToFirstCloneStepOne: function(obj, index){
            var _this = this;

            _this.goToPage(obj, index);

            setTimeout(function(){
                _this._removeClone(obj);
                _this.addLastCloneStepOne(obj);
                _this.goToPage(obj, obj.countPage-obj.size, 0);
                obj.prevPage = 0;
                obj.activePage = obj.countPage-obj.size;

                ////////////console.log('6: '+ obj.activePage)

                if(_this.options.gallery.zeropixel && obj.name == 'gallery')
                    _this.addZeroPixel(obj.activePage);

            }, obj.speed+100);
        },
        indexFirstPageStepOne:function(obj, index){

            ////////////console.log('indexFirstPageStepOne')

            if(obj.countPage <= obj.size)
                this.disableBtns(obj);

            this._removeClone(obj);
            this.addFirstCloneStepOne(obj);

            if(obj.size == 1){
                this.goToPage(obj, obj.size + 1, 0);
                obj.prevPage = obj.size+1;
                obj.activePage = obj.size+1;
            }


            if(obj.size > obj.countPage -1){
                this.goToPage(obj, obj.size -(obj.size - obj.countPage), 0);
                obj.prevPage = obj.size -(obj.size - obj.countPage);
                obj.activePage = obj.size;
            }else{
                this.goToPage(obj, obj.size + 1, 0);
                obj.prevPage = obj.size+1;
                obj.activePage = obj.size+1;
            }

        },
        addFirstCloneStepOne: function(obj){

            var _this = this, i = obj.countPage-1, clone;

            while(i >= obj.countPage - obj.size-1){
                if (typeof obj.item[i] != 'undefined') {

                    clone = obj.item[i].cloneNode(true);
                    $(clone).addClass('clone');

                    if (obj.mask.firstChild) {
                        obj.mask.insertBefore(clone, obj.mask.firstChild);
                    } else {
                        obj.mask.appendChild(clone);
                    }
//                    obj.mask.prepend(clone);

                    _this._spanToImg(clone.querySelectorAll('.image>span'));
                }
                i--;
            };

            return;
        },
        disableBtns: function(obj){
            obj.bt_next.unbind().addClass('disable');
            obj.bt_prev.unbind().addClass('disable');
        },
        goToLastCloneStepOne: function(obj, index){
            var _this = this;

            this.goToPage(obj, index);

            setTimeout(function(){
                _this.goToPage(obj, 0, 0);
                _this._removeClone(obj);

                _this.addFirstCloneStepOne(obj);
                _this.goToPage(obj, obj.size+1, 0);
                obj.activePage = obj.size+1;
                obj.prevPage = obj.countPage-1;

                ////////console.log('f'+obj.activePage)


            }, obj.speed+100)
        },
        addLastCloneStepOne: function(obj){
            var i = 0, _this = this, clone;

            while(i <= obj.size){
                if (typeof obj.item[i] != 'undefined') {

                    clone = obj.item[i].cloneNode(true);
                    $(clone).addClass('clone')

                    obj.mask.appendChild(clone);
                    _this._spanToImg(clone.querySelectorAll('.image>span'));
                }
                i++;
            }

            return;
        },

        /*navigation*/
        next: function (obj) {

            if(obj.activePage > obj.item.length && !this.options.infinity) return;
            if (obj.countPage <=  obj.step) return;

            if(this.options.thumbs.show && !this.options.thumbs.center)
                if(obj._class == 'elements' && this.gallery.activePage == (this.thumbs.activePage + this.thumbs.step-1))
                    this.selectedThumb(this.thumbs.activePage + this.thumbs.step);

            if(this.options.thumbs.show && this.options.thumbs.center)
                if(obj._class == 'elements' && this.gallery.activePage == (this.thumbs.activePage + 2))
                    this.selectedThumb(this.thumbs.activePage + 1);

            if(obj.pagination.show)
                this.selectedPagination(obj, obj.pagination.activePage+1)

            if(typeof obj.activePage == 'undefined')
                obj.activePage = 0;

            return this._go(obj, (obj.activePage+obj.step));
        },
        prev: function (obj) {
            if (obj.activePage < 0 && !this.options.infinity) return;
            if (obj.countPage <=  obj.step) return;

            if(this.options.thumbs.show && !this.options.thumbs.center)
                if(obj._class == 'elements' && this.gallery.activePage == this.thumbs.activePage)
                    this.selectedThumb(this.thumbs.activePage - this.thumbs.step);

            if(this.options.thumbs.show && this.options.thumbs.center)
                if(obj._class == 'elements' && this.gallery.activePage == (this.thumbs.activePage + 2))
                    this.selectedThumb(this.thumbs.activePage - 1);

            if(obj.pagination.show)
                this.selectedPagination(obj, obj.pagination.activePage - 1);

            return this._go(obj, (obj.activePage-obj.step));
        },
        insertPrevAction: function (obj) {
            var _this = this;

            if($(obj.bt_prev).length != 1 || typeof obj.bt_prev == 'undefined') {
                var bt_prev = document.createElement('a');
                bt_prev.innerHTML = '<em></em>';
                bt_prev.href = '#';
                bt_prev.className = obj.cl_prev;
                bt_prev.setAttribute('onclick', 'return false');
                obj.bt_prev = $(bt_prev)
                    .appendTo(obj.group);
            }

            obj.bt_prev.removeClass('disable');

            obj.bt_prev.unbind();

            obj.bt_prev.bind('click', function (e) {

                e.preventDefault();

                _this.prev(obj);

                if(_this.options.gallery.rating.show) {
                    _this.updateRating(_this.gallery.activePage);
                }

                if(_this.options.gallery.socialpanel.show) {
                    _this.addSocialPanel(_this.gallery.activePage);
                }

                if(null != _this.options.callbackNextPrevActions && obj.name == 'gallery') {
                    _this.options.callbackNextPrevActions();
                }

                if(_this.options.auto_scroll) {
                    _this.destroyAutoScroll();
                }

                if(_this.options.popup.show && typeof _this.gallery.item[_this.gallery.activePage] != 'undefined') {
                    $(_this.gallery.item[_this.gallery.activePage]).find('.image').append(_this.popup.buttons.zoom);
                }
            });



            return;
        },
        insertNextAction: function (obj) {
            var _this = this;

            if($(obj.bt_next).length != 1  || typeof obj.bt_next == 'undefined') {
                var bt_next = document.createElement('a');
                bt_next.innerHTML = '<em></em>';
                bt_next.href = '#';
                bt_next.className = obj.cl_next;
                bt_next.setAttribute('onclick', 'return false');
                obj.bt_next = $(bt_next)
                    .appendTo(obj.group);
            }

            obj.bt_next.removeClass('disable');

            obj.bt_next.unbind();

            obj.bt_next.bind('click', function (e) {

                e.preventDefault();

                _this.next(obj);

                if(_this.options.gallery.rating.show) {
                    _this.updateRating(_this.gallery.activePage);
                }

                if(_this.options.gallery.socialpanel.show) {
                    _this.addSocialPanel(_this.gallery.activePage);
                }

                if(null != _this.options.callbackNextPrevActions && obj.name == 'gallery') {
                    _this.options.callbackNextPrevActions();
                }

                if(_this.options.auto_scroll) {
                    _this.destroyAutoScroll();
                }

                if(_this.options.popup.show && typeof _this.gallery.item[_this.gallery.activePage] != 'undefined') {
                    $(_this.gallery.item[_this.gallery.activePage]).find('.image').append(_this.popup.buttons.zoom);
                }
            });

            return;
        },
        insertTouchEvents: function (obj) {
            var _this = this;
            if (_this.options.touchEvents & 'ontouchstart' in document.documentElement) {
                $(obj.group).on('touchstart', function(e){
                    _this.onTouchStart(e, obj);
                }, false);
            }
        },
        _addNextPrevActions: function (obj) {
            this.insertPrevAction(obj);
            this.insertNextAction(obj);
            this.insertTouchEvents(obj);

            return;
        },
        _removeNextPrevActions: function (obj) {
            if (obj.bt_prev) obj.bt_prev.unbind().addClass('disable');
            if (obj.bt_next) obj.bt_next.unbind().addClass('disable');
            return;
        },

        /*pagination*/
        _addPagination: function(obj){

            obj.pagination.item = [];
            obj.pagination.count = (this.gallery.countPage % this.gallery.step) == 0
                ? parseInt((this.gallery.countPage / this.gallery.step), 10)
                : parseInt((this.gallery.countPage / this.gallery.step), 10) + 1;

            if(obj.pagination.count < 1) return;

            var i=0;
            while (obj.pagination.count > i) {

                obj.pagination.item[i] = document.createElement('li');
                obj.pagination.item[i].innerHTML = '<a href="#page-' + i + '">' + (i+1) + '</a>';
                obj.pagination.item[i].className = 'item';

                obj.pagination.mask.appendChild(obj.pagination.item[i]);

                i++;
            }

            $(obj.pagination.item[0]).addClass('selected');

            return this._addEventPagination(obj);
        },

        _addEventPagination: function(obj) {

            var _this = this;

            $(obj.pagination.mask).find('a').bind('click', function () {

                if ($(this).parent().hasClass('selected')) {
                    return;
                }

                $(obj.pagination.mask).children('li').removeClass('selected');

                _this._activeItem(obj.pagination, _this._paginationIndex(this));

                obj.pagination.activePage = _this._paginationIndex(this);

                if(_this.options.clones) {
                    return _this.eventPaginationClone(obj, this);
                }

                _this._go(obj , _this._paginationIndex(this) * _this.gallery.step);

            });
        },
        _paginationIndex: function(e){
            return parseInt(e.hash.split('-')[1]);
        },
        selectedPagination: function(obj, index){

            var index = (index == 0 || index > obj.pagination.count-1) ? 0
                : (index < 0) ? obj.pagination.count-1
                : index;

            obj.pagination.activePage = index;

            $(obj.pagination.mask).children('.item').removeClass('selected');
            $(obj.pagination.item[index]).addClass('selected');
            return;
        },
        eventPaginationClone: function(obj, e){

            var step = (this._paginationIndex(e) * this.gallery.step);

            if ($(obj.mask).children('li:first').hasClass('clone')) {
                step = (this._paginationIndex(e) * this.gallery.step) + this.gallery.step + 1;
            }

            this._go(obj , step);
        },

        /*ajax block (simple: block "see more")*/
        getAjaxBlock: function(obj){
            var _this = this;
            $.ajax({
                url         : obj.ajax.url,
                type        : obj.ajax.type,
                dataType    : obj.ajax.dataType,
                data        : obj.ajax.data,
                success: function(data){
                    _this._addAjaxBlock(obj, data);
                },
                global:false
            });
        },
        _addAjaxBlock: function(obj, d){

            obj.group = document.createElement('div');
            obj.group.className = obj._class;
            obj.group.innerHTML = d;

            this.gallery.group.appendChild(obj.group);

            if(obj.overlay) {
                obj.overlay = document.createElement('div');
                obj.overlay.className = 'overlay';
                obj.group.appendChild(obj.overlay);
            }

            $(obj.group).hide();

            return this._addAjaxThumbs(obj);
        },
        _addAjaxThumbs: function(obj){

            var li = document.createElement('li');
            li.innerHTML = obj.item;
            li.className = 'item ' + obj._class;

            obj.item = this.thumbs.item[this.thumbs.item.length] = li;

            this.gallery.item[this.gallery.countPage - 1] = this.gallery.item[this.ablock.count-1].cloneNode(true);

            this._appendElements(this.thumbs, true);

            this._addAjaxThumbsEvent(obj);
        },
        _addAjaxThumbsEvent: function(obj){
            var _this = this;
            $(obj.item).bind('click', function(){
                $(obj.group).show();
                _this._activeItem(_this.thumbs, $(this).index());
                $(obj.item).unbind('click', '_go');
            });
        },
        _hideAjaxBlock: function(){

            $(this.gallery.inner).find('.description').show();
            $(this.gallery.inner).find('.tochka-rating').show();
            $(this.gallery.inner).removeAttr('style');

            if(typeof this.ablock != 'undefined')
                $.each(this.ablock, function(e, obj){
                    $(obj.group).hide();
                });
        },

        _showAjaxBlock: function(){

            $(this.gallery.inner).find('.description').hide();
            $(this.gallery.inner).find('.tochka-rating').hide();
            $(this.gallery.inner).height(480);

            $.each(this.ablock, function(e, obj){
                $(obj.group).show();
            });
        },

        /*filters*/
        initFilters: function(obj, data){

            obj.filters.group = document.createElement('div');
            obj.filters.group.className = 'group filters';

            if (this.element[0].firstChild) {
                this.element[0].insertBefore(obj.filters.group, this.element[0].firstChild);
            } else {
                this.element[0].appendChild(obj.filters.group);
            }

            obj.filters.inner = document.createElement('div');
            obj.filters.inner.className = 'inner';

            obj.filters.group.appendChild(obj.filters.inner);

            obj.filters.mask = document.createElement('ul');
            obj.filters.mask.className = 'mask';

            obj.filters.inner.appendChild(obj.filters.mask);

            this.addFilters(obj, data);
        },
        addFilters:function(obj, data){
            var _this = this, i = 0;

            obj.filters.item = [];

            $.each(obj.filters.data, function(f, e){

                obj.filters.item[i] = document.createElement('li');
                obj.filters.item[i].className = 'item';
                obj.filters.item[i].setAttribute('data-filter', f);
                obj.filters.item[i].innerHTML = '<a href="#"><span>'+e+'</span></a>';

                _this.eventFilters(obj, data, obj.filters.item[i]);

                obj.filters.mask.appendChild(obj.filters.item[i]);

                i++;
            });
        },
        eventFilters:function(obj, data, e){
            var _this = this;
            $(e).bind('click', function(){

                $(this).parent().find('li').removeClass('selected');
                $(this).addClass('selected');

                obj.activePage = 0;
                $(obj.group).hide();
                $(obj.mask).empty().attr('style', '');

                _this.reCreateElements(obj, data, $(this).attr('data-filter'));
                _this._appendElements(obj, false);
                _this.indexFirstPage(obj, 0);
                obj.group.fadeIn();
                return false;
            });
        },

        /*counter*/
        initCounter: function(){

            if(this.gallery.counter.type == 'page')
                return this.counterTypePage();

            if(this.gallery.counter.type == 'elements')
                return this.counterTypeElements();

        },

        counterTypePage : function(){

            var active_page =
                    this.gallery.activePage == 0
                        ? 1 : this.gallery.activePage+ 1,
                text = _LANG == 'ua' ? 'з' : 'из';

            this.gallery.counter.group = document.createElement('div');
            this.gallery.counter.group.className = 'counter';
            this.gallery.counter.group.innerHTML = '<span class="active">' + active_page + '</span>' +
                text + '<span class="total">' + this.gallery.countPage + '</span>';

            return this.gallery.group.appendChild(this.gallery.counter.group);
        },

        counterTypeElements : function(){
            this.gallery.counter.total = this.gallery.countPage * this.gallery.counter.size
                - (this.gallery.counter.size  - this.gallery.item[this.gallery.countPage-1].find("div.visible").size());

            this.counterFormatElements();

            var text = _LANG == 'ua' ? 'з' : 'из';

            var group = document.createElement('div');
            group.className = 'counter';
            group.innerHTML = '<span class="active">' + this.gallery.counter.text + '</span>' + text +
                '<span class="total">' + this.gallery.counter.total + '</span>' + '</div>';

            this.gallery.counter.group = $(group);

            return this.gallery.group.append(this.gallery.counter.group);
        },
        counterFormatElements: function(){

            /*
             case '1':
             - для 1-го элемента в карусели, пишем: 1 из 1

             case '2':
             - для 2-х элементов в карусели, пишем: 1, 2 из 2
             - для 4-х элементов: 1 - 3 из 3, 4 из 4
             - для 5-и элементов: 1 - 3 из 3, 4,5 из 5

             default :
             - для 3-х элементов: 1 - 3 из 3
             - для 6-и элементов: 1 - 3 из 3, 4 - 6 из 6
             */

            var type = false;

            if (this.gallery.activePage == this.gallery.countPage -1)
                type = this.gallery.item[this.gallery.countPage-1].find("div.visible").size();

            ////////////console.log(type)

            switch (type){

                case 1:
                    ////////////console.log('case 1')
                    this.gallery.counter.text = this.gallery.activePage * this.gallery.counter.size + 1;
                    break;

                case 2:
                    this.gallery.counter.text =
                        (this.gallery.counter.total - 1) + ',' +
                        this.gallery.counter.total;q
                    break;

                default :
                    this.gallery.counter.text = this.gallery.activePage == 0
                        ? 1 + '-' + this.gallery.counter.size
                        : this.gallery.counter.text = (this.gallery.activePage * this.gallery.counter.size + 1) + '-'
                        + (this.gallery.activePage * this.gallery.counter.size + this.gallery.counter.size);

            }


        },
        eventCounter: function(){
            switch (this.gallery.counter.type){
                case 'page' :
                    var active_page = this.gallery.activePage <= 0
                        ? 1
                        : this.gallery.activePage + 1 >= this.gallery.countPage
                        ? this.gallery.countPage : this.gallery.activePage + 1;
                    return $(this.gallery.counter.group).find('.active').html(active_page);
                    break;
                case 'elements' :
                    this.counterFormatElements();
                    $(this.gallery.counter.group).find('.active').html(this.gallery.counter.text);
                    break;
            }
        },

        /*auto_scroll*/
        initAutoScroll: function(){
            var _this = this;
            this.options.auto_scroll_interval = setInterval(
                function(){
                    _this.next(_this.gallery);
                }, _this.options.auto_scroll_interval);
        },

        /*zero_pixel*/
        initZeroPixel: function (){
            this.gallery.zeropixel = {};
            this.gallery.zeropixel.item = {};
            this.gallery.zeropixel.show = true;

            var group = document.createElement('div');
            group.className = 'group zeropixel';

            this.gallery.zeropixel.group = $(group).appendTo(this.element[0]);
            this.addZeroPixel(this.gallery.start_index);
        },

        addZeroPixel: function (index){
            if(typeof this.gallery.zeropixel.item[index] != 'undefined') return;
            if(typeof this.gallery.image[index] != 'undefined'){
                var img = document.createElement('img');
                img.className = 'zero-pixel item-' + index;
                img.src = this.gallery.image[index].zeropixel;
                this.gallery.zeropixel.item[index] = $(img);
                this.gallery.zeropixel.group.append(this.gallery.zeropixel.item[index]);
            }
        },

        destroyAutoScroll: function(){
            this.options.auto_scroll = false;
            return clearInterval(this.options.auto_scroll_interval);
        },

        /*skins*/
        initSkins: function(cls){
            if(!this.element.hasClass(cls)){
                $(this.element).removeClass(this.options.skin);
                $(this.element).addClass(cls);

                if(this.options.popup.show && (typeof this.popup != 'undefined' || typeof this.popup.slider != 'undefined')){
                    $(this.popup.slider).removeClass(this.options.skin);
                    $(this.popup.slider).addClass(cls);
                }
                this.options.skin = cls;
            }
            return;
        },

        /*template*/
        parserTemplate: function(s, e){
            $.each(e, function(i, val){
                s = s.replace(new RegExp('{{' + i + '}}', 'g'), val);
            });
            return s;
        },

        /*popup*/
        initPopup: function(){
            this.popup = this.options.popup;
            this.popup.buttons.zoom = $(this.popup.buttons.zoom);
            $(this.gallery.item[this.gallery.activePage]).find('.image').append(this.popup.buttons.zoom);
            this.addBtnPopupAction();
            return;
        },
        initPopupSlider: function(){
            this.popup.slider = this.popup.element.find('.slider').addClass(this.options.skin);

            var group = document.createElement('div');
            group.className = 'group';
            group.innerHTML = '<em></em>';

            this.popup.group = $(group).appendTo(this.popup.slider);
            this.popup.group.height($(window).height() - 60 - 15)
            this.popup.info_box = this.popup.group.find('.' + this.popup.info_box);

            this.addPopupItem();

            if($(this.gallery.item).length != 1){

                var prev = document.createElement('a');
                prev.className = this.options.popup.cl_prev;
                prev.innerHTML = '<em></em>';
                prev.href = '#';
                prev.setAttribute('onclick', 'return false');

                this.popup.buttons.prev = $(prev).appendTo(this.popup.slider);

                var next = document.createElement('a');
                next.className = this.options.popup.cl_next;
                next.innerHTML = '<em></em>';
                next.href = '#';
                next.setAttribute('onclick', 'return false')

                this.popup.buttons.next = $(next).appendTo(this.popup.slider);
                this.popupNextAction();
                this.popupPrevAction();
            }

            this.initSkins(this.options.skin);
            this.popupImageAction();
        },

        addPopupItem: function(){
            var _this = this;
            _this.popup.group.item = [];
            _this.popup.group.item.length = 0;
            $.each(this.gallery.image, function(i, e){

                _this.popup.group.item[i] = document.createElement('a');
                _this.popup.group.item[i].href = '#';
                _this.popup.group.item[i].innerHTML = '<span src = "' + e.src_full_size + '"></span>';

                $(_this.popup.group.item[i]).appendTo(_this.popup.group);
                $(_this.popup.group.item[i]).hide();

                if(_this.gallery.activePage - 1 == i || _this.gallery.activePage == i || _this.gallery.activePage + 1 == i) {
                    _this._spanToImg(_this.popup.group.item[i].querySelectorAll('span'));
                }

                if(_this.gallery.activePage == i) {
                    $(_this.popup.group.item[i]).show();
                }

                var img = document.createElement('img');
                img.className = 'loader';
                img.src = _this.popup.loader_src;

                _this.popup.group.item[i].appendChild(img);
            });

            if (this.options.ablock.show){
                this.popup.group.item[this.popup.group.item.length] = this.ablock.block.group.cloneNode(true);
                $(this.popup.group.item[this.popup.group.item.length - 1]).find('.overlay').remove();
                this.popup.group.append(this.popup.group.item[this.popup.group.item.length - 1]);
            }

            _this.popup.group.item[_this.popup.group.item.length - 1].style.cursor = 'default';
        },
        popupNextAction: function(){
            var _this = this;
            this.popup.buttons.next.bind('click', function(){

                if(typeof _this.popup.group.item[_this.gallery.activePage + 1] != 'undefined'){
                    _this.gallery.bt_next.click();

                    _this.popupBtnNextPrev();

                    if (typeof _this.popup.group.item[_this.gallery.activePage + 1] != 'undefined') {
                        _this._spanToImg(_this.popup.group.item[_this.gallery.activePage + 1].querySelectorAll('span'));
                    }
                }

                $(_this.popup.group.item[_this.gallery.activePage]).prev().hide();
                $(_this.popup.group.item[_this.gallery.activePage]).show();
            });
        },
        popupPrevAction: function(){
            var _this = this;
            this.popup.buttons.prev.bind('click', function(){

                if(typeof _this.popup.group.item[_this.gallery.activePage - 1] != 'undefined'){
                    _this.gallery.bt_prev.click();

                    _this.popupBtnNextPrev();

                    if (typeof _this.popup.group.item[_this.gallery.activePage - 1] != 'undefined') {
                        _this._spanToImg(_this.popup.group.item[_this.gallery.activePage - 1].querySelectorAll('span'));
                    }
                }

                $(_this.popup.group.item[_this.gallery.activePage]).next().hide();
                $(_this.popup.group.item[_this.gallery.activePage]).show();

            });
        },
        popupBtnNextPrev : function(){

            if (typeof this.popup.group == 'undefined') return;

            var index = $(this.popup.group.item[this.gallery.activePage]).index();

            if(!this.options.infinity){
                index == 1
                    ? $(this.popup.buttons.prev).addClass('disable')
                    : $(this.popup.buttons.prev).removeClass('disable');

                index == this.popup.group.item.length
                    ? $(this.popup.buttons.next).addClass('disable')
                    : $(this.popup.buttons.next).removeClass('disable');
            }

            if (this.options.ablock.show && index == this.popup.group.item.length){
                this.popup.element.find('.description').hide();
                this.gallery.rating.element.hide();
                $(this.gallery.socialpanel.element).hide();

            }else{

                this.popup.element.find('.description').show();
                this.popup.element.find('.description').html(this.gallery.image[this.gallery.activePage].description);

                $(this.gallery.rating.element).show();
                $(this.gallery.socialpanel.element).show();
            }

            this.popup.element.find('.right').scrolling();
            this.popup.element.find('.right').scrolling('option', {height : $(window).height() -60});

            //this.popup.element.find('.right').scrolling("option", "value", 100);

            if (null != this.options.callbackNextPrevActionsPopup)
                this.options.callbackNextPrevActionsPopup();

        },
        popupImageAction: function(){
            var _this = this;
            this.popup.group.on('click', 'a', function(){

                if (typeof _this.popup.group.item[_this.gallery.activePage + 1] != 'undefined'){
                    _this.gallery.bt_next.click();
                    _this.popup.group.item[_this.gallery.activePage].prev().hide();
                    _this.popup.group.item[_this.gallery.activePage].show();
                }

                if(typeof _this.popup.group.item[_this.gallery.activePage + 1].find('span') != 'undefined')
                    _this._spanToImg(_this.popup.group.item[_this.gallery.activePage + 1].querySelectorAll('span'));

                _this.popupBtnNextPrev();
            });
        },
        openPopup: function(){
            var _this = this;

            if (typeof this.popup.element == 'undefined'){
                var id = '#gallery-popup' + this.getRandomArbitary(1, 100);

                var div = document.createElement('div');
                div.id = id;

                this.popup.element = $(div).appendTo($('body'))

                //////////console.log(this.options.popup.data)

                this.popup.element.popupGallery({
                    ajaxOptions: {
                        data: _this.options.popup.data,
                        afterSuccess : function (){
                            _this.initPopupSlider();
                            _this.popupBtnNextPrev();
                            _this.popupResize();

                            if(null != _this.options.callbackOpenPopup)
                                _this.options.callbackOpenPopup();

                            $('body').css({overflow: 'hidden'});

                            _this.popup.group.find('.right').scrolling();
                            _this.moveBanner();
                            _this.activeKey('37');
                            _this.activeKey('39');
                        }
                    },
                    afterClose : function(){

                        if (_this.gallery.rating.show) {
                            $(_this.gallery.item[_this.gallery.activePage]).find('.image').append(_this.gallery.rating.element);
                        }

                        if (_this.gallery.socialpanel.show) {
                            _this.gallery.group.appendChild(_this.gallery.socialpanel.element);
                        }

                        _this.popup.visible = 0

                        $('body').css({overflow: 'visible'});

                        if ($('body').hasClass('branding')) {
                            $('body').css({position: 'relative'});
                        }

                    },
                    afterOpen : function(){
                        _this.popup.element.find('.description').html(_this.gallery.image[_this.gallery.activePage].description);
                        _this.popup.element.find('.description').after(_this.gallery.rating.element);
                        _this.popup.element.find('.tochka-rating').after(_this.gallery.socialpanel.element);

                        _this.popup.visible = 1;
                        $('body').css({overflow: 'hidden'});

                        if (typeof _gaq != 'undefined')
                            _gaq.push(['_trackEvent', _this.track_name, 'zoom', 'http://'+location.host+location.pathname+'']);

                    }
                });

            }else{
                this.popup.element.popupGallery('open');

                if(typeof _this.popup.group != 'undefined'){

                    if (typeof _this.popup.group.item[_this.gallery.activePage] != 'undefined') {
                        _this._spanToImg(_this.popup.group.item[_this.gallery.activePage].querySelectorAll('span'));
                    }

                    if (typeof _this.popup.group.item[_this.gallery.activePage - 1] != 'undefined') {
                        _this._spanToImg(_this.popup.group.item[_this.gallery.activePage - 1].querySelectorAll('span'));
                    }

                    _this.popup.group.find(">*:not('em')").hide();
                    $(_this.popup.group.item[this.gallery.activePage]).show();
                }

                _this.moveBanner();

                _this.popupBtnNextPrev();
                _this.popup.visible = 1
            }
        },

        moveBanner: function(){

            if(typeof $('.gallery-popup').find('.banner.vertical') != 'undefined') {
                this.popup.element.find('.info-box').before($('.gallery-popup').find('.banner.vertical'));
            }

            this.popup.element.find('.banner.vertical').next('.banner.vertical').remove();
        },

        addBtnPopupAction: function(){
            var _this = this;
            this.popup.buttons.zoom.bind('click', function(e){
                e.preventDefault();
                _this.openPopup();
            });
        },
        addBtnPopupHover: function(){
            var _this = this;

            $(this.gallery.mask).on('click', 'img', function (e) {
                e.preventDefault();
                _this.openPopup();
            });

            $(this.gallery.mask).on('mouseenter', 'img', function (e) {
                _this.popup.buttons.zoom.show();
            });

            $(this.gallery.mask).on('mouseleave', 'img', function () {
                $(_this.popup.buttons.zoom).hover(
                    function(){
                        return _this.popup.buttons.zoom.show();
                    },
                    function(){
                        _this.popup.buttons.zoom.hide();
                    }
                );
                _this.popup.buttons.zoom.hide();
            });

            return;
        },
        popupResize: function(){
            var _this = this;
            $(window).resize(function(){
                if(_this.popup.element.css('display') == 'block'){
                    _this.popup.group.style.height = ($(window).height() - 60 - 15) + 'px';
                    //_this.popup.element.find('.right').scrolling('option', {height : $(window).height() -60});
                }
            });
        },

        /*rating*/
        initRating : function(){
            var _this = this,
                id = '#tochka-rating' + this.getRandomArbitary(1, 100);

            if(this.options.gallery.rating.show) {

                var rating = document.createElement('div');
                rating.className = 'tochka-rating';
                rating.id = id;

                this.gallery.rating.element = $(rating).appendTo($(this.gallery.item[this.gallery.activePage]).find('.image'));
            }

            this.gallery.rating.element.rating({
                skin: 'small',
                progress: false,
                ajax: {
                    data: {
                        object_id: _this.gallery.image[this.gallery.activePage].id,
                        object_type: 'photo',
                        section: this.options.gallery.rating.section
                    }
                }
            });

            this.gallery.rating.element.rating('option', 'callbackAfterCreate', function(){
                for(var i in this.rating){
                    _this.gallery.image[_this.gallery.activePage].rating[i].count = this.rating[i].count;
                    _this.gallery.image[_this.gallery.activePage].rating[i].disable = this.rating[i].disable;
                }
            });

            this.storage = new preloadStorage();
            this.storage.getAjaxConfig = this.gallery.rating.ajax;

            this.createDataRating();

            this.storage.onGetValue(function(key, value){
                if(null != _this.storage.data[_this.gallery.image[_this.gallery.activePage].id]){
                    _this.gallery.image[_this.gallery.activePage].rating = {};
                    _this.gallery.image[_this.gallery.activePage].rating.id = key;
                    $.extend(_this.gallery.image[_this.gallery.activePage].rating, _this.storage.data[_this.gallery.image[_this.gallery.activePage].id])
                }
                return _this.gallery.rating.element.rating('option', {setRating : _this.gallery.image[_this.gallery.activePage].rating});
            });

            $(this.gallery.item[this.gallery.activePage]).find('.image').append(this.gallery.rating.element);

            return this.storage.getValue(this.gallery.image[this.gallery.activePage].id);
        },

        updateRating: function (index) {

            if (typeof this.gallery.image[index] != 'undefined') {

                this.storage.getValue(this.gallery.image[index].id);

                if (!this.options.popup.visible) {
                    $(this.gallery.item[index]).find('.image').append(this.gallery.rating.element);
                }
            }
        },

        createDataRating : function(){
            for(var i in this.gallery.image){
                this.storage.addKey(this.gallery.image[i].id);
            }
        },

        activeKey: function(code){
            var _this = this;

            switch (code) {
                case '37':
                    $(document).keyup(function(event){
                        if(event.keyCode == 37)
                            _this.popup.buttons.prev.click();
                    });
                    break;

                case '39':
                    $(document).keyup(function(event){
                        if(event.keyCode == 39)
                            _this.popup.buttons.next.click();
                    });
                    break;
            }
        },

        /*socialpanel for gallery*/
        initSocialPanel: function(){

            this.gallery.socialpanel.items = [];
            $(this.gallery.group).addClass('socialpanel');

            var socialpanel = document.createElement('div');
            socialpanel.className = 's-panel group';
            socialpanel.innerHTML = '<span>Поделись фотографией:</span>';

            this.gallery.socialpanel.element = $(socialpanel).appendTo(this.gallery.group);

            this.addSocialPanel(this.gallery.activePage);
        },

        addSocialPanel: function(index){

            var _this = this, end = index + 1, i = index;

            $.each(this.gallery.socialpanel.items, function(){ $(this).removeClass('active'); });

            for (i; i <= end; ++i) {

                if (typeof this.gallery.socialpanel.items[i] == 'undefined' && typeof this.gallery.image[i] != 'undefined') {

                    var socialpanel = document.createElement('div');
                    socialpanel.id = 'social-panel2';
                    socialpanel.className = 'social-panel';

                    this.gallery.socialpanel.items[i] = $(socialpanel).appendTo(this.gallery.socialpanel.element);

                    var imgLink = 'http://' + window.location.host + window.location.pathname;
                    var imgPos = imgLink.indexOf('/img-');

                    if(imgPos == -1) {
                        imgLink += 'img-'+_this.gallery.image[i].id + '/';
                    }else{
                        imgLink = imgLink.substr(0,imgPos) + '/img-' + _this.gallery.image[i].id + '/';
                    }

                    this.gallery.socialpanel.items[i].socialpanel({
                        socialpanel:{
                            url: imgLink,
                            media: 'photo',
                            id_article: _this.gallery.image[i].id,
                            track_name : 'tochka_share_gallery'
                        },
                        pin:{
                            src: _this.gallery.image[i].src,
                            description: $(_this.gallery.image[i].description).text()
                        },
                        tw:{
                            src: _this.gallery.image[i].src,
                            description: $(_this.gallery.image[i].description).text()
                        }
                    });

                }
            }

            if (typeof this.gallery.socialpanel.items[index] != 'undefined') {
                this.gallery.socialpanel.items[index].addClass('active');
            }
        },

        /*Seo mode: options.static = true*/
        initStaticObject: function(){
            this.initStaticGallery();
            this.initStaticThumbs();

            /*create ajax block*/
            if(this.options.ablock.show) this.initAjaxBlocks();
        },
        initStaticGallery: function(){
            var _this = this;

            this.gallery = this.options.gallery;
            this.gallery.name = 'gallery';
            this.gallery.group = this.element.find('.elements.group')[0];
            this.gallery.inner = this.element.find('.elements .inner')[0];
            this.gallery.mask = this.element.find('.elements .mask')[0];
            this.gallery.bt_prev = this.gallery.group.find('.btn-prev');
            this.gallery.bt_next = this.gallery.group.find('.btn-prev');
            this.gallery.item = [];

            $.each($(this.gallery.mask).children('li'), function(i, e){

                _this.gallery.item[i] = e;

                $(_this.gallery.item[i]).find('.image img').attr({
                    heigth: _this.gallery.heigth,
                    width: _this.gallery.width
                });

                _this.gallery.countPage = i+1;
            });

            this.gallery.mask.style.width = (this.gallery.item.length * ((+this.gallery.step_dim) + (+this.gallery.indent))) + 'px';

            this._initObject(this.gallery);

            if(this.gallery.start_index != 0){
                this.goToPage(this.gallery, this.gallery.start_index, 0);
                this.disableBtnPrevNext(this.gallery, this.gallery.start_index)
            }

            if(this.options.infinity && !this.options.clones && this.gallery.step == this.gallery.countPage)
                this.disableBtnPrevNext(this.gallery, this.gallery.start_index)

            if(this.options.clones)
                this.indexFirstPage(this.gallery);

            /*filter*/
            if(this.options.gallery.filters.show)
                this.initFilters(this.gallery);

            /*pagination*/
            if(this.options.gallery.pagination.show)
                this.initStaticPagination(this.gallery);

            /*counter*/
            if(this.options.gallery.counter.show)
                this.initCounter();

            /*counter*/
            if(this.options.gallery.zeropixel)
                this.initZeroPixel();
        },
        initStaticThumbs: function(){
            var _this = this;

            this.thumbs = this.options.thumbs;
            this.thumbs.name = 'thumbs';
            this.thumbs.group = this.element.find('.thumbs.group')[0];
            this.thumbs.inner = this.element.find('.thumbs .inner')[0];
            this.thumbs.mask = this.element.find('.thumbs .mask')[0];
            this.thumbs.bt_prev = this.thumbs.group.find('.btn-prev');
            this.thumbs.bt_next = this.thumbs.group.find('.btn-prev');
            this.thumbs.item = [];

            $.each($(this.thumbs.mask).children('li'), function(i, e){
                _this.thumbs.item[i] = e;

                $(_this.thumbs.item[i]).find('.image img').attr({
                    heigth: _this.thumbs.heigth,
                    width: _this.thumbs.width
                });

                _this.thumbs.countPage = i+1;
            });

            this.thumbs.mask.style.width = (this.thumbs.item.length * ((+this.thumbs.step_dim) + (+this.thumbs.indent) + ((+this.thumbs.step_dim) * (+this.thumbs.size)))) + 'px';

            this._initObject(this.thumbs);

            this._addEventThumbs();

        },
        initStaticPagination: function(obj){

            obj.pagination.group = document.createElement('div');
            obj.pagination.group.className = 'group ' + obj.pagination._class;

            if (this.element[0].firstChild) {
                this.element[0].insertBefore(obj.pagination.group, this.element[0].firstChild);
            } else {
                this.element[0].appendChild(obj.pagination.group);
            }

            obj.pagination.inner = document.createElement('div');
            obj.pagination.inner.className = 'inner';

            obj.pagination.group.appendChild(obj.pagination.inner);

            obj.pagination.mask = document.createElement('ul');
            obj.pagination.mask.className = 'mask';

            obj.pagination.inner.appendChild(obj.pagination.mask);

            obj.pagination.prevPage = 1;
            obj.pagination.activePage = 0;

            this._addPagination(obj);
        },

        cancelTouch: function(obj) {
            var _this = this;
            $(obj.group).off('touchmove', function(e){_this.onTouchMove(e, obj);});
            _this.startX = null;
            _this.isMoving = false;
        },
        onTouchMove: function(e, obj) {
            if(this.isMoving) {
                var x = e.originalEvent.touches[0].pageX;
                var y = e.originalEvent.touches[0].pageY;
                var dx = this.startX - x;
                var dy = this.startY - y;
                if (Math.abs(dx) > Math.abs(dy)) {
                    e.preventDefault();
                }
                if(Math.abs(dx) >= 40) {
                    this.cancelTouch(obj);
                    if(dx > 0) {
                        obj.bt_next.click();
                    }
                    else {
                        obj.bt_prev.click();
                    }
                }
                else if(Math.abs(dy) >= 40) {
                    this.cancelTouch(obj);
                    if(dy > 0) {
                        // down;
                    }
                    else {
                        // up();
                    }
                }
            }
        },
        onTouchStart: function(e, obj) {
            var _this = this;
            if (e.originalEvent.touches.length == 1) {
                _this.startX = e.originalEvent.touches[0].pageX;
                _this.startY = e.originalEvent.touches[0].pageY;
                _this.isMoving = true;
                $(obj.group).on('touchmove', function(e){
                    _this.onTouchMove(e, obj);
                }, false);
            }
        },

        getRandomArbitary : function (min, max){
            return Math.round(Math.random() * (max - min) + min);
        },


        destroy: function() {
            $.Widget.prototype.destroy.call(this);
            return this.element.empty();
        }
    });

    $.widget("tochka.carouselJson", $.tochka.gallery, {
        /*default options*/
        options:{
            infinity: true,

            /*gallery options*/
            gallery: {
                show    : true,
                _class   : 'elements',
                step    : 3,
                size    : 5,
                speed   : 300,
                width   : 180,
                height  : 136,
                step_dim : 180,
                indent  : 12,
                pagination:{show: true},
                template : '<li class="item">' +
                '<a class="image" href="{{href}}"><span src="{{src}}"></span></a>' +
                '</li>'

            },

            /*thumbs options*/
            thumbs: {show: false},
            /*pagination*/
            pagination:{show: true},
            /*see more*/
            ablock:{show:false}
        },
        _create: function() {
            $.tochka.gallery.prototype._create.call(this);
        }
    });

    $.widget("tochka.carouselJsonSizeOne", $.tochka.carouselJson, {

        /*default options*/
        options: {

            /*gallery options*/
            gallery: {
                step: 1,
                size: 2,
                speed: 300,
                width: 300,
                height: 225,
                step_dim: 300,
                indent: 0,
                cl_next: 'btn-next small',
                cl_prev: 'btn-prev small',
                template: '<li class="item">' +
                '<a class="image" href="{{href}}">' +
                '<span src="{{src}}"></span>' +
                '<div class="title">' +
                '<span>{{title}}</span>' +
                '</div>' +
                '</a>' +
                '</li>'
            }
        },
        _create: function() {
            $.tochka.carouselJson.prototype._create.call(this);
        }
    });

    $.widget("tochka.carouselJsonSizeTow", $.tochka.carouselJsonSizeOne, {

        /*default options*/
        options:{
            /*gallery options*/
            gallery: {
                step    : 2,
                size    : 2,
                indent  : 0
            }
        },
        _create: function() {
            $.tochka.carouselJsonSizeOne.prototype._create.call(this);
        }
    });

    $.widget("tochka.carouselJsonArticle", $.tochka.carouselJsonSizeOne, {

        /*default options*/
        options:{
            /*gallery options*/
            gallery: {
                step    : 1,
                size    : 2,
                speed   : 300,
                width   : 640,
                height  : 470,
                step_dim : 640,
                indent  : 0,
                cl_next:'btn-next small',
                cl_prev:'btn-prev small',
                template : '<li class="item">' +
                '<a href="#" class="image" onclick="return false;"><span src="{{src}}"></span></a>' +
                '<div class="description">{{description}}</div>' +
                '</li>',

                /*pagination*/
                pagination:{show: false},
                counter: {show : true}
            }
        },
        _create: function() {
            $.tochka.carouselJsonSizeOne.prototype._create.call(this);
            //this.isEmptyDescription();
        },
        isEmptyDescription: function(){

            $.each(this.gallery.item, function(){
                if($(this).find('.description').html() == '')
                    $(this).find('.description').hide();

            });
        }
    });

}(jQuery));