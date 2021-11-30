import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from 'react-simple-snackbar';
import logo from '../../assets/icon.png';
import { getEmployee, requestLogin } from "../utils/api";
import Loading from "./Loading";
import packageJson from '../../package.json';

const Login = () => {
  const [usr, setUser] = useState('');
  const [pwd, setPass] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openSnackbar] = useSnackbar();

  useEffect(() => {
    const check = async () => {
      const status = await getEmployee();
      setLoading(false);
      if (status) navigate('tracker');
    };

    check();
  }, [history]);

  const handleLogin = useCallback(
    (event: any) => {
      event.preventDefault();
      const rqst = async () => {
        setLoading(true);
        try {
          const success = await requestLogin(usr, pwd);
          setLoading(false);

          if (success) {
            navigate('tracker');
            window.Main.triggerEvent('update-tray');
          } else {
            openSnackbar('Invalid email or password');
            setPass('');
          }
        } catch (e) {
          setLoading(false);
        }
      };

      rqst();
    },
    [usr, pwd, history]
  );

  return (
    <form onSubmit={handleLogin} className="login">
      <img src={logo} alt="Tempus Logo" width={70} />
      <h3 className="title">Sign In</h3>
      <input
        autoFocus
        value={usr}
        onChange={(e) => setUser(e.target.value)}
        type="text"
        placeholder="Email address"
      />
      <input
        value={pwd}
        onChange={(e) => setPass(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button type="submit" className="signin">
        Sign In
      </button>
      <span className="version">Version { packageJson.version }</span>
      {loading && <Loading />}
    </form>
  );
};

export default Login;
