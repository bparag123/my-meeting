// This is a configuration for the first client

const localConnection = new RTCPeerConnection()

const dataChannel = localConnection.createDataChannel("channel");

dataChannel.onmessage = e => console.log("Got a message", e.data);

dataChannel.onopen = e => console.log("Connection Open");

localConnection.onicecandidate = e => console.log("Printing Ice Candidate", JSON.stringify(localConnection.localDescription));

localConnection.createOffer()
    //Here offer is a local for the current client so setting it as a local desc.
    .then(e => localConnection.setLocalDescription(e))
    .then(e => console.log("Set Local Description as Created Offer"))

//Here the answer is dummy
const answer = { "type": "answer", "sdp": "v=0\r\no=- 1315682332800318423 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=candidate:343366911 1 udp 2113937151 9486d4b6-c482-490d-88e9-a98020b199ce.local 41901 typ host generation 0 network-cost 999\r\na=ice-ufrag:gljH\r\na=ice-pwd:hMooXzZQCb16TSVmSU+QcA4L\r\na=ice-options:trickle\r\na=fingerprint:sha-256 A6:01:B6:92:FF:42:AF:10:85:92:E1:BC:0B:07:DD:56:D9:2B:68:65:FA:03:A9:6E:9E:3E:16:D2:9B:44:D1:67\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n" }

//the answer for the current client is remote so setting it as a remote desc.
localConnection.setRemoteDescription(answer)


// configuration for the second client

//This is a offer created by another client
const offer = { "type": "offer", "sdp": "v=0\r\no=- 1315682332800318423 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=candidate:343366911 1 udp 2113937151 9486d4b6-c482-490d-88e9-a98020b199ce.local 41901 typ host generation 0 network-cost 999\r\na=ice-ufrag:gljH\r\na=ice-pwd:hMooXzZQCb16TSVmSU+QcA4L\r\na=ice-options:trickle\r\na=fingerprint:sha-256 A6:01:B6:92:FF:42:AF:10:85:92:E1:BC:0B:07:DD:56:D9:2B:68:65:FA:03:A9:6E:9E:3E:16:D2:9B:44:D1:67\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n" }
//Creating RTC connection
const remoteConnection = new RTCPeerConnection();

remoteConnection.onicecandidate = e => console.log("Printing Ice Candidate", JSON.stringify(remoteConnection.localDescription));

//Setting up the data channel configuration event
remoteConnection.ondatachannel = e => {
    remoteConnection.dataChannel = e.channel;
    remoteConnection.dataChannel.onmessage = e => console.log("Message at client 2", e.data);
    remoteConnection.dataChannel.onopen = e => console.log("Connection Open")
}

//The incoming offer is remote for the current client so setting it as a remote desc.
remoteConnection.setRemoteDescription(offer).then(e => console.log("Set Remote Description successfully"))

//The answer to the offer is local for the current client so setting it as a local desc.
remoteConnection.createAnswer().then(e => remoteConnection.setLocalDescription(e)).then("answer set successfully")