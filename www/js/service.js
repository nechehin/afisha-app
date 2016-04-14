
var service = angular.module('service', []);

service
.factory('Articles', function($http, $ionicPopup){

    var items = [];

    var url      = 'http://feeds.tochka.net/articles/items/';
    var url_item = 'http://feeds.portal.spavor.dvdev.org.ua/articles/item/afisha/';
    var dev_url  = 'http://feeds.portal.spavor.dvdev.org.ua/articles/items/afisha/';


    url = dev_url;

    return {
        load: function(offset){

            return $http.get(url+'?offset='+offset, {timeout: 70000}).then(function(response){
                items = response.data;
                return items;
            }, function(){
                $ionicPopup.alert({title: 'Connection error', content: 'Error with your connection'});
                return [];
            });
        },

        all: function(){
            return items;
        },

        get: function(id){

            return $http.get(url_item + id + '/?json', {timeout: 1000})
                .then(function(response){
                    return response.data;
                }, function(response){
                    $ionicPopup.alert({title: 'Connection error', content: 'Error with your connection'});
                    return [];
                });

        }
    }
})
.factory('StorageHelper', function($window){
    return {

        getArticlesFromLocalStorage: function(){

            if ($window.localStorage.getItem('articles') !== undefined) {
                return JSON.parse($window.localStorage.getItem('articles'));
            } else {
                $window.localStorage.setItem('articles', '[]');
                return  [];
            }

        },

        storeArticles: function(storedArticles, loadedArticles, insertBefore){

            if(storedArticles === null) {

                console.error('scope.articles is null');
                storedArticles = [];

            }

            var storedArticlesIds = [];

            storedArticles.forEach(function (storedArticle) {
                storedArticlesIds.push(storedArticle.id);
            });

            if(insertBefore){
                loadedArticles = loadedArticles.reverse();
            }
            loadedArticles.forEach(function(loadedArticle){

                if(storedArticlesIds.indexOf(loadedArticle.id) == -1){
                    if(insertBefore) {

                        storedArticles.unshift(loadedArticle);
                    }else{
                        storedArticles.push(loadedArticle);
                    }
                }

            });

            storedArticles.map(function(article){

                delete article.$$hashKey;
                return article;

            });

            $window.localStorage.setItem('articles', JSON.stringify(storedArticles));
            return storedArticles;

        },

        save: function(name, data){
            $window.localStorage.setItem(name, JSON.stringify(data));
        }

    };
});
