import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import cam from "../assets/photography.png";
import inst from "../assets/pngwing.com.png";
import save from "../assets/save.png";
import html2canvas from "html2canvas";

function WebbCam() {
    const webcamRef = useRef(null);
    const [filter, setFilter] = useState("contrast(1.3) saturate(1.8) brightness(0.8) hue-rotate(10deg)");
    const [crosshatchActive, setCrosshatchActive] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("90s"); // Track the active button
    const [images, setImages] = useState([]);
    const [final, setfinal] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [click, setClick] = useState(false);
    const [visible, setVisible] = useState(false);
    const captureRef = useRef(null);

    const handleFilterChange = (filterValue, filterName) => {
        setFilter(filterValue);
        setCrosshatchActive(false);
        setSelectedFilter(filterName);
    };


    const mergeImages = async (images) => {
        if (images.length === 0) return;
    
        const imgElements = await Promise.all(
            images.map(src => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => resolve(img);
                });
            })
        );
    
        // Adjusted scaling for smaller output
        const scaleFactor = 0.35; // Smaller size
        const margin = 15; // Margin for spacing
        const borderRadius = 8; // Border radius for images and canvas
    
        // Get current date and time
        const now = new Date();
        const dateTimeStr = `PixelBooth ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
        // Font settings (Smaller text)
        const fontSize = 8; // Smaller font size
        const fontFamily = "'Press Start 2P', cursive";
    
        // Calculate final canvas size
        const width = imgElements[0].width * scaleFactor + margin * 2;
        const height = imgElements.reduce((acc, img) => acc + img.height * scaleFactor, 0) 
                       + margin * (imgElements.length + 1) 
                       + fontSize + margin; // Reduced extra space for text
    
        // Create the canvas
        const mergedCanvas = document.createElement("canvas");
        const ctx = mergedCanvas.getContext("2d");
        mergedCanvas.width = width;
        mergedCanvas.height = height;
    
        // Apply rounded corners to the entire canvas
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(borderRadius, 0);
        ctx.lineTo(mergedCanvas.width - borderRadius, 0);
        ctx.quadraticCurveTo(mergedCanvas.width, 0, mergedCanvas.width, borderRadius);
        ctx.lineTo(mergedCanvas.width, mergedCanvas.height - borderRadius);
        ctx.quadraticCurveTo(mergedCanvas.width, mergedCanvas.height, mergedCanvas.width - borderRadius, mergedCanvas.height);
        ctx.lineTo(borderRadius, mergedCanvas.height);
        ctx.quadraticCurveTo(0, mergedCanvas.height, 0, mergedCanvas.height - borderRadius);
        ctx.lineTo(0, borderRadius);
        ctx.quadraticCurveTo(0, 0, borderRadius, 0);
        ctx.closePath();
        ctx.fill();
    
        // Draw each image with rounded corners
        let yOffset = margin;
        imgElements.forEach((img) => {
            const imgWidth = img.width * scaleFactor;
            const imgHeight = img.height * scaleFactor;
    
            // Draw images with rounded corners
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(margin + borderRadius, yOffset);
            ctx.lineTo(margin + imgWidth - borderRadius, yOffset);
            ctx.quadraticCurveTo(margin + imgWidth, yOffset, margin + imgWidth, yOffset + borderRadius);
            ctx.lineTo(margin + imgWidth, yOffset + imgHeight - borderRadius);
            ctx.quadraticCurveTo(margin + imgWidth, yOffset + imgHeight, margin + imgWidth - borderRadius, yOffset + imgHeight);
            ctx.lineTo(margin + borderRadius, yOffset + imgHeight);
            ctx.quadraticCurveTo(margin, yOffset + imgHeight, margin, yOffset + imgHeight - borderRadius);
            ctx.lineTo(margin, yOffset + borderRadius);
            ctx.quadraticCurveTo(margin, yOffset, margin + borderRadius, yOffset);
            ctx.closePath();
            ctx.clip();
    
            ctx.drawImage(img, margin, yOffset, imgWidth, imgHeight);
            ctx.restore();
    
            yOffset += imgHeight + margin; // Adding margin between images
        });
    
        // Add text at the bottom (Smaller)
        ctx.fillStyle = "black";
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.fillText(dateTimeStr, mergedCanvas.width / 2, mergedCanvas.height - margin / 2);
    
        // Convert to final image URL
        const finalImage = mergedCanvas.toDataURL("image/png");
        setfinal(finalImage);
    };
    
    
    const btnClick = async () => {
        setClick(true);
        let capturedImages = []; // Temporary array to store images

        for (let i = 0; i < 3; i++) { // Repeat 3 times
            // Countdown from 3 → 2 → 1 → Smile
            for (let j = 3; j > 0; j--) {
                setCountdown(j);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setCountdown("Smile");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCountdown(null);

            await new Promise((resolve) => setTimeout(resolve, 500));

            if (captureRef.current) {
                try {
                    // Capture the webcam div as a canvas
                    const canvas = await html2canvas(captureRef.current, { useCORS: true });

                    // Create a new canvas for the cropped image
                    const croppedCanvas = document.createElement("canvas");
                    const ctx = croppedCanvas.getContext("2d");

                    // Calculate the crop dimensions (90% of original)
                    const cropFactor = 0.9;
                    const cropWidth = canvas.width * cropFactor;
                    const cropHeight = canvas.height * cropFactor;

                    // Calculate the top-left position to crop from center
                    const startX = (canvas.width - cropWidth) / 2;
                    const startY = (canvas.height - cropHeight) / 2;

                    // Set canvas size to cropped dimensions
                    croppedCanvas.width = cropWidth;
                    croppedCanvas.height = cropHeight;

                    // Apply filter if needed
                    ctx.filter = crosshatchActive ? "none" : filter;

                    // Mirror the image
                    ctx.save();
                    ctx.scale(-1, 1); // Flip horizontally
                    ctx.drawImage(
                        canvas,
                        startX,
                        startY,
                        cropWidth,
                        cropHeight,
                        -cropWidth, // Flip horizontally by moving the start position
                        0,
                        cropWidth,
                        cropHeight
                    );
                    ctx.restore();

                    // Convert to image format
                    const croppedImage = croppedCanvas.toDataURL("image/png");
                    capturedImages.push(croppedImage);

                } catch (error) {
                    console.error("Error capturing image:", error);
                }
            }
        }

        setImages(capturedImages); // Update state with all captured images
        setTimeout(() => mergeImages(capturedImages), 100);       
         setVisible(true);
        setClick(false);
    };



    return (
        <>

            <div className="flex flex-col items-center space-y-4">
                {/* Webcam Container */}
                <div ref={captureRef} className="relative bg-[#232222] w-[90%] h-600 flex justify-center items-center rounded-3xl my-20 mx-auto  py-1 overflow-hidden
                md:w-[90%] md:h-[90vw] max-w-[700px] max-h-[450px]">

                    <Webcam

                        className="rounded-3xl"

                        screenshotFormat="image/jpeg"
                        mirrored={true}
                        style={{
                            width: "98%",
                            height: "98%",
                            objectFit: "cover",
                            filter: crosshatchActive ? "none" : filter, // Disable CSS filter when crosshatch is active
                        }}
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: "user",
                        }}
                    />

                    {countdown !== null && (
                        <div className="absolute text-[#FFEAF0] text-8xl font-bold   p-4 rounded-lg">
                            {countdown == 0 ? "Smile" : countdown}
                        </div>
                    )}

                    {/* Crosshatch Overlay */}
                    {crosshatchActive && (
                        <svg className="absolute inset-0 w-full h-full z-10">
                            <defs>
                                <filter id="crosshatch">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
                                    <feColorMatrix type="saturate" values="0" />
                                    <feComposite operator="in" in2="SourceGraphic" />
                                </filter>
                            </defs>
                            <rect width="100%" height="100%" filter="url(#crosshatch)" />
                        </svg>
                    )}





                    {/* Noise Overlay */}
                    <svg className="absolute inset-0  w-full h-full  pointer-events-none rounded-3xl z-10"
                        style={{
                            background: `repeating-linear-gradient(
                                    transparent, transparent 2px, rgba(0, 0, 0, 0.2) 4px
                                    ), url('/vhs-noise.png')`,
                            mixBlendMode: "overlay",
                            opacity: 0.5,
                        }}
                    />

                </div>
                <div onClick={() => window.open("https://github.com/ajayrawati", "_blank")}
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                    className="text-white bg-[#CA9F00] absolute w-[120px] h-10 rounded-3xl flex items-center justify-center my-4 top-5 right-0.5 rotate-6 hover:rotate-0 transition-transform duration-300 text-[10px] hover:cursor-pointer"
                >
                    <div
                        className="bg-[#FDC700] text-black  flex items-center justify-center w-[96%] h-[80%] rounded-3xl text-[8px]  overflow-hidden whitespace-nowrap"
                    >
                        made by aj
                    </div>
                </div>
                <div onClick={() => window.open("https://www.instagram.com/ajayrawat0016/", "_blank")}
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                    className="text-white bg-[#CA9F00] absolute w-[120px] h-10 rounded-3xl flex items-center justify-center my-4 top-5 left-0.5 rotate-354 hover:rotate-360 transition-transform duration-300 text-[10px] hover:cursor-pointer"
                >
                    <div
                        className="bg-[#FDC700] text-black  flex items-center  w-[96%] h-[80%] rounded-3xl text-[8px]  overflow-hidden whitespace-nowrap"
                    >
                        <img className="w-[20px] my-3 mx-4" src={inst}></img>
                        <span>Insta</span>
                    </div>
                </div>


            </div>
            <div className="flex justify-center gap-4 bg-[#141416] p-4">
                <button
                    onClick={() => handleFilterChange("contrast(1.3) saturate(1.8) brightness(0.8) hue-rotate(10deg)", "90s")}
                    className={`p-2 rounded ${selectedFilter === "90s" ? "bg-yellow-500 text-black" : "text-white bg-[#36363C] hover:bg-[#4A4A52]"}`}
                >
                    90's
                </button>
                <button
                    onClick={() => handleFilterChange("contrast(1.4) brightness(1.2) saturate(1.1) blur(0.8px)", "2000s")}
                    className={`p-2 rounded ${selectedFilter === "2000s" ? "bg-yellow-500 text-black" : "text-white bg-[#36363C] hover:bg-[#4A4A52]"}`}
                >
                    2000's
                </button>
                <button
                    onClick={() => handleFilterChange("grayscale(1) contrast(1.0) brightness(1)", "Noir")}
                    className={`p-2 rounded ${selectedFilter === "Noir" ? "bg-yellow-500 text-black" : "text-white bg-[#36363C] hover:bg-[#4A4A52]"}`}
                >
                    Noir
                </button>
                <button
                    onClick={() => {
                        setCrosshatchActive(true);
                        setSelectedFilter("Crosshatch");
                    }}
                    className={`p-2  rounded ${selectedFilter === "Crosshatch" ? "bg-yellow-500 text-black" : "text-white bg-[#36363C] hover:bg-[#4A4A52]"}`}
                >
                    Crosshatch
                </button>
            </div>
            <div className=" bg-[#524C28] hover:bg-[#7A7135] hover:scale-104 rounded-full w-[90px] h-[90px]  hover:cursor-pointer p-1 flex justify-center items-center my-4 mx-auto">
                <button disabled={click} onClick={btnClick} className="rounded-full w-[95%] h-[95%] bg-[#FDC700] flex justify-center items-center hover:bg-[#FFE100] hover:cursor-pointer">
                    <img src={cam} alt="Capture" className="w-[50%] h-[50%] hover:cursor-pointer" />
                </button>

            </div>

           
           {visible &&( <div className="overflow-y-auto scrollbar-hide absolute rounded-2xl border-[#3F3F47] border-8 top-20 left-1/2 transform -translate-x-1/2 bg-[#27272A] text-black w-11/12  md:w-1/2 sm:h-[650px] h-[400px] flex  flex-row z-50">
                {/* Left Side (White Background) */}
                <div className="  h-[300px] sm:h-[500px] rounded-lg w-[65%] bg-[#131315] ">
                    <img src={final} alt="final_image" className="mx-auto md:w-[300px] sm:w-[300px] w-[120px] my-10 rotate-5" />
                </div>

                {/* Right Side (Dark Background with Centered Buttons) */}
                <div className="bg-[#27272A]  h-full  w-[35%] flex flex-col justify-center items-center p-4 rounded-lg">
                    <button onClick={()=>{
                        if (!final) return; // Ensure the image exists before saving

                        const link = document.createElement("a");
                        link.href = final;
                        link.download = `PixelBooth_${new Date().toISOString()}.png`; // Unique filename
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }} className="bg-[#FFDF20] w-23 sm:w-40 sm:text-[15px] h-10 rounded-lg font-semibold text-[12px] flex items-center justify-center mb-3 hover:cursor-pointer hover:bg-[#CCAB14]">
                        <img src={save} alt="save" className="w-[15px] mr-2" />
                        Save Photos
                    </button>
                    <button onClick={()=>{setVisible(false);
                        setImages([]);
                    }} className="text-[white] bg-[#3F3F47] w-[90px] text-[10px] sm:text-[15px] sm:w-40 h-10 rounded-lg font-semibold hover:bg-[#55555F] hover:cursor-pointer">
                        Take more Photos
                    </button>
                </div>
            </div>)}




        </>
    );
}

export default WebbCam;
