import mongoose from "mongoose";

const RoundSchema = new mongoose.Schema({
    number: {
        /**
         * Name of the player who voted
         */

        type: Number,
        required: [true, 'Please provide a name for this player.'],
    },

    imposter_name: {
        /**
         * Name of the player who got voted
         */

         type: String,
    },

    winner: {
        type: String,
    }


});

export default mongoose.models.Round || mongoose.model('Round', RoundSchema)