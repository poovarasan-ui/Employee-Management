import React, { useState, useEffect, useRef } from 'react';

export default function ScanData() {
    // 1. Pre-stored Master Database
    const [storedMasterRecords] = useState([
        { snOrImei: '865931087398038', model: 'Smart Meter Gen-1', manufacturer: 'Zenith Tech', status: 'Active' },
        { snOrImei: 'ZEN0000004', model: 'ZenMeter Pro', manufacturer: 'Zenith Tech', status: 'Active' },
        { snOrImei: 'S26072010553231', model: 'ZenMeter Lite', manufacturer: 'Zenith Tech', status: 'Active' },
        { snOrImei: 'DS2208-SR0007ZZK', model: 'Zebra Scanner Unit', manufacturer: 'Zebra Corp', status: 'Active' }
    ]);

    // 2. Main Scans History State
    const [scans, setScans] = useState(() => {
        const saved = localStorage.getItem('postgresql_scans');
        return saved ? JSON.parse(saved) : [
            { 
                id: 8, 
                qrCode: '{"imei_no":"865931087398038","comms_technology":"12"}', 
                meterSn: '865931087398038', 
                scannerDevice: 'Zebra / QR Scanner Device (DS2208)', 
                batch: 'BATCH-2026-A1', 
                model: 'Smart Meter Gen-1', 
                manufacturer: 'Zenith Tech', 
                date: '09:39 am 16/09/2026', 
                status: 'PASS' 
            }
        ];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [activeBatch, setActiveBatch] = useState('BATCH-2026-A1');
    const [activeScannerDevice, setActiveScannerDevice] = useState('Zebra / QR Scanner Device (DS2208)');
    const [currentInput, setCurrentInput] = useState('');
    
    // Alert & Side Popup states
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success'); 
    const [sidePopupData, setSidePopupData] = useState(null); // Side popup notification card
    const [duplicateMatchInfo, setDuplicateMatchInfo] = useState(null); // Side-by-side duplicate modal

    const inputRef = useRef(null);

    // Keep focus locked on input for hardware scanner gun
    useEffect(() => {
        const interval = setInterval(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem('postgresql_scans', JSON.stringify(scans));
    }, [scans]);

    // Helper: Parse S/N or IMEI from raw text or JSON QR code strings
    const parseCodeData = (rawCode) => {
        try {
            if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
                const parsedObj = JSON.parse(rawCode);
                const extractedValue = parsedObj.imei_no || parsedObj.serial_number || parsedObj.s_no || parsedObj.sn;
                if (extractedValue) {
                    return { cleanSn: extractedValue };
                }
            }
        } catch (e) {
            // Not JSON
        }
        return { cleanSn: rawCode };
    };

    // Process scan from hardware gun / input
    const handleScanSubmit = (e) => {
        if (e.key === 'Enter') {
            const rawCode = currentInput.trim();
            if (!rawCode) return;

            const { cleanSn } = parseCodeData(rawCode);

            // Check if already exists in history (Duplicate check)
            const existingRecord = scans.find(item => {
                const storedRaw = String(item.qrCode || '').trim();
                const storedSn = String(item.meterSn || '').trim();
                return storedRaw === rawCode || storedSn === cleanSn;
            });

            if (existingRecord) {
                setAlertType('error');
                setAlertMessage(`⚠️ Duplicate Alert: Code "${cleanSn}" is already stored in records!`);
                setDuplicateMatchInfo({
                    scannedCode: rawCode,
                    record: existingRecord
                });
                setCurrentInput('');
                return;
            }

            // Find matching record in Stored Master Database
            const storedInfo = storedMasterRecords.find(item => item.snOrImei === cleanSn) || {
                model: 'Unknown / Unregistered Model',
                manufacturer: 'N/A',
                status: 'Unregistered'
            };

            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
            const dateStr = now.toLocaleDateString('en-GB');
            const formattedDate = `${timeStr} ${dateStr}`;

            const newEntry = {
                id: Date.now(),
                qrCode: rawCode,
                meterSn: cleanSn,
                scannerDevice: activeScannerDevice,
                batch: activeBatch,
                model: storedInfo.model,
                manufacturer: storedInfo.manufacturer,
                date: formattedDate,
                status: 'PASS'
            };

            setScans(prev => [newEntry, ...prev]);
            setCurrentInput('');
            
            setAlertType('success');
            setAlertMessage(`✅ Scanned & saved successfully: ${cleanSn}`);
            
            // Trigger Side Popup Notification Card
            setSidePopupData(newEntry);
        }
    };

    const handleClearDatabase = () => {
        if (window.confirm("Are you sure you want to clear all scan history?")) {
            setScans([]);
            localStorage.removeItem('postgresql_scans');
        }
    };

    // Search filter
    const filteredScans = scans.filter(scan => {
        if (!searchTerm || !searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase().trim();
        
        const qrCodeStr = scan.qrCode ? String(scan.qrCode).toLowerCase() : '';
        const meterSnStr = scan.meterSn ? String(scan.meterSn).toLowerCase() : '';
        const modelStr = scan.model ? String(scan.model).toLowerCase() : '';
        const batchStr = scan.batch ? String(scan.batch).toLowerCase() : '';

        return qrCodeStr.includes(query) || 
               meterSnStr.includes(query) || 
               modelStr.includes(query) || 
               batchStr.includes(query);
    });

    return (
        <div style={{ padding: '24px', fontFamily: 'Inter, Segoe UI, sans-serif', background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
            
            {/* 1. SIDE POPUP TOAST NOTIFICATION (BOTTOM-RIGHT) */}
            {sidePopupData && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '24px', 
                    right: '24px', 
                    width: '380px', 
                    background: '#ffffff', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                    border: '1px solid #cbd5e1', 
                    zIndex: 9999, 
                    overflow: 'hidden',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <div style={{ background: '#0284c7', color: '#fff', padding: '10px 16px', fontSize: '13px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⚡ New QR Scan Detected</span>
                        <button 
                            onClick={() => setSidePopupData(null)} 
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                            &times;
                        </button>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(sidePopupData.qrCode)}`} 
                            alt="Scanned QR" 
                            style={{ width: '70px', height: '70px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', padding: '2px', flexShrink: 0 }} 
                        />
                        <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5', overflow: 'hidden' }}>
                            <div style={{ fontWeight: '700', color: '#0284c7', fontSize: '13px' }}>{sidePopupData.model}</div>
                            <div><b>S/N:</b> {sidePopupData.meterSn}</div>
                            <div><b>Batch:</b> {sidePopupData.batch}</div>
                            <div style={{ color: '#64748b', fontSize: '11px' }}>🕒 {sidePopupData.date}</div>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '8px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => setSidePopupData(null)} 
                            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* 2. SIDE-BY-SIDE DUPLICATE MATCH COMPARISON MODAL */}
            {duplicateMatchInfo && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#ffffff', width: '580px', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #fee2e2' }}>
                        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
                            ⚠️ Duplicate Match Found (Already Stored in Database!)
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>📷 Newly Scanned QR</p>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(duplicateMatchInfo.scannedCode)}`} 
                                    alt="Scanned QR" 
                                    style={{ width: '100px', height: '100px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '4px', background: '#fff', marginBottom: '8px' }} 
                                />
                                <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#334155' }}>{duplicateMatchInfo.scannedCode}</p>
                            </div>

                            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#166534' }}>💾 Stored Database Record (#{duplicateMatchInfo.record.id})</p>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(duplicateMatchInfo.record.qrCode)}`} 
                                    alt="Stored QR" 
                                    style={{ width: '100px', height: '100px', borderRadius: '6px', border: '1px solid #bbf7d0', padding: '4px', background: '#fff', marginBottom: '8px' }} 
                                />
                                <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#334155' }}>{duplicateMatchInfo.record.qrCode}</p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left', background: '#fffbeb', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', border: '1px solid #fde68a' }}>
                            <p style={{ margin: '0 0 4px 0', color: '#92400e', fontWeight: '600' }}>✓ Match Status: Verified Identical Code Data</p>
                            <p style={{ margin: '0 0 4px 0' }}><strong>Model:</strong> {duplicateMatchInfo.record.model} | <strong>Batch:</strong> {duplicateMatchInfo.record.batch}</p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}><strong>Original Scan Time:</strong> {duplicateMatchInfo.record.date}</p>
                        </div>

                        <button 
                            onClick={() => setDuplicateMatchInfo(null)} 
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>
                            Close & Resume Scanning
                        </button>
                    </div>
                </div>
            )}

            {/* Dashboard Header */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>PostgreSQL Scan & Generated QR Records Portal</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Scan items using your hardware scanner gun to view side popup details instantly.</p>
            </div>

            {/* Scanner Input Panel */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px', marginBottom: '12px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>ACTIVE BATCH</label>
                        <select value={activeBatch} onChange={(e) => setActiveBatch(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600', background: '#fff', color: '#0284c7' }}>
                            <option value="BATCH-2026-A1">BATCH-2026-A1</option>
                            <option value="BATCH-2026-A2">BATCH-2026-A2</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>SCANNER DEVICE</label>
                        <select value={activeScannerDevice} onChange={(e) => setActiveScannerDevice(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600', background: '#fff', color: '#0f172a' }}>
                            <option value="Zebra / QR Scanner Device (DS2208)">Zebra / QR Scanner Device (DS2208)</option>
                            <option value="Handheld Barcode Reader Model-B">Handheld Barcode Reader Model-B</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>HARDWARE SCANNER INPUT (READY)</label>
                        <input
                            type="text"
                            ref={inputRef}
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleScanSubmit}
                            placeholder="Scan QR code / Barcode here (Press Enter)..."
                            style={{ width: '100%', padding: '10px 14px', fontSize: '14px', fontFamily: 'monospace', border: '2px solid #0ea5e9', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                {alertMessage && (
                    <div style={{ background: alertType === 'error' ? '#fef2f2' : '#f0fdf4', color: alertType === 'error' ? '#991b1b' : '#166534', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', border: `1px solid ${alertType === 'error' ? '#fecaca' : '#bbf7d0'}`, fontWeight: '600' }}>
                        {alertMessage}
                    </div>
                )}
            </div>

            {/* Main History Table */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>POSTGRESQL SCAN HISTORY (Total: {scans.length})</h3>
                        <button onClick={handleClearDatabase} style={{ background: '#fff', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Clear DB</button>
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Search by code data or QR..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ padding: '8px 12px', width: '280px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none' }} 
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase' }}>
                            <th style={{ padding: '10px' }}>S.No</th>
                            <th style={{ padding: '10px' }}>Generated QR Code</th>
                            <th style={{ padding: '10px' }}>Scanned Code Data</th>
                            <th style={{ padding: '10px' }}>Scanner Device Info</th>
                            <th style={{ padding: '10px' }}>Stored Master Data Record</th>
                            <th style={{ padding: '10px' }}>Date & Time</th>
                            <th style={{ padding: '10px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredScans.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                                    No scan records match your search keyword.
                                </td>
                            </tr>
                        ) : (
                            filteredScans.map((scan, index) => (
                                <tr key={scan.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 10px', color: '#64748b', fontWeight: '600' }}>#{scans.length - index}</td>
                                    
                                    <td style={{ padding: '12px 10px' }}>
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(scan.qrCode)}`} 
                                            alt="Generated QR" 
                                            style={{ width: '50px', height: '50px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', padding: '2px' }} 
                                        />
                                    </td>

                                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', wordBreak: 'break-all', maxWidth: '180px' }}>
                                        {scan.qrCode}
                                    </td>

                                    <td style={{ padding: '12px 10px', color: '#475569', fontWeight: '600' }}>
                                        🖨️ {scan.scannerDevice}
                                    </td>

                                    <td style={{ padding: '12px 10px' }}>
                                        <div style={{ fontWeight: '700', color: '#0284c7', fontSize: '13px' }}>{scan.model}</div>
                                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                                            📦 Batch: <b>{scan.batch}</b> &bull; S/N: <b>{scan.meterSn}</b> &bull; Mfg: {scan.manufacturer}
                                        </div>
                                    </td>

                                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>🕒 {scan.date}</td>
                                    <td style={{ padding: '12px 10px' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>✓ Saved</span>
                                            <button onClick={() => setScans(scans.filter(s => s.id !== scan.id))} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}