angular.module('controllers', [])

.controller('ArticlesCtrl', function($scope, $stateParams, $ionicPopup, Articles, StorageHelper){

    $scope.articles = [];

    $scope.loadMoreItems = function(){

        if($scope.articles.length > 0) {
            Articles.load(offset).then(function () {

                $scope.articles = StorageHelper.storeArticles($scope.articles);

                offset += 20;

                $scope.$broadcast('scroll.infiniteScrollComplete')
            });
        }

    };

    $scope.refreshListItems = function(){

        Articles
            .load(0)
            .then(function(){
                $scope.articles = Articles.all();
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            });



    };

    var offset = 0;

    $scope.articles = StorageHelper.getArticlesFromLocalStorage();

    Articles.load(0).then(function(){

        $scope.articles =  StorageHelper.storeArticles($scope.articles);

        offset+= 20;

    });

})

.controller('ArticleDetailCtrl', function( Articles, StorageHelper, $scope, $stateParams){

    $scope.item = {};

    Articles.get($stateParams.articleId)
        .then(function(article){
            $scope.item = article;
        });


    $scope.$on("$ionicView.loaded", function(){


        var interval = setInterval(function(){

            if(document.getElementsByClassName('content').length > 0){
                initArticle(document.getElementsByClassName('content')[0]);
                // setTimeout(function(){
                //     var html = document.getElementsByClassName('content')[0].innerHTML;
                //
                //     var regex = /href=\\?"([^"]+)\\?"/g;
                //     html = html.replace(regex, "onClick=\"window.open('$1', '_system', 'location=yes')\"");
                //     console.log(html);
                //     document.getElementsByClassName('content')[0].innerHTML = html;
                // }, 500);

                clearInterval(interval);
            }


        }, 100);

    });

});