angular.module('profitCalculator',[])
.controller('profitController',function($scope){
	$scope.result = "test";
	$scope.search = function(){
		console.log("searching!");
	}

});