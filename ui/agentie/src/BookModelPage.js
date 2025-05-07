import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./BookModelPage.css";
import { Link } from "react-router-dom";

const BookModelPage = ({ modelPictures }) => {
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const { nume, prenume } = useParams();
  const modelPicture = modelPictures[nume] || "https://via.placeholder.com/150";
  const [similarModels, setSimilarModels] = useState([]);
  const [showSimilarModels, setShowSimilarModels] = useState(false);
  const fetchSimilarModels = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5009/api/Agentie/GetSimilarModels?nume=${nume}&prenume=${prenume}`
      );
      setSimilarModels(response.data);
      setShowSimilarModels(true);
    } catch (error) {
      console.error("Error fetching similar models:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5009/api/Agentie/GetModelEvents?nume=${nume}&prenume=${prenume}`
      );
      setEvents(response.data);
      setShowTable(true);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5009/api/Agentie/GetModelReviews?nume=${nume}&prenume=${prenume}`
      );
      setReviews(response.data);
      setShowReviews(true);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const [contractData, setContractData] = useState({
    dataSemnarii: "",
    suma: "",
    oras: "",
  });

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert("Please log in to create a contract");
        return;
      }

      const response = await axios.post(
        "http://localhost:5009/api/Agentie/CreateContract",
        {
          email: userEmail,
          modelNume: nume,
          modelPrenume: prenume,
          dataSemnarii: new Date(contractData.dataSemnarii).toISOString(),
          suma: parseInt(contractData.suma),
          oras: contractData.oras,
        }
      );

      if (response.data) {
        alert("Contract created successfully!");
        setShowContractModal(false);
        setContractData({
          dataSemnarii: "",
          suma: "",
          oras: "",
        });
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      alert(
        `Error creating contract: ${error.response?.data || error.message}`
      );
    }
  };

  return (
    <div className="book-model-page">
      <div className="model-header">
        <img
          src={modelPicture}
          alt={`${nume} ${prenume}`}
          className="model-profile-image"
        />
        <h1>
          Model Profile: {nume} {prenume}
        </h1>
      </div>

      <div className="button-group">
        <button
          className="book-now-button"
          onClick={() => setShowContractModal(true)}
        >
          Book Now
        </button>
        {!showTable ? (
          <button className="see-events-button" onClick={fetchEvents}>
            See Model Events
          </button>
        ) : (
          <button className="hide-button" onClick={() => setShowTable(false)}>
            Hide Events
          </button>
        )}
        {!showReviews ? (
          <button className="see-reviews-button" onClick={fetchReviews}>
            Show Reviews
          </button>
        ) : (
          <button className="hide-button" onClick={() => setShowReviews(false)}>
            Hide Reviews
          </button>
        )}
        {!showSimilarModels ? (
          <button className="see-similar-button" onClick={fetchSimilarModels}>
            Show Similar Models
          </button>
        ) : (
          <button
            className="hide-button"
            onClick={() => setShowSimilarModels(false)}
          >
            Hide Similar Models
          </button>
        )}
      </div>

      {showContractModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Contract</h2>
            <form onSubmit={handleContractSubmit}>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={contractData.dataSemnarii}
                  onChange={(e) =>
                    setContractData({
                      ...contractData,
                      dataSemnarii: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={contractData.suma}
                  onChange={(e) =>
                    setContractData({
                      ...contractData,
                      suma: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>City:</label>
                <input
                  type="text"
                  value={contractData.oras}
                  onChange={(e) =>
                    setContractData({
                      ...contractData,
                      oras: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  Create Contract
                </button>
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTable && (
        <div className="table-section">
          <h2>Events</h2>
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Hours Participated</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>{event.NumeEveniment}</td>
                  <td>{new Date(event.Data).toLocaleDateString()}</td>
                  <td>{event.OreParticipare}</td>
                  <td>{event.Rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReviews && (
        <div className="table-section">
          <h2>Reviews</h2>
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr key={index}>
                  <td>{review.ClientNume}</td>
                  <td>{review.Rating} ⭐</td>
                  <td>{review.Comentarii}</td>
                  <td>{new Date(review.Data).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showSimilarModels && (
        <div className="table-section">
          <h2>Similar Models</h2>
          <table className="similar-models-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rating</th>
                <th>Events</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {similarModels.map((model, index) => (
                <tr key={index}>
                  <td>{`${model.Nume} ${model.Prenume}`}</td>
                  <td>{model.AvgRating?.toFixed(1)} ⭐</td>
                  <td>{model.EventCount}</td>
                  <td>
                    <Link
                      to={`/book-model/${model.Nume}/${model.Prenume}`}
                      onClick={() => setShowSimilarModels(false)}
                    >
                      <button className="view-profile-button">
                        View Profile
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookModelPage;
