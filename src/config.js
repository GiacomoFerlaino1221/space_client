export const directions = {
  87: "up",
  83: "down",
  65: "left",
  68: "right",
  38: "up",
  40: "down",
  37: "left",
  39: "right"
};

export const ACCESS_KEY = "123123";

export const JWT_SECRET = "mintersecret";

export const API_URI =
  process.env.NODE_ENV === "production"
    ? "https://api.spacegame.store"
    : "http://localhost:5004";

export const domain = () => {
  if (process.env.NODE_ENV === "production")
    return `http://spacegame.store:5001`;
  else return "http://localhost:5001";
};
