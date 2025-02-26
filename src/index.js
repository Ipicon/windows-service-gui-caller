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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const fastify = (0, fastify_1.default)({
    logger: true,
});
fastify.register(cors_1.default, (instance) => {
    return (req, callback) => {
        // callback expects two parameters: error and options
        callback(null, { origin: true });
    };
});
fastify.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    (0, child_process_1.exec)(
    // im using -i 1 as default, Tomer should handle the correct session search
    // running the powershell in minified cmd, thats what TS does when using shell: TS
    `PsExec.exe -i 1 -accepteula -d -s mshta vbscript:Execute("CreateObject(""WScript.Shell"").Run ""powershell -ExecutionPolicy Bypass & '${path_1.default.join(__dirname, "select-folder.ps1")}'"", 0:close")`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return err;
        }
        if (stderr)
            return stderr;
        return stdout;
    });
    return "Hello World!1";
}));
fastify.get("/health", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return "ok :)";
}));
// in Debrief world we will notify the client that the folder selection is done using a web hook
fastify.get("/finish-folder-select", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const query = request.query;
    console.log(query.path);
    (0, fs_1.writeFileSync)(".\\selected-folder.txt", (query === null || query === void 0 ? void 0 : query.path) || "no path");
    return decodeURIComponent((query === null || query === void 0 ? void 0 : query.path) || "no path");
}));
fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
});
