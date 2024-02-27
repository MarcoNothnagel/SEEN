"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api1_1 = require("./api1");
const port = 3000;
const customerId = 3;
const api1 = new api1_1.Main(port);
api1.start(customerId);
// const api2 = new api2Main(port);
// api2.start(customerId);
