angular.module("profitCalculator",[])
.controller("profitController",function($scope, $http){
	$scope.result = "test";
	$scope.stockSymbol = "";
	$scope.currentPrice = "";

	$scope.search = function(){
		console.log("searching for "+$scope.symbol+"!");

		$http({method: "GET", url: "https://api.iextrading.com/1.0/stock/"+$scope.symbol+"/chart/1d"})
		.then(function successCallback(response){
			$scope.stockSymbol = $scope.symbol;
			$scope.currentPrice = response.data[response.data.length-1].close;
			console.log(response);
		}, function errorCallback(response){
			console.log("there was an error");
		});
	}

});