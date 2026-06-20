import express, { type Application } from 'express';
import { corsMiddleware } from '../middleware/global/cors.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

export const configureGlobalMiddlewares = (app: Application): void => {
	app.use(corsMiddleware);
	app.use(express.json());                    
	app.use(express.urlencoded({ extended: true })); 
	app.use(bodyParser.json());
	app.use(cookieParser());
};