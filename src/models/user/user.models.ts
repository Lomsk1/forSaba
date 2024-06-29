import mongoose, { Document, Model, Query } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// An interface that describes the properties
// that are required to create a new User
interface UserAttrs {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  register: Date;
  password: string;
  passwordConfirm: string;

  totalSellingMoney: number;

  active: boolean;

  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
export interface UserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  register: Date;
  password: string;
  passwordConfirm: string;

  totalSellingMoney: number;

  active: boolean;

  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;

  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): Promise<boolean>;
  createPasswordResetToken(): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserAttrs>(
  {
    firstName: {
      type: String,
      required: [true, "მიუთითეთ თქვენი სახელი"],
    },
    lastName: {
      type: String,
      required: [true, "მიუთითეთ თქვენი გვარი"],
    },
    email: {
      type: String,
      required: [true, "მიუთითეთ თქვენი იმეილი"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "იმეილის ტიპი არასწორია"],
    },
    password: {
      type: String,
      required: [true, "მიუთითეთ პაროლი"],
      validate: {
        validator: function (value: string | any[]) {
          return value.length >= 8;
        },
        message: "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო.",
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "გთხოვთ, დაადასტუროთ თქვენი პაროლი"],
      validate: {
        validator: function (el: string): boolean {
          const userAttrs = this as UserAttrs;

          return el === userAttrs.password;
        },
        message: "პაროლები არ ემთხვევა ერთმანეთს",
      },
    },
    register: {
      type: Date,
      default: Date.now(),
    },
    totalSellingMoney: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: {
        values: ["costumer", "manager"],
        message: "როლი შეიძლება იყოს მხოლოდ: Costumer, Manager",
      },
      default: "costumer",
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("ownProducts", {
  ref: "Product",
  foreignField: "user",
  localField: "_id",
});
userSchema.virtual("soldProducts", {
  ref: "SoldProduct",
  foreignField: "user",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //   Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //   Delete passwordConfirm field

  (this as any).passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// For QUERY
userSchema.pre(/^find/, function (next) {
  const query = this as Query<UserDoc, UserDoc>;

  query.find({ active: { $ne: false } });

  next();
});

userSchema.pre(/^find/, function (next) {
  const query = this as Query<UserDoc[], UserDoc>;

  query
    .populate({
      path: "ownProducts",
      select: "_id title ",
    })
    .populate({
      path: "soldProducts",
      select: "_id product -user createdAt",
    });

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      String(this.passwordChangedAt.getTime() / 1000)
    );
    return JWTTimestamp < changedTimestamp;
  }

  //   False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export default User;
