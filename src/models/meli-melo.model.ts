// Import
import { Schema, model } from 'mongoose';

const meliMeloSchema = new Schema({
	name: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	data: {
		nodes: [],
		edges: []
	}
}, { timestamps: true });

// Export
export default model('MeliMelo', meliMeloSchema);