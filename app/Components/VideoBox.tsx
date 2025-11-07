
export default function VideoBox(props: any) {
    return (
        <div className="aspect-video flex rounded-sm overflow-hidden items-center h-[fit-content] w-[750px] justify-center bg-white mb-32">
            <video ref={props.video} autoPlay playsInline></video>
            <audio ref={props.audio} autoPlay muted={!props.isListening}></audio>
        </div>
    );
}