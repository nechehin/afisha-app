
var service = angular.module('service', []);

service
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
})

.factory('Articles',['StorageHelper', '$http', '$ionicPopup', function(StorageHelper, $http, $ionicPopup){

    var items = [];

    var url      = 'http://feeds.tochka.net/articles/items/afisha';
    var url_item      = 'http://feeds.tochka.net/articles/item/afisha/';
    var dev_url_item = 'http://feeds.portal.spavor.dvdev.org.ua/articles/item/afisha/';
    var dev_url  = 'http://feeds.portal.spavor.dvdev.org.ua/articles/items/afisha/';


    //url = dev_url;
    //url_item = dev_url_item;

    return {
        load: function(offset){

            return $http.get(url+'?offset='+offset, {timeout: 70000}).then(function(response){

                var collectedId = [];

                items.every(function(article){
                    collectedId.push(article.id);
                    return true;
                });

                if(offset > 0){
                    response.data.every(function(article){
                        if(collectedId.indexOf(article.id) === -1){
                            items.push(article);
                        }
                        return true;
                    });
                }else {
                    response.data.reverse().every(function (article) {
                        if (collectedId.indexOf(article.id) === -1) {
                            items.unshift(article);
                        }
                        return true;
                    });
                }

                return response.data;

            }, function(){
                $ionicPopup.alert({title: 'Connection error', content: 'Error with your connection'});
                return [];
            });
        },

        all: function(){
            return items;
        },

        get: function(id){

            return $http.get(url_item + id + '/?json')
                .then(function(response){

                    var articles = StorageHelper.getArticlesFromLocalStorage();

                    var currentArticle = null;

                    articles = articles.map(function(article){
                        if(article.id == id){
                            article.content = response.data.content;
                            currentArticle = article;
                        }

                        return article;
                    });
                    StorageHelper.save('articles', articles);

                    return currentArticle;

                }, function(){
                    $ionicPopup.alert({title: 'Connection error', content: 'Error with your connection'});

                    var articleFromCache = null;

                    var articles = StorageHelper.getArticlesFromLocalStorage();
                    articles.every(function(article){
                        if(article.id == id){
                            articleFromCache = article;
                            return false;
                        }else{
                            return true;
                        }
                    });

                    return articleFromCache;
                });


        }
    }
}]);
