var profitCalculatorFactory = angular.module('profitCalculatorFactory', []);
profitCalculatorFactory.factory('profitCalculator',[function (){
    var profitCalculator = {};

    profitCalculator.getCalculation = function(symbolData, dateRange){

        var unixTimestamps = [];
        var stockPrices = [];
        var minY = undefined;
        var maxY = undefined;
        var interval;
        var chartValues;
        var trades = [];
        var trade = {};
        var profit = 0;

        var buy = 0;
        var sell = 0;
        var bought = false;

        //remove null values from dataset
        var noNull = [];
        for (var i = symbolData.length - 1; i >= 0; i--) {
            //only push non null close values
            if(symbolData[i].close != null){
                noNull.push(symbolData[i]);
            }
        }
        console.log("no null",noNull);


        for (var i = noNull.length - 1; i >= 1; i--) {
            var currentElement = noNull[i];
            var currentElementCloseValue = noNull[i].close;
            var nextElementCloseValue = noNull[i-1].close;

            //store values for chart 
            stockPrices.push(currentElementCloseValue); 
            
            if(dateRange == "Today"){
                unixTimestamps.push(parseInt((new Date(currentElement.date+'T'+currentElement.minute+':00').getTime()).toFixed(0)));
            }else if(dateRange == "5D"){
                unixTimestamps.push(parseInt((new Date(currentElement.date+'T03:59:00').getTime()).toFixed(0)));
            }else if(dateRange == "1M"){
                unixTimestamps.push(parseInt((new Date(currentElement.date+'T03:59:00').getTime()).toFixed(0)));
            }else if(dateRange == "Date"){
                unixTimestamps.push(parseInt((new Date(currentElement.date+'T'+currentElement.minute+':00').getTime()).toFixed(0)));
            }

            //check for new minY
            if(currentElementCloseValue < minY){
                minY = currentElementCloseValue;
            }else if(minY === undefined){
                minY = currentElementCloseValue;
            }

            //check for new maxY
            if(currentElementCloseValue > maxY){
                maxY = currentElementCloseValue;
            }else if(maxY === undefined){
                maxY = currentElementCloseValue;
            }

            if(!bought){
                //buy before rise
                if(currentElementCloseValue < nextElementCloseValue){
                    buy = currentElement;
                    bought = true;
                }
            }
            else{
                //sell before decline
                if(currentElementCloseValue > nextElementCloseValue){
                    sell = currentElement;
                    bought = false;
                    trade = {
                        buy: buy.close,
                        buyTime: buy.date+" "+buy.minute,
                        sell: sell.close,
                        sellTime: sell.date+" "+sell.minute,
                        tradeMessage: ""
                    }
                    trades.push(trade);
                }
            }
        }

        //push final element
        stockPrices.push(noNull[0].close);
        if(dateRange == "Today"){
            unixTimestamps.push(parseInt((new Date(currentElement.date+'T'+currentElement.minute+':00').getTime()).toFixed(0)));
        }else if(dateRange == "5D"){
            unixTimestamps.push(parseInt((new Date(currentElement.date+'T03:59:00').getTime()).toFixed(0)));
        }else if(dateRange == "1M"){
            unixTimestamps.push(parseInt((new Date(currentElement.date+'T03:59:00').getTime()).toFixed(0)));
        }else if(dateRange == "Date"){
            unixTimestamps.push(parseInt((new Date(currentElement.date+'T'+currentElement.minute+':00').getTime()).toFixed(0)));
        }
        //if bought but didn't sell, sell at last non null date
        if(bought){
            sell = noNull[0];
            bought = false;
            trade = {
                buy: buy.close,
                buyTime: buy.date+" "+buy.minute,
                sell: sell.close,
                sellTime: sell.date+" "+sell.minute,
                tradeMessage: ""
            }
            trades.push(trade);
        }

        //calculate return based on value of 100 shares at max recorded price
        var maxSharePrice = maxY;
        var sharesOwned = 100;
        var initialInvestment = maxSharePrice * sharesOwned;
        var grossReturn = initialInvestment;

        for (var i = 0; i < trades.length; i++) {
            sharesOwned = Math.floor(grossReturn/trades[i].buy);
            grossReturn = grossReturn - (sharesOwned * trades[i].buy);
            grossReturn = grossReturn + (sharesOwned * trades[i].sell);
            trades[i].tradeMessage = ""+trades[i].buyTime+" buy at $"+trades[i].buy+" "+trades[i].sellTime+" sell at $"+trades[i].sell;
            sharesOwned = 0;
        }

        interval = Math.round(maxY*.01);
        minY = Math.round(minY*.99);
        maxY = Math.ceil(maxY*1.01);
        chartValues = ""+minY+":"+maxY+":"+interval;

        var json = {
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
                values: unixTimestamps,
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
                values: chartValues,
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
                values: stockPrices,
                backgroundColor1: "#4AD8CC",
                backgroundColor2: "#272822",
                lineColor: "#4AD8CC"
            }]
        };

        var calculation = {
            chartJSON: json,
            trades: trades,
            initialInvestment: initialInvestment,
            grossReturn: grossReturn
        };

        return calculation;

    };

    return profitCalculator;
}]);