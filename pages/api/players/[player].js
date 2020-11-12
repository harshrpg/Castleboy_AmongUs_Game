import next from 'next'
import nextConnect from 'next-connect'
import middleware from '../../utils/database'

const handler = nextConnect();
handler.use(middleware);

handler.post(async, (req, res) => {
    let data = req.body;
    data = JSON.parse(data);
    let doc = await req.db.collection('users').updateOne({$set:data}, {upsert: true})
    res.json({message: 'ok'})
});

export default handler;