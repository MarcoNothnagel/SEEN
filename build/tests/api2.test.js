"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api2_1 = require("../api2");
// import { sendOutput } from '../functions/sendOutput';
// import { fetchData } from '../functions/fetchData';
const main = new api2_1.Main(3000);
describe('Main', () => {
    // tests for start()
    // TODO. struggling with getting the mock functions to work
    // tests for getP2PTransactions()
    test('handle empty transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [];
        const expectedP2PArray = [];
        const actualP2PArray = yield main.getP2PTransactions(filteredTransactions);
        expect(actualP2PArray).toEqual(expectedP2PArray);
    }));
    test('return an empty array for no P2P transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 1,
                transactionType: 'ACH_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 40,
                metadata: {}
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '2022-10-01T11:46:42+00:00',
                customerId: 2,
                transactionType: 'WIRE_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 100,
                metadata: {}
            }
        ];
        const expectedP2PArray = [];
        const actualP2PArray = yield main.getP2PTransactions(filteredTransactions);
        expect(actualP2PArray).toEqual(expectedP2PArray);
    }));
    test('extract P2P transactions from filtered transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 1,
                transactionType: 'ACH_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 40,
                metadata: {}
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '2022-10-01T11:46:42+00:00',
                customerId: 2,
                transactionType: 'P2P_SEND',
                transactionStatus: '',
                description: '',
                amount: 100,
                metadata: {}
            },
            {
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '2022-11-01T11:46:42+00:00',
                customerId: 3,
                transactionType: 'P2P_RECEIVE',
                transactionStatus: '',
                description: '',
                amount: -50,
                metadata: {}
            }
        ];
        const expectedP2PArray = [
            { transactionType: 'P2P_SEND', transactionDate: '2022-10-01T11:46:42+00:00', transactionAmount: 100 },
            { transactionType: 'P2P_RECEIVE', transactionDate: '2022-11-01T11:46:42+00:00', transactionAmount: -50 },
        ];
        const actualP2PArray = yield main.getP2PTransactions(filteredTransactions);
        expect(actualP2PArray).toEqual(expectedP2PArray);
    }));
    // tests for findP2PLink()
    test('handle no matching P2P links', () => __awaiter(void 0, void 0, void 0, function* () {
        const allTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 1,
                transactionType: 'P2P_SEND',
                transactionStatus: '',
                description: '',
                amount: 50,
                metadata: {}
            }
        ];
        const p2PArray = [
            { transactionType: 'P2P_RECEIVE', transactionDate: '2023-11-20', transactionAmount: 100 },
        ];
        const expectedP2PLinkCustomers = [];
        const actualP2PLinkCustomers = yield main.findP2PLink(allTransactions, p2PArray);
        expect(actualP2PLinkCustomers).toEqual(expectedP2PLinkCustomers);
    }));
    test('handle empty transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const allTransactions = [];
        const p2PArray = [];
        const expectedP2PLinkCustomers = [];
        const actualP2PLinkCustomers = yield main.findP2PLink(allTransactions, p2PArray);
        expect(actualP2PLinkCustomers).toEqual(expectedP2PLinkCustomers);
    }));
    test('find P2P links in transactions matching P2P data', () => __awaiter(void 0, void 0, void 0, function* () {
        const allTransactions = [
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 2,
                transactionType: 'P2P_SEND',
                transactionStatus: '',
                description: '',
                amount: 100,
                metadata: {}
            },
            {
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '2022-09-01T11:46:42+00:00',
                customerId: 3,
                transactionType: 'P2P_RECEIVE',
                transactionStatus: '',
                description: '',
                amount: -100,
                metadata: {}
            },
            {
                transactionId: 4,
                authorizationCode: '',
                transactionDate: '2023-09-01T11:46:42+00:00',
                customerId: 4,
                transactionType: 'ACH_INCOMING',
                transactionStatus: '',
                description: '',
                amount: 50,
                metadata: {}
            }
        ];
        const p2PArray = [
            {
                transactionType: 'P2P_RECEIVE',
                transactionDate: '2022-09-01T11:46:42+00:00',
                transactionAmount: 100,
            },
        ];
        const expectedP2PLinkCustomers = [
            { relatedCustomerId: 2, relationType: 'P2P_SEND' }
        ];
        const actualP2PLinkCustomers = yield main.findP2PLink(allTransactions, p2PArray);
        expect(actualP2PLinkCustomers).toEqual(expectedP2PLinkCustomers);
    }));
    // tests for getDevices()
    test('handle empty transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [];
        const expectedDevices = [];
        const actualDevices = yield main.getDevices(filteredTransactions);
        expect(actualDevices).toEqual(expectedDevices);
    }));
    test('return an empty array for no transaction metadata', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: {}
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: {}
            }
        ];
        const expectedDevices = [];
        const actualDevices = yield main.getDevices(filteredTransactions);
        expect(actualDevices).toEqual(expectedDevices);
    }));
    test('extract unique device IDs from transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device2' }
            },
            {
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '',
                customerId: 3,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            {
                transactionId: 4,
                authorizationCode: '',
                transactionDate: '',
                customerId: 4,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device3' }
            }
        ];
        const expectedDevices = ['device1', 'device2', 'device3'];
        const actualDevices = yield main.getDevices(filteredTransactions);
        expect(actualDevices).toEqual(expectedDevices);
    }));
    // tests for findDeviceLink()
    test('find related customer IDs from transactions with matching devices', () => __awaiter(void 0, void 0, void 0, function* () {
        const allTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device2' }
            },
            {
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '',
                customerId: 3,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            }
        ];
        const deviceArray = ['device1'];
        const excludeId = 1;
        const expectedRelatedIDs = [3];
        const actualRelatedIDs = yield main.findDeviceLink(allTransactions, deviceArray, excludeId);
        expect(actualRelatedIDs).toEqual(expectedRelatedIDs);
    }));
    test('should return an empty array for no matching devices', () => __awaiter(void 0, void 0, void 0, function* () {
        const allTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 1,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device1' }
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 2,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device2' }
            },
            {
                transactionId: 3,
                authorizationCode: '',
                transactionDate: '',
                customerId: 3,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { deviceId: 'device3' }
            }
        ];
        const deviceArray = ['device4'];
        const excludeId = 1;
        const expectedRelatedIDs = [];
        const actualRelatedIDs = yield main.findDeviceLink(allTransactions, deviceArray, excludeId);
        expect(actualRelatedIDs).toEqual(expectedRelatedIDs);
    }));
    test('should handle empty transactions data', () => __awaiter(void 0, void 0, void 0, function* () {
        const allTransactions = [];
        const deviceArray = ['device1'];
        const excludeId = 1;
        const relatedIDs = yield main.findDeviceLink(allTransactions, deviceArray, excludeId);
        expect(relatedIDs).toEqual([]);
    }));
    // tests for buildRelatedCustomers()
    test('build related customers with device and transaction links', () => __awaiter(void 0, void 0, void 0, function* () {
        const deviceLinkCustomers = [1, 2, 3];
        const transactionLinkCustomers = [
            { relatedCustomerId: 4, relationType: 'TRANSACTION' },
            { relatedCustomerId: 5, relationType: 'TRANSACTION' },
        ];
        const expectedRelatedCustomers = {
            relatedTransactions: [
                { relatedCustomerId: 4, relationType: 'TRANSACTION' },
                { relatedCustomerId: 5, relationType: 'TRANSACTION' },
                { relatedCustomerId: 1, relationType: 'DEVICE' },
                { relatedCustomerId: 2, relationType: 'DEVICE' },
                { relatedCustomerId: 3, relationType: 'DEVICE' },
            ],
        };
        const actualRelatedCustomers = yield main.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);
        expect(actualRelatedCustomers).toEqual(expectedRelatedCustomers);
    }));
    test('return an empty object for empty input', () => __awaiter(void 0, void 0, void 0, function* () {
        const deviceLinkCustomers = [];
        const transactionLinkCustomers = [];
        const expectedRelatedCustomers = {
            relatedTransactions: []
        };
        const actualRelatedCustomers = yield main.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);
        expect(actualRelatedCustomers).toEqual(expectedRelatedCustomers);
    }));
});
