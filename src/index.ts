import { Main as api1Main } from './api1';
import { Main as api2Main } from './api2';

// fair practice to leave outside of Main class as it is true constants
const port: number = 3000;
const customerId: number = 5;

class Main {

    constructor() {
        const api1 = new api1Main(port);
        api1.start(customerId);

        const api2 = new api2Main(port);
        // api2.start(customerId);

    }
}

// create instance to run
const mainInstance = new Main();
