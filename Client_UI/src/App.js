import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const App = () => {
    const [genders, setGenders] = useState([]);  // Stores available genders
    const [selectedGender, setSelectedGender] = useState('Male');  // Default gender
    const [selectedAgeRange, setSelectedAgeRange] = useState('10-30');  // Default age range
    const [data, setData] = useState([]);  // Stores client data
    const [loading, setLoading] = useState(false);  // Loading state
    const [error, setError] = useState(null);  // Error state
    const [counts, setCounts] = useState({});  // Stores gender-wise counts

    const API_URL = 'http://localhost:8000/api';  // Your backend API URL

    // Fetch genders on initial render
    const fetchGenders = async () => {
        try {
            const response = await axios.get(`${API_URL}/genders/`);
            setGenders(response.data);
        } catch (err) {
            console.error('Error fetching gender list:', err);
        }
    };

    // Fetch client counts for each gender
    const fetchGenderCounts = async () => {
        try {
            const promises = genders.map(async (gender) => {
                const response = await axios.get(`${API_URL}/countByGender/${gender}/`);
                return { gender, count: response.data.count };
            });
            const results = await Promise.all(promises);
            const countsObj = {};
            results.forEach((item) => {
                countsObj[item.gender] = item.count;
            });
            setCounts(countsObj);
        } catch (err) {
            console.error('Error fetching gender counts:', err);
        }
    };

    // Fetch clients based on selected gender and age range
    const fetchClients = async () => {
        const [lowAge, highAge] = selectedAgeRange.split('-').map(Number);
        const url = `${API_URL}/clientsByAge/${lowAge}/${highAge}/${selectedGender}/`;

        console.log('Fetching clients from:', url);
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(url);
            console.log('Fetched clients:', response.data);
            setData(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Error fetching clients');
        } finally {
            setLoading(false);
        }
    };

    // Fetch genders and initial client data on load
    useEffect(() => {
        const initialize = async () => {
            await fetchGenders();  // Load genders
            fetchClients();  // Fetch initial clients
        };
        initialize();
    }, []);

    // Fetch gender counts whenever the genders are updated
    useEffect(() => {
        if (genders.length > 0) {
            fetchGenderCounts();
        }
    }, [genders]);

    // Fetch clients whenever selectedGender or selectedAgeRange changes
    useEffect(() => {
        fetchClients();
    }, [selectedGender, selectedAgeRange]);

    const handleGenderChange = (gender) => {
        console.log('Changing gender to:', gender);
        setSelectedGender(() => gender);  // Functional state update
        setSelectedAgeRange('10-30');  // Reset age range on gender change
        setData([]);  // Clear previous data
    };

    const handleAgeRangeChange = (ageRange) => {
        console.log('Changing age range to:', ageRange);
        setSelectedAgeRange(ageRange);
        setData([]);  // Clear previous data
    };

    const genderAndRange = (ageRange, gender) => {
        setSelectedGender(() => gender);
        setSelectedAgeRange(ageRange);
        setData([]);  // Clear previous data
    };

    return (
        <div className="container">
            <div className="sidebar">
                {genders.map((gender) => (
                    <div key={gender}>
                        <h2 onClick={() => handleGenderChange(gender)}>
                            {gender} ({counts[gender] || 0})
                        </h2>
                        {['10-30', '30-60', '60-90'].map((ageRange) => (
                            <button
                                key={ageRange}
                                className="age-btn"
                                onClick={() => genderAndRange(ageRange, gender)}
                            >
                                {ageRange}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            <div className="data-display">
                <h3>Clients with age {selectedAgeRange}</h3>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                <table id="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone#</th>
                            <th>SSN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.pty_firstname} {item.pty_lastname}</td>
                                    <td>{item.pty_phone}</td>
                                    <td>{item.pty_ssn}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default App;