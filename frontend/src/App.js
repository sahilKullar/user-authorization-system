import React from "react";
import { Link, Route, Routes } from "react-router-dom";

const Home = () => (
  <div>
    <h2> Home </h2>
  </div>
);

const Course = () => (
  <div>
    <h2> Course </h2>
  </div>
);

const Edpresso = () => (
  <div>
    <h2>Edpresso</h2>
  </div>
);

export default function App() {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/course">Course</Link>
          </li>
          <li>
            <Link to="/edpresso">Edpresso</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course" element={<Course />} />
        <Route exact path="/edpresso" element={<Edpresso />} />
      </Routes>
    </>
  );
}
