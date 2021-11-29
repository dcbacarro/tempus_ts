import Loader from '../components/Loader';

const Loading = () => (
  <main
    style={{
      position: 'fixed',
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(7px)',
    }}
  >
    <Loader />
  </main>
);

export default Loading;
