angular.module('project', ['firebase']).
  value('fbURL', 'https://drdocker.firebaseIO.com/').
  factory('Projects', function(angularFireCollection, fbURL) {
    return angularFireCollection(fbURL);
  }).
  config(function($routeProvider) {
    $routeProvider.
      when('/list', {controller:ListCtrl, templateUrl:'list.html'}).
      when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
      when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
      when('/', {controller:LoginCtrl, templateUrl:'login.html'}).
      otherwise({redirectTo:'/'});
  });
 
function LoginCtrl($scope, $location, $routeParams, angularFire, fbURL) {
  var auth = new FirebaseSimpleLogin(new Firebase(fbURL), function(error, user) {
    if (error) {
      // an error occurred while attempting login
      $scope.loginStatus = "Error logging in:" + error.code + " access!"
      console.log(error);
    } else if (user) {
      // user authenticated with Firebase
      console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
    } else {
      // user is logged out
    }
  });
  
  $scope.login = function() {
    auth.login('twitter', {
      rememberMe: true
    });
  };
}

function ListCtrl($scope, Projects) {
  $scope.projects = Projects;
}
 
function CreateCtrl($scope, $location, $timeout, Projects) {
  $scope.save = function() {
    Projects.add($scope.project, function() {
      $timeout(function() { $location.path('/'); });
    });
  }
}
 
function EditCtrl($scope, $location, $routeParams, angularFire, fbURL) {
  angularFire(fbURL + $routeParams.projectId, $scope, 'remote', {}).
  then(function() {
    $scope.project = angular.copy($scope.remote);
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