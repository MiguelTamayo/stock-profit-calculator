var apiFactory = angular.module('apiFactory', []);
apiFactory.factory('apiData', ['$http','$filter', function ($http, $filter) {

    var apiData = {};
    var urlBase = 'https://cloud.iexapis.com/stable';

    apiData.getSymbolChart = function(symbol, range, date = null){
    	var endpoint = "";

    	if(range == 'Today'){
			var today = $filter('date')(new Date(), "yyyyMMdd");
			endpoint = "/stock/"+symbol+"/intraday-prices?chartIEXOnly=true&";
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

    	if(range == 'Today'){
            return $http.get(""+urlBase+endpoint+"token=TOKEN_HERE");
        }else{
            return $http.get(""+urlBase+endpoint+"?token=TOKEN_HERE");
        }
    };

    apiData.getSymbolList = function(){
    	var url = "https://cloud.iexapis.com/stable/ref-data/symbols?token=TOKEN_HERE";
    	return $http.get(url);
    };

    return apiData;

}]);