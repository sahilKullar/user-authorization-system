import axios from "axios";

const API_URL = "http://localhost:4000/api";

const signup = ({ firstName, lastName, username, email, password }) =>
  axios.post(`${API_URL}/signup`, {
    firstName,
    lastName,
    username,
    email,
    password,
  });

const login = ({ emailOrUsername, password }) =>
  axios
    .post(`${API_URL}/login`, { emailOrUsername, password })
    .then((response) => {
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    });

const logout = () => localStorage.removeItem("user");

const getCurrentUser = () => localStorage.getItem("user");

const AuthService = { signup, login, logout, getCurrentUser };

export default AuthService;
