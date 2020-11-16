import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
    name: {
        /**
         * Name of the player who voted
         */

        type: String,
        required: [true, 'Please provide a name for this player.'],
        maxlength: [20, 'Name cannot be more than 20 characters'],
        unique: true,
        dropDups: true,
    },

    voted: {
        /**
         * Name of the player who got voted
         */

         type: String,
    }
});

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema)