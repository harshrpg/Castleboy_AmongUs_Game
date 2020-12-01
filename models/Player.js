import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
    name: {
        /**
         * Name of the Player
         */

         type: String,
         required: [true, 'Please provide a name for this player.'],
         maxlength: [20, 'Name cannot be more than 20 characters'],
         unique: true,
         dropDups: true,
    },
    avatar_name: {
        /**
         * Name of the avatar for the player
         */

         type: String,
         required: [true, 'Please provide an avatar name for this player.'],
         maxlength: [20, 'Name cannot be more than 20 characters'],
    },
    color: {
        /**
         * Color of the player
         */

         type: String,
         required: [true, 'Please provide the color of the avatar'],
    },
    tasks: {
        /**
         * Number of tasks done by the player
         */

         type: Number,
    },
    imposter: {
        /**
         * Is the player an imposter
         */

         type: Boolean,
    },
    kicked: {
        /**
         * Has the player been kicked ?
         */
        type: Boolean,
    },
    voted: {
        /**
         * Has the player voted ?
         */
        type: Boolean,
    },
    killed: {
        type: Boolean,
    }
});

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema)