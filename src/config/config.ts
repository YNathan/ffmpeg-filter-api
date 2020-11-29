const appName = "Freeze-Frame-Validator-Api";
const serverPort: number = Number(process.env.SERVER_PORT) || 3000;
const fakeDbPath = 'db/data';
const sslKeyPath: string = process.env.SSL_KEY_PATH || "db/certs/key.pem";
const sslCrtPath: string = process.env.SSL_CRT_PATH || "db/certs/cert.pem";
const sslPassPhrase: string = process.env.SSL_PASS_PHRASE || "disdisdis";
const machineName: string = process.env.MACHINE_NAME || `Freeze-Frame-Validator_Machine_ID#${new Date().getTime()}`;

// prettier-ignore

const ssl = !!process.env.SSL;
const allowCors = !!process.env.CORS;
/* eslint no-use-before-define: 2 */
export type Config = {
    serverPort: number;
    appName: string;
    ssl: boolean;
    sslKeyPath?: string;
    sslCrtPath?: string;
    fakeDbPath?: string;
    sslPassPhrase?: string;
};

const config = {
    machineName,
    serverPort,
    appName,
    ssl,
    sslKeyPath,
    sslCrtPath,
    allowCors,
    fakeDbPath,
    sslPassPhrase
};

export {config};
