/*Alexey Pasikov*/
(function ($, undefined) {

    $.widget("tochka.rating", {

        options: {
            skin : 'small', /*small || stars*/
            progress: false,
            ajax : {
                type: 'post',
                data:{
                    object_id: null,
                    object_type: null,
                    section: null
                }
            },
            dislike : true,
            count_inner: false,
            rating : {
                0 : {
                    _class : 'up', /*any class name*/
                    _type : 'increment', /*increment || decrement*/
                    ajax: { /*extend main params*/
                        url: 'http://tochka.net/rating/like/'
                    }, 
                    count: 0,
                    avg: 0,
                    disable: false,
                    dislike : false,
                    width: 74,
                    eButtonText: null
                },
                1 : {
                    _class : 'down', /*any class name*/
                    _type : 'decrement', /*increment || decrement*/
                    ajax: { /*extend main params*/
                        url: 'http://tochka.net/rating/dislike/'
                    },
                    count: 0,
                    disable: false,
                    dislike : false,
                    width: null,
                    eButtonText: null
                }
            },

            callbackAfterCreate : null,
            callbackAfterButtonClick : null,
            callbackAfterAjaxDone : null,
            callbackAfterRichButtonClick : null
        },

        _create: function () {
            this.createRating();
            this.collectorElements();
        },

        createRating: function(){
            this.element.rating = {};
            this.element.rating.group = $('<div class="group"></div>');
            this.element.rating.total = 0;
            this.element.rating.new_user = true;
            this.createRatingElements();
        },
        createRatingElements: function(){
            var j = 0, e;

            this.element.rating.items = [];
            this.element.rating.items.length = 0;

            for(var i in this.options.rating){

                if(!this.options.rating[i]) continue;

                if(null == this.options.rating[i].eButtonText) this.options.rating[i].eButtonText = '';

                e = this.element.rating.items[i] = {};
                e.item = $('<span class="' + this.options.rating[i]._class + '"></span>');

                e.eButton = $('<span class="button">'+this.options.rating[i].eButtonText+'</span>');
                e.eCount = $('<span class="count"><em></em><span>' + this.options.rating[i].count + '</span></span>');
                e.type = this.options.rating[i]._type;
                e.count = this.options.rating[i].count;
                e.avg = this.options.rating[i].avg;
                e.width = this.options.rating[i].width;
                e.disable = this.options.rating[i].disable;
                e.ajax = this.options.ajax;

                if(e.disable)
                    this.element.rating.new_user = false;

                this.element.rating.total = this.element.rating.total + e.count;


                if(this.options.rating[i].ajax)
                    e.ajax = $.extend({}, e.ajax, this.options.rating[i].ajax);

                if (e.disable) e.item.addClass('disable');

                this.eventsRatingElements(e);

            }


            if(this.options.type == 'rich')
                this.eventsRichRatingElements(e);

            if(this.options.progress)
                this.progressRatingElements();

        },
        eventsRatingElements: function(e){
            var _this = this;

            e.eButton.bind('click', function(){
                if (e.disable) return false;

                if(_this.options.dislike){
                    for(var i in _this.element.rating.items){
                        if (_this.element.rating.items[i].disable)
                            _this.decrementCount(_this.element.rating.items[i]);
                    };
                }else if(e.dislike && e.disable){
                    _this.decrementCount(e);
                }

                if(!e.disable) {
                    _this.incrementCount(e);

                    if (_this.element.rating.new_user){
                        _this.element.rating.total = _this.element.rating.total +1;
                        _this.element.rating.new_user = false;
                    }
                }

                if(_this.options.progress)
                    _this.progressRatingElements();

                if(_this.options.type == 'rich')
                    e.ajax.data.mark = _this.element.rating.items[0].user_rating;

                if (!$.cookie('__uv')) {
                    $.get('http://tochka.net/rating/uh/', function() {
                        if(e.ajax) $.ajax(e.ajax).done(function(data){
                            if(null != _this.options.callbackAfterAjaxSucsess)
                                _this.options.callbackAfterAjaxSucsess();
                        });
                    });
                } else {
                    if(e.ajax) $.ajax(e.ajax).done(function(data){
                        if(null != _this.options.callbackAfterAjaxSucsess)
                            _this.options.callbackAfterAjaxSucsess();
                    });
                }       
//                if(e.ajax) $.ajax(e.ajax).done(function(data){
//                    if(null != _this.options.callbackAfterAjaxSucsess)
//                        _this.options.callbackAfterAjaxSucsess();
//                });

                _this.options.rating = _this.element.rating.items;

                if(null != _this.options.callbackAfterButtonClick)
                    _this.options.callbackAfterButtonClick();

            });
        },

        /*rich*/
        eventsRichRatingElements: function(e){
            var _this = this,
                count = e.count,
                avg = e.avg;

            e.avg ? e.eButton.width(e.width / 5 * e.avg) : e.eButton.width(0);

            if (e.disable) {
                this.element.rating.items[0].item.unbind();
                return false;
            }

            this.element.rating.items[0].item.mouseenter(function(el){
                _this.light(el);
            });
            this.element.rating.items[0].item.mousemove(function(el){
                _this.light(el);
            });
            this.element.rating.items[0].item.mouseleave(function(el){
                e.avg ? e.eButton.width(e.width / 5 * e.avg) : e.eButton.width(0);
            });

            this.element.rating.items[0].item.click(function(){

                e.avg = count == 0
                    ? _this.element.rating.items[0].user_rating
                    : (((count * avg) + _this.element.rating.items[0].user_rating) / (count + 1)).toFixed(1);

                e.eButton.width(e.width / 5 * e.avg);
                _this.element.rating.items[0].item.unbind();

                if(null != _this.options.callbackAfterRichButtonClick)
                    _this.options.callbackAfterRichButtonClick(_this);

            });

        },

        mouseX : function (e) {

            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            }
            else if (e.clientX || e.clientY) {
                x = e.clientX + document.body.scrollLeft;
                y = e.clientY + document.body.scrollTop;
            }

            x -= this.element.rating.items[0].item.offset().left;;

            return x;
        },

        light : function (e){
            x = this.mouseX(e);
            this.element.rating.items[0].user_rating = Math.ceil((x*5)/this.element.rating.items[0].width);
            this.element.rating.items[0].item.find('.button').css({'width':(this.element.rating.items[0].user_rating*this.element.rating.items[0].width/5)});
        },


        collectorElements: function(){
            var e;

            for(var i in this.element.rating.items){
                e = this.element.rating.items[i];

                if(!this.options.count_inner){
                    e.item.append(e.eButton).append(e.eCount).append('<em></em>');
                }else{
                    e.eButton.append(e.eCount)
                    e.item.append(e.eButton);
                }

                this.element.rating.group.append(e.item);
                this.element.append(this.element.rating.group).addClass('tochka-rating ' + this.options.skin);
            }

            if(null != this.options.callbackAfterCreate)
                this.options.callbackAfterCreate(this);

            return;
        },

        incrementCount: function(e){
            e.disable = true;
            if (!e.dislike) e.item.addClass('disable');
            return $(e.eCount).find('span').text(++e.count);
        },

        decrementCount: function(e){
            e.disable = false;
            if (!e.dislike) e.item.removeClass('disable');
            return $(e.eCount).find('span').text(--e.count);
        },

        _setOption: function(key, value) {

            switch(key) {

                case 'setRating':

                    for (var i in value) {

                        if (typeof this.element.rating.items[i] == 'object') {
                            $.extend(this.element.rating.items[i], value[i]);
                            this.element.rating.items[i].eCount.find('span').text(this.element.rating.items[i].count);
                            this.element.rating.items[i].disable
                                ?   this.element.rating.items[i].item.addClass('disable')
                                :   this.element.rating.items[i].item.removeClass('disable');
                            this.element.rating.items[i].ajax.data.object_id = value.id;
                        }
                    }
                    break;

                case 'callbackAfterCreate':
                    $.Widget.prototype._setOption.apply(this, arguments);

                    this.options.callbackAfterButtonClick = this.options.callbackAfterCreate;

                    break;
                    
                case 'setObjectId':
                    this.options.ajax.data.object_id = value;
                    break;      

                return;
            }
        },

        getRating : function(){
            return this.element.rating;
        },

        /*progress*/
        progressRatingElements: function(){

            for(var i in this.element.rating.items){
                this.element.rating.items[i].prootsent = 0;

                if(this.element.rating.items[i].count != 0)
                    this.element.rating.items[i].prootsent = 100 / this.element.rating.total * this.element.rating.items[i].count;

                if(!this.element.rating.total)
                    this.element.rating.items[i].prootsent = 100 / this.element.rating.items.length;

                this.element.rating.items[i].item.css({
                    width: this.element.rating.items[i].prootsent + '%'
                });

                if(this.options.skin == 'middle'){
                    this.progressRatingMaxWidth(this.element.rating.items[i]);
                }
            }

            if(this.options.skin == 'middle'){
                if (this.element.rating.items[0].count > this.element.rating.items[1].count){
                    this.element.rating.items[0].item.css({'z-index' : 2});
                    this.element.rating.items[1].item.css({'z-index' : 1});
                }else{
                    this.element.rating.items[0].item.css({'z-index' : 1});
                    this.element.rating.items[1].item.css({'z-index' : 2});
                }
            }

        },
        progressRatingMaxWidth: function(e){

            e.item.css({
                'max-width' : this.element.width() - 103 + 'px'
            });

            return;
        },



        destroy: function () {
            $.Widget.prototype.destroy.call(this);
            return this.element.empty();
        }
    });
}(jQuery));
