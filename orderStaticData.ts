import {dowjones_objects, IDowJonesObject, books, traders} from "../../data/staticdata";

export const colDefs = [
    {
        headerName: "OrderId", 
        field: "orderId", 
        width: 110, 
        editable: false, 
        sort: "desc",
        cellStyle: function(params) {
            if (params.value === "UNSAVED") {
                return {
                    backgroundColor: "black",
                    color: "white"
                }
            }
        }
    },
    {
        headerName: "Status", 
        field: "status", 
        width: 130, 
        editable: false, 
        cellStyle: function(params) {
            if (params.value === "PENDING") {
                return {
                    backgroundColor: "orange",
                    color: "#222"
                }
            } else if (params.value === "CANCELLED") {
                return {
                    backgroundColor: "red",
                    color: "#222"
                }
            } else if (params.value === "FULFILLED") {
                return {
                    backgroundColor: "green",
                    color: "#222"
                }
            } else if (params.value === "UNSAVED") {
                return {
                    backgroundColor: "black",
                    color: "white"
                }
            }
        }
    },
    {
        headerName: "Symbol", 
        field: "symbol", 
        width: 80, 
        editable: true,
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams:  function(params) {
            console.log(params)
            return {
              values: getStockSymbols() // getStockNames()
            };
        },
        cellStyle: function(params) {
            if (params.value === "*") {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
    {
        headerName: "B/S", 
        field: "side", 
        width: 80, 
        editable: true, 
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
          width: 30,
          values: ["BUY", "SELL"]
        },
        cellStyle: function(params) {
            if (params.value === "BUY") {
                return {
                    backgroundColor: "green"
                }
            }   
            else if (params.value === "SELL") {
                return {
                    backgroundColor: "red"
                }    
            }
            else if (params.value === "*") {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
    {
        headerName: "Price", 
        field: "price", 
        width: 100, 
        editable: true, 
        cellStyle: function(params) {
            if (params.value === 0) {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
    {
        headerName: "OrderType", 
        field: "orderType", 
        width: 120, 
        editable: true, 
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            width: 30,
            values: ["MARKET", "LIMIT","STOP","BUY-STOP"]
        },
        cellStyle: function(params) {
            if (params.value === "*") {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
    {
        headerName: "Quantity", 
        field: "quantity", 
        width: 120, 
        editable: true, 
        cellStyle: function(params) {
            if (params.value === 0) {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
    {
        headerName: "Value", 
        field: "value", 
        width: 100, 
        editable: false, 
    },
    {
        headerName: "Book", 
        field: "bookName", 
        width: 150, 
        editable: true, 
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            width: 30,
            values: books
        },
        cellStyle: function(params) {
            if (params.value === "*") {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
    {
        headerName: "Trader Name", 
        field: "traderName", 
        width: 130, 
        editable: true, 
        cellEditor: "agRichSelectCellEditor",
        cellEditorParams: {
            width: 30,
            values: traders
        },
        cellStyle: function(params) {
            if (params.value === "*") {
                return {
                    backgroundColor: "grey"
                }
            }
        }
    },
]

function getStockNames(){
    var namesArr: any = [];
    dowjones_objects.forEach((stockItem: IDowJonesObject)=>{
        namesArr.push(stockItem.name)
    })
    console.log(namesArr);
    return namesArr;
}

function getStockSymbols(){
    var symbolsArr: any = [];
    dowjones_objects.forEach((stockItem: IDowJonesObject)=>{
        symbolsArr.push(stockItem.upperSymbol)
    })
    console.log(symbolsArr);
    return symbolsArr;
}

