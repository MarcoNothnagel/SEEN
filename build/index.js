"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api2_1 = require("./api2");
const port = 3000;
const customerId = 3;
// const api1 = new api1Main(port);
// api1.start(customerId);
const api2 = new api2_1.Main(port);
api2.start(customerId);
