import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { supabase } from "./supabase";

const DEFAULT_LOCATION = { latitude: 10.7769, longitude: 106.7009 };
const LAST_LOCATION_MS = 10 * 60 * 1000;
const TEAM_MEMBERS = ["Vợ thúi", "Mập"];

function App() {
    const mapElement = useRef(null);
    const map = useRef(null);
    const markers = useRef(new Map());
    const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
    const [people, setPeople] = useState([]);
    const [name, setName] = useState(() => {
        const savedName = localStorage.getItem("map-display-name");
        return TEAM_MEMBERS.includes(savedName) ? savedName : "";
    });
    const [status, setStatus] = useState("Sẵn sàng chia sẻ vị trí");
    const [sharing, setSharing] = useState(false);
    const [configured] = useState(Boolean(supabase));

    useEffect(() => {
        map.current = L.map(mapElement.current, { zoomControl: false }).setView(
            [DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude],
            13,
        );
        L.control.zoom({ position: "topright" }).addTo(map.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map.current);
        return () => map.current?.remove();
    }, []);

    useEffect(() => {
        if (!map.current) return;
        const visible = people.filter(
            (person) => Date.now() - new Date(person.updated_at).getTime() < LAST_LOCATION_MS,
        );
        visible.forEach((person) => {
            const label = `<strong>${escapeHtml(person.display_name)}</strong><br><small>Cập nhật ${new Date(person.updated_at).toLocaleTimeString("vi-VN")}</small>`;
            if (markers.current.has(person.user_id))
                markers.current
                    .get(person.user_id)
                    .setLatLng([person.latitude, person.longitude])
                    .setPopupContent(label);
            else {
                const avatar = person.display_name === "Mập" ? "map" : "vo-thui";
                const marker = L.marker([person.latitude, person.longitude], {
                    icon: L.divIcon({
                        className: "avatar-marker-wrap",
                        html: `<span class="avatar-marker ${avatar}"></span>`,
                        iconSize: [50, 50],
                        iconAnchor: [25, 50],
                        popupAnchor: [0, -48],
                    }),
                })
                    .bindPopup(label)
                    .addTo(map.current);
                markers.current.set(person.user_id, marker);
            }
        });
        markers.current.forEach((marker, id) => {
            if (!visible.some((person) => person.user_id === id)) {
                marker.remove();
                markers.current.delete(id);
            }
        });
    }, [people]);

    useEffect(() => {
        if (!supabase) return undefined;
        let channel;
        const startRealtime = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) await supabase.auth.signInAnonymously();
            const load = async () => {
                const { data, error } = await supabase.from("shared_locations").select("*");
                if (error) setStatus(`Lỗi kết nối: ${error.message}`);
                else setPeople(data || []);
            };
            await load();
            channel = supabase
                .channel("shared-locations")
                .on("postgres_changes", { event: "*", schema: "public", table: "shared_locations" }, load)
                .subscribe();
        };
        startRealtime();
        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const updateSharedLocation = useCallback(
        (centerMap = false) => {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    const location = { latitude: coords.latitude, longitude: coords.longitude };
                    setMyLocation(location);
                    if (centerMap) map.current?.setView([location.latitude, location.longitude], 16);
                    const {
                        data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) {
                        setSharing(false);
                        setStatus("Phiên chia sẻ đã hết hạn. Vui lòng bật chia sẻ lại.");
                        return;
                    }
                    const { error } = await supabase
                        .from("shared_locations")
                        .upsert({
                            user_id: user.id,
                            display_name: name,
                            ...location,
                            accuracy: Math.round(coords.accuracy),
                            updated_at: new Date().toISOString(),
                        });
                    setStatus(error ? `Không thể cập nhật vị trí: ${error.message}` : "Đang chia sẻ vị trí với nhóm");
                },
                () => setStatus("Không thể lấy vị trí. Hãy kiểm tra quyền định vị."),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
            );
        },
        [name],
    );

    const shareLocation = () => {
        if (!configured) {
            setStatus("Chưa cấu hình Supabase. Xem hướng dẫn trong README.");
            return;
        }
        if (!name) {
            setStatus("Hãy chọn người dùng trước khi chia sẻ.");
            return;
        }
        if (!navigator.geolocation) {
            setStatus("Trình duyệt này không hỗ trợ định vị.");
            return;
        }
        localStorage.setItem("map-display-name", name);
        setSharing(true);
        setStatus("Đang xác định vị trí…");
        updateSharedLocation(true);
    };

    useEffect(() => {
        if (!sharing) return undefined;
        const intervalId = window.setInterval(() => updateSharedLocation(), 2 * 60 * 1000);
        return () => window.clearInterval(intervalId);
    }, [sharing, updateSharedLocation]);

    const stopSharing = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) await supabase.from("shared_locations").delete().eq("user_id", user.id);
        setSharing(false);
        setStatus("Đã dừng chia sẻ và xóa vị trí của bạn");
    };
    const focusPerson = (person) => {
        map.current?.setView([person.latitude, person.longitude], 17, { animate: true });
        markers.current.get(person.user_id)?.openPopup();
    };
    const visiblePeople = people.filter(
        (person) => Date.now() - new Date(person.updated_at).getTime() < LAST_LOCATION_MS,
    );

    return (
        <main
            className="app-shell"
            style={{ "--team-sprite": `url(${import.meta.env.BASE_URL}avatars/team-sprite.png)` }}
        >
            <header className="topbar">
                <div className="brand-mark">V</div>
                <div>
                    <p className="eyebrow">PHẦN MỀM GIÁM SÁT VÀ RA CHỈ THỊ CHO MẬP THÚI</p>
                    <h1>Vị trí hiện tại</h1>
                </div>
                <p className="status">
                    <span className="status-dot" />
                    {status}
                </p>
            </header>
            <div className="workspace">
                <aside className="sidebar">
                    <p className="sidebar-label">NHÓM CỦA BẠN</p>
                    <p className="name-label">Bạn là ai?</p>
                    <div className="member-picker">
                        {TEAM_MEMBERS.map((member) => (
                            <button
                                className={name === member ? "member-choice selected" : "member-choice"}
                                type="button"
                                key={member}
                                onClick={() => setName(member)}
                            >
                                {member}
                            </button>
                        ))}
                    </div>
                    <button className="share-button" type="button" onClick={sharing ? stopSharing : shareLocation}>
                        {sharing ? "Dừng chia sẻ" : "Chia sẻ vị trí"}
                    </button>
                    <div className="people-list">
                        <p className="sidebar-label">ĐANG HIỂN THỊ ({visiblePeople.length})</p>
                        {visiblePeople.map((person) => (
                            <button
                                className="person"
                                type="button"
                                key={person.user_id}
                                onClick={() => focusPerson(person)}
                            >
                                {person.display_name}
                                <span className="person-arrow">›</span>
                            </button>
                        ))}
                    </div>
                    <div className="sidebar-footer">
                        Vị trí tự ẩn sau 10 phút nếu không được cập nhật. Bạn có thể dừng chia sẻ bất cứ lúc nào.
                    </div>
                </aside>
                <section className="map-panel">
                    <div ref={mapElement} className="map" />
                    <button
                        className="locate-button"
                        type="button"
                        onClick={() => map.current.setView([myLocation.latitude, myLocation.longitude], 16)}
                    >
                        ⌖ Về vị trí của tôi
                    </button>
                </section>
            </div>
        </main>
    );
}

function escapeHtml(value) {
    return value.replace(
        /[&<>'"]/g,
        (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char],
    );
}
export default App;
