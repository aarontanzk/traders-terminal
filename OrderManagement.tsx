import * as React from 'react';
import { render } from "react-dom";
import { AgGridReact } from "ag-grid-react";
import firebase from '../../firebase';
import "ag-grid-community/dist/styles/ag-grid.css";
import "../Portfolio/ag-grid.css";
import { colDefs } from './orderStaticData';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import ClearAllIcon from '@material-ui/icons/DeleteSweep';
import { withSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { styleNotification, styleTradeNotification } from "../Notification/NotificationStyles";

const notificationStyle = {
  success: {
    background: "#000",
    color: "#fff"
  },
  error: {
    background: "red",
    color: "white"
  }
}

class OrderManagement extends React.Component<any, any> {
  private gridApi: any;
  private gridColumnApi: any;
  private ref: any;
  private unsubscribe: any;

  constructor(props: any) {
    super(props);
    this.ref = firebase.firestore().collection('orders');
    this.unsubscribe = null;
    window.addEventListener("resize", this.onResize);

    this.state = {
      orders: [],

      isOpen: false,
      selectedRowKey: null,

      key: "",
      orderId: "",
      status: "",
      symbol: "",
      description: "",
      side: "",
      price: "",
      orderType: "",
      quantity: "",
      value: "",
      bookId: "",
      bookName: "",
      traderId: "",
      traderName: "",

      last_order_number: null,

      defaultColDef: {
        enableRowGroup: true,
        width: 100,
        sortable: true,
        resizable: true,
        filter: true,
        editable: false
      },
      gridOptions: {
        columnDefs: colDefs,
        rowData: [],
        rowSelection: "multiple",
      },
    }
  };
  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  onCollectionUpdate = (querySnapshot: any) => {
    const orders: any = [];
    querySnapshot.forEach((doc: any) => {
      const {
        orderId, status, symbol, side, price, orderType, quantity, value, bookName, traderName,
      } = doc.data();
      orders.push({
        key: doc.id, orderId, status, symbol, side, price, orderType, quantity, value, bookName, traderName,
      });
    });

    // get last order when update
    var idArr: string[] = this.getIdArrayFromOrdersArray(orders);
    var max = this.getLastOrderid(idArr);

    this.setState({
      orders,
      last_order_number: max
    });

  }

  onResize = () => {
    this.gridApi.sizeColumnsToFit();
  }

  onGridReady = (params: any) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // params.api.sizeColumnsToFit();
  };

  getLastOrderid = (idArr: string[]) => {
    var strNumbersArr = idArr.map(v => v.slice(1, 10));
    var intArr = strNumbersArr.map(v => parseInt(v, 10));
    var max = Math.max(...intArr);
    return max;
  }

  getIdArrayFromOrdersArray = (objectsArr: any[]) => {
    return objectsArr.map(a => a.orderId);
  }

  getTopBar = () => {
    if (this.props.keyLiveData !== null) {
      showValue = this.state.portfolioValue;
    }
    return (
      <div style={{ width: "100%", display: "flex" }}>
        <Typography style={{ width: "80%", padding: "12px", backgroundColor: "#202020", color: "#DC9202" }}>
          Order Management
        </Typography>
        <Tooltip title="Add Order" placement="right-end">
          <IconButton onClick={this.onAddRow}>
            <AddIcon color="primary" fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Save All" placement="right-end">
          <IconButton onClick={this.onSave} >
            <SaveIcon color="primary" fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="right-end">
          <IconButton onClick={this.onCancel}>
            <ClearIcon color="primary" fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="FULFIL ORDER" placement="right-end">
          <Button color="primary" onClick={this.fulfilOrder}>
            FULFIL
          </Button>
        </Tooltip>
      </div>
    )
  }

  fulfilOrder = () => {
    var selectedRow = this.gridApi.getSelectedRows()[0];

    if (!this.gridApi.getSelectedRows()) {
      this.errorNotificationMessage("Error: Please select a row on OMS")
      return;
    }
  
    if (selectedRow === null || selectedRow === undefined) {
      this.errorNotificationMessage("Error: Please select a row on OMS")
      return;
    }

    if (selectedRow.key) {
      this.notificationMessage("MANUAL FULFIL : " + selectedRow.orderId)
      const updateRef = firebase.firestore().collection('orders').doc(selectedRow.key);
      updateRef.set({
        orderId: selectedRow.orderId,
        status: "FULFILLED",
        symbol: selectedRow.symbol,
        side: selectedRow.side,
        price: selectedRow.price,
        orderType: selectedRow.orderType,
        quantity: selectedRow.quantity,
        value: this.calculateValue(selectedRow.price, selectedRow.quantity),
        bookName: selectedRow.bookName,
        traderName: selectedRow.traderName,
      })
        .then((docRef) => {
          this.setState({
            key: '',
            orderId: '',
            status: '',
            symbol: '',
            side: '',
            price: '',
            orderType: '',
            quantity: '',
            value: '',
            bookName: '',
            traderName: '',
          });
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    } 
  }
  delete(id: string) {
    firebase.firestore().collection('orders').doc(id).delete().then(() => {
      console.log(`Document ${id} successfully deleted!`);
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  }
  getLivePrice = (symbol: string) => {
    var z = this.props.keyLiveData.find(x => x.symbol === symbol);
    return z;
  }
  onAddRow = () => {
    var newItem = this.createNewRowData();
    var res = this.gridApi.updateRowData({ add: [newItem] });
  }

  onHardDelete = () => {
    var selectedData = this.gridApi.getSelectedRows();
    // console.log(selectedData)
    selectedData.forEach((item: any) => {
      this.delete(item.key);
    })
    var res = this.gridApi.updateRowData({ remove: selectedData });
    // this.printResult(res);
  }

  getNextOrderId = () => {
    var nextOrderId = "N";
    for (var i = (this.state.last_order_number + 1).toString().length; i < 5; i++) {
      nextOrderId += '0'
    }
    nextOrderId += (this.state.last_order_number + 1).toString()
    return nextOrderId;
  }

  createNewRowData() {
    var newData = {
      // key: "????",
      orderId: "UNSAVED",
      status: "UNSAVED",
      symbol: "*",
      side: "*",
      price: 0,
      orderType: "*",
      quantity: 0,
      value: "-----",
      bookName: "*",
      traderName: "*",
    }

    return newData;
  }

  calculateValue = (price: number, quantity: number) => {
    return price * quantity;
  }
  errorNotificationMessage = (message: string) => {
    this.props.enqueueSnackbar(styleNotification(message, notificationStyle.error.background, notificationStyle.error.color),
      {
        variant: 'default',
        autoHideDuration: 2000,
        disableWindowBlurListener: true,
        preventDuplicate: true,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        }
      });
  }

  notificationMessage = (message: string) => {
    this.props.enqueueSnackbar(styleNotification(message, notificationStyle.success.background, notificationStyle.success.color),
      {
        variant: 'default',
        autoHideDuration: 2000,
        disableWindowBlurListener: true,
        preventDuplicate: true,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        }
      });
  }

  tradeNotificationMessage = (message1: string, message2: string) => {
    this.props.enqueueSnackbar(styleTradeNotification(message1, message2, notificationStyle.success.background, notificationStyle.success.color),
      {
        variant: 'default',
        autoHideDuration: 2000,
        disableWindowBlurListener: true,
        preventDuplicate: true,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        }
      });
  }

  onSave = () => {
    this.gridApi.stopEditing();
    if (!this.gridApi.getSelectedRows()) {
      this.errorNotificationMessage("Error: Please select a row on OMS")
      return;
    }

    var selectedRow = this.gridApi.getSelectedRows()[0];
    
    if (selectedRow === null || selectedRow === undefined) {
      this.errorNotificationMessage("Error: Please select a row on OMS")
      return;
    }
    if (selectedRow.symbol === "*" ||
      selectedRow.side === "*" ||
      selectedRow.orderType === "*" ||
      selectedRow.bookName === "*" ||
      selectedRow.traderName === "*"
    ) {
      this.errorNotificationMessage("Error: Unable to save. Ensure all fields are filled")
      return;
    }

    if (isNaN(selectedRow.price) === true) {
      this.errorNotificationMessage("Error: Unable to save. Incorrect inputs in PRICE field")
      return;
    }

    if (isNaN(selectedRow.quantity) === true) {
      this.errorNotificationMessage("Error: Unable to save. Incorrect inputs in QUANTITY field")
      return;
    }

    if (selectedRow.key) {
      console.log('saving ... existing key')
      this.tradeNotificationMessage("UPDATE : " + selectedRow.traderName, selectedRow.symbol + "@" + selectedRow.side + " $" + selectedRow.price + "*" + selectedRow.quantity)
      const updateRef = firebase.firestore().collection('orders').doc(selectedRow.key);
      updateRef.set({
        orderId: selectedRow.orderId,
        status: selectedRow.status,
        symbol: selectedRow.symbol,
        side: selectedRow.side,
        price: selectedRow.price,
        orderType: selectedRow.orderType,
        quantity: selectedRow.quantity,
        value: this.calculateValue(selectedRow.price, selectedRow.quantity),
        bookName: selectedRow.bookName,
        traderName: selectedRow.traderName,
      })
        .then((docRef) => {
          this.setState({
            key: '',
            orderId: '',
            status: '',
            symbol: '',
            side: '',
            price: '',
            orderType: '',
            quantity: '',
            value: '',
            bookName: '',
            traderName: '',
          });
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    } else {
      this.tradeNotificationMessage("NEW ORDER : " + selectedRow.traderName, selectedRow.symbol + "@" + selectedRow.side + " $" + selectedRow.price + "*" + selectedRow.quantity)
      this.ref.add({
        orderId: this.getNextOrderId(),// selectedRow.orderId,
        status: "PENDING",
        symbol: selectedRow.symbol,
        side: selectedRow.side,
        price: selectedRow.price,
        orderType: selectedRow.orderType,
        quantity: selectedRow.quantity,
        value: this.calculateValue(selectedRow.price, selectedRow.quantity),
        bookName: selectedRow.bookName,
        traderName: selectedRow.traderName,
      }).then((docRef: any) => {
        this.setState({
          key: "",
          orderId: "",
          status: "",
          symbol: "",
          side: "",
          price: "",
          orderType: "",
          quantity: "",
          value: "",
          bookName: "",
          traderName: "",

        });
      })
        .catch((error: any) => {
          console.error("Error adding document: ", error);
        });
    }
  }


  onCancel = () => {
    if (!this.gridApi.getSelectedRows()) {
      console.log('on cancel -- no rows selected')
      return;
    }
    console.log(this.gridApi.getSelectedRows());
    var selectedRow = this.gridApi.getSelectedRows()[0];
    console.log(selectedRow)
    if (selectedRow.key) {
      console.log('saving ... existing key')

      const updateRef = firebase.firestore().collection('orders').doc(selectedRow.key);
      updateRef.set({
        orderId: selectedRow.orderId,
        status: "CANCELLED",
        symbol: selectedRow.symbol,
        side: selectedRow.side,
        price: selectedRow.price,
        orderType: selectedRow.orderType,
        quantity: selectedRow.quantity,
        value: this.calculateValue(selectedRow.price, selectedRow.quantity),
        bookName: selectedRow.bookName,
        traderName: selectedRow.traderName,
      })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.getTopBar()}
        <div style={{ width: "100%", height: "calc(100vh - 100px)" }}>
          <div
            id="myGrid"
            style={{
              height: "100%",
              width: "100%"
            }}
            className="ag-theme-dark"
          >
            <AgGridReact
              gridOptions={this.state.gridOptions}
              rowData={this.state.orders}
              defaultColDef={this.state.defaultColDef}
              onGridReady={this.onGridReady}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }

}

export default withSnackbar(OrderManagement);
