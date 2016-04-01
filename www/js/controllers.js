angular.module('controllers', [])

.controller('ArticlesCtrl', function($scope, $stateParams, Articles){

    var offset = 0;
    $scope.articles = [];

    $scope.loadMoreItems = function(){
        console.log('call func');
        if($scope.articles.length > 0) {
            Articles.load(offset).then(function () {

                $scope.articles = $scope.articles.concat(Articles.all());
                offset += 20;
                console.log(Articles.all());
                $scope.$broadcast('scroll.infiniteScrollComplete')
            });
        }

    };

    Articles.load(0).then(function(){

        $scope.articles  = Articles.all();
        offset+= 20;
        console.log(Articles.all());

    });

})

.controller('ArticleDetailCtrl', function( Articles, $scope, $stateParams){

    Articles.get($stateParams.articleId).then(function(data){
       $scope.item = data;
    });

});