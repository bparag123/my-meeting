const setupWhiteboard = (roomId, userId) => {
    console.log(userId)
    let pixel = new window.Comet({
        room: roomId,
        key: 'vJMI27Iw6tOkDndquXxwCNfskDeW6bLBkK5npSAB',
        name: userId
    });
    console.log(roomId)
}

export default setupWhiteboard