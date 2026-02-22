import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FileText, RotateCcw } from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import { Line } from 'react-chartjs-2';

const ResultsPage = () => {
    const { state } = useLocation();
    const score = state?.score || 72;
    const rawRisks = state?.risks || {
        'flood': { level: 'Medium', value: 50 },
        'heat': { level: 'High', value: 80 },
        'storm': { level: 'Low', value: 30 },
        'sea_level': { level: 'Low', value: 10 }
    };

    const projectionData = state?.projection || [
        { year: 2030, risk: 20 },
        { year: 2040, risk: 35 },
        { year: 2050, risk: 55 },
        { year: 2060, risk: 70 },
        { year: 2070, risk: 85 }
    ];

    const timelineData = {
        labels: projectionData.map(d => d.year.toString()),
        datasets: [{
            label: 'Projected Risk (%)',
            data: projectionData.map(d => d.risk),
            borderColor: '#ff9f43',
            backgroundColor: 'rgba(255, 159, 67, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ff9f43',
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#bdbdbd', font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 9, 5, 0.9)',
                titleFont: { family: 'Outfit' },
                bodyFont: { family: 'Inter' },
                padding: 12,
                borderColor: 'rgba(255, 159, 67, 0.3)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: { color: '#888', font: { size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#888', font: { size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        animation: {
            duration: 1500,
            easing: 'easeOutQuart'
        }
    };

    return (
        <div className="results-container">
            <div className="results-grid">
                <GlassCard className="score-card">
                    <h2 style={{ marginBottom: '2rem' }}>Climate Credit Score</h2>
                    <div className="score-circle" style={{ '--score': score }}>
                        <div className="score-inner">
                            <span>{score}</span>
                        </div>
                    </div>

                    <div className={`loan-impact ${score >= 80 ? 'safe' : ''}`}>
                        <h3>Loan Adjustment Recommendation</h3>
                        <p>{score >= 80 ? 'Low climate risk. Standard interest rates apply.' : 'High exposure. Recommend +0.25% risk premium on loan pricing.'}</p>
                    </div>
                </GlassCard>

                <GlassCard className="risk-card">
                    <h3>Top Risk Factors</h3>
                    <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                        {Object.entries(rawRisks).map(([risk, data]) => (
                            <li key={risk} style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: '500', color: '#eee' }}>
                                        {risk.replace('_', ' ')}
                                    </span>
                                    <span className={`badge ${data.level.toLowerCase()}`}>{data.level}</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${data.value}%`,
                                        height: '100%',
                                        background: data.level === 'High' ? 'var(--accent-red)' : data.level === 'Medium' ? 'var(--accent-green)' : '#00ff9d',
                                        boxShadow: `0 0 10px ${data.level === 'High' ? 'var(--accent-red)' : data.level === 'Medium' ? 'var(--accent-green)' : '#00ff9d'}`
                                    }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </GlassCard>

                <GlassCard className="timeline-card">
                    <h3>Climate Risk Projection (2030-2070)</h3>
                    <div style={{ height: '300px', marginTop: '1rem' }}>
                        <Line data={timelineData} options={chartOptions} />
                    </div>
                </GlassCard>

                <div style={{ gridColumn: 'span 12', textAlign: 'center', marginTop: '2rem' }}>
                    <button onClick={() => window.print()} className="btn btn-outline">
                        <FileText size={18} /> Download Report
                    </button>
                    &nbsp;
                    <Link to="/analysis" className="btn btn-primary">
                        <RotateCcw size={18} /> Analyze Another Property
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
