
var service = angular.module('service', []);

service.factory('Articles', function($http, $ionicPopup){

        var items = [];

        var url      = 'http://feeds.tochka.net/articles/items/';
        var url_item = 'http://feeds.portal.spavor.dvdev.org.ua/articles/item/afisha/';
        var dev_url  = 'http://feeds.portal.spavor.dvdev.org.ua/articles/items/afisha/';


        url = dev_url;

        return {
            load: function(){
                return $http.get(url, {timeout: 10000}).then(function(response){
                    items = response.data;
                    return items;
                }, function(){
                    $ionicPopup.alert({title: 'error'});
                });
            },

            all: function(){
                return items;
            },

            get: function(id){

                return $http.get(url_item + id + '/?json', {timeout: 10000})


            }
        }
    });
