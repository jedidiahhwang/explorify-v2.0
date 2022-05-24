require("dotenv").config();
const express = require("express");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
const lyricsFinder = require("lyrics-finder");

const app = express();

app.use(cors());
app.use(express.json());

console.log(process.env);

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken;
    
    const spotifyApi = new SpotifyWebApi({
        redirectUri: "http://localhost:3000",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken
    })

    spotifyApi.refreshAccessToken()
        .then((data) => {
            res.json({
                accessToken: data.body.accessToken,
                expiresIn: data.body.expiresIn
            })
            console.log("The access token has been refreshed!");

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body["access_token"]);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        })
})

app.post("/login", (req, res) => {
    const code = req.body.code;
            
    const spotifyApi = new SpotifyWebApi({
        redirectUri: "http://localhost:3000",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    })

    spotifyApi.authorizationCodeGrant(code)
        .then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in
            })
         })
        .catch((err) => {
            console.log(err);
            res.status(400).send(err);
        })
})

app.get("/lyrics", async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No lyrics found";
    res.json({lyrics});
})

app.listen(3001, () => {
    console.log("Server running on 3001");
})