var application = angular.module("profitCalculator", ['zingchart-angularjs', 'apiFactory', 'profitCalculatorFactory']);

application.controller("profitController", function($scope, $http, $filter, apiData, profitCalculator) {

    var symbolList;

    //API call for symbols available
    apiData.getSymbolList().then(function successCallback (response){
    	console.log("success, got a response!",response.data);
    	symbolList = response.data;
    }, function errorCallback(response){
    	console.log("there was an error!");
    });

    $scope.autoComplete = function() {
    	$scope.results = [];

    	//check if symbolList is defined and that search entry is not empty
    	if((symbolList != undefined) && ($scope.symbol != "")){

    		var patt = new RegExp("^"+$scope.symbol, "i");

	    	//filter symbolList
	    	for (var i = 0, len = symbolList.length; i < len; i++) {
	    		if(patt.test(symbolList[i].symbol)){
	    			$scope.results.push(symbolList[i]);
	    		}
	    	}

	    	//if no results return message
	    	if($scope.results.length == 0){
	    		$scope.results.push({symbol:"No Results found",name:"try another symbol"});
	    	}
    	}else{
    		console.log("symbols undefined!");
    	}
    };

    $scope.search = function() {
        console.log("searching for " + $scope.symbol + "!");
        var range = "Today"; //TEMP

        //API chart data call
        apiData.getSymbolChart($scope.symbol, range).then(function successCallback(response) {
            console.log("success, got a response!");
            var data = response.data;
            //check to see if response data is not empty
            if(data != []) {
                var calculation = profitCalculator.getCalculation(data);
                $scope.chartJson = calculation.chartJSON;
                $scope.trades = calculation.trades;
                $scope.profit = calculation.profit;
            } else {
                console.log("response was empty!");
            }
        }, function errorCallback(response) {
            console.log("there was an error with the api call!");
        });
    };

    $scope.searchBarKeyInput = function(eventKey){
    	//check if enter key has been pressed
    	if(eventKey.keyCode == 13){
    		$scope.search();
    	}else{
    		//autocomplete results
    		$scope.autoComplete();
    	}
    };

});