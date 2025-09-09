"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleUserInfo = exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
const verifyGoogleToken = async (accessToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: accessToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return null;
        }
        return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub,
        };
    }
    catch (error) {
        console.error("Google token verification failed:", error);
        return null;
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
const getGoogleUserInfo = async (accessToken) => {
    try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
        if (!response.ok) {
            return null;
        }
        const userInfo = await response.json();
        return {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.id,
        };
    }
    catch (error) {
        console.error("Failed to get Google user info:", error);
        return null;
    }
};
exports.getGoogleUserInfo = getGoogleUserInfo;
