const setupWhiteboard = (roomId, userId) => {
    const isexist = sessionStorage.getItem('whiteboard')
    console.log(isexist)
    if(!isexist){
        console.log("Creating new Whiteboard")
        sessionStorage.setItem("whiteboard", true)
        let pixel = new window.Comet({
            room: roomId,
            key: 'vJMI27Iw6tOkDndquXxwCNfskDeW6bLBkK5npSAB',
            name: userId
        });
        console.log(pixel)
    }
    
}

export default setupWhiteboard