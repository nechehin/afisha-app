angular.module('controllers', [])

.controller('ArticlesCtrl', function($scope, $stateParams, $ionicPopup, $ionicLoading, Articles, StorageHelper){

    $scope.articles = [];
    $scope.disableLoadMore = false;
    
    $scope.loadMoreItems = function(){

        $ionicLoading.show({
            template: 'Загрузка...'
        });

        var old_articles_count = $scope.articles.length;

        Articles.load(offset).then(function () {

            $scope.articles = Articles.all();
            StorageHelper.storeArticles($scope.articles);

            if($scope.articles.length === old_articles_count){
                $scope.disableLoadMore = true;
                setTimeout(function(){
                    $scope.disableLoadMore = false;
                }, 500);
            }else{
                offset += 20;
            }

        }).finally(function(){
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $ionicLoading.hide();
        });

    };

    $scope.refreshListItems = function(){

        $ionicLoading.show({
            template: 'Загрузка...'
        });

        Articles
            .load(0)
            .then(function(){
                $scope.articles = Articles.all();
            })
            .finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
                $ionicLoading.hide();
            });



    };

    var offset = 0;

    $scope.articles = StorageHelper.getArticlesFromLocalStorage();

    if(!$scope.articles || $scope.articles.length === 0){
        $ionicLoading.show({
            template: 'Загрузка...'
        });
    }

    Articles.load(0).then(function(){

        $scope.articles =  StorageHelper.storeArticles(Articles.all());

        offset+= 20;

        $ionicLoading.hide();

    });

})

.controller('ArticleDetailCtrl', function( Articles, StorageHelper, $scope, $stateParams, $ionicLoading){

    $scope.item = {};

    $scope.$on('$ionicView.enter', function(){
        $ionicLoading.show({
            template: 'Загрузка...'
        });

        Articles
            .get($stateParams.articleId)
            .then(function(article){
                $scope.item = article;
            });
    });




    $scope.$on("$ionicView.loaded", function(){


        var interval = setInterval(function(){

            if(document.getElementsByClassName('content').length > 0){
                initArticle(document.getElementsByClassName('content')[0]);
                $ionicLoading.hide();
                clearInterval(interval);
            }


        }, 100);

    });

});