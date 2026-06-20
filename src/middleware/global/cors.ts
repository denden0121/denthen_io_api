import cors from "cors";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173" 
];

const corsOptions = {
    origin: allowedOrigins, 
    methods: "GET,POST,PUT,DELETE",
	credentials: true,
};

export const corsMiddleware = cors(corsOptions);