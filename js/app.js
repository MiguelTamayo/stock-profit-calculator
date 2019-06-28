angular.module("profitCalculator",['zingchart-angularjs'])
.controller("profitController",function($scope, $http){
	$scope.unixTimestamps = [];
	$scope.stockPrices = [];


	$scope.result = "test";
	$scope.stockSymbol = "";
	$scope.currentPrice = "";
	$scope.timestamps = [];
	$scope.beggining = "";
	$scope.end = "";

	$scope.minChartY = 0;
	$scope.maxChartY = 0;
	$scope.chartInterval = 0;
	$scope.chartValues = "";



	function getDateYYYYMMDD(){
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth() + 1;
		var day = today.getDate()-1;//TEMPORARY
		if(day < 10){
			day = '0' + day;
		}
		if(month < 10){
			month = '0' + month;
		}
		var yyyymmdd = '' + year + month + day; 
		return yyyymmdd;
	}

	function getMaxProfit(){
		var counter = 0;
		var buy = 0;
		var sell = 0;
		var bought = false;
		while(counter < $scope.stockPrices.length){
			console.log(counter);
			if(!bought){
				//ignore values that are null
				if(($scope.stockPrices[counter] != null) && ($scope.stockPrices[counter+1] != null)){
					//buy before rise
					if(($scope.stockPrices[counter] < $scope.stockPrices[counter+1])){
						buy = $scope.stockPrices[counter];
						bought = true;
					}
				}
			}
			else{
				//sell if end of day and bought and no decline
				if((counter == $scope.stockPrices.length-1) && ($scope.stockPrices[counter] != null)){
							sell = $scope.stockPrices[counter];
							bought = false;
							console.log("buy at: "+buy);
							console.log("sell at end: "+sell);
				}else{
					//ignore values that are null
					if(($scope.stockPrices[counter] != null) && ($scope.stockPrices[counter+1] != null)){
						//sell before decline
						if($scope.stockPrices[counter] > $scope.stockPrices[counter+1]){
							sell = $scope.stockPrices[counter];
							bought = false;
							console.log("buy at: "+buy);
							console.log("sell at: "+sell);
						}
					}
				}
			}
			counter++;
		}
	}

	function calculateProfit(response){
		//get timestamps
		$scope.minChartY = response.data[0].close;
		$scope.maxChartY = response.data[0].close;
		for (var i = 0; i < response.data.length; i++) {
			if((response.data[i].close < $scope.minChartY) && (response.data[i].close != null)){
				$scope.minChartY = response.data[i].close;
			}
			if((response.data[i].close > $scope.maxChartY) && (response.data[i].close != null)){
				$scope.maxChartY = response.data[i].close;
			}
			$scope.stockPrices.push(response.data[i].close);
			$scope.unixTimestamps.push(parseInt((new Date(response.data[i].date+'T'+response.data[i].minute+':00').getTime()).toFixed(0)));
			$scope.timestamps.push(response.data[i]);
		}
		//calculate
		$scope.chartInterval = Math.round($scope.maxChartY*.01);
		$scope.minChartY = Math.round($scope.minChartY*.99);
		$scope.maxChartY = Math.round($scope.maxChartY*1.01);
		$scope.chartValues = ""+$scope.minChartY+":"+$scope.maxChartY+":"+$scope.chartInterval;
	}

	$scope.search = function(){

		console.log("searching for "+$scope.symbol+"!");
		$http({method: "GET", url: "https://sandbox.iexapis.com/stable/stock/"+$scope.symbol+"/chart/date/"+getDateYYYYMMDD()+"?token=TOKEN_HERE"})
		.then(function successCallback(response){
			if(response != []){
				$scope.stockSymbol = $scope.symbol;
				$scope.currentPrice = response.data[response.data.length-1].close;
				$scope.beggining = response.data[0].minute;
				$scope.end = response.data[response.data.length-1].minute;
			}
			calculateProfit(response);
			$scope.myJson = {
			gui: {
				contextMenu: {
					button: {
						visible: 0
					}
				}
			},
			backgroundColor: "#434343",
			globals: {
					shadow: false,
					fontFamily: "Helvetica"
			},
			type: "area",

			legend: {
					layout: "x1",
					backgroundColor: "transparent",
					borderColor: "transparent",
					marker: {
							borderRadius: "50px",
							borderColor: "transparent"
					},
					item: {
							fontColor: "white"
					}

			},
			scaleX: {
					maxItems: 8,
					transform: {
							type: 'date'
					},
					zooming: true,
					values: $scope.unixTimestamps,
					lineColor: "white",
					lineWidth: "1px",
					tick: {
							lineColor: "white",
							lineWidth: "1px"
					},
					item: {
							fontColor: "white"
					},
					guide: {
							visible: false
					}
			},
			scaleY: {
				values: $scope.chartValues,
					lineColor: "white",
					lineWidth: "1px",
					tick: {
							lineColor: "white",
							lineWidth: "1px"
					},
					guide: {
							lineStyle: "solid",
							lineColor: "#626262"
					},
					item: {
							fontColor: "white"
					},
			},
			tooltip: {
					visible: false
			},
			crosshairX: {
					scaleLabel: {
							backgroundColor: "#fff",
							fontColor: "black"
					},
					plotLabel: {
							backgroundColor: "#434343",
							fontColor: "#FFF",
							_text: "Number of hits : %v"
					}
			},
			plot: {
					lineWidth: "2px",
					aspect: "spline",
					marker: {
							visible: false
					}
			},
			series: [{
					text: "Site 1",
					values: $scope.stockPrices,
					backgroundColor1: "#4AD8CC",
					backgroundColor2: "#272822",
					lineColor: "#4AD8CC"
			}]
		};
		getMaxProfit();
		}, function errorCallback(response){
			console.log("there was an error");
		});
	}

});