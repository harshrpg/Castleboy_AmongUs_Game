import dbConnect from '../../../utils/dbConnect'
import Round from '../../../models/Round'

export default async function handler(req, res) {
    const { method } = req

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const rounds = await Round.find({}) // Find all the players in the database
                res.status(200).json({
                    success: true,
                    data: rounds
                });
            } catch (error) {
                res.status(400).json({
                    success: false,
                })
            }
            break;
        case 'POST':
            try {
                var query = {'number' : req.body.number}
                const round = await Round.findOneAndUpdate(
                    query, req.body, {upsert: true}
                ) // create a new model
                res.status(201).json({
                    success: true,
                    data: round,
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