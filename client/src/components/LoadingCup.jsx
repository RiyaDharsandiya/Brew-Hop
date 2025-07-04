import { Player } from "@lottiefiles/react-lottie-player";
import coffeeCup from "../assets/coffee-cup.json";

const LoadingCup = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white flex items-center justify-center z-[9999]">
      <Player
        autoplay
        loop
        src={coffeeCup}
        className="w-100 h-100"
      />
    </div>
  );
};

export default LoadingCup;
