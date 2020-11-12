
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