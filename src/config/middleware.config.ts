import express, { Application } from 'express';
import { corsMiddleware } from '../middleware/global/cors.js';

export const configureGlobalMiddlewares = (app: Application): void => {
	app.use(corsMiddleware);
	app.use(express.json());                    
	app.use(express.urlencoded({ extended: true })); 
};