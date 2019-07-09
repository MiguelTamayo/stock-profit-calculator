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
        for (var i = 0; i < symbolData.length; i++) {
            var element = symbolData[i];

            //store values for chart 
            stockPrices.push(element.close); 
            unixTimestamps.push(parseInt((new Date(element.date+'T'+element.minute+':00').getTime()).toFixed(0)));
            
            //make sure element closing price is not null
            if(element.close != null){

                //check for new minY
                if(element.close < minY){
                    minY = element.close;
                }else if(minY === undefined){
                    minY = element.close;
                }

                //check for new maxY
                if(element.close > maxY){
                    maxY = element.close;
                }else if(maxY === undefined){
                    maxY = element.close;
                }

                //algo
                if(!bought){
                    //ignore values that are null
                    if((symbolData[i].close != null) && (symbolData[i+1].close != null)){
                        //buy before rise
                        if((symbolData[i].close < symbolData[i+1].close)){
                            buy = symbolData[i];
                            bought = true;
                        }
                    }
                }
                else{
                    //sell if end of day and bought and no decline
                    if((i == symbolData.length-1) && (symbolData[i].close != null)){
                                sell = symbolData[i];
                                bought = false;
                                console.log("buy at: "+buy.close);
                                console.log("sell at end: "+sell.close);
                                trades.push("buy at: "+buy.close);
                                trades.push("sell at: "+sell.close);
                    }else{
                        //ignore values that are null
                        if((symbolData[i].close != null) && (symbolData[i+1].close != null)){
                            //sell before decline
                            if(symbolData[i].close > symbolData[i+1].close){
                                sell = symbolData[i];
                                bought = false;
                                console.log("buy at: "+buy.close);
                                console.log("sell at: "+sell.close);
                                trades.push("buy at: "+buy.close);
                                trades.push("sell at: "+sell.close);
                            }
                        }
                    }
                }

            }

        }

        interval = Math.round(maxY*.01);
        minY = Math.round(minY*.99);
        maxY = Math.round(maxY*1.01);
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