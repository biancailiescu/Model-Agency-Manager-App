import React, { Component } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";
import Login from "./LogIn";
import "./App.css";
import BookModelPage from "./BookModelPage";
import MyAccount from "./MyAccount";

const modelPictures = {
  Anghel: "/assets/Anghel Madalina.jpg",
  Dobre: "/assets/Dobre Dan.jpg",
  Dragomir: "/assets/Dragomir Marius.jpg",
  Dumitru: "/assets/Dumitru Andreea.jpg",
  Georgescu: "/assets/Georgescu Alex.jpg",
  Ionescu: "/assets/Ionescu Mihai.jpg",
  Lazar: "/assets/Lazar Diana.jpg",
  Marinescu: "/assets/Marinescu Radu.jpg",
  Matei: "/assets/Matei Laura.jpg",
  Petrescu: "/assets/Petrescu Anca.jpg",
  Popa: "/assets/Popa Alina.jpg",
  Popescu: "/assets/Popescu Ioana.jpg",
  Rusu: "/assets/Rusu Elena.jpg",
  Stoica: "/assets/Stoica Cristian.jpg",
  Voicu: "/assets/Voicu Sorin.jpg",
};

const BookModelPageWrapper = () => {
  return <BookModelPage modelPictures={modelPictures} />;
};
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      models: [],
      fetchedUsernames: [],
      fetchedPasswords: [],
      inputUsername: "",
      inputPassword: "",
      showLogin: false,
      showDropdown: false,
    };
  }

  API_URL = "http://localhost:5009/";

  componentDidMount() {
    this.refreshNames();
    this.refreshUsernames();
    this.refreshPasswords();
  }

  toggleDropdown = () => {
    this.setState((prevState) => ({
      showDropdown: !prevState.showDropdown,
    }));
  };

  async refreshNames() {
    fetch(this.API_URL + "api/Agentie/GetNumeModel")
      .then((response) => response.json())
      .then((data) => {
        const modelsWithPictures = data.map((model) => ({
          ...model,
          picture:
            modelPictures[model.Nume] || "https://via.placeholder.com/150",
        }));
        this.setState({ models: modelsWithPictures });
      })
      .catch((error) => console.error("Error fetching models:", error));
  }

  async refreshUsernames() {
    fetch(this.API_URL + "api/Agentie/GetUserClient")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ fetchedUsernames: data });
      });
  }

  async refreshPasswords() {
    fetch(this.API_URL + "api/Agentie/GetParolaClient")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ fetchedPasswords: data });
      });
  }

  handleUsernameChange = (event) => {
    this.setState({ inputUsername: event.target.value });
  };

  handlePasswordChange = (event) => {
    this.setState({ inputPassword: event.target.value });
  };

  render() {
    const { models, inputUsername, inputPassword } = this.state;

    return (
      <div className="App">
        <nav className="navbar">
          <ul className="nav-links">
            <li className="dropdown">
              <button onClick={this.toggleDropdown}>Menu</button>
              {this.state.showDropdown && (
                <div className="dropdown-content">
                  <Link to="/">Home</Link>
                  <Link to="/myaccount">My Account</Link>
                </div>
              )}
            </li>
          </ul>
          <div className="auth-buttons">
            <Link to="/login">
              <button className="login-button">Log In</button>
            </Link>
            <Link to="/signup">
              <button className="signup-button">Sign Up</button>
            </Link>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<Home models={models} modelPictures={modelPictures} />}
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/book-model/:nume/:prenume"
            element={<BookModelPageWrapper />}
          />
          <Route
            path="/login"
            element={
              <Login
                inputUsername={inputUsername}
                inputPassword={inputPassword}
                handleUsernameChange={this.handleUsernameChange}
                handlePasswordChange={this.handlePasswordChange}
                fetchedUsernames={this.state.fetchedUsernames}
                fetchedPasswords={this.state.fetchedPasswords}
              />
            }
          />
          <Route path="/myaccount" element={<MyAccount />} />
        </Routes>
      </div>
    );
  }
}

export default App;
