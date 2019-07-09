var application = angular.module("profitCalculator", ['zingchart-angularjs', 'apiFactory', 'profitCalculatorFactory']);

application.controller("profitController", function($scope, $http, $filter, apiData, profitCalculator) {

    $scope.result = "test";
    //scope.symbolList = apiData.getSymbols

    $scope.autoComplete = function(searchBarInput) {
    	//filter symbollist for searchbarinput
    	//limit to ten
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
                console.log("response received!");
                console.log("data=", data);
                var calculation = profitCalculator.getCalculation(data);
                console.log("calc = ",calculation);
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

});