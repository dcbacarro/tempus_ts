import { LottieOptions, useLottie } from 'lottie-react';
import loaderAnimation from '../../assets/loader.json';

const Loader = () => {
  const options: LottieOptions = {
    animationData: loaderAnimation,
    loop: true,
    autoplay: true,
    style: {
      transform: 'scale(0.5)',
    },
  };

  const { View } = useLottie(options);

  return View;
};

export default Loader;
