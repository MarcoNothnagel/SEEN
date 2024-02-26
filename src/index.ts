import { Main as api1Main } from './api1';
import { Main as api2Main } from './api2';

const port: number = 3000;

const api1 = new api1Main(port);
api1.start();

// const api2 = new api2Main(port);
// api2.start();
