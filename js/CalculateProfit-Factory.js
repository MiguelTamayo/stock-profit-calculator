var profitCalculatorFactory = angular.module('profitCalculatorFactory', []);
profitCalculatorFactory.factory('profitCalculator',[function (){
    var profitCalculator = {};

    profitCalculator.getCalculation = function(symbolData){

        var unixTimestamps = [];
        var stockPrices = [];
        var minY = undefined;
        var maxY = undefined;
        var interval;
        var chartValues;
        var trades = [];
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
            unixTimestamps.push(parseInt((new Date(currentElement.date+'T'+currentElement.minute+':00').getTime()).toFixed(0)));
            
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
                    trades.push("buy at: "+buy.close);
                    trades.push("sell at: "+sell.close);
                }
            }
        }

        //push final element
        stockPrices.push(noNull[0].close);
        unixTimestamps.push(parseInt((new Date(noNull[0].date+'T'+noNull[0].minute+':00').getTime()).toFixed(0)));

        //if bought but didn't sell, sell at last non null date
        if(bought){
            sell = noNull[0];
            bought = false;
            trades.push("buy at: "+buy.close);
            trades.push("sell at: "+sell.close);
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
            profit: profit
        };

        return calculation;

    };

    return profitCalculator;
}]);