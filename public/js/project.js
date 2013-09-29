angular.module('project', ['firebase']).
  value('fbURL', 'https://drdocker.firebaseIO.com/apps').
  config(function($routeProvider) {
    $routeProvider.
      when('/list', {controller:ListCtrl, templateUrl:'list.html'}).
      when('/edit/:appName', {controller:EditCtrl, templateUrl:'detail.html'}).
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

  $rootScope.logout = function() {
    angularFireAuth.logout();
    $location.path("/");
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
  $scope.logout = $rootScope.logout;

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

    $scope.app.name = $scope.appName;
    $scope.apps.push($scope.app);

    $location.path("/list");
  }
}
 
function EditCtrl($scope, $location, $routeParams, angularFire, fbURL) {
  angularFire(new Firebase(fbURL), $scope, 'apps').
  then(function() {
    var found = false;
    for (var i = 0; i < $scope.apps.length; i++) {
      if ($scope.apps[i] != null && $scope.apps[i].name === $routeParams.appName) {
        $scope.app = $scope.apps[i];
        found = true;
        break;
      }
    }

    if (!found) {
      $location.path("/new");
      return;
    }

    $scope.appName = $scope.app.name;
    $scope.disabled = "disabled";

    $scope.isClean = function() {
      return $routeParams.appName == $scope.appName;
    }

    $scope.destroy = function() {
      for (var i = 0; i < $scope.apps.length; i++) {
        if ($scope.apps[i] != null && $scope.apps[i].name == $scope.app.name) {
          $scope.apps.splice(i, 1);
          i--;
          break;
        }
      }
      $location.path('/list');
    };

    $scope.save = function() {
      $scope.app.name = $scope.appName;
      $location.path('/');
    };
  });
}