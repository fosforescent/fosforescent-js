export type PeerOptions = {
    type: 'webrtc';
} | {
    type: 'websocket';
} | {
    type: 'http';
} | {
    type: 'js';
};
