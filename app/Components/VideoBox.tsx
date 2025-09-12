export default function VideoBox(props: any) {
    return (
      <div className="w-full h-full flex rounded-sm overflow-hidden items-center justify-center bg-black">
        <video
          ref={props.video}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ backgroundColor: "black" }}
        ></video>
        <audio ref={props.audio} autoPlay></audio>
      </div>
    );
  }