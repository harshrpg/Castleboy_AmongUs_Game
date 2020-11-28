
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
        let totalVotesNeededToBeKicked = Math.round((totalPlayers) / 2);
        console.log('====================================');
        console.log('Total votes needed to be kicked');
        console.log(totalVotesNeededToBeKicked);
        console.log('====================================');
        let totalImposters = imposter.length;
        let ghostResult = {}
        console.log('TOTAL IMPOSTERS: ', totalImposters);
        if (totalImposters === 1) {
            ghostResult = ghostsI1Imposter(votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposter[0], playersFromData);
        } else if (totalImposters === 2) {
            ghostResult = ghosts2Imposters(votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposter, playersFromData);
        }
        return ghostResult;
    }
}

const ghosts2Imposters = (votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposters, playersFromData) => {
    votedPlayers.forEach((value, key, _) => {
        console.log('VOTED PLAYERS WHEN 2 Imposters: ', key, value);
        if (value.length >= totalVotesNeededToBeKicked) {
            imposters.forEach(imposter => {
                console.log('Imposter: ', imposter);
                if (ifImposter(key, imposter)) {
                    console.log(imposter.name, " is added to imposters list, Likely to be kicked");
                    kickedImposter.add(imposter.name);
                } else if (ifCrewmate(key, imposter)) {
                    console.log(imposter.name, " is added to players list, Likely to be ghosted");
                    kickedPlayer.add(imposter.name);
                }
            });
            crewmateKicked(playersFromData, kickedImposter, key, value, totalVotesNeededToBeKicked, kickedPlayer);
        }
    });
    console.log('====================================');
    console.log("KICKED IMPOSTER");
    console.log(kickedImposter);
    console.log("KICKED PLAYER");
    console.log(kickedPlayer);
    console.log('====================================');
    if (kickedImposter.size === kickedPlayer.size || kickedImposter.size > 1 || kickedPlayer.size > 1) {
        return {
            "type": undefined,
            "player": undefined
        }
    } else if (kickedImposter.size === 1) {
        return {
            "type": "imposter",
            "player": kickedImposter.values().next()
        }
    } else if (kickedPlayer.size === 1) {
        return {
            "type": "crewmate",
            "player": kickedPlayer.values().next()
        }
    }
}

const crewmateKicked = (playersFromData, kickedImposter, playerName,votes, totalVotesNeededToBeKicked, kickedPlayer) => {
    let imposter_name = ''
    if (kickedImposter.size > 0) {
        imposter_name = kickedImposter.values().next().value;
    }
    console.log('looking for voted crewmates');
    console.log('Crewmate: ', playerName, ' with votes: ', votes)
    if (votes.length >= totalVotesNeededToBeKicked) {
        console.log('Players From Data: ',playersFromData);
        console.log('Imposter Name: ', imposter_name);
        if (playersFromData instanceof Set) {
            playersFromData.forEach((player) => {
                if (ifCrewmateAndNotImposter(playerName, player, imposter_name)) {
                    console.log(player.name, " is added to players list, Likely to be ghosted");
                    kickedPlayer.add(player.name);
                }
            })
        }
    }
}

const ghostsI1Imposter = (votedPlayers, totalVotesNeededToBeKicked, kickedImposter, kickedPlayer, imposter, playersFromData) => {
    votedPlayers.forEach((value, key, _) =>{
        console.log('VOTED PLAYERS WHEN 1 Imposters: ', key, value);
        if (value.length >= totalVotesNeededToBeKicked) {
            if (ifImposter(key, imposter)) {
                console.debug(imposter.name, " is added to imposters list, Likely to be kicked");
                kickedImposter.add(imposter.name);
            } else if (ifCrewmate(key, imposter)) {
                console.debug(imposter.name, " is added to players list, Likely to be ghosted");
                kickedPlayer.add(imposter.name);
            }
            crewmateKicked(playersFromData, kickedImposter, key, value, totalVotesNeededToBeKicked, kickedPlayer);
        }
    });
    if (kickedImposter.size === kickedPlayer.size || kickedImposter.size > 1 || kickedPlayer.size > 1) {
        return {
            "type": undefined,
            "player": undefined
        }
    }else if (kickedImposter.size === 1) {
        return {
            "type": "imposter",
            "player": kickedImposter.values().next()
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
        console.log(data);
        console.log(name);
    }
    return imposter;
}

function ifCrewmate(name, data) {
    let crewmate = false
    if (data.name === name && !data.imposter && !data.kicked) {
        crewmate = true;
    }
    return crewmate;
}

function ifCrewmateAndNotImposter(name, data, imposter_name) {
    let crewmate = false;
    if (imposter_name != '' && imposter_name === data.name) {
        return false;
    } else if (data.name === name) {
        crewmate = true;
    }
    return crewmate;
}

