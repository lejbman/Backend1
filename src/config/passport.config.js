import passport from "passport";
import jwt from "passport-jwt";

const JwtStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const initializePassport = () =>{
    passport.use("current", new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: "coderhouse"
    }, async (jwt_payLoad, done) => {
        try {
            return done(null, jwt_payLoad);  
        } catch (error) {
            return done(error);
        }
    }))
}

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["coderCookieToken"];
    }
    return token;
}
export default initializePassport;