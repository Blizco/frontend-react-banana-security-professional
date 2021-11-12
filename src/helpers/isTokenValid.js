import jwt_decode from "jwt-decode";

function isTokenValid(jwtToken) {
    const decodedToken = jwt_decode(jwtToken);
    const expirationUnix = decodedToken.exp; // let op: dit is een UNIX timestamp

    const now = new Date().getTime(); // dit is een javascript timestamp
    const currentUnix = Math.round(now / 1000); // nu is het ook een UNIX timestamp

    // Als er nog seconden over zijn wanneer we "nu" aftrekken van de expiratiedatum is hij nog geldig
    const isTokenStillValid = expirationUnix - currentUnix > 0;

    return isTokenStillValid;
}

export default isTokenValid;