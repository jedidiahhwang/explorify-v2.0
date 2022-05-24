import React, {useState, useEffect} from "react";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";

import useAuth from "../Hooks/useAuth.js";
import TrackSearchResult from "./TrackSearchResult.js";
import Player from "./Player.js";

import {Container, Form} from "react-bootstrap";

const spotifyApi = new SpotifyWebApi({
    clientId: "f62351429f2c4c81bc5795ad670f6568"
})

const Dashboard = ({code}) => {
    const accessToken = useAuth(code);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [playingTrack, setPlayingTrack] = useState();
    const [lyrics, setLyrics] = useState("");

    function chooseTrack(track) {
        setPlayingTrack(track);
        setSearch("");
        setLyrics("");
    }

    useEffect(() => {
        if(!playingTrack) return;
        axios.get("http://localhost:3001/lyrics", {params: {track: playingTrack.title, artist: playingTrack.artist}})
            .then((res) => {
                setLyrics(res.data.lyrics);
            })
    }, [playingTrack])

    useEffect(() => {
        if(!accessToken) return;
        spotifyApi.setAccessToken(accessToken);
    }, [accessToken])

    useEffect(() => {
        if(!search) return setSearchResults([]);
        if(!accessToken) return;
        let cancel = false;

        spotifyApi.searchTracks(search)
        .then((res) => {
                if(cancel) return;
                setSearchResults(res.body.tracks.items.map((track) => {
                    const smallestAlbumImage = track.album.images.reduce((smallest, image) => {
                        if(image.height < smallest.height) return image
                        return smallest;
                    }, track.album.images[0])
                    return {
                        artist: track.artists[0].name,
                        title: track.name,
                        uri: track.uri,
                        albumUrl: smallestAlbumImage.url
                    }
                }))
            })

        return () => {
            cancel = true;
        }
    }, [search, accessToken])
    return (
        <Container className="d-flex flex-column py-2" style={{height: "100vh"}}>
            <Form.Control 
                type="search" 
                placeholder="Search Songs/Artists" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
            />
            <div className="flex-grow-1 my-2" style={{overflowY: "auto"}}>
                {searchResults.map((track) => (
                    <TrackSearchResult track={track} key={track.uri} chooseTrack={chooseTrack}/>
                ))}
                {searchResults.length === 0 && (
                    <div className="text-center" style={{whiteSpace: "pre"}}>
                        {lyrics}
                    </div>
                )}
            </div>
            <div><Player accessToken={accessToken} trackUri={playingTrack?.uri}/></div>
        </Container>
    )
}

export default Dashboard