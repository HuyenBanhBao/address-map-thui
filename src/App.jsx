import { useEffect, useMemo, useState } from "react";
import "./App.css";

const DEFAULT_LOCATION = { latitude: 10.7769, longitude: 106.7009 };

function makeMapUrl({ latitude, longitude }) {
    const distance = 0.015;
    const bbox = [longitude - distance, latitude - distance, longitude + distance, latitude + distance].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

function App() {
    const [location, setLocation] = useState(DEFAULT_LOCATION);
    const [status, setStatus] = useState("Đang xin quyền truy cập vị trí…");
    const [accuracy, setAccuracy] = useState(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setStatus("Trình duyệt này không hỗ trợ định vị.");
            return;
        }

        setStatus("Đang xác định vị trí của bạn…");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setLocation({ latitude: coords.latitude, longitude: coords.longitude });
                setAccuracy(Math.round(coords.accuracy));
                setStatus("Đã cập nhật vị trí hiện tại");
            },
            (error) => {
                setStatus(
                    error.code === error.PERMISSION_DENIED
                        ? "Bạn đã từ chối quyền vị trí."
                        : "Không thể lấy vị trí lúc này. Vui lòng thử lại.",
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
        );
    };

    useEffect(() => {
        getLocation();
    }, []);
    const mapUrl = useMemo(() => makeMapUrl(location), [location]);

    return (
        <main className="app-shell">
            <header className="topbar">
                <div className="brand-mark" aria-hidden="true">
                    V
                </div>
                <div>
                    <p className="eyebrow">PHẦN MỀM GIÁM SÁT VÀ RA CHỈ THỊ CHO MẬP THÚI</p>
                    <h1>Vị trí hiện tại của mập thúi</h1>
                </div>
                <p className="status">
                    <span className="status-dot" />
                    {status}
                </p>
            </header>

            <div className="workspace">
                <aside className="sidebar" aria-label="Chức năng">
                    <p className="sidebar-label">CHỨC NĂNG</p>
                    <nav>
                        <button className="nav-button active" type="button">
                            <span>⌖</span>Bản đồ
                        </button>
                        <button className="nav-button" type="button" disabled>
                            <span>⌑</span>Địa điểm đã lưu
                        </button>
                        <button className="nav-button" type="button" disabled>
                            <span>◷</span>Lịch sử vị trí
                        </button>
                    </nav>
                    <div className="sidebar-footer">Các chức năng mới sẽ được bổ sung tại đây.</div>
                </aside>

                <section className="map-panel" aria-label="Bản đồ vị trí hiện tại">
                    <iframe title="Bản đồ OpenStreetMap tại vị trí của bạn" src={mapUrl} loading="eager" />
                    <div className="map-controls">
                        <button type="button" onClick={getLocation}>
                            <span>⌖</span>Cập nhật vị trí
                        </button>
                        <div className="coordinates">
                            <span>
                                {location.latitude.toFixed(6)}°, {location.longitude.toFixed(6)}°
                            </span>
                            <small>{accuracy ? `Độ chính xác ±${accuracy} m` : "Đang cập nhật độ chính xác"}</small>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default App;
