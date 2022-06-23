import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRef, useState, forwardRef } from 'react';

const styles = {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
    width: '100vw',
    height: '70vh'
};
//Here it can get reference of its parent component
const Canvas = forwardRef(
    (props, ref) => {

        // const [path, setPath] = useState([])
        const [color, setColor] = useState("black")
        const [width, setWidth] = useState(4)
        const [eraseMode, setEraseMode] = useState(false);
        const meetingManager = props.meetingManager
        // console.log(meetingManager)
        const onChange = async (data) => {
            // const paths = await ref.current.exportPaths()
            // setPath(state => paths);
        }
        const onStroke = (data) => {
            if (data.paths.length > 100) {
                let chunks = Math.ceil(data.paths.length / 100)
                let start = 0
                const dataToSend = JSON.stringify(data)
                while (chunks--) {
                    const chunk = JSON.parse(dataToSend)
                    if (chunks === 0) {
                        chunk.paths = data.paths.slice(start, data.paths.length)
                    }
                    chunk.paths = data.paths.slice(start, start + 100)
                    start += 100;

                    meetingManager.audioVideo.realtimeSendDataMessage('Drawing', JSON.stringify(chunk))
                }
            }
            else {
                meetingManager.audioVideo.realtimeSendDataMessage('Drawing', JSON.stringify(data))
            }
        }

        const onUndo = () => {
            console.log("Undo Called")
            ref.current.undo()
            meetingManager.audioVideo.realtimeSendDataMessage('undoDrawing', ["hii"])
        }

        const onRedo = () => {
            console.log("Redo Called")
            ref.current.redo()
            meetingManager.audioVideo.realtimeSendDataMessage('redoDrawing', ["hii"])
        }

        const onReset = () => {
            console.log("Reset Called");
            ref.current.resetCanvas()
            meetingManager.audioVideo.realtimeSendDataMessage('resetDrawing', ["hii"])
        }

        const onClear = () => {
            console.log("Clear Canvas");
            ref.current.clearCanvas();
            meetingManager.audioVideo.realtimeSendDataMessage('clearDrawing', ["hii"])
        }

        const onColorChange = (e) => {
            setColor(_ => e.target.value);
        }

        const onWidthChange = (e) => {
            setWidth(_ => e.target.value);
        }
        return (
            <>
                <input type="color" name="color" id="color" onChange={onColorChange} />
                <input type="range" name="width" id="width" min={1} max={10} onChange={onWidthChange} />
                <button onClick={() => {
                    setEraseMode(state => {
                        ref.current.eraseMode(!state)
                        return !state
                    })

                }}>{eraseMode ? "Draw" : "Erase"}</button>
                <button onClick={onClear}>Clear</button>
                <button onClick={onUndo}>Undo</button>
                <button onClick={onRedo}>Redo</button>
                <button onClick={onReset}>Reset</button>
                <ReactSketchCanvas
                    style={styles}
                    strokeWidth={width}
                    strokeColor={color}
                    onChange={onChange}
                    onStroke={onStroke}
                    ref={ref}
                />
            </>
        );
    }
)

export default Canvas