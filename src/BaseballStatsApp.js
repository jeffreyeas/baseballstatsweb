import React, { useState, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Paper, Typography, Button, CircularProgress, TextField } from '@mui/material';
import { Edit, X, Zap } from 'lucide-react';

// --- Configuration Constants ---
// NOTE: Using the correct public API URL as confirmed by the user
const FULL_PLAYERS_URL = 'https://api.hirefraction.com/api/test/baseball';
// NOTE: Placeholder for your C# API, which will be integrated later
const LOCAL_API_BASE_URL = 'http://localhost:5058/api/Baseball';


// Define the required 18 columns with their exact keys from the API
const COLUMN_CONFIG = [
  { header: 'Player', key: 'Player name', width: 'w-48', sortable: false, editable: false },
  { header: 'Position', key: 'position', width: 'w-16', sortable: false, editable: false },
  { header: 'Games', key: 'Games', width: 'w-24', sortable: false, editable: true },
  { header: 'At Bat', key: 'At-bat', width: 'w-24', sortable: false, editable: true },
  { header: 'Runs', key: 'Runs', width: 'w-24', sortable: false, editable: true },
  { header: 'Hits', key: 'Hits', width: 'w-24', sortable: true, editable: true }, 
  { header: '2B', key: 'Double (2B)', width: 'w-24', sortable: false, editable: true },
  { header: '3B', key: 'third baseman', width: 'w-24', sortable: false, editable: true },
  { header: 'HR', key: 'home run', width: 'w-24', sortable: true, editable: true }, 
  { header: 'RBI', key: 'run batted in', width: 'w-24', sortable: false, editable: true }, 
  { header: 'Walks', key: 'a walk', width: 'w-24', sortable: false, editable: true },
  { header: 'Strikeouts', key: 'Strikeouts', width: 'w-24', sortable: false, editable: true },
  { header: 'Stolen Bases', key: 'stolen base', width: 'w-16', sortable: false, editable: true },
  { header: 'Caught Stealing', key: 'Caught stealing', width: 'w-16', sortable: false, editable: true },
  { header: 'AVG', key: 'AVG', width: 'w-20', sortable: false, editable: true }, 
  { header: 'OBP', key: 'On-base Percentage', width: 'w-20', sortable: false, editable: false },
  { header: 'SLG', key: 'Slugging Percentage', width: 'w-20', sortable: false, editable: false },
  { header: 'OPS', key: 'On-base Plus Slugging', width: 'w-20', sortable: false, editable: false },
  { header: 'Actions', key: 'actions', width: 'w-24', sortable: false, editable: false }, 
];

// Define which keys can be edited 
const editableKeys = ['Games', 'At-bat', 'Runs', 'Hits','Double (2B)', 
  'third baseman', 'home run', 'run batted in', 'a walk', 'Strikeouts', 'stolen base', 'Caught Stealing'];

// --- MUI Theme for Aesthetics ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
  },
});

// --- Helper Components ---

// Component for the LLM Analysis Display
const AnalysisDisplay = ({ selectedPlayer, analysisResult, isLoading, onClose }) => (
  <Paper className="p-4 mb-6 shadow-xl rounded-xl bg-blue-50 border-blue-200 border">
    <div className="flex justify-between items-start">
      <Typography variant="h6" className="text-blue-700 flex items-center mb-2">
        <Zap className="w-5 h-5 mr-2 text-blue-500" />
        LLM Insight: {selectedPlayer['Player name']}
      </Typography>
      <Button onClick={onClose} size="small" variant="text" color="inherit" className="text-gray-500 hover:text-gray-900">
        Close <X className="w-4 h-4 ml-1" />
      </Button>
    </div>
    {isLoading ? (
      <div className="flex items-center text-blue-600">
        <CircularProgress size={20} className="mr-2" />
        <Typography variant="body2">Generating insights...</Typography>
      </div>
    ) : (
      <Typography variant="body2" component="pre" className="whitespace-pre-wrap p-2 bg-white rounded border border-gray-200 text-gray-800">
        {analysisResult || "Analysis not found. Click 'Analyze' to generate a description."}
      </Typography>
    )}
  </Paper>
);

// --- Main Application Component ---
function BaseballStatsApp() {
  const [playerData, setPlayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'Hits', direction: 'desc' });
  const [editingRow, setEditingRow] = useState(null); // ID of the player being edited
  const [editFormData, setEditFormData] = useState({}); // Data currently in the edit fields

  // State for the LLM Analysis Feature
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // --- Data Fetching and Deduplication ---

  // NOTE: useCallback removed for local development simplicity as per user request
  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(FULL_PLAYERS_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();

      console.log(data);

      // Deduplication: Filter to ensure only one entry per unique player name
      const playerMap = new Map();
      let counter = 1;
      for (const player of data) {
        const key = player['Player name'];
        if (!playerMap.has(key)) {
          player.id = counter++;   // ✅ simple numeric ID for demo purposes
          player.Id = player.id;   // ensure both properties exist consistently
          playerMap.set(key, player);
        }
      }

      const uniquePlayers = Array.from(playerMap.values());
      setPlayerData(uniquePlayers);

    } catch (err) {
      console.error("Failed to fetch player data:", err);
      setError(`Failed to load data: ${err.message}. Check network connection or public API status.`);
    } finally {
      setLoading(false);
    }
  };


    const fetchUpdatedPlayers = async () => {
   
    try {
      const response = await fetch(LOCAL_API_BASE_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();
     
    } catch (err) {
     
    } finally {
      
    }
  };








  useEffect(() => {
    fetchPlayers();
    fetchUpdatedPlayers();
  }, []); // Run only once on mount

  // --- Sorting Logic ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    // Sort logic must explicitly compare numbers
    const sortedData = [...playerData].sort((a, b) => {
      const aVal = parseFloat(a[key]);
      const bVal = parseFloat(b[key]);

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setPlayerData(sortedData);
    setSortConfig({ key, direction });
  };

  // --- Editing Logic (Local State Management) ---

  const handleEditClick = (player) => {
    setEditingRow(player.id);
    // Initialize form data with current player data
    const initialData = {};
    COLUMN_CONFIG.forEach(col => {
      if (editableKeys.includes(col.key)) {
        initialData[col.key] = player[col.key];
      }
    });
    setEditFormData(initialData);
  };

  const handleEditChange = (key, value) => {
    setEditFormData(prev => ({
      ...prev,
      [key]: ['Hits', 'home run', 'run batted in', 'AVG'].includes(key)
        ? Number(value)
        : value,
    }));
  };



  const handleSaveEdit = async () => {
    setLoading(true);

    // 1. Prepare the Payload
    try {
      const player = playerData.find(p => p.id === editingRow || p.Id === editingRow);

      // Ensure you use a reliable ID property, assuming the model uses 'id' lowercase
      const playerId = player?.id || player?.Id;

      if (!playerId) {
        throw new Error("Could not find a valid ID for the row being edited.");
      }

      const payload = {
        // Use the actual ID for the payload
        id: playerId,
        name: player["Player name"],
        position: player.position,
        hits: Number(editFormData["Hits"]),
        homeRun: Number(editFormData["home run"]),
        runBattedIn: Number(editFormData["run batted in"]),
        avg: parseFloat(editFormData["AVG"]),
      };

      let finalResponse;
      const url = `${LOCAL_API_BASE_URL}/${playerId}`;
      const headers = { 'Content-Type': 'application/json' };

      // --- 2. Check for Player Existence (GET Request) ---
      const checkResponse = await fetch(url, { method: 'GET' });

      if (checkResponse.ok) {
        // --- 3. Player EXISTS: Run PUT Request (UPDATE) ---
        console.log(`Player with ID ${playerId} found. Running PUT (Update).`);
        finalResponse = await fetch(url, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(payload),
        });

      } else if (checkResponse.status === 404) {
        // --- 4. Player DOES NOT EXIST: Run POST Request (INSERT) ---
        console.log(`Player with ID ${playerId} not found. Running POST (Insert).`);

        // IMPORTANT: For POST (Create), you usually remove the ID from the payload 
        // so the database can generate a new one. The URL is also just the base path.

        const postPayload = { ...payload };
        delete postPayload.id;

        finalResponse = await fetch(LOCAL_API_BASE_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(postPayload),
        });

      } else {
        // Handle unexpected errors during the check
        throw new Error(`Failed to check player existence: ${checkResponse.status}`);
      }

      // --- 5. Handle Final Response ---
      if (!finalResponse.ok) {
        throw new Error(`Failed to save (final step): ${finalResponse.status}`);
      }

      // Note: Both POST (201 Created) and PUT (200 OK or 204 No Content) 
      // should return the updated/created player object, or you can refetch.
      const savedPlayer = finalResponse.status === 204 ? payload : await finalResponse.json();

      // --- 6. Update Local State ---
      const updatedData = playerData.map(p =>
        // Use the returned ID for comparison
        p.id === savedPlayer.id ? { ...p, ...savedPlayer } : p
      );

      // For POST, add the new player to the list
      if (finalResponse.status === 201 && !updatedData.some(p => p.id === savedPlayer.id)) {
        updatedData.push(savedPlayer);
      }

      setPlayerData(updatedData);
      setEditingRow(null);

    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save edit — check console.');
    } finally {
      setLoading(false);
    }
  };


  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  // --- LLM Analysis Logic (Triggered by Player Name Click) ---

  const handleAnalyzePlayer = useCallback(async (player) => {
    if (analysisLoading) return;

    setSelectedPlayer(player);
    setAnalysisResult('');
    setAnalysisLoading(true);

    try {
      // *** SIMULATION: Replace this with a real fetch to your C# GenerateDescription endpoint ***
      // Example: const response = await fetch(`${LOCAL_API_BASE_URL}/Analyze`, { method: 'POST', ... });

      // SIMULATION: Simulate a network delay and a mock LLM response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const playerStatsSummary = COLUMN_CONFIG
        .filter(c => c.key !== 'actions')
        .map(c => `${c.header}: ${player[c.key]}`)
        .join(', ');

      const mockDescription = `
        Player Analysis for ${player['Player name']} (${player.position}):

        Based on these stats, the LLM provides the following insight:
        ${player['Player name']} has shown impressive longevity with ${player.Games} games played and is a strong offensive presence with ${player.Hits} hits and ${player['home run']} home runs. 
        His AVG of ${player.AVG} suggests consistency at the plate, while his OBP and SLG show excellent plate discipline and power production.
        
        Raw Stats: 
        ${playerStatsSummary}
      `;
      setAnalysisResult(mockDescription);

    } catch (err) {
      setAnalysisResult(`Error generating analysis: Failed to connect to local C# API.`);
      console.error("LLM Analysis Error:", err);
    } finally {
      setAnalysisLoading(false);
    }
  }, [analysisLoading, COLUMN_CONFIG]);


  // --- Render Functions ---

  const renderTableCell = (player, column) => {
    const key = column.key;
    const isEditing = editingRow === player.id;
    const isEditable = editableKeys.includes(key);

    // Player Name Link (Trigger for LLM Analysis)
    if (key === 'Player name') {
      return (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleAnalyzePlayer(player); }}
          className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {player[key]}
        </a>
      );
    }

    // Editable Text Field
    if (isEditing && isEditable) {
      return (
        <TextField
          size="small"
          value={editFormData[key] || ''}
          onChange={(e) => handleEditChange(key, e.target.value)}
          type="text"
          sx={{ width: 120 }}   // Or 150, 200 — whatever looks good
        />
      );
    }

    // Default Cell Content
    return player[key];
  };

  const renderActionCell = (player) => {
    const isEditing = editingRow === player.id;

    if (isEditing) {
      return (
        <div className="flex space-x-2">
          <Button
            onClick={handleSaveEdit}
            size="small"
            variant="contained"
            color="primary"
            className="text-xs px-2 py-1"
            disabled={analysisLoading}
          >
            Save
          </Button>
          <Button
            onClick={handleCancelEdit}
            size="small"
            variant="outlined"
            color="inherit"
            className="text-xs px-2 py-1"
            disabled={analysisLoading}
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={() => handleEditClick(player)}
        size="small"
        variant="outlined"
        color="inherit"
        className="text-xs px-2 py-1 text-gray-700 hover:bg-gray-100"
        disabled={analysisLoading}
      >
        <Edit className="w-3 h-3 mr-1" />
        Edit Stats
      </Button>
    );
  };

  // --- Main Render ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
        <Typography className="ml-4">Loading player data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" className="py-12">
        <Paper className="p-8 bg-red-50 border border-red-400">
          <Typography variant="h5" color="error" gutterBottom>
            Data Loading Error
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
          <Typography variant="body2" className="mt-4 text-gray-700">
            Ensure the public API URL ({FULL_PLAYERS_URL}) is correct and accessible.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="bg-gray-50 min-h-screen py-12">
        <Container maxWidth={false} className="px-12">
          <Typography variant="h4" component="h1" className="mb-6 text-gray-800 font-bold">
            MLB Player Statistics Tracker
          </Typography>

          {/* LLM Analysis Display */}
          {selectedPlayer && (
            <AnalysisDisplay
              selectedPlayer={selectedPlayer}
              analysisResult={analysisResult}
              isLoading={analysisLoading}
              onClose={() => setSelectedPlayer(null)}
            />
          )}

          {/* Player Table */}
          <Paper elevation={3} className="rounded-xl overflow-x-auto shadow-2xl">
            <div className="min-w-full">
              <table className="min-w-full bg-white border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 sticky top-0">
                    {COLUMN_CONFIG.map((column) => (
                      <th
                        key={column.key}
                        className={`p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer ${column.width}`}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center">
                          {column.header}
                          {column.sortable && (
                            <span className="ml-1 text-gray-400">
                              {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '—'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {playerData.map((player) => (
                    <tr key={player.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      {COLUMN_CONFIG.map((column) => (
                        <td
                          key={`${player.id}-${column.key}`}
                          className={`p-3 text-sm text-gray-800 align-top text-left ${column.width}`}
                        >
                          {column.key === 'actions' ? renderActionCell(player) : renderTableCell(player, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Paper>
          <Typography variant="caption" className="mt-4 block text-center text-gray-500">
            Total Players Displayed: {playerData.length}
          </Typography>
        </Container>
      </div>
    </ThemeProvider>
  );
}



export default BaseballStatsApp;