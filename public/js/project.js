angular.module('project', ['firebase']).
  value('fbURL', 'https://drdocker.firebaseIO.com/apps').
  config(function($routeProvider) {
    $routeProvider.
      when('/list', {controller:ListCtrl, templateUrl:'list.html'}).
      when('/edit/:appId', {controller:EditCtrl, templateUrl:'detail.html'}).
      when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
      when('/', {controller:LoginCtrl, templateUrl:'login.html'}).
      otherwise({redirectTo:'/'});
  }).run( function($rootScope, $location) {
    // register listener to watch route changes
    $rootScope.$on( "$locationChangeStart", function(event, next, current) {
      if ( $rootScope.user == null ) {
        // no logged user, we should be going to #login
        if ( next.templateUrl == "partials/login.html" ) {
          // already going to #login, no redirect needed
        } else {
          // not going to #login, we should redirect now
          $location.path( "/" );
        }
      }         
    });
 });
 
function LoginCtrl($scope, $rootScope, $location, angularFireAuth, fbURL) {

  //console.log("fbURL: "+fbURL);
  $scope.loginStatus = "";
  angularFireAuth.initialize(fbURL, {scope: $scope, name: "user"});

  //var ref = new Firebase(fbURL);

  //angularFireAuth.initialize(ref, {scope: $scope, name: "user"});

  $scope.login = function() {
    angularFireAuth.login('twitter', {
      rememberMe: true
    });
  };

  $scope.$on("angularFireAuth:error", function(evt, err) {
    console.error("twitter login error:"+err);
    $scope.loginStatus = ''+err;
  });

  $scope.$on("angularFireAuth:login", function(evt, user) {
    console.log("user: "+JSON.stringify(user));
    $rootScope.user = user;
    $location.path("/list");
  });

}

function ListCtrl($scope, $rootScope, $location, angularFire, fbURL) {
  //console.log("user: "+JSON.stringify($rootScope.user));
  $scope.user = $rootScope.user;
  var ref = new Firebase(fbURL);
  angularFire(ref, $scope, 'apps').then(function() {
    console.log("apps:"+JSON.stringify($scope.apps));
    if ($scope.apps == null) return;

    for (var i = 0; i < $scope.apps.length; i++) {
      if ($scope.apps[i] == null) {
        $scope.apps.splice(i, 1);
        i--;
      }
    }
  });

  //console.log("apps:"+JSON.stringify($scope.apps));
}
 
function CreateCtrl($scope, $location, $timeout, $rootScope, angularFire, fbURL) {
  var ref = new Firebase(fbURL);
  angularFire(ref, $scope, 'apps');

  $scope.save = function() {
    $scope.app.createdBy = { 
      twitter: $rootScope.user.username,
      display: $rootScope.user.displayName,
      picture: $rootScope.user.photos[0].value
    };

    $scope.apps.push($scope.app);

    $location.path("/");
  }
}
 
function EditCtrl($scope, $location, $routeParams, angularFire, fbURL) {
  angularFire(fbURL + $routeParams.projectId, $scope, 'remote', {}).
  then(function() {
    $scope.app = angular.copy($scope.remote);
    $scope.project.$id = $routeParams.projectId;
    $scope.isClean = function() {
      return angular.equals($scope.remote, $scope.project);
    }
    $scope.destroy = function() {
      $scope.remote = null;
      $location.path('/');
    };
    $scope.save = function() {
      $scope.remote = angular.copy($scope.project);
      $location.path('/');
    };
  });
}