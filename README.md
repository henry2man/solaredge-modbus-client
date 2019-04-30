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

const RELEVANT_DATA = [
        'C_Manufacturer',
        'C_Model',
        'C_Version',
        'C_SerialNumber',
        'I_AC_Current',
        'I_AC_VoltageAB',
        'I_AC_Power',
        'I_AC_Energy_WH',
        'I_DC_Current',
        'I_DC_Voltage',
        'I_DC_Power',
        'I_Temp_Sink', 
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