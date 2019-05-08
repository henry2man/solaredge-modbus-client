/*!
 * solaredge-modbus-client
 * Copyright(c) 2018 Brad Slattman slattman@gmail.com
 * GPL-3.0 Licensed
 */

import Net from 'net'
import Modbus from 'modbus-tcp'

export class SolarEdgeModbusClient2 {


    constructor(config) {

        this.config = config || {
            host: "192.168.0.20",
            port: 502
        }

        this.registers = new Map(
            [
                // https://www.solaredge.com/sites/default/files/sunspec-implementation-technical-note.pdf, 
                // Common Model MODBUS Register Mappings, 
                ["CM_C_SunSpec_ID", [40001, 2, "uint32", "Value = \"SunS\"(0x53756e53).Uniquely identifies this as a SunSpec MODBUS Map"]],
                ["CM_C_SunSpec_DID", [40003, 1, "uint16", "Value = 0x0001.Uniquely identifies this as a SunSpec Common Model Block"]],
                ["CM_C_SunSpec_Length", [40004, 1, "uint16", "65 = Length of block in 16 - bit registers"]],
                ["CM_C_Manufacturer", [40005, 16, "String(32)", "Value Registered with SunSpec = \"SolarEdge \""]],
                ["CM_C_Model", [40021, 16, "String(32)", "SolarEdge Specific Value"]],
                ["CM_C_Version", [40045, 8, "String(16)", "SolarEdge Specific Value"]],
                ["CM_C_SerialNumber", [40053, 16, "String(32)", "SolarEdge Unique Value"]],
                ["CM_C_DeviceAddress", [40069, 1, "uint16", "MODBUS Unit ID"]],
                ["INV_C_SunSpec_DID", [40070, 1, "uint16", "101 = single phase 102 = split phase1 103 = three phase"]],
                ["INV_C_SunSpec_Length", [40071, 1, "uint16", "Registers 50 = Length of model block"]],
                ["INV_I_AC_Current", [40072, 1, "uint16", "Amps AC Total Current value"]],
                ["INV_I_AC_CurrentA", [40073, 1, "uint16", "Amps AC Phase A Current value"]],
                ["INV_I_AC_CurrentB", [40074, 1, "uint16", "Amps AC Phase B Current value"]],
                ["INV_I_AC_CurrentC", [40075, 1, "uint16", "Amps AC Phase C Current value"]],
                ["INV_I_AC_Current_SF", [40076, 1, "int16", "AC Current scale factor"]],
                ["INV_I_AC_VoltageAB", [40077, 1, "uint16", "Volts AC Voltage Phase AB value"]],
                ["INV_I_AC_VoltageBC", [40078, 1, "uint16", "Volts AC Voltage Phase BC value"]],
                ["INV_I_AC_VoltageCA", [40079, 1, "uint16", "Volts AC Voltage Phase CA value"]],
                ["INV_I_AC_VoltageAN", [40080, 1, "uint16", "Volts AC Voltage Phase A to N value"]],
                ["INV_I_AC_VoltageBN", [40081, 1, "uint16", "Volts AC Voltage Phase B to N value"]],
                ["INV_I_AC_VoltageCN", [40082, 1, "uint16", "Volts AC Voltage Phase C to N value"]],
                ["INV_I_AC_Voltage_SF", [40083, 1, "int16", "AC Voltage scale factor"]],
                ["INV_I_AC_Power", [40084, 1, "int16", "Watts AC Power value"]],
                ["INV_I_AC_Power_SF", [40085, 1, "int16", "AC Power scale factor"]],
                ["INV_I_AC_Frequency", [40086, 1, "uint16", "Hertz AC Frequency value"]],
                ["INV_I_AC_Frequency_SF", [40087, 1, "int16", "Scale factor"]],
                ["INV_I_AC_VA", [40088, 1, "int16", "VA Apparent Power"]],
                ["INV_I_AC_VA_SF", [40089, 1, "int16", "Scale factor"]],
                ["INV_I_AC_VAR", [40090, 1, "int16", "VAR Reactive Power"]],
                ["INV_I_AC_VAR_SF", [40091, 1, "int16", "Scale factor"]],
                ["INV_I_AC_PF", [40092, 1, "int16", "% Power Factor4"]],
                ["INV_I_AC_PF_SF", [40093, 1, "int16", "Scale factor"]],
                ["INV_I_AC_Energy_WH", [40094, 2, "acc32", "WattHours AC Lifetime Energy production"]],
                ["INV_I_AC_Energy_WH_SF", [40096, 1, "uint16", "Scale factor"]],
                ["INV_I_DC_Current", [40097, 1, "uint16", "Amps DC Current value"]],
                ["INV_I_DC_Current_SF", [40098, 1, "int16", "Scale factor"]],
                ["INV_I_DC_Voltage", [40099, 1, "uint16", "Volts DC Voltage value"]],
                ["INV_I_DC_Voltage_SF", [40100, 1, "int16", "Scale factor"]],
                ["INV_I_DC_Power", [40101, 1, "int16", "Watts DC Power value"]],
                ["INV_I_DC_Power_SF", [40102, 1, "int16", "Scale factor"]],
                ["INV_I_Temp_Sink", [40104, 1, "int16", "Degrees C Heat Sink Temperature"]],
                ["INV_I_Temp_SF", [40107, 1, "int16", "Scale factor"]],
                ["INV_I_Status", [40108, 1, "uint16", "Operating State"]],
                ["INV_I_Status_Vendor", [40109, 1, "uint16", "Vendor - defined operating state and error codes. The errors displayed here are similar to the ones displayed on the inverter LCD screen. For error description, meaning and troubleshooting, refer to the SolarEdge Installation Guide. 5*"]],
                ["INV_I_Event_1", [40110, 2, "uint32", "Not implemented"]],
                ["INV_I_Event_2", [40112, 2, "uint32", "Not implemented"]],
                ["INV_I_Event_1_Vendor", [40114, 2, "uint32(bitmask)", "Vendor defined events: 0x1 – Off-grid (Available from inverter CPU firmware version 3.19xx and above) 4*"]],
                ["INV_I_Event_2_Vendor", [40116, 2, "uint32", "Not implemented"]],
                ["INV_I_Event_3_Vendor", [40118, 2, "uint32", "Not implemented"]],
                ["INV_I_Event_4_Vendor", [40120, 2, "uint32", "3x2 in the inverter manual(LCD display) is translated to 0x03000002 in the I_Event_4_Vendor register (Available from inverter CPU firmware version 3.19xx and above) 4*"]],
                // Meter Models, 
                // BUGFIX --> Addresses +1--> https://forum.iobroker.net/topic/6403/solaredge-adapter-photovoltaikanlage/28, 
                // TODO Add all fields from spec --> https://www.solaredge.com/sites/default/files/sunspec-implementation-technical-note.pdf, 
                ["MET_C_SunSpec_DID", [40122, 1, "uint16", "Value = 0x0001.Uniquely identifies this as a SunSpec Common Model Block"]],
                ["MET_C_SunSpec_Length", [40123, 1, "uint16", "65 = Length of block in 16 - bit registers"]],
                ["MET_C_Manufacturer", [40124, 16, "String(32)", "Value Registered with SunSpec = \"SolarEdge \""]],
                ["MET_C_Model", [40140, 16, "String(32)", "SolarEdge Specific Value"]],
                ["MET_C_Version", [40164, 8, "String(16)", "SolarEdge Specific Value"]],
                ["MET_C_SerialNumber", [40172, 16, "String(32)", "SolarEdge Unique Value"]],
                ["MET_C_DeviceAddress", [40188, 1, "uint16", "MODBUS Unit ID"]],
                ["MET_C_SunSpec_DID", [40189, 1, "uint16", "Well-known value. Uniquely identifies this as a SunSpecMODBUS Map: Single Phase (AN or AB) Meter (201), Split Single Phase (ABN) Meter (202), Wye-Connect Three Phase (ABCN) Meter (203), Delta-Connect Three Phase (ABC) Meter(204)"]],
                ["MET_C_SunSpec_Length", [40190, 1, "uint16", "Registers 50 = Length of model block"]],
                // Real Power, 
                ["MET_M_AC_Power", [40207, 1, "int16", "Total Real Power (sum of active phases)"]],
                ["MET_M_AC_Power_SF", [40211, 1, "int16", "AC Real Power Scale Factor"]],
                // Accumulated Energy , 
                ["MET_M_Exported", [40227, 2, "uint32", "Phase A Exported Real Energy"]],
                ["MET_M_Imported", [40235, 2, "uint32", "Phase A Imported Real Energy"]],
                ["MET_M_Energy_W_SF", [40241, 1, "int16", "Real Energy Scale Factor"]]
            ]
        );

        this.offset = 40001;

        this.socket = Net.connect(this.config)
        this.modbusClient = new Modbus.Client()

        this.modbusClient.writer().pipe(this.socket)
        this.socket.pipe(this.modbusClient.reader())

    }

    getData(registersToRead) {

        let promises = []

        registersToRead
            // Get registries
            .map((toRead) => {

                var reg = this.registers.get(toRead);

                let start = 0
                let end = 0
                let data = []

                start = reg[0] - this.offset
                end = (start + reg[1]) - 1

                promises.push(new Promise((resolve, reject) => {

                    this.modbusClient.readHoldingRegisters(1, start, end, (error, buffers) => {

                        if (error) {

                            reject(error)

                        } else {

                            let value = null
                            let buffer = Buffer.concat(buffers)

                            switch (reg[2]) {
                                case "String(16)":
                                case "String(32)":
                                    value = buffer.toString()
                                    break
                                case "uint16":
                                    value = buffer.readUInt16BE().toString()
                                    break
                                case "uint32":
                                case "acc32":
                                    value = buffer.readUInt32BE().toString()
                                    break
                                case "int16":
                                    value = buffer.readInt16BE().toString()
                                    break
                                case "int32":
                                    value = buffer.readInt32BE().toString()
                                    break
                            }

                            resolve({
                                name: toRead,
                                id: reg[0],
                                size: reg[1],
                                type: reg[2],
                                description: reg[3],
                                buffers: buffers,
                                value: value
                            })

                        }

                    })

                }))

            })

        return Promise.all(promises)

    }

}
