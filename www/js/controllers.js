angular.module('controllers', [])

.controller('ArticlesCtrl', function($scope, $stateParams, $ionicPopup, $window, Articles, StorageHelper){

    $scope.articles = [];

    $scope.loadMoreItems = function(){

        if($scope.articles.length > 0) {
            Articles.load(offset).then(function () {

                $scope.articles = StorageHelper.storeArticles($scope.articles, Articles.all(), false);

                offset += 20;

                $scope.$broadcast('scroll.infiniteScrollComplete')
            });
        }

    };

    $scope.refreshListItems = function(){

        Articles
            .load(0)
            .then(function(){
                $scope.articles = StorageHelper.storeArticles($scope.articles, Articles.all(), true);
                console.log(Articles.all());
                offset = 20;
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });



    };

    var offset = 0;

    $scope.articles = StorageHelper.getArticlesFromLocalStorage();

    Articles.load(0).then(function(){

        $scope.articles =  StorageHelper.storeArticles($scope.articles, Articles.all(), false);

        offset+= 20;

    });

})

.controller('ArticleDetailCtrl', function( Articles, StorageHelper, $scope, $stateParams){

    var articles = StorageHelper.getArticlesFromLocalStorage();

    $scope.item = {};

    Articles.get($stateParams.articleId)
        .then(function(article){
            console.log(article);
            $scope.item = article;
        });


    $scope.$on("$ionicView.loaded", function(){


        var interval = setInterval(function(){

            if(document.getElementsByClassName('content').length > 0){
                initArticle(document.getElementsByClassName('content')[0]);
                clearInterval(interval);
            }

        }, 100);

    });

});