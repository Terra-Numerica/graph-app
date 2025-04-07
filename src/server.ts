// Imports
import { keepAliveRenderdotCom } from "@/utils/functions";
import { connectDatabase } from "@/base/Database";
import { checkConfig } from "@/utils/config";
import { resolve } from "path";

import Logger from "@/base/Logger";
import express from "express";
import cors from "cors";
import "dotenv/config";

// Type
import type { Request, Response } from "express";

// Routes
import graphRoute from "@/routes/graph.route";
import adminRoute from "@/routes/admin.route";
import meliMeloRoute from "@/routes/meli-melo.route";

try {

	// Check Config
	Logger.info("Checking configuration...");
	await checkConfig();
	Logger.success("Configuration is valid");

	// Initialize Express
	const app = express();

	// Middleware
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(resolve('./src/public'), { extensions: ['html', 'css'] }));
	app.use(express.json());
	app.use(cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"]
	}));

	// Initialize Database Connection
	Logger.info("Connecting to the database...");
	await connectDatabase();
	Logger.success("Connected to the database");

	// Use Routes
	app.use("/api/graph", graphRoute);
	app.use("/api/meli-melo", meliMeloRoute);
	app.use("/admin", adminRoute);

	app.get('/', (req: Request, res: Response) => res.sendFile(resolve('./src/public/index.html')));

	// Get port from environment or default to 3000
	const port = process.env.PORT || 3000;

	// Start the server
	Logger.info(`Starting server on port ${port}...`);
	app.listen(port, () => {
		Logger.success(`Server is running on port ${port}`);
	});

	if(process.env.NODE_ENV === "production") {
		setInterval(async () => {
			await keepAliveRenderdotCom();
		}, 30000);
	};

} catch (error: any) {
	console.log(error.stack);
	process.exit(1);
};