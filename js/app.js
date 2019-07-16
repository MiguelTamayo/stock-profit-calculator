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

    $scope.dateRanges = ["Today", "5D", "1M"];//TODO ADD "DATE"
    $scope.selectedRange = $scope.dateRanges[0];

    $scope.setRange = function(range){
    	$scope.selectedRange = range;

    }

    $scope.autoComplete = function() {
    	$scope.results = [];

    	//check if symbolList is defined and that search entry is not empty
    	if((symbolList != undefined) && ($scope.symbol != "")){

    		var patt = new RegExp("^"+$scope.symbol, "i");
    		var resultCounter = 0;
	    	//filter symbolList
	    	for (var i = 0, len = symbolList.length; i < len; i++) {
	    		if(patt.test(symbolList[i].symbol)){
	    			var result = symbolList[i];
	    			result.class = "";
	    			$scope.results.push(result);
	    			resultCounter++;
	    			//limit results to 10
	    			if(resultCounter >= 10){
	    				break;
	    			}
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
        var range = $scope.selectedRange;

        //API chart data call
        apiData.getSymbolChart($scope.symbol, range).then(function successCallback(response) {
            console.log("success, got a response!");
            var data = response.data;
            //check to see if response data is not empty
            if(data.length != 0) {
                var calculation = profitCalculator.getCalculation(data, range);
                $scope.chartJson = calculation.chartJSON;
                $scope.trades = calculation.trades;
                $scope.initialInvestment = calculation.initialInvestment;
                $scope.grossReturn = calculation.grossReturn;
                $scope.profit = calculation.grossReturn - calculation.initialInvestment;
                $scope.percentage = $scope.symbol.toUpperCase();
                $scope.stockSymbol = $scope.symbol.toUpperCase();
            } else {
                console.log("response was empty!");
            }
        }, function errorCallback(response) {
            console.log("there was an error with the api call!");
        });
    };

	$scope.searchControls = function(event){

		var keyCode = event.keyCode;
		
	    //check if enter key has been pressed and result is selected
	    if((keyCode == 13) && ($scope.results.length >= 1)){
			//set symbol to highlighted result
			$scope.symbol = $scope.results[highlightedResultIndex].symbol;
			//clear search results
			$scope.results = [];
			if($scope.symbol != "No Results found"){
				$scope.search();
			}else{
				$scope.symbol = "";
			}
		}
		//update if arrow keys are not used
		else if((keyCode < 37) || (keyCode > 40)){
			//update autocomplete results
	    	$scope.autoComplete();
		}

	};

	$scope.arrowKeyControls = function(event){
		var keyCode = event.keyCode;
		//check if arrow keys are selected
		//up or left arrow keys
		if((keyCode == 37) || (keyCode == 38)){
			//prevent going into negative index
			if(highlightedResultIndex >= 1){
				$scope.results[highlightedResultIndex].class = "";
				highlightedResultIndex--;
				$scope.results[highlightedResultIndex].class = "highlighted";
			}
		}
		//down or right arrow keys
		else if((keyCode == 39) || (keyCode == 40)){
			//prevent going out of bounds
			if(highlightedResultIndex < $scope.results.length-1){
				$scope.results[highlightedResultIndex].class = "";
				highlightedResultIndex++;
				$scope.results[highlightedResultIndex].class = "highlighted";
			}
		}
	};

});