import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useRef, useState } from 'react';

const styles = {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
};

const Canvas = ({ meetingManager }) => {

    const [path, setPath] = useState([])
    const [color, setColor] = useState("black")
    const [width, setWidth] = useState(4)
    const c = useRef(null);
    const onChange = async (data) => {
        const paths = await c.current.exportPaths()
        setPath(state => paths);
    }
    const onStroke = async (data) => {
        meetingManager.audioVideo.realtimeSendDataMessage('Drawing', JSON.stringify(path))
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
                c.current.eraseMode(true)
            }}>Erase</button>
            <button onClick={() => {
                c.current.clearCanvas()
            }}>Clear</button>
            <button onClick={() => {
                c.current.undo()
            }}>Undo</button>
            <button onClick={() => {
                c.current.redo()
            }}>Redo</button>
            <button onClick={() => {
                c.current.resetCanvas()
            }}>Reset</button>
            <ReactSketchCanvas
                style={styles}
                width="600"
                height="400"
                strokeWidth={width}
                strokeColor={color}
                onChange={onChange}
                onStroke={onStroke}
                ref={c}
            />
        </>
    );
};

export default Canvas