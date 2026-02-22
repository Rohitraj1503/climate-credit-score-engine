import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Crosshair, LoaderCircle, Bolt } from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    ArcElement,
} from 'chart.js';
import { Radar, Line, Pie } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import { API_BASE } from '../services/api';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    ArcElement
);

// Helper component to control map view
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, {
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
};

const AnalysisPage = () => {
    const [mode, setMode] = useState("address");
    const [address, setAddress] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [assetValue, setAssetValue] = useState("1000000");
    const [loanTerm, setLoanTerm] = useState("30");
    const [coords, setCoords] = useState("");
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center default
    const [markerPosition, setMarkerPosition] = useState([20.5937, 78.9629]);

    const setPosition = (pos) => {
        setMapCenter(pos);
        setMarkerPosition(pos);
    };

    // Chart Data States
    const radarData = {
        labels: ['Flood', 'Heat', 'Storm', 'Sea Level', 'Fire'],
        datasets: [{
            label: 'Risk Profile',
            data: [65, 80, 45, 70, 30],
            backgroundColor: 'rgba(255, 159, 67, 0.2)',
            borderColor: '#ff9f43',
            pointBackgroundColor: '#ff9f43',
        }]
    };

    const tempTrendData = {
        labels: ['2000', '2010', '2020', '2030', '2040', '2050'],
        datasets: [{
            label: 'Temp Increase (°C)',
            data: [0.5, 0.8, 1.2, 1.8, 2.5, 3.2],
            borderColor: '#f6b93b',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(246, 185, 59, 0.1)',
        }]
    };

    const compositionData = {
        labels: ['Built Up', 'Greenery', 'Water'],
        datasets: [{
            data: [70, 20, 10],
            backgroundColor: ['#eb4d4b', '#00ff9d', '#ffbe76'],
            borderWidth: 0,
        }]
    };

    // Professional Chart Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#bdbdbd',
                    font: { family: 'Inter', size: 10 }
                }
            }
        }
    };

    const radarOptions = {
        ...commonOptions,
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                    color: "#bdbdbd",
                    backdropColor: "transparent"
                },
                grid: { color: "rgba(255,255,255,0.08)" },
                angleLines: { color: "rgba(255,255,255,0.08)" },
                pointLabels: {
                    color: "#e0e0e0",
                    font: { size: 12, weight: "500", family: 'Outfit' }
                }
            }
        }
    };

    const lineOptions = {
        ...commonOptions,
        plugins: {
            legend: {
                labels: { color: "#f5b041", font: { weight: '600' } }
            }
        },
        scales: {
            x: {
                ticks: { color: "#ccc" },
                grid: { color: "rgba(255,255,255,0.05)" }
            },
            y: {
                ticks: { color: "#ccc" },
                grid: { color: "rgba(255,255,255,0.05)" }
            }
        }
    };

    const pieOptions = {
        ...commonOptions,
        plugins: {
            legend: { position: 'right' }
        }
    };

    const handleLiveLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = [latitude, longitude];
                    const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    setMapCenter(newPos);
                    setMarkerPosition(newPos);
                    setCoords(coordsStr);
                    setAddress(coordsStr);
                    setLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Could not get your location. Please check permissions.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const fetchLocation = async () => {
        if (mode === "address") {
            if (!address) return;
            setLoading(true);
            const url = `${API_BASE}/api/geocode?q=${encodeURIComponent(address)}`;
            console.log(`[DEBUG] API URL: ${url}`);
            console.log(`[DEBUG] Request query: ${address}`);

            try {
                const res = await fetch(url);
                console.log(`[DEBUG] Response status: ${res.status}`);

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error(`[DEBUG] API error:`, errorData);
                    alert(errorData.error || "Location not found");
                    return;
                }

                const data = await res.json();
                console.log(`[DEBUG] API response:`, data);

                const lat = Number(data.lat);
                const lng = Number(data.lng);

                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error("Invalid coordinates received from API");
                }

                console.log(`[DEBUG] Final coordinates: ${lat}, ${lng}`);
                setPosition([lat, lng]);
            } catch (err) {
                console.error("[ERROR] Fetch error:", err);
                alert("Error fetching location. Please check if backend is running on 5001.");
            } finally {
                setLoading(false);
            }
        } else {
            const [lat, lng] = coords.split(",").map(Number);
            if (isNaN(lat) || isNaN(lng)) {
                alert("Invalid coordinates");
                return;
            }
            setPosition([lat, lng]);
        }
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            lat: markerPosition[0],
            lng: markerPosition[1],
            asset_value: Number(assetValue),
            loan_term: Number(loanTerm),
            property_name: propertyName || `Property at ${markerPosition[0].toFixed(4)}, ${markerPosition[1].toFixed(4)}`,
            address: address || `${markerPosition[0].toFixed(4)}, ${markerPosition[1].toFixed(4)}`
        };

        console.log("[DEBUG] Submitting analysis:", payload);

        try {
            const res = await fetch(`${API_BASE}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Analysis failed");

            const result = await res.json();
            console.log("[DEBUG] Analysis result:", result);

            // Navigate to results with real data
            navigate('/results', {
                state: {
                    score: result.score,
                    risks: result.risk_factors,
                    projection: result.projection,
                    id: result.id
                }
            });
        } catch (err) {
            console.error("[ERROR] Analysis error:", err);
            alert("Failed to generate climate score. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analysis-container">
            <div className="analysis-form-panel glass-card" style={{ borderRadius: 0, border: 'none', borderRight: 'var(--glass-border)' }}>
                <h2 style={{ marginBottom: '2rem' }}>Property Analysis</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Property ID / Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. PROP-2024-001"
                            value={propertyName}
                            onChange={(e) => setPropertyName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Search Mode</label>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="address"
                                    checked={mode === "address"}
                                    onChange={(e) => setMode(e.target.value)}
                                    style={{ accentColor: 'var(--accent-green)' }}
                                />
                                Address / Place
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="coordinates"
                                    checked={mode === "coordinates"}
                                    onChange={(e) => setMode(e.target.value)}
                                    style={{ accentColor: 'var(--accent-green)' }}
                                />
                                Coordinates
                            </label>
                        </div>
                    </div>

                    {mode === "address" ? (
                        <div className="form-group">
                            <label className="form-label">Property Address</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g. Mumbai, India"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: '0.75rem' }}
                                    onClick={handleLiveLocation}
                                    title="Use Current Location"
                                >
                                    <Crosshair size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">Coordinates (Lat, Lon)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={coords}
                                    onChange={(e) => setCoords(e.target.value)}
                                    placeholder="e.g. 19.0760, 72.8777"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: '0.75rem' }}
                                    onClick={handleLiveLocation}
                                    title="Use Current Location"
                                >
                                    <Crosshair size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'center' }}
                        onClick={fetchLocation}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle size={18} className="animate-spin" /> : 'Fetch Location'}
                    </button>
                    <div className="form-group">
                        <label className="form-label">Asset Value ($)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="1000000"
                            value={assetValue}
                            onChange={(e) => setAssetValue(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Loan Term (Years)</label>
                        <select
                            className="form-input"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                        >
                            <option value="15">15 Years</option>
                            <option value="30">30 Years</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-cta" style={{ width: '100%', marginTop: '1rem' }}>
                        <Bolt size={18} /> Generate Score
                    </button>
                </form>

                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--accent-green)' }}>
                        <LoaderCircle size={32} className="animate-spin" />
                        <p style={{ marginTop: '0.5rem' }}>Analyzing climate models...</p>
                    </div>
                )}
            </div>

            <div className="map-panel">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={markerPosition} />
                    <MapController center={mapCenter} />
                </MapContainer>
            </div>

            <div className="analysis-right-panel animate-fade-in">
                <GlassCard className="insight-card">
                    <h3>Regional Risk Profile</h3>
                    <div className="chart-container">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <p className="insight-meta">Aggregated risk factors from local climate models.</p>
                </GlassCard>

                <GlassCard className="insight-card">
                    <h3>Historical Temp. Trend</h3>
                    <div className="chart-container">
                        <Line data={tempTrendData} options={lineOptions} />
                    </div>
                </GlassCard>

                <GlassCard className="insight-card">
                    <h3>Environmental Composition</h3>
                    <div className="chart-container">
                        <Pie data={compositionData} options={pieOptions} />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AnalysisPage;
