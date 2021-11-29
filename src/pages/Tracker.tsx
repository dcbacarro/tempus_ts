import cogIcon from '../../assets/cog.svg';
import playIcon from '../../assets/play.svg';
import pauseIcon from '../../assets/pause.svg';
import noteIcon from '../../assets/note.svg';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import Loading from './Loading';
import { logout } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Tracker = () => {
  const [isFullLoading, setFullLoading] = useState(false);
  const [isRunning, setRunning] = useState(window.Main.getTimerStatus());
  const [dateString, setDateString] = useState(dayjs().format('ddd, MMM DD'));
  const [time, setTime] = useState('00:00:00');
  const navigate = useNavigate();

  useEffect(() => {
    window.Main.triggerEvent('request-time');

    window.Main.on('tick', (t: string) => {
      setTime(t);
      setDateString(dayjs().format('ddd, MMM DD'));
    });

    window.Main.on('timer_status', (status: boolean) => {
      setRunning(status);
    });

    window.Main.on('logout', async () => {
      setFullLoading(true);
      await logout();
      window.Main.triggerEvent('update-tray');
      setFullLoading(false);
      navigate('/');
    });

    return () => {
      window.Main.unsubscribe('tick');
    };
  }, []);

  const tp = useMemo(() => {
    return time.split(':');
  }, [time]);

  return (
    <>
      <button type="button" className="project-button">
        Software
      </button>
      <span className="timer-main">
        <span className="num">{ tp[0] }</span>
        <span>:</span>
        <span className="num">{ tp[1] }</span>
        <span>:</span>
        <span className="num">{ tp[2] }</span>
      </span>
      <span className="date-main">{dateString}</span>
      <div className="button-row">
        <button type="button" className="button-small" disabled>
          <img src={cogIcon} alt="Settings Icon" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (isRunning) {
              setRunning(false);
              window.Main.pauseTimer();
            } else {
              setRunning(true);
              window.Main.startTimer();
            }
          }}
          className="start-stop"
        >
          <img
            src={isRunning ? pauseIcon : playIcon}
            alt="Timer Icon"
          />
        </button>
        <button type="button" className="button-small" disabled>
          <img src={noteIcon} alt="Tasks Icon" />
        </button>
      </div>
      {isFullLoading && <Loading />}
    </>
  );
};

export default Tracker;
