// Import
import { Schema, model } from 'mongoose';

const graphSchema = new Schema({
	name: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	data: {
		nodes: [],
		edges: []
	},
    difficulty: {
        type: String,
        enum: ['Très facile', 'Facile', 'Moyen', 'Difficile', 'Impossible-preuve-facile', 'Impossible-preuve-difficile'],
        required: true
    },
	optimalColoring: { type: Number, required: true },
	pastilleCounts: { type: Object, required: true },
}, { timestamps: true });

// Export
export default model('Graph', graphSchema);