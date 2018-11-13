/*!
 * solaredge-modbus-client
 * Copyright(c) 2018 Brad Slattman slattman@gmail.com
 * GPL-3.0 Licensed
 */

'use strict'

var net = require('net');
var modbus = require('modbus-tcp');

var SolareEdgeModbusClient = {
    version: 0,
    debug: true,
    host: null,
    port: null,
    offset: 40001,
    registers: [
        [40001, 2, "C_SunSpec_ID", "uint32", "Value = \"SunS\"(0x53756e53).Uniquely identifies this as a SunSpec MODBUS Map"],
        [40003, 1, "C_SunSpec_DID", "uint16", "Value = 0x0001.Uniquely identifies this as a SunSpec Common Model Block"],
        [40004, 1, "C_SunSpec_Length", "uint16", "65 = Length of block in 16 - bit registers"],
        [40005, 16, "C_Manufacturer", "String(32)", "Value Registered with SunSpec = \"SolarEdge \""],
        [40021, 16, "C_Model", "String(32)", "SolarEdge Specific Value"],
        [40045, 8, "C_Version", "String(16)", "SolarEdge Specific Value"],
        [40053, 16, "C_SerialNumber", "String(32)", "SolarEdge Unique Value"],
        [40069, 1, "C_DeviceAddress", "uint16", "MODBUS Unit ID"],
        [40070, 1, "C_SunSpec_DID", "uint16", "101 = single phase 102 = split phase1 103 = three phase"],
        [40071, 1, "C_SunSpec_Length", "uint16", "Registers 50 = Length of model block"],
        [40072, 1, "I_AC_Current", "uint16", "Amps AC Total Current value"],
        [40073, 1, "I_AC_CurrentA", "uint16", "Amps AC Phase A Current value"],
        [40074, 1, "I_AC_CurrentB", "uint16", "Amps AC Phase B Current value"],
        [40075, 1, "I_AC_CurrentC", "uint16", "Amps AC Phase C Current value"],
        [40076, 1, "I_AC_Current_SF", "int16", "AC Current scale factor"],
        [40077, 1, "I_AC_VoltageAB", "uint16", "Volts AC Voltage Phase AB value"],
        [40078, 1, "I_AC_VoltageBC", "uint16", "Volts AC Voltage Phase BC value"],
        [40079, 1, "I_AC_VoltageCA", "uint16", "Volts AC Voltage Phase CA value"],
        [40080, 1, "I_AC_VoltageAN", "uint16", "Volts AC Voltage Phase A to N value"],
        [40081, 1, "I_AC_VoltageBN", "uint16", "Volts AC Voltage Phase B to N value"],
        [40082, 1, "I_AC_VoltageCN", "uint16", "Volts AC Voltage Phase C to N value"],
        [40083, 1, "I_AC_Voltage_SF", "int16", "AC Voltage scale factor"],
        [40084, 1, "I_AC_Power", "int16", "Watts AC Power value"],
        [40085, 1, "I_AC_Power_SF", "int16", "AC Power scale factor"],
        [40086, 1, "I_AC_Frequency", "uint16", "Hertz AC Frequency value"],
        [40087, 1, "I_AC_Frequency_SF", "int16", "Scale factor"],
        [40088, 1, "I_AC_VA", "int16", "VA Apparent Power"],
        [40089, 1, "I_AC_VA_SF", "int16", "Scale factor"],
        [40090, 1, "I_AC_VAR", "int16", "VAR Reactive Power"],
        [40091, 1, "I_AC_VAR_SF", "int16", "Scale factor"],
        [40092, 1, "I_AC_PF", "int16", "% Power Factor4"],
        [40093, 1, "I_AC_PF_SF", "int16", "Scale factor"],
        [40094, 2, "I_AC_Energy_WH", "acc32", "WattHours AC Lifetime Energy production"],
        [40096, 1, "I_AC_Energy_WH_SF", "uint16", "Scale factor"],
        [40097, 1, "I_DC_Current", "uint16", "Amps DC Current value"],
        [40098, 1, "I_DC_Current_SF", "int16", "Scale factor"],
        [40099, 1, "I_DC_Voltage", "uint16", "Volts DC Voltage value"],
        [40100, 1, "I_DC_Voltage_SF", "int16", "Scale factor"],
        [40101, 1, "I_DC_Power", "int16", "Watts DC Power value"],
        [40102, 1, "I_DC_Power_SF", "int16", "Scale factor"],
        [40104, 1, "I_Temp_Sink", "int16", "Degrees C Heat Sink Temperature"],
        [40107, 1, "I_Temp_SF", "int16", "Scale factor"],
        [40108, 1, "I_Status", "uint16", "Operating State"],
        [40109, 1, "I_Status_Vendor", "uint16", "Vendor - defined operating state and error codes. The errors displayed here are similar to the ones displayed on the inverter LCD screen. For error description, meaning and troubleshooting, refer to the SolarEdge Installation Guide. 5*"],
        [40110, 2, "I_Event_1", "uint32", "Not implemented"],
        [40112, 2, "I_Event_2", "uint32", "Not implemented"],
        [40114, 2, "I_Event_1_Vendor", "uint32(bitmask)", "Vendor defined events: 0x1 – Off-grid (Available from inverter CPU firmware version 3.19xx and above) 4*"],
        [40116, 2, "I_Event_2_Vendor", "uint32", "Not implemented"],
        [40118, 2, "I_Event_3_Vendor", "uint32", "Not implemented"],
        [40120, 2, "I_Event_4_Vendor", "uint32", "3x2 in the inverter manual(LCD display) is translated to 0x03000002 in the I_Event_4_Vendor register (Available from inverter CPU firmware version 3.19xx and above) 4*"]
    ],
    data: [],

    setConnectionDetails: function(ip, port) {
        var ip = ip || "192.168.0.20";
        var port = port || 502;
        this.ip = ip;
        this.port = port;
        console.log('connection details set to ' + ip + ':' + port);
    },

    connect: function() {

        console.log('connecting...');

        var socket = net.connect({
            host: this.host,
            port: this.port
        }, this.read);

    },

    read: function() {

        console.log('connected to ' + host + ' on port ' + port);
        console.log('reading modbus sunspec registers');

        var modbus = new modbus.Client();

        this.registers.forEach(reg => {
            var start = 0;
            var end = 0;

            start = reg[0] - this.offset;
            end = (start + reg[1]) - 1;

            modbus.readHoldingRegisters(1, start, end, function (error, buffers) {

                if (error) {
                    console.log('error reading register', reg, error);
                    return;
                }

                var buffer = Buffer.concat(buffers);

                if (reg[3] == "String(16)" || reg[3] == "String(32)") {
                    var value = buffer.toString();
                }

                if (reg[3] == "uint16") {
                    var value = buffer.readUInt16BE().toString();
                }

                if (reg[3] == "uint32" || reg[3] == "acc32") {
                    var value = buffer.readUInt32BE().toString();
                }

                if (reg[3] == "int16") {
                    var value = buffer.readInt16BE().toString();
                }

                if (reg[3] == "int32") {
                    var value = buffer.readInt32BE().toString();
                }

                var data = {
                    id: reg[0],
                    size: reg[1],
                    name: reg[2],
                    type: reg[3],
                    description: reg[4],
                    buffers: buffers,
                    value: value
                };

                this.data.push(data);

            });
        });
    }

};

exports.SolareEdgeModbusClient = SolareEdgeModbusClient


/*
var modbusClient = new modbus.Client();
modbusClient.writer().pipe(socket);
socket.pipe(modbusClient.reader());
*/