import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  html,
  body,
  #app {
    height: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #d8d8d8;
    background-color: #191622;
    line-height: 1.15;
    -webkit-user-select: none;
    user-select: none;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .project-button {
    margin-top: 32px;
    width: 124px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: linear-gradient(270deg, #91FF23 0%, #008506 100%);
    box-shadow: 2px 2px 7px 0 rgba(0,0,0,0.29);
    border-radius: 12px;
    border: 0;
    color: #ffffff;
  }

  .project-button:focus {
    outline: none;
  }

  .timer-main {
    margin-top: 19px;
    font-size: 46px;
    color: #ffffff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.42);
    display: flex;
    flex-direction: row;

    & > .num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      margin: 0 4px;
    }
  }

  .date-main {
    font-size: 14px;
    opacity: 0.2;
    color: #ffffff;
  }

  .start-stop {
    border: 0;
    height: 64px;
    width: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: linear-gradient(135deg, #038300 0%, #A5FF0D 100%);
    box-shadow: 4px 4px 4px 0 rgba(0,0,0,0.25);
    margin: 0 42px;
  }

  .start-stop:focus {
    outline: none;
  }

  .start-stop:active {
    background-image: linear-gradient(135deg, #03a500 0%, #9bf500 100%);
  }

  .button-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 32px;
  }

  .button-small {
    background: rgba(82,108,77,0.13);
    box-shadow: 2px 2px 4px 0 rgba(0,0,0,0.21);
    height: 36px;
    width: 36px;
    border-radius: 18px;
    border: 0;
  }

  .button-small:focus {
    outline: none;
  }

  .button-small:disabled {
    box-shadow: none;
    opacity: 0.3;
  }

  form.login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  form.login > input {
    box-sizing: border-box;
    border: 0;
    margin-bottom: 10px;
    width: 80vw;
    height: 30px;
    padding: 0 10px;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.2);
    color: #ffffff;
    box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.1);
  }

  form.login > input:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.1);
  }

  form.login > button {
    border: 0;
    height: 30px;
    width: 80vw;
    border-radius: 5px;
    background-color: #038300;
    color: #ffffff;
    font-weight: bold;
    box-shadow: 4px 4px 4px 0 rgba(0,0,0,0.1);
  }

  form.login > button:focus {
    outline: none;
  }

  form.login > button:active {
    background-color: #0e5f0d;
  }

  .spinner {
    position: fixed;
    top: 4px;
    right: 4px;
    z-index: 99;
    opacity: 0;
  }

  .version {
    display: block;
    margin-top: 10px;
    font-size: 10px;
    opacity: 0.3;
  }
`
