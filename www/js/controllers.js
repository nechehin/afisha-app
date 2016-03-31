angular.module('controllers', [])

.controller('ArticlesCtrl', function($scope, $stateParams, Articles){

    Articles.load().then(function(){

        $scope.articles = Articles.all();
    });

})

.controller('ArticleDetailCtrl', function( Articles, $scope, $stateParams){

    Articles.get($stateParams.articleId).then(function(data){
       $scope.item = data;
    });

})