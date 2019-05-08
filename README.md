# solaredge-modbus-client
A simple modbus client reader for solaredge inverters & meters

Thanks to Brad Slattman for the original work in https://github.com/slattman/solaredge-modbus-client  

Forked in order to debug & optimize register reads

## Example usage

```javascript
let SolarEdgeModbusClient2 = require('solaredge-modbus-client2')

let solar = new SolarEdgeModbusClient2({
    host: "192.168.0.20",
    port: 502
})

// INV means "Inverter"
// MET means "Meter", like 
const RELEVANT_DATA = [
        'INV_I_AC_Power',
        'INV_I_AC_Power_SF',
        'INV_I_AC_Energy_WH',
        'INV_I_AC_Energy_WH_SF',
        'INV_I_Temp_Sink',
        'INV_I_Temp_SF',
        'INV_I_Status',
        'INV_I_Status_Vendor',
        'MET_M_AC_Power',
        'MET_M_AC_Power_SF',
        'MET_M_Exported',
        'MET_M_Imported',
        'MET_M_Energy_W_SF'
    ]


solar.getData(RELEVANT_DATA).then((data) => {
   
    let results = []

    data.map(result => {
            console.log(result.name + " - " + result.description + ": " + result.value)
    })

    solar.socket.destroy();

})
```

:metal: