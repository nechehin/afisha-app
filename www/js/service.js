
var service = angular.module('service', []);

service.factory('Articles', function($http){

        var items = [];

        var url = 'http://feeds.tochka.net/articles/items/';

        return {
            load: function(){
                return $http.get(url, {timeout: 2000}).then(function(response){
                    console.log(response);
                    items = response.data;
                    return items;
                }, function(){
                    console.error('Connection error');
                });
            },

            all: function(){
                return items;
            }
        }
    });
