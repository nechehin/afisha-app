
var service = angular.module('service', []);

service.factory('Articles', function($http, $ionicPopup){

        var items = [];

        var url = 'http://feeds.tochka.net/articles/items/';

        return {
            load: function(){
                return $http.get(url, {timeout: 10000}).then(function(response){
                    items = response.data;
                    return items;
                }, function(){
                    $ionicPopup.alert({title: error});
                });
            },

            all: function(){
                return items;
            }
        }
    });
