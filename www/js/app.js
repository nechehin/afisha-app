// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'controllers', 'service'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

})

.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})



.config(function($stateProvider, $urlRouterProvider){

  $stateProvider

      .state('articles',{
        url: '/',
        templateUrl: 'templates/list.html'

      })

      .state('article', {
        url: '/article/:articleId',
        templateUrl: 'templates/item.html',
        controller: 'ArticleDetailCtrl',
        resolve: {
            item : function(Articles, $stateParams){
                return Articles.get($stateParams.articleId)
            }
        }
      });

    $urlRouterProvider.otherwise('/');
});


