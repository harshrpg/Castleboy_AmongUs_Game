
let decoder = new TextDecoder();
export function getUserFromCode(code) {
    if (code != undefined) {
        let values = code.split(",");
        values = values.map((i) => Number(i))
        values = new Uint8Array(values).buffer;
        let decode = String(decoder.decode(values).trim());

        let query_vals = decode.split(',');

        return query_vals;
    }
    return undefined;
}

export function convertVotingResultsToDisplayFormat(votingResult) {
    let votedPlayers = new Map()
    if (votingResult != undefined) {
        votingResult.map((vote) => {
            let key = vote.voted;
            if (! votedPlayers.has(key)) {
                votedPlayers.set(key, [vote.name])
            } else {
                let voters = votedPlayers.get(key)
                if (!voters.includes(vote.name)) {
                    votedPlayers.get(key).push(vote.name)
                }
            }
        })
    }
    return votedPlayers
}

export function findIfVotedIsImposter(votedPlayers, imposter, playersFromData) {
    if ((votedPlayers != undefined) && (playersFromData != undefined)) {
        let kickedPlayer = new Set();
        let kickedImposter = new Set();
        let totalPlayers = playersFromData.length
        let totalVotesNeededToBeKicked = totalPlayers / 2;
        votedPlayers.forEach((value, key, _) =>{
            if (value.length >= totalVotesNeededToBeKicked) {
                if (ifImposter(key, imposter)) {
                    kickedImposter.add(key);
                } else {
                    kickedPlayer.add(key);
                }
            }
        });
        if (kickedImposter.size > 0) {
            return {
                "type": "imposter",
                "player": kickedImposter.values().next()
            }
        }
        if (kickedPlayer.size > 1) {
            return {
                "type": undefined,
                "player": undefined
            }
        } else if (kickedPlayer.size === 1) {
            return {
                "type": "crewmate",
                "player": kickedPlayer.values().next()
            }
        }
    }
}

function ifImposter(name, data) {
    let imposter = false
    // data.map((player) => {
    //     if (player.name === name && player.imposter) {
    //         imposter = true;
    //     }
    // });
    console.log(data);
    // console.log(data.name === name && data.imposter);
    if (data.name === name && data.imposter) {
        imposter = true;
        console.log(data);
        console.log(name);
    }
    return imposter;
}