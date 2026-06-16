import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const familySchema = new mongoose.Schema({
  familyName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  appleId: { type: String, unique: true, sparse: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
  profilePic: { type: String, default: "" },
}, { timestamps: true });

// Encrypt password before save
familySchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
familySchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Family", familySchema);
