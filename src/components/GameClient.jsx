import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AnswerInput from './AnswerInput';
import { ThemeProvider } from '@emotion/react';
import { Button, Checkbox, createTheme, Grid, IconButton, Modal, TextField } from '@mui/material';
import BettingInput from './BettingInput';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'motion/react';
import SelectPosition from './SelectPosition';

const GameClient = ({isDevMode}) => {
    const [socket, setSocket] = useState(null);
    const [nickname, setNickname] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [clientId, setClientId] = useState(null);
    const [gamedata, setGamedata] = useState(null);
    const [playerCount, setPlayerCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [timerCheckbox, setTimerCheckbox] = useState(false);
    const [isDevSettingsOpen, setIsDevSettingsOpen] = useState(false);
    const [devSettingsPassword, setDevSettingsPassword] = useState('');
    const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [roomName, setRoomName] = useState('');

    const correctDevSettingsPassword = 'thisShouldNotBeStoredInPlainTextBudIdc';

    useEffect(() => {
        const newSocket = isDevMode ? io() : io('192.9.150.5:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            const savedNickname = localStorage.getItem('nickname');
            const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
            const savedClientId = localStorage.getItem('clientId');
            const savedRoomName = localStorage.getItem('roomName');

            if (savedNickname && savedClientId) {
                rejoinRoom(newSocket, savedRoomName, savedNickname, savedIsAdmin, savedClientId);
            }
        });

        newSocket.on('reconnected', (data) => {
            setClientId(data.id);
            setNickname(data.nickname);
            setIsAdmin(data.isAdmin);
            setIsConnected(true);
            setRoomName(data.roomName);
        });

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('gamedataUpdated', (newData) => setGamedata(newData));
            socket.on('joinedRoom', (data) => {
                setClientId(data.id);
                setNickname(data.nickname);
                setIsAdmin(data.isAdmin);
                setIsConnected(true);
                localStorage.setItem('clientId', data.id);
            });
            socket.on('gamedataUpdated', (newData) => {
                setGamedata(newData);
                console.log('Gamedata received:', newData);
            });
            socket.on('playerCountUpdated', (count) => setPlayerCount(count));
            socket.on('error', (message) => setError(message));
        }
    }, [socket]);

    const handleSubmit = (answer) => {
        if (answer !== null && answer !== undefined && answer !== '') {
            // Emit the 'submitAnswer' event to the server with the current answer
            socket.emit('submitAnswer', { roomName, clientId, answer });
        } else {
            alert('Please enter an answer before submitting.');
        }
    };

    const handleWagerSubmit = (pointWager) => {
        if (pointWager !== null && pointWager !== undefined && pointWager !== '') {
            socket.emit('submitWager', { roomName, clientId, pointWager });
        } else {
            alert('Please enter a wager before submitting.');
        }
    }

    const handleJoinRoom = () => {
        if (nickname.trim() && roomName.trim()) {
            saveSessionData(nickname, isAdmin);
            socket.emit('joinRoom', { roomName, nickname, isAdmin, clientId: null });
        } else {
            alert('Please enter a nickname and a roomcode.');
        }
    };

    const handleDisconnect = () => {
        if (socket) {
            socket.emit('disconnectAndRemove', { roomName, clientId });
            localStorage.clear(); // Clear all stored client data
            socket.disconnect();
            setIsConnected(false); // Update state to reflect disconnection
        }
    };

    const handleSelectPosition = (position) => {
        socket.emit('selectPosition', { roomName, clientId, position });
    }

    const rejoinRoom = (currentSocket, savedRoomName, savedNickname, savedIsAdmin, savedClientId) => {
        currentSocket.emit('joinRoom', {
            roomName: savedRoomName,
            nickname: savedNickname,
            isAdmin: savedIsAdmin,
            clientId: savedClientId,
        });
    };

    const saveSessionData = (nickname, isAdmin) => {
        localStorage.setItem('nickname', nickname);
        localStorage.setItem('isAdmin', isAdmin.toString());
        localStorage.setItem('roomName', roomName);
    };

    const updateGamedata = () => {
        if (socket && isConnected) {
            socket.emit('updateGamedata', {
                roomName,
                clientId,
                newData: { score: Math.floor(Math.random() * 100), status: 'running' },
            });
        }
    };

    const resetGameData = () => {
        if (socket && isConnected) {
            socket.emit('resetGameData', { roomName, clientId });
        }
    };

    const advanceGameState = () => {
        if (socket && isConnected) {
            socket.emit('advanceGameState', { roomName, clientId });
        }
    }

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    return (
        <ThemeProvider theme={darkTheme}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" alignContent={"center"}>
                <Grid item xs={isConnected ? 2 : 1}>
                    <IconButton onClick={() => setIsDevSettingsOpen(true)}>
                        <SettingsIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={isConnected ? 8 : 11}>
                    <h2>2024 White Elephant Event</h2>
                </Grid>
                {
                    isConnected &&
                    <Grid item xs={2}>
                        <IconButton variant="contained" onClick={() => setIsLogoutConfirmationOpen(true)}>
                            <LogoutIcon />
                        </IconButton>
                    </Grid>
                }
            </Grid>
            <Modal
                open={isLogoutConfirmationOpen}
                onClose={() => setIsLogoutConfirmationOpen(false)}
                sx={{ '& .MuiBackdrop-root': { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
            >
                <div style={{
                    padding: "40px",
                    color: "white",
                    textAlign: "center",
                }}>
                    <p>Are you sure you want to logout?</p>
                    <Button onClick={() => setIsLogoutConfirmationOpen(false)} variant="contained" fullWidth style={{ marginTop: "10px" }}>Cancel</Button>
                    <Button onClick={() => {
                        handleDisconnect()
                        setIsLogoutConfirmationOpen(false)
                    }} variant='contained' color="error" fullWidth style={{ marginTop: "10px" }}>Logout</Button>
                </div>
            </Modal>
            <Modal
                open={isDevSettingsOpen}
                onClose={() => setIsDevSettingsOpen(false)}
                sx={{ '& .MuiBackdrop-root': { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
            >
                <div style={{
                    padding: "40px",
                    color: "white",
                }}>
                    {
                        devSettingsPassword === correctDevSettingsPassword ? (
                            <div>
                                <Checkbox
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                />
                                Join as Admin
                            </div>
                        ) : (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: "20px" }}>
                                    <p style={{ fontWeight: 700, fontSize: '24px' }}>Developer Settings</p>
                                    <p>(Please don't guess this password because if you do, things might break and I will cry. As a peace offering, here is a picture of a cute cat.)</p>
                                    <img style={{ width: "150px" }} src="https://preview.redd.it/af446nff4fq51.jpg?width=640&crop=smart&auto=webp&s=4f109ac392afe60a99674e6ebd1ff75df4719b5b" />
                                </div>
                                <TextField
                                    label="Password"
                                    type="password"
                                    value={devSettingsPassword}
                                    onChange={(e) => setDevSettingsPassword(e.target.value)}
                                    style={{ marginBottom: "10px" }}
                                    fullWidth
                                />
                            </div>
                        )
                    }
                </div>
            </Modal>
            {isConnected ? (
                <div>
                    {
                        gamedata?.gamestate === "lobby" &&
                        <>
                            <p>Welcome {nickname}!</p>
                            <p>We'll get started soon, so please sit tight!</p>
                        </>
                    }
                    {
                        gamedata?.gamestate !== "lobby" && gamedata?.gamestate !== "select_positions" &&
                        <>
                            <h2>Current Score: {gamedata?.players?.[clientId]?.score || 0}</h2>
                            {
                                gamedata?.questionPointGain?.[clientId] !== undefined && (
                                    <motion.div
                                        animate={{ opacity: [0, 1], y: [-100, 0] }}
                                        transition={{ duration: 1 }}
                                    >
                                        <p style={{
                                            fontSize: "50px",
                                            color: gamedata?.questionPointGain?.[clientId].questionPointGain > 0 ? 'green' : 'red',
                                            transition: 'opacity 0.5s ease-in-out',
                                            opacity: gamedata?.questionPointGain?.[clientId] === undefined ? 0 : 1,
                                        }}>
                                            +{gamedata?.questionPointGain?.[clientId].questionPointGain}
                                        </p>
                                    </motion.div>
                                )
                            }
                        </>
                    }
                    {
                        gamedata?.gamestate === "select_positions" &&
                            <SelectPosition
                                gamedata={gamedata}
                                handleSubmit={handleSelectPosition}
                                numPlayers={playerCount}
                                isPlayersTurn={gamedata.positions.pickOrder[gamedata.positions.pickIndex].id === clientId}
                            />
                    }
                    {isAdmin && (<>
                        <div style={{textAlign: 'left', fontSize: '14px'}}>Gamedata: {gamedata ? <pre>{JSON.stringify(gamedata, null, 2)}</pre> : 'Waiting for updates...'}</div>
                        <p>Players Connected: {playerCount}</p>
                        <div>
                            <Checkbox checked={timerCheckbox} label="Display Timer" onChange={
                                (e) => {
                                    setTimerCheckbox(e.target.checked);
                                    socket.emit('updateGamedata', { roomName, clientId, newData: { shouldDisplayTimer: e.target.checked } })}
                                }
                            />
                            Display Timer
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Button variant="contained" onClick={advanceGameState} fullWidth>Advance Game State</Button>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Button variant="contained" onClick={updateGamedata} fullWidth>Force Update Gamedata</Button>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Button variant="contained" onClick={() => setIsResetModalOpen(true)} fullWidth color="error">Reset Game Data</Button>
                            <Modal open={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} sx={{ '& .MuiBackdrop-root': { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
                                <Button variant="contained" onClick={() => resetGameData(roomName)} fullWidth color="error">Reset Game Data</Button>
                            </Modal>
                        </div>
                    </>)}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {
                        (gamedata?.gamestate === "question" || gamedata?.gamestate === "survey_query" || gamedata?.gamestate === "survey_question" || gamedata?.gamestate === "final_question") && !isAdmin && (
                            <AnswerInput key={gamedata?.gamestate} gamedata={gamedata} handleSubmit={handleSubmit} />
                        )
                    }
                    {
                        gamedata?.gamestate === 'final_betting' && !isAdmin && (
                            <BettingInput numPoints={gamedata?.players?.[clientId]?.score} handleWagerSubmit={handleWagerSubmit} />
                        )
                    }
                </div>
            ) : (
                <div>
                    <p>Hosted by the US SOCFI team!</p>
                    <div>
                        <TextField
                            type="text"
                            placeholder="Enter a nickname!"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <TextField
                            type="text"
                            placeholder="Enter the room code!"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div style={{ marginTop: "20px" }}>
                        <Button onClick={handleJoinRoom} variant="contained" fullWidth>Join Game</Button>
                    </div>
                </div>
            )}
        </ThemeProvider>
    );
};

export default GameClient;

