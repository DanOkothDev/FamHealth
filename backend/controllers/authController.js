import { OAuth2Client } from "google-auth-library";
import * as appleSigninAuth from "apple-signin-auth";
import Family from "../models/Family.js";
import generateToken from "../utils/generateToken.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyAppleToken = appleSigninAuth.verifyIdToken || appleSigninAuth.default?.verifyIdToken;

const socialLoginResponse = (family) => ({
  _id: family._id,
  familyName: family.familyName,
  email: family.email,
  profilePic: family.profilePic,
  token: generateToken(family._id),
});

const findOrCreateFamily = async ({ email, provider, providerId, familyName, profilePic }) => {
  const lookup = { $or: [{ email }, { [`${provider}Id`]: providerId }] };
  let family = await Family.findOne(lookup);

  if (family) {
    if (!family[`${provider}Id`]) family[`${provider}Id`] = providerId;
    if (!family.profilePic && profilePic) family.profilePic = profilePic;
    await family.save();
    return family;
  }

  const safeFamilyName = familyName || (email ? email.split("@")[0] : "Family");
  family = await Family.create({
    familyName: safeFamilyName,
    email,
    googleId: provider === "google" ? providerId : undefined,
    appleId: provider === "apple" ? providerId : undefined,
    profilePic: profilePic || "",
  });
  return family;
};

export const googleAuth = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Google idToken is required" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Unable to read Google user information" });
    }

    const family = await findOrCreateFamily({
      email: payload.email,
      provider: "google",
      providerId: payload.sub,
      familyName: payload.name,
      profilePic: payload.picture,
    });

    res.json(socialLoginResponse(family));
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};

export const appleAuth = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "Apple idToken is required" });

  if (!verifyAppleToken) {
    return res.status(500).json({ message: "Apple token verification is not configured" });
  }

  try {
    const payload = await verifyAppleToken(idToken, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    if (!payload || !payload.sub) {
      return res.status(400).json({ message: "Unable to read Apple user information" });
    }

    const family = await findOrCreateFamily({
      email: payload.email,
      provider: "apple",
      providerId: payload.sub,
      familyName: payload.name || (payload.email ? payload.email.split("@")[0] : "Family"),
      profilePic: "",
    });

    res.json(socialLoginResponse(family));
  } catch (error) {
    console.error("Apple auth error:", error);
    res.status(500).json({ message: "Apple sign-in failed" });
  }
};
