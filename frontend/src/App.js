import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return <Navbar auth={false} />;
}
