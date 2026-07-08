// Passport local strategy: authenticates with email + password.
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User, verifyPassword } from "../models/User.js";

export function configurePassport(): void {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return done(null, false, { message: "E-posta veya şifre hatalı." });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Only the user id is stored in the session.
  passport.serializeUser((user, done) => {
    done(null, (user as { id: string }).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user ?? false);
    } catch (err) {
      done(err);
    }
  });
}
