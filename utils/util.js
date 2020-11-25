
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
    console.debug('====================================');
    console.debug("INPOSTER SENT TO UTILS");
    console.debug(imposter);
    console.debug('====================================');
    if ((votedPlayers != undefined) && (playersFromData != undefined) && (imposter != undefined)) {
        let kickedPlayer = new Set();
        let kickedImposter = new Set();
        let totalPlayers = playersFromData.size
        let totalVotesNeededToBeKicked = (totalPlayers) / 2;
        console.debug('====================================');
        console.debug('Total votes needed to be kicked');
        console.debug(totalVotesNeededToBeKicked);
        console.debug('====================================');
        let totalImposters = imposter.length;
        let ghostResult = {}
        if (totalImposters === 1) {
            ghostResult = ghostsI1Imposter(votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposter[0]);
        } else if (totalImposters === 2) {
            ghostResult = ghosts2Imposters(votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposter);
        }
        return ghostResult;
    }
}

const ghosts2Imposters = (votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposters) => {
    votedPlayers.forEach((value, key, _) => {
        if (value.length >= totalVotesNeededToBeKicked) {
            imposters.forEach(imposter => {
                if (ifImposter(key, imposter)) {
                    console.debug(key, " is added to imposters list, Likely to be kicked");
                    kickedImposter.add(key);
                } else {
                    console.debug(key, " is added to players list, Likely to be ghosted");
                    kickedPlayer.add(key);
                }
            });
        }
    });
    console.debug('====================================');
    console.debug("KICKED IMPOSTER");
    console.debug(kickedImposter);
    console.debug("KICKED PLAYER");
    console.debug(kickedPlayer);
    console.debug('====================================');
    if (kickedImposter.size === 1) {
        return {
            "type": "imposter",
            "player": kickedImposter.values().next()
        }
    } else if (kickedImposter.size > 1 || kickedPlayer.size > 1) {
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

const ghostsI1Imposter = (votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposter) => {
    votedPlayers.forEach((value, key, _) =>{
        if (value.length >= totalVotesNeededToBeKicked) {
            if (ifImposter(key, imposter)) {
                console.debug(key, " is added to imposters list, Likely to be kicked");
                kickedImposter.add(key);
            } else {
                console.debug(key, " is added to players list, Likely to be ghosted");
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

function ifImposter(name, data) {
    let imposter = false
    if (data.name === name && data.imposter) {
        imposter = true;
        console.debug(data);
        console.debug(name);
    }
    return imposter;
}