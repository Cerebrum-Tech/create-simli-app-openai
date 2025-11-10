export default function VideoBox(props: any) {
    return (
      <div className="w-full h-full flex rounded-2xl overflow-hidden items-center justify-center bg-black shadow-2xl border-2 border-gray-700">
        <video
          ref={props.video}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
          style={{ backgroundColor: "black" }}
        ></video>
        <audio ref={props.audio} autoPlay></audio>
      </div>
    );
  }