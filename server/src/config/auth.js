import jwt from "jsonwebtoken";

export const genToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Cookie configuration for development vs production
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction, // Only secure in production
    sameSite: isProduction ? "None" : "Lax", // Lax for development, None for production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: isProduction ? ".meditechremedies.in" : undefined, // Set domain only in production
  });

  return token;
};
