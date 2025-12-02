import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapView, useMapData, useMap, Label, useMapViewEvent } from '@mappedin/react-sdk';
import { DynamicFocus } from '@mappedin/dynamic-focus';
import Keyboard from './Components/Keyboard';

interface MappedinProps {
    onBackToMenu?: () => void;
}

function MyCustomComponent() {
    const { mapData, mapView } = useMap();
    const [selectedSpace, setSelectedSpace] = useState<any>(null);
    const [dynamicFocus, setDynamicFocus] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const spaces = useMemo(
        () => (mapData?.getByType('space') ?? []).filter((space: any) => space?.name?.trim()),
        [mapData]
    );
    const yardSpace = useMemo(() => spaces.find((s: any) => s.name === 'Yard'), [spaces]);
    const filteredSpaces = useMemo(() => {
        if (!searchQuery) return spaces;
        return spaces.filter((space: any) =>
            space?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [spaces, searchQuery]);

    const navigateToDestination = useCallback(async (destination: any) => {
        if (!mapView || !mapData || !yardSpace || !destination) {
            console.warn('Yard veya hedef bulunamadı.');
            return;
        }

        try {
            mapView.Navigation.clear();
            const directions = await mapData.getDirections(yardSpace, destination);
            if (directions) {
                mapView.Navigation.draw(directions, {
                    pathOptions: {
                        displayArrowsOnPath: true,
                        animateArrowsOnPath: true,
                        accentColor: '#4248FF',
                        color: '#4248FF',
                        pulseColor: '#4248FF',
                    },
                    markerOptions: {
                        departureColor: '#22c55e',
                        destinationColor: '#ef4444',
                    }
                });

                console.log(`Yol tarifi çizildi (kamera sabit): Yard -> ${destination.name}`);
            }
        } catch (error) {
            console.error('Yol tarifi oluşturulamadı:', error);
        }
    }, [mapData, mapView, yardSpace]);

    // Enable Dynamic Focus and interactivity for all spaces
    useEffect(() => {
        if (mapData && mapView && !dynamicFocus) {
            // Create and enable Dynamic Focus
            const df = new DynamicFocus(mapView as any);
            df.enable({
                autoFocus: true, // Automatically focus on buildings as camera moves
                setFloorOnFocus: true, // Automatically switch floors when focusing on a building
                indoorZoomThreshold: 18, // Zoom level at which indoors are revealed
                outdoorZoomThreshold: 17, // Zoom level at which indoors are hidden
                indoorAnimationOptions: {
                    duration: 300, // Animation duration for revealing indoors
                },
                outdoorAnimationOptions: {
                    duration: 300, // Animation duration for hiding indoors
                }
            });
            setDynamicFocus(df);

            // Set each space to be interactive with hover effect
            mapData.getByType('space').forEach((space: any) => {
                mapView.updateState(space, {
                    interactive: true,
                    hoverColor: '#4248FF', // Custom hover color
                });
            });

            console.log('Dynamic Focus enabled! Yaklaştıkça katların içi görünecek.');
        }

        // Cleanup on unmount
        return () => {
            if (dynamicFocus) {
                dynamicFocus.destroy();
            }
        };
    }, [mapData, mapView, dynamicFocus]);

    const handleSpaceSelect = useCallback(async (space: any) => {
        if (!space) return;
        setSelectedSpace(space);
        setSearchQuery(space.name ?? '');
        setShowDropdown(false);
        await navigateToDestination(space);
    }, [navigateToDestination]);

    const handleKeyboardKeyPress = useCallback((key: string) => {
        const input = searchInputRef.current;
        if (!input) return;

        let start = input.selectionStart ?? searchQuery.length;
        let end = input.selectionEnd ?? searchQuery.length;
        const value = searchQuery;

        const updateValue = (newValue: string, caretPos: number) => {
            setSearchQuery(newValue);
            setShowDropdown(true);
            requestAnimationFrame(() => {
                input.focus();
                input.setSelectionRange(caretPos, caretPos);
            });
        };

        if (key === 'BACKSPACE') {
            if (start !== end) {
                const newValue = value.slice(0, start) + value.slice(end);
                updateValue(newValue, start);
            } else if (start > 0) {
                const newValue = value.slice(0, start - 1) + value.slice(end);
                updateValue(newValue, start - 1);
            }
        } else if (key === 'LEFT') {
            const newPos = start > 0 ? start - 1 : 0;
            requestAnimationFrame(() => {
                input.focus();
                input.setSelectionRange(newPos, newPos);
            });
        } else if (key === 'RIGHT') {
            const newPos = start < value.length ? start + 1 : value.length;
            requestAnimationFrame(() => {
                input.focus();
                input.setSelectionRange(newPos, newPos);
            });
        } else if (key === 'SPACE') {
            const newValue = value.slice(0, start) + ' ' + value.slice(end);
            updateValue(newValue, start + 1);
        } else {
            const newValue = value.slice(0, start) + key + value.slice(end);
            updateValue(newValue, start + key.length);
        }
    }, [searchQuery]);

    // Handle click events and wayfinding
    useMapViewEvent('click', async (event: any) => {
        if (event?.spaces?.length > 0) {
            const clickedSpace = event.spaces[0];
            console.log('Clicked on space:', clickedSpace.name);
            await handleSpaceSelect(clickedSpace);
        } else {
            // Clicked on empty area - clear selection and navigation
            setSelectedSpace(null);
            if (mapView) {
                mapView.Navigation.clear();
            }
        }
    });

    // Handle hover events
    useMapViewEvent('hover', (event: any) => {
        if (event?.spaces?.length > 0) {
            console.log('Hovering over:', event.spaces[0].name);
        }
    });

    return (
        <>
            {/* Search Bar */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                width: '300px',
                zIndex: 1100
            }}>
                <input
                    type="text"
                    placeholder="Lokasyon ara..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    ref={searchInputRef}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                    }}
                />
                {showDropdown && filteredSpaces.length > 0 && (
                    <div style={{
                        marginTop: '6px',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                        maxHeight: '320px',
                        overflowY: 'auto',
                        border: '1px solid #e5e7eb'
                    }}>
                        {filteredSpaces.map((space: any) => (
                            <button
                                key={space.id}
                                onClick={() => handleSpaceSelect(space)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #f3f4f6',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                {space.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Add interactive labels to all spaces */}
            {spaces.map((space: any) => {
                return (
                    <Label 
                        key={space.id} 
                        target={space.center} 
                        text={space.name}
                        options={{ interactive: true }}
                    />
                );
            })}

            {/* Show selected space info with navigation */}
            {selectedSpace && (
                <div style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    maxWidth: '280px'
                }}>
                    <button 
                        onClick={() => {
                            setSelectedSpace(null);
                            if (mapView) {
                                mapView.Navigation.clear();
                            }
                        }}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ✕
                    </button>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#4248FF' }}>
                        🎯 {selectedSpace.name}
                    </h3>
                    <p style={{ margin: '8px 0', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                        <strong>📍 Başlangıç:</strong> Yard
                    </p>
                    <p style={{ margin: '8px 0', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                        <strong>🚶 Hedef:</strong> {selectedSpace.name}
                    </p>
                    <div style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#0369a1'
                    }}>
                        ℹ️ Yol tarifi haritada gösteriliyor
                    </div>
                </div>
            )}

            <div style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1100,
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
            }}>
                <Keyboard onKeyPress={handleKeyboardKeyPress} />
            </div>
        </>
    );
}

const mappedin: React.FC<MappedinProps> = ({ onBackToMenu }) => {
    const { isLoading, error, mapData } = useMapData({
        key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
        secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
        mapId: "682e13a2703478000b567b66",
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    return mapData ? (
        <div style={{ width: '100%', height: '100vh' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <MapView mapData={mapData}>
                    <MyCustomComponent />
                </MapView>
                {onBackToMenu && (
                    <button
                        onClick={onBackToMenu}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 1200,
                            backgroundColor: '#4248FF',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '100px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(66, 72, 255, 0.3)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                            e.currentTarget.style.borderRadius = '100px';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#4248FF';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderRadius = '100px';
                        }}
                    >
                        Ana Menü
                    </button>
                )}
            </div>
        </div>
    ) : null;
}

export default mappedin




