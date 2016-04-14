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

    Articles.get($stateParams.articleId).then(function(data){

        articles.every(function(article, index){

           if(article.id == $stateParams.articleId){

               articles[index].content = data.content;
               StorageHelper.save('articles', articles);
               return false;

           }else {
               return true;
           }

        });

        $scope.item = data;
    }).catch( function(err){

        articles.every(function(article){
           if(article.id == $stateParams.articleId ){
               $scope.item = article;
               return false;
           }else{
               return true;
           }
        });

    });

});