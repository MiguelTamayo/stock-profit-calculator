var application = angular.module("profitCalculator", ['zingchart-angularjs', 'apiFactory', 'profitCalculatorFactory']);

application.controller("profitController", function($scope, $http, $filter, apiData, profitCalculator) {

    var symbolList;
    var highlightedResultIndex = 0;

    //API call for symbols available
    apiData.getSymbolList().then(function successCallback (response){
    	console.log("success, got a response!",response.data);
    	symbolList = response.data;
    }, function errorCallback(response){
    	console.log("there was an error!");
    });

    $scope.autoComplete = function() {
    	$scope.results = [];
    	console.log("symbol:",$scope.symbol);

    	//check if symbolList is defined and that search entry is not empty
    	if((symbolList != undefined) && ($scope.symbol != "")){

    		var patt = new RegExp("^"+$scope.symbol, "i");

	    	//filter symbolList
	    	for (var i = 0, len = symbolList.length; i < len; i++) {
	    		if(patt.test(symbolList[i].symbol)){
	    			var result = symbolList[i];
	    			result.class = "";
	    			$scope.results.push(result);
	    		}
	    	}

	    	//if no results return message
	    	if($scope.results.length == 0){
	    		$scope.results.push({symbol:"No Results found",name:"try another symbol"});
	    	}

	    	//highlight first search result
	    	highlightedResultIndex = 0;
    		$scope.results[highlightedResultIndex].class = "highlighted";

    	}else{
    		console.log("symbols undefined! or symbol is empty");
    	}
    };

    $scope.search = function() {
        console.log("searching for " + $scope.symbol + "!");
        var range = "5D"; //TEMP

        //API chart data call
        apiData.getSymbolChart($scope.symbol, range).then(function successCallback(response) {
            console.log("success, got a response!");
            var data = response.data;
            //check to see if response data is not empty
            if(data.length != 0) {
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
    	console.log(eventKey);
    	//check if enter key has been pressed
    	if(eventKey.keyCode == 13){
    		//set symbol to highlighted result
    		$scope.symbol = $scope.results[highlightedResultIndex].symbol;
    		//clear search results
    		$scope.results = [];
    		$scope.search();

    	}
    	//check if arrow keys are selected
    	//up or left arrow keys
    	else if((eventKey.keyCode == 37) || (eventKey.keyCode == 38)){
    		//prevent going into negative index
    		if(highlightedResultIndex >= 1){
    			$scope.results[highlightedResultIndex].class = "";
    			highlightedResultIndex -= 1;
    			$scope.results[highlightedResultIndex].class = "highlighted";
    		}
    	}
    	//down or right arrow keys
    	else if((eventKey.keyCode == 39) || (eventKey.keyCode == 40)){
    		//prevent going out of bounds
    		if(highlightedResultIndex < $scope.results.length-1){
    			$scope.results[highlightedResultIndex].class = "";
    			highlightedResultIndex += 1;
    			$scope.results[highlightedResultIndex].class = "highlighted";
    		}
    	}
    	else{
    		//autocomplete results
    		$scope.autoComplete();
    	}
    };

});