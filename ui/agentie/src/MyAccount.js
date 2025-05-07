import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyAccount.css";
import { Link } from "react-router-dom";
import axios from "axios";

function MyAccount() {
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [contracts, setContracts] = useState([]);
  const [cities, setCities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [userName, setUserName] = useState("");
  const [showModifyBox, setShowModifyBox] = useState(false);
  const [modifyType, setModifyType] = useState(""); // "username" or "password"
  const [newPassword, setNewPassword] = useState("");
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [newSum, setNewSum] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

  const [filters, setFilters] = useState({
    sex: "",
    oras: "",
    dataSemnarii: "",
    minSum: "",
    maxSum: "",
  });

  const clearFilters = () => {
    setFilters({
      sex: "",
      oras: "",
      dataSemnarii: "",
      minSum: "",
      maxSum: "",
    });
    fetchContracts();
  };
  const handleModifySum = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5009/api/Agentie/ModifyContractSum?contractId=${selectedContractId}&newSum=${newSum}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Contract sum modified successfully");
        setShowModifyModal(false);
        setNewSum("");
        fetchContracts(); // Refresh the contracts list
      } else {
        alert("Failed to modify contract sum");
      }
    } catch (error) {
      console.error("Error modifying contract sum:", error);
      alert("Error modifying contract sum");
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(
        `http://localhost:5009/api/Agentie/DeleteAccount?mail=${encodeURIComponent(
          email
        )}&parola=${encodeURIComponent(password)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Account deleted successfully.");
      } else {
        setMessage(data.message || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setMessage("An error occurred. Please check the console for details.");
    }
  };

  const fetchContracts = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      let url = `http://localhost:5009/api/Agentie/GetContractsWithFilters?email=${encodeURIComponent(
        userEmail
      )}`;

      if (filters.sex) url += `&sex=${encodeURIComponent(filters.sex)}`;
      if (filters.oras) url += `&oras=${encodeURIComponent(filters.oras)}`;
      if (filters.dataSemnarii)
        url += `&dataSemnarii=${encodeURIComponent(filters.dataSemnarii)}`;
      if (filters.minSum)
        url += `&minSum=${encodeURIComponent(filters.minSum)}`;
      if (filters.maxSum)
        url += `&maxSum=${encodeURIComponent(filters.maxSum)}`;

      const response = await fetch(url);
      const data = await response.json();
      setContracts(data.contracts);
      setCities(data.cities);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const fetchFeedbackHistory = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(
        `http://localhost:5009/api/Agentie/GetClientFeedbackHistory?email=${encodeURIComponent(
          userEmail
        )}`
      );
      const data = await response.json();
      setFeedbackHistory(data);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchContracts();
    setShowFilters(false);
  };
  const handleModifyPassword = async () => {
    try {
      const response = await fetch(
        "http://localhost:5009/api/Agentie/ModifyPassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            currentPassword: password,
            newPassword: newPassword,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Password modified successfully");
        document.getElementById("modify-password-box").style.display = "none";
        setEmail("");
        setPassword("");
        setNewPassword("");
      } else {
        alert("Failed to modify password");
      }
    } catch (error) {
      console.error("Error modifying password:", error);
      alert("An error occurred while modifying password");
    }
  };
  const handleDeleteContract = async (contractId) => {
    try {
      const response = await fetch(
        `http://localhost:5009/api/Agentie/DeleteContract?contractId=${contractId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setContracts(
          contracts.filter((contract) => contract.IDContract !== contractId)
        );
        alert("Contract deleted successfully");
      } else {
        alert("Failed to delete contract");
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      alert("An error occurred while deleting the contract");
    }
  };

  return (
    <div className="account-container">
      <h2>My Account</h2>
      <div className="user-email">
        <p>{userEmail}</p>
      </div>
      <div id="modify-password-box" style={{ display: "none" }}>
        <h3>Modify Password</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter current password"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
        <div className="modal-buttons">
          <button onClick={handleModifyPassword}>Confirm Change</button>
          <button
            onClick={() => {
              document.getElementById("modify-password-box").style.display =
                "none";
              setEmail("");
              setPassword("");
              setNewPassword("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="user-info">
        <div className="info-row">
          <p>Password: *******</p>
          <button
            className="modify-button"
            onClick={() => {
              document.getElementById("modify-password-box").style.display =
                "block";
            }}
          >
            Modify Password
          </button>
        </div>
      </div>

      <div className="account-actions">
        <button
          onClick={() => {
            setShowContracts(!showContracts);
            if (!showContracts) fetchContracts();
          }}
        >
          My Contracts
        </button>

        <button
          onClick={() => {
            setShowFeedback(!showFeedback);
            if (!showFeedback) fetchFeedbackHistory();
          }}
        >
          My Feedback History
        </button>

        <Link to="/">
          <button>Book a Model</button>
        </Link>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <button
        className="delete-account-button"
        onClick={() => {
          document.getElementById("delete-box").style.display = "block";
        }}
      >
        Delete My Account
      </button>

      <div id="delete-box" style={{ display: "none" }}>
        <h3>Confirm Account Deletion</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          I am sure that I want to delete my account.
        </label>
        <button onClick={handleDeleteAccount}>Confirm Deletion</button>
        {message && <p className="error-message">{message}</p>}
      </div>

      {showContracts && (
        <div className="contracts-section">
          <div className="contracts-header">
            <h3>My Contracts</h3>
            <button
              className="filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {showFilters && (
            <div className="filters-section">
              <div className="filter-category">
                <h4>Fotomodele</h4>
                <select
                  name="sex"
                  value={filters.sex}
                  onChange={handleFilterChange}
                >
                  <option value="">Select Sex</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                <select
                  name="oras"
                  value={filters.oras}
                  onChange={handleFilterChange}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-category">
                <h4>Data Semnarii</h4>
                <input
                  type="date"
                  name="dataSemnarii"
                  value={filters.dataSemnarii}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-category">
                <h4>Suma</h4>
                <input
                  type="number"
                  name="minSum"
                  placeholder="Min Sum"
                  value={filters.minSum}
                  onChange={handleFilterChange}
                />
                <input
                  type="number"
                  name="maxSum"
                  placeholder="Max Sum"
                  value={filters.maxSum}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-buttons">
                <button onClick={applyFilters}>Apply Filters</button>
                <button onClick={clearFilters}>Clear Filters</button>
              </div>
            </div>
          )}

          <div className="contracts-list">
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <div key={contract.IDContract} className="contract-card">
                  <div className="contract-buttons">
                    <button
                      className="modify-button"
                      onClick={() => {
                        setSelectedContractId(contract.IDContract);
                        setShowModifyModal(true);
                      }}
                    >
                      Modify
                    </button>
                    <button
                      className="delete-contract-button"
                      onClick={() => handleDeleteContract(contract.IDContract)}
                    >
                      Delete
                    </button>
                  </div>
                  <p>
                    Model: {contract.NumeFotomodel} {contract.PrenumeFotomodel}
                  </p>
                  <p>City: {contract.Oras}</p>
                  <p>
                    Date: {new Date(contract.DataSemnarii).toLocaleDateString()}
                  </p>
                  <p>Sum: {contract.Suma}</p>
                  <p>Client: {contract.NumeClient}</p>
                </div>
              ))
            ) : (
              <p className="no-contracts">No contracts found</p>
            )}
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="feedback-section">
          <h3>My Feedback History</h3>
          <div className="feedback-list">
            {feedbackHistory.length > 0 ? (
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>Model Name</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackHistory.map((feedback, index) => (
                    <tr key={index}>
                      <td>{`${feedback.ModelNume} ${feedback.ModelPrenume}`}</td>
                      <td>{feedback.Rating} ⭐</td>
                      <td>{feedback.Comentarii}</td>
                      <td>{new Date(feedback.Data).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-feedback">No feedback history found</p>
            )}
          </div>
        </div>
      )}
      {showModifyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Modify Contract Sum</h2>
            <form onSubmit={handleModifySum}>
              <div className="form-group">
                <label>New Sum:</label>
                <input
                  type="number"
                  value={newSum}
                  onChange={(e) => setNewSum(e.target.value)}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Confirm</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModifyModal(false);
                    setNewSum("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAccount;
