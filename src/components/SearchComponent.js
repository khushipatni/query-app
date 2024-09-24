import './SearchComponent.css';  // Import the CSS file for custom styles
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS import
import { FaMoon } from 'react-icons/fa'; // Import sun and moon icons from react-icons
import { PiSunFill } from "react-icons/pi";
import axios from 'axios'
import logo from '../csoda.png'; // Adjust the path accordingly


const SearchComponent = () => {
  const [database, setDatabase] = useState('');
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [queriedData, setQueriedData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // New state variable

  const API_URL = 'http://your-ec2-public-dns:3001';

  const handleSearch = () => {
    console.log('Searching...');
    setLoading(true);
    setQueriedData([]); 
    setErrorMessage(''); // Clear previous error messages
    setHasSearched(true); // Mark that a search has been performed
    let formattedStartDate = new Date(startDate).toISOString();
    let formattedEndDate = new Date(endDate).toISOString();
    
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${API_URL}/data?startDate=${encodeURIComponent(formattedStartDate)}&endDate=${encodeURIComponent(formattedEndDate)}&keyword=${encodeURIComponent(query)}&db=${encodeURIComponent(database)}`,
      headers: { 
        'Content-Type': 'application/json'
      }
    };   

    console.log(config)
    axios.request(config)
    .then(response => {
        const notes = response.data;
        console.log(notes);
        setQueriedData(notes); // Assuming notes is an array of data
        setErrorMessage('');
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      setErrorMessage(`Error: ${errorMessage}. Please try again.`);
      alert('An error occurred. Please check your inputs and try again.'); // Alert the user for immediate feedback
    })
    .finally(() => {
      setLoading(false); // Stop loading
    });
  };

  function jsonToCSV(json) {
    if (!Array.isArray(json) || json.length === 0) {
        throw new Error('Invalid JSON data: must be a non-empty array.');
    }

    const keys = Object.keys(json[0]); // Assumes all objects in the array have the same keys
    const csvRows = [];

    // Add header
    csvRows.push(keys.join(','));

    // Add rows
    for (const row of json) {
        const values = keys.map(key => {
            const escaped = ('' + row[key]).replace(/"/g, '\\"'); // Escape double quotes
            return `"${escaped}"`; // Wrap values in quotes
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n'); // Return CSV string
}

  const triggerDownload = (blob, filename) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (type) => {
    console.log(`Downloading ${type}...`);
    setErrorMessage('');
    
    let formattedStartDate = new Date(startDate).toISOString();
    let formattedEndDate = new Date(endDate).toISOString();
    
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${API_URL}/${type}?startDate=${encodeURIComponent(formattedStartDate)}&endDate=${encodeURIComponent(formattedEndDate)}&keyword=${encodeURIComponent(query)}&db=${encodeURIComponent(database)}`,
        headers: { 
            'Content-Type': 'application/json'
        }
    };   

    console.log(config);
    axios.request(config)
    .then(response => {
        const notes = response.data;
        console.log(notes);

        let csvData = jsonToCSV(notes);
        const blob = new Blob([csvData], { type: 'text/csv' });
        triggerDownload(blob, `queried_${type}.csv`);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      setErrorMessage(`Error: ${errorMessage}. Please try again.`);
      alert('An error occurred. Please check your inputs and try again.'); // Alert the user for immediate feedback
    });
};


  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <Container fluid className="main-container">
        {/* Dark/Light mode toggle button with moon and sun icons */}
        <Button
          className="toggle-mode btn btn-light"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <PiSunFill size={30} /> : <FaMoon size={20} />}
        </Button>

        <Row className="content-container">
          {/* Left side: Search and Download Section */}
          <Col md={4} className="left-side">
            {/* <div className="logo-container text-left mb-3">
                <img src={logo} alt="Logo" className="logo" />
            </div> */}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Database</Form.Label>
                <Form.Select value={database} onChange={(e) => setDatabase(e.target.value)}>
                  <option>Select database</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Query</Form.Label>
                <Form.Control type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Date Range</Form.Label>
                  <div className="d-flex justify-content-center">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="form-control me-2"
                    />
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      className="form-control"
                    />
                  </div>
                </Form.Group>


              <Button variant="primary" onClick={handleSearch}>Search</Button>

              <div className="mt-3 d-flex justify-content-center">
                <Button variant="secondary" onClick={() => handleDownload('data')} className="me-2">
                  Download
                </Button>
                <Button variant="secondary" onClick={() => handleDownload('url')} className="me-2">
                  Download URL
                </Button>
                <Button variant="secondary" onClick={() => handleDownload('metadata')}>
                  Download Metadata
                </Button>
              </div>


              {/* Instructions Section: Moved below download buttons */}
              <div className="instructions mt-3">
                <h4>Instructions</h4>
                <p>Select a database (Twitter or Facebook) from the dropdown menu.</p>
                <p>Enter your search query in the text box.</p>
                <p>Choose a date range for your search.</p>
                <p>Click the "Search" button to perform the search.</p>
                <p>View the results in the table on the right.</p>
                <p>Use the download buttons to export the data, URLs, or metadata as needed.</p>
              </div>
            </Form>
          </Col>

          {/* Right side: Space for the queried table */}
          <Col md={7} className="right-side">
            <div className="queried-table-placeholder">
              <h5>Queried Data</h5>
              {loading ? (
                <p>Searching for the queried data...</p>
              ) : !hasSearched ? (
                <p>Search for data.</p> // Show this only if no search has been performed
              ) : hasSearched && queriedData.length === 0 && !errorMessage ? (
                <p>No data found.</p> // Show this when no data is returned
              ) : (
                <>
                  {errorMessage && <div style={{ color: 'red' }}>{`Server Error. ${errorMessage}`}</div>}

                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User Username</th>
                      <th>ID</th>
                      <th>Total Posts</th>
                      <th>Week of Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queriedData.map((note, index) => (
                      <tr key={index + 1}>
                        <td>{index + 1}</td>
                        <td>{note.user_username}</td>
                        <td>{note.author_id}</td>
                        <td>{note.total_posts}</td>
                        <td>{note.week_of_month}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SearchComponent;
