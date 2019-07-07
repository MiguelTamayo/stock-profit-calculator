var apiFactory = angular.module('apiFactory', []);
apiFactory.factory('apiData', ['$http','$filter', function ($http, $filter) {

    var apiData = {};
    var urlBase = 'https://sandbox.iexapis.com/stable';

    apiData.getSymbolChart = function(symbol, range, date = null){
    	var endpoint = "";

    	if(range == 'Today'){
			var today = $filter('date')(new Date(), "yyyyMMdd");
			endpoint = "/stock/"+symbol+"/chart/date/"+today;
    	}
    	else if(range == '5D'){
			endpoint = "/stock/"+symbol+"/chart/5d";
    	}
    	else if(range == '1M'){
    		endpoint = "/stock/"+symbol+"/chart/1m";
    	}
    	else if((range == 'Date') && (date != null)){
			date = $filter('date')(date, "yyyyMMdd");
			endpoint = "/stock/"+symbol+"/chart/date/"+date;
    	}
    	else{
    		console.log("error");
    		return [];
    	}

    	console.log("URL: "+urlBase+endpoint);

    	return $http.get(""+urlBase+endpoint+"?token=TOKEN_HERE");
    };

    apiData.getSymbolList = function(){
    	var url = "https://sandbox.iexapis.com/stable/ref-data/symbols?token=TOKEN_HERE";
    	return $http.get(url);
    };

    return apiData;

}]);