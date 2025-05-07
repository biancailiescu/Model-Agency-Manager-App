import React, { useState, useEffect } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = ({ models, modelPictures }) => {
  const [showDetails, setShowDetails] = useState({});
  const [showRatingSortOptions, setShowRatingSortOptions] = useState(false);
  const [showEarningsSortOptions, setShowEarningsSortOptions] = useState(false);
  const [sortedModels, setSortedModels] = useState(models);
  const [showRatings, setShowRatings] = useState(false);
  const [showEventCount, setShowEventCount] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [showMultipleCities, setShowMultipleCities] = useState(false);

  const handleMultipleCitiesFilter = async () => {
    try {
      if (showMultipleCities) {
        // Reset to original models list
        setSortedModels(models);
        setShowMultipleCities(false);
      } else {
        const response = await fetch(
          "http://localhost:5009/api/Agentie/GetModelsInMultipleCities"
        );
        const data = await response.json();

        const modelsWithPictures = data.map((model) => ({
          ...model,
          picture:
            modelPictures[model.Nume] || "https://via.placeholder.com/150",
        }));

        setSortedModels(modelsWithPictures);
        setShowMultipleCities(true);
        setShowRatings(false);
        setShowEarnings(false);
        setShowEventCount(false);
      }
    } catch (error) {
      console.error("Error fetching models with multiple cities:", error);
    }
  };

  useEffect(() => {
    setSortedModels(models);
  }, [models]);

  const toggleDetails = (index) => {
    setShowDetails((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleRatingSortOptions = () => {
    setShowRatingSortOptions(!showRatingSortOptions);
    setShowEarningsSortOptions(false);
  };

  const toggleEarningsSortOptions = () => {
    setShowEarningsSortOptions(!showEarningsSortOptions);
    setShowRatingSortOptions(false);
  };

  const handleSort = async (order) => {
    try {
      const response = await fetch(
        `http://localhost:5009/api/Agentie/GetModelsByFeedback?sortOrder=${order}`
      );
      const data = await response.json();

      const modelsWithPictures = data.map((model) => ({
        ...model,
        picture: modelPictures[model.Nume] || "https://via.placeholder.com/150",
      }));

      setSortedModels(modelsWithPictures);
      setShowRatings(true);
      setShowEarnings(false);
      setShowEventCount(false);
      setShowRatingSortOptions(false);
    } catch (error) {
      console.error("Error fetching sorted models:", error);
    }
  };

  const handleAboveAverageFilter = async () => {
    try {
      if (isFiltered) {
        setSortedModels(models);
        setShowEventCount(false);
        setShowRatings(false);
        setShowEarnings(false);
        setIsFiltered(false);
      } else {
        const response = await axios.get(
          "http://localhost:5009/api/Agentie/GetAboveAverageModels"
        );

        const modelsWithPictures = response.data.map((model) => ({
          ...model,
          picture:
            modelPictures[model.Nume] || "https://via.placeholder.com/150",
        }));
        setSortedModels(modelsWithPictures);
        setShowEventCount(true);
        setShowRatings(false);
        setShowEarnings(false);
        setIsFiltered(true);
      }
    } catch (error) {
      console.error("Error fetching above average models:", error);
    }
  };

  const handleEarningsSort = async (order) => {
    try {
      const response = await fetch(
        `http://localhost:5009/api/Agentie/GetModelsByEarnings?sortOrder=${order}`
      );
      const data = await response.json();

      const modelsWithPictures = data.map((model) => ({
        ...model,
        picture: modelPictures[model.Nume] || "https://via.placeholder.com/150",
      }));

      setSortedModels(modelsWithPictures);
      setShowEarnings(true);
      setShowRatings(false);
      setShowEventCount(false);
      setShowEarningsSortOptions(false);
    } catch (error) {
      console.error("Error fetching sorted models:", error);
    }
  };

  return (
    <div className="main-content">
      <h1 className="website-title">Aura Modelling Agency</h1>
      <p className="description">
        Welcome to Aura Modelling Agency, where beauty meets professionalism.
        Our goal is to empower models and provide them with a platform to shine.
        Join us and embark on a journey to success and elegance.
      </p>

      <div className="filters-section">
        <div className="sort-dropdown">
          <button className="sort-button" onClick={toggleRatingSortOptions}>
            Sort by Average Rating
          </button>
          {showRatingSortOptions && (
            <div className="sort-options">
              <div className="sort-option" onClick={() => handleSort("asc")}>
                Ascending
              </div>
              <div className="sort-option" onClick={() => handleSort("desc")}>
                Descending
              </div>
            </div>
          )}
        </div>

        <div className="sort-dropdown">
          <button className="sort-button" onClick={toggleEarningsSortOptions}>
            Sort by Earnings
          </button>
          {showEarningsSortOptions && (
            <div className="sort-options">
              <div
                className="sort-option"
                onClick={() => handleEarningsSort("asc")}
              >
                Ascending
              </div>
              <div
                className="sort-option"
                onClick={() => handleEarningsSort("desc")}
              >
                Descending
              </div>
            </div>
          )}
        </div>

        <button
          className={`filter-by-activity-button ${isFiltered ? "active" : ""}`}
          onClick={handleAboveAverageFilter}
        >
          {isFiltered ? "Reset" : "Show High Activity Models"}
        </button>
        <button
          className="filter-by-cities-button"
          onClick={handleMultipleCitiesFilter}
        >
          {showMultipleCities ? "Reset" : "Show Models in Multiple Cities"}
        </button>
      </div>

      <h1>Our Models</h1>

      <div className="model-list">
        {sortedModels.map((model, index) => (
          <div key={index} className="model-box">
            <div className="model-photo">
              <img src={model.picture} alt={`${model.Nume} ${model.Prenume}`} />
            </div>
            <div className="model-name">
              <b>
                {model.Nume} {model.Prenume}
              </b>
            </div>
            {showEventCount && (
              <div className="event-count">
                Events participated: {model.EventCount}
              </div>
            )}
            {showEarnings && (
              <div className="earnings-info">
                Total Earnings: ${model.TotalEarnings}
              </div>
            )}
            {showMultipleCities && (
              <div className="cities-info">
                <p>Number of Cities: {model.CityCount}</p>
                <p>Cities: {model.Cities}</p>
              </div>
            )}
            <button
              className="details-button"
              onClick={() => toggleDetails(index)}
            >
              Details
            </button>
            <Link to={`/book-model/${model.Nume}/${model.Prenume}`}>
              <button className="details-button">Book Model</button>
            </Link>

            {showDetails[index] && (
              <div className="model-details">
                <p>Oras: {model.Oras}</p>
                <p>Numar de telefon: {model.Telefon}</p>
                <p>Mail: {model.Mail}</p>
              </div>
            )}

            {showRatings && (
              <div className="rating-display">
                Rating: {(model.AverageRating || 0).toFixed(1)}
                <span className="rating-stars">★</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
