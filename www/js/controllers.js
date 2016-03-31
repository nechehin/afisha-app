angular.module('controllers', [])

.controller('ArticlesCtrl', function($scope,$stateParams, Articles){

    Articles.load().then(function(){

        $scope.articles = Articles.all();
    });

})

.controller('ArticleDetailCtrl', function( item, $scope){

    $scope.item = item.data;

})