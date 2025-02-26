import { exec as execSync } from "child_process";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { writeFileSync } from "fs";
import path from "path";

const fastify = Fastify({
	logger: true,
});

fastify.register(cors, (instance) => {
	return (req, callback) => {
		// callback expects two parameters: error and options
		callback(null, { origin: true });
	};
});

fastify.get("/", async (request, reply) => {
	execSync(
		// im using -i 1 as default, Tomer should handle the correct session search
		// running this through a visual basic script to avoid the powershell window
		`PsExec.exe -i 1 -accepteula -d -s mshta vbscript:Execute("CreateObject(""WScript.Shell"").Run ""powershell -ExecutionPolicy Bypass & '${path.join(__dirname, "select-folder.ps1")}'"", 0:close")`,
		(err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return err;
			}

			if (stderr) return stderr;
			return stdout;
		},
	);
	return "Hello World!1";
});

fastify.get("/health", async (request, reply) => {
	return "ok :)";
});

interface FinishFolderSelectQuery {
	path?: string;
}

// in Debrief world we will notify the client that the folder selection is done using a web hook
fastify.get("/finish-folder-select", async (request, reply) => {
	const query = request.query as FinishFolderSelectQuery;
	console.log(query.path);
	writeFileSync(".\\selected-folder.txt", query?.path || "no path");
	return decodeURIComponent(query?.path || "no path");
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	fastify.log.info(`server listening on ${address}`);
});
