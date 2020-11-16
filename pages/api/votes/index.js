import dbConnect from '../../../utils/dbConnect'
import Vote from '../../../models/Vote'

export default async function handler(req, res) {
    const {method} = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const votes = await Vote.find({}) // Find all the players in the database
                res.status(200).json({
                    success: true,
                    data: votes
                });
            } catch (error) {
                res.status(400).json({
                    success: false,
                })
            }
            break;
        case 'POST':
            try {
                var query = {'name' : req.body.name}
                const vote = await Vote.findOneAndUpdate(
                    query, req.body, {upsert: true}
                ) // create a new model
                res.status(201).json({
                    success: true,
                    data: vote,
                });
            } catch (error) {
                console.log(error);
                res.status(400).json({
                    success: false,
                });
            }
            break;
        default:
            res.status(400).json({
                success: false,
            });
            break;
    }
}