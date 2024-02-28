"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api1_1 = require("./api1");
const api2_1 = require("./api2");
// fair practice to leave outside of Main class as it is true constants
const port = 3000;
const customerId = 5;
class Main {
    constructor() {
        const api1 = new api1_1.Main(port);
        api1.start(customerId);
        const api2 = new api2_1.Main(port);
        // api2.start(customerId);
    }
}
// create instance to run
const mainInstance = new Main();
