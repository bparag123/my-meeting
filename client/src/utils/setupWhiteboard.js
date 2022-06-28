const setupWhiteboard = (roomId, userId) => {
    console.log(userId)
    let pixel = new window.Comet({
        room: roomId,
        key: 'FBKhKdLVzGhyGCKY1ohKotAIV5Yn1mVgscz3erUw',
        name: userId
    });
    console.log(roomId)
}

export default setupWhiteboard