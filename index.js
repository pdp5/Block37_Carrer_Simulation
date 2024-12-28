const { config } = require("dotenv");
const express = require("express");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");

const PORT = 3000;
const JWT = process.env.JWT;

app.use(express.json());
app.use(require("morgan")("dev"));

let token = null;

const authentication = async (req, res, next) => {
  if (!token) {
    if (
      (req.method === "POST" &&
        req.path.match(/^\/api\/items\/\d+\/reviews$/)) ||
      req.path.match(/^\/api\/items\/\d+\/reviews\/\d+\/comments$/) ||
      (req.method === "DELETE" &&
        req.path.match(/^\/api\/users\/\d+\/comments\/\d+$/)) ||
      req.path.match(/^\/api\/users\/\d+\/reviews\/\d+$/)
    ) {
      req.user = { username: "Guest" };

      return next();
    }
    return res.send("You are not authorized!!");
  }
  try {
    const verify = jwt.verify(token, JWT);
    req.user = { username: verify };
    req.authorizationMessage = {
      message: "You are authorized!!",
      username: verify,
    };
    next();
  } catch (error) {
    return res.send("invalid token");
  }
};

app.post("/api/auth/register", async (req, res, next) => {
  const user_data = req.body;
  console.log("user Data: ", user_data);
  if (
    user_data.username === "" ||
    !user_data.username ||
    !user_data.password ||
    user_data.password === ""
  ) {
    return res.status(201).send("Username or password is not provided!!");
  }

  res.status(201).send(user_data);
});
app.post("/api/auth/login", async (req, res, next) => {
  const user_data = req.body;
  if (
    user_data.username === "" ||
    !user_data.username ||
    !user_data.password ||
    user_data.password === ""
  ) {
    return res.send("Username or password is not provided!!");
  }
  token = await jwt.sign(user_data.username, JWT);
  console.log("token: ", token);
  res.send(user_data);
});

app.get("/api/auth/me", authentication, async (req, res, next) => {
  if (!authentication) {
    res.status(200);
    return;
  }
  if (req.authorizationMessage) {
    res.send(req.authorizationMessage);
  }
});

app.get("/api/items", async (req, res, next) => {
  res.send("Displaying all the items!");
});
app.get("/api/items/:id", async (req, res, next) => {
  const id = req.params.id;
  res.send(`Displaying item of ID# ${id}`);
});

app.get("/api/items/:id/reviews", async (req, res, next) => {
  const id = req.params.id;
  res.send(`Displaying reviews of a product with ID# ${id}`);
});
app.post("/api/items/:id/reviews", authentication, async (req, res, next) => {
  const id = req.params.id;
  const review = req.body.review || "Nice Product!";
  const username = req.user.username;
  res.status(201).json({ id: id, username: username, review: review });
});
app.get("/api/items/:itemId/reviews/:id", async (req, res, next) => {
  const id = req.params.id;
  const itemId = req.params.itemId;
  res.send(
    `Displaying reviews of ID# ${id} and of a product with ID# ${itemId}`
  );
});
app.get("/api/reviews/me", authentication, async (req, res, next) => {
  const username = req.user.username;

  res.send(`Displaying reviews posted by ${username}`);
});
app.put(
  "/api/users/:userId/reviews/:id",
  authentication,
  async (req, res, next) => {
    const userId = req.body.userId;
    const id = req.body.id;
    res.send(
      `Modifying reviews with ID# ${id} and for the user with userID# ${userId}`
    );
  }
);
app.post(
  "/api/items/:itemId/reviews/:id/comments",
  authentication,
  async (req, res, next) => {
    const itemId = req.params.itemId;
    const id = req.params.id;
    const comment = req.body.comment || "My comment for this item!";
    res.status(201).json({
      id: id,
      itemId: itemId,
      comment: comment,
    });
  }
);
app.get("/api/comments/me", authentication, async (req, res, next) => {
  const username = req.user.username;
  res.send(`Displaying comments made by ${username}`);
});
app.put(
  "/api/users/:userId/comments/:id",
  authentication,
  async (req, res, next) => {
    const userId = req.params.userId;
    const id = req.params.id;
    res.send(
      `Modifying comment with ID# ${id} of the user with userId# ${userId}`
    );
  }
);
app.delete(
  "/api/users/:userId/comments/:id",
  authentication,
  async (req, res, next) => {
    const userId = req.params.userId;
    const id = req.params.id;
    res
      .status(204)
      .send(
        `Deleted comment with ID# ${id} of the user with userId# ${userId}`
      );
  }
);
app.delete(
  "/api/users/:userId/reviews/:id",
  authentication,
  async (req, res, next) => {
    const userId = req.params.userId;
    const id = req.params.id;
    res
      .status(204)
      .send(`Deleted review with ID# ${id} of the user with userId# ${userId}`);
  }
);
app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
