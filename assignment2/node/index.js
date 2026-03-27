import http from "http";
import fs from "fs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "tjay_secret_12345";

http
  .createServer((req, res) => {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello Apache!\n");

      return;
    }

    if (req.method === "POST") {
      if (req.url === "/login") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            body = JSON.parse(body);

            // handle a login attempt

            // open up our "database" (actually a flat file called ./users.txt)
            const users = fs.readFileSync("./users.txt", "utf-8")
              .split("\n")
              .map(line => line.trim())
              .filter(line => line.length > 0);

            // to see if there is a username/password combination that matches
            // body.username and body.password
            const userLine = users.find(line => {
            const [, username] = line.split(",");
            return username === body.username;
     });

            // return a 404 error if the username isn't found
            if (!userLine) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "User not found" }));
              return;
            }

            const [userId, username, password, role] = userLine.split(",");

            // return a 401 error if the username is found but the password doesn't match
            if (password !== body.password) {
              res.writeHead(401, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid password" }));
              return;
            }

            // on success, return an encoded userId and role using your JWT_SECRET.
            // https://www.npmjs.com/package/jsonwebtoken
            const token = jwt.sign(
              {
                userId: parseInt(userId),
                role: role
              },
              JWT_SECRET,
              { expiresIn: "1h" }
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ token }));

          } catch (err) {
            console.log(err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error\n");
          }
        });
      }

      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found\n");
  })
  .listen(8000, "0.0.0.0");

console.log("Node server listening on port 8000");