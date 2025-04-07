import MeliMeloModel from '@/models/meli-melo.model';
import type { Request, Response } from 'express';

export const getMeliMelos = async (req: Request, res: Response) => {
	try {
		const meliMelos = await MeliMeloModel.find();
		res.status(201).json(meliMelos);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const getMeliMelo = async (req: Request, res: Response) => {
	try {
		const meliMelo = await MeliMeloModel.findById(req.params.id);
		res.status(201).json(meliMelo);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const createMeliMelo = async (req: Request, res: Response) => {
	try {
		const meliMelo = await MeliMeloModel.create(req.body);
		res.status(201).json(meliMelo);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const updateMeliMelo = async (req: Request, res: Response) => {
	try {
		const meliMelo = await MeliMeloModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.status(201).json(meliMelo);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};

export const deleteMeliMelo = async (req: Request, res: Response) => {
	try {
		const meliMelo = await MeliMeloModel.findByIdAndDelete(req.params.id);
		res.status(201).json(meliMelo);
	} catch (error: any) {
		res.status(500).json({ error: error.stack });
	}
};