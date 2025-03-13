import React, {useRef, useState} from "react";
import Webcam from "react-webcam";



function WebCamm(){
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);


    const Capture = ()=>{
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    }

    return(
        <div>
            {
                !image ? (
                    <>
                    
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={400}
                            height={300}
                        />
                        <button onClick={Capture}>Capture Photo</button>
                    </>
                ) : (
                    <>
                        <img src={image} alt="Captured" />
                        <button onClick={() => setImage(null)}>Retake</button>
                        <a href={image} download="photo.jpg">
                            Download
                        </a>
                    </>
                )
            }
        </div>
    );
}

export default WebCamm;