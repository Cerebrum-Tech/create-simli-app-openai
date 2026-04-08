export default function VideoBox(props: any) {
    return (
      <div className="w-full h-full flex rounded-sm overflow-hidden items-center justify-center bg-white">
        <video
          ref={props.video}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
          style={{ backgroundColor: "white" }}
        ></video>
        <audio ref={props.audio} autoPlay></audio>
      </div>
    );
  }