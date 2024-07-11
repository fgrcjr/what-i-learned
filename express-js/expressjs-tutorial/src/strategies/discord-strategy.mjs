import passport from "passport";
import { Strategy } from "passport-discord";

passport.use(
    new Strategy({
        clientID: '1260412751965061222',
        clientSecret: 'rSob_tAbwr0IhpVOZ2sTzc2h5OHsbrIe',
        callbackURL: 'http:localhost:3000/api/auth/discord/redirect',
        scope: ["identify", "guilds"]
    }, (accessToken, refreshToken, profile, done) => {

    })
)