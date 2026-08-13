import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

export const TEAM_MEMBERS = ["Vợ thúi", "Mập"];
const UPDATE_INTERVAL = 2 * 60 * 1000;
const VISIBLE_FOR = 10 * 60 * 1000;

export function useSharedLocations(onMyLocation) {
    const [name, setName] = useState(() =>
        TEAM_MEMBERS.includes(localStorage.getItem("map-display-name")) ? localStorage.getItem("map-display-name") : "",
    );
    const [people, setPeople] = useState([]);
    const [sharing, setSharing] = useState(false);
    const [status, setStatus] = useState("Sẵn sàng chia sẻ vị trí");

    const refreshPeople = useCallback(async () => {
        const { data, error } = await supabase.from("shared_locations").select("*");
        if (error) setStatus(`Lỗi kết nối: ${error.message}`);
        else setPeople(data || []);
    }, []);

    useEffect(() => {
        if (!supabase) return undefined;
        let channel;
        const connect = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) await supabase.auth.signInAnonymously();
            await refreshPeople();
            channel = supabase
                .channel("shared-locations")
                .on("postgres_changes", { event: "*", schema: "public", table: "shared_locations" }, refreshPeople)
                .subscribe();
        };
        connect();
        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [refreshPeople]);

    const updateLocation = useCallback(() => {
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const location = { latitude: coords.latitude, longitude: coords.longitude };
                onMyLocation(location);
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
    }, [name, onMyLocation]);

    const startSharing = () => {
        if (!supabase) {
            setStatus("Chưa cấu hình Supabase.");
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
        updateLocation();
    };

    useEffect(() => {
        if (!sharing) return undefined;
        const id = window.setInterval(updateLocation, UPDATE_INTERVAL);
        return () => window.clearInterval(id);
    }, [sharing, updateLocation]);

    const stopSharing = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) await supabase.from("shared_locations").delete().eq("user_id", user.id);
        setSharing(false);
        setStatus("Đã dừng chia sẻ và xóa vị trí của bạn");
    };

    const visiblePeople = people.filter((person) => Date.now() - new Date(person.updated_at).getTime() < VISIBLE_FOR);
    return { name, setName, people: visiblePeople, sharing, status, startSharing, stopSharing };
}
