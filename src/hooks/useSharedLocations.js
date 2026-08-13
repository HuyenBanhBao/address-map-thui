import { useCallback, useEffect, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { registerPlugin } from "@capacitor/core";
import { supabase } from "../supabase";

export const TEAM_MEMBERS = ["Vợ thúi", "Mập xinh"];
const UPDATE_INTERVAL = 10 * 1000;
const VISIBLE_FOR = 10 * 60 * 1000;
const LocationSharing = registerPlugin("LocationSharing");

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

    const updateLocation = useCallback(async () => {
        try {
            const permission = await Geolocation.requestPermissions();
            if (permission.location !== "granted" && permission.coarseLocation !== "granted")
                throw new Error("Bạn chưa cấp quyền vị trí");
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
            });
            const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            onMyLocation(location);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setSharing(false);
                setStatus("Phiên chia sẻ đã hết hạn. Vui lòng bật chia sẻ lại.");
                return;
            }
            const { error } = await supabase.from("shared_locations").upsert({
                user_id: user.id,
                display_name: name,
                ...location,
                accuracy: Math.round(position.coords.accuracy),
                updated_at: new Date().toISOString(),
            });
            setStatus(error ? `Không thể cập nhật vị trí: ${error.message}` : "Đang chia sẻ vị trí với nhóm");
        } catch (error) {
            setStatus(error.message || "Không thể lấy vị trí. Hãy kiểm tra quyền định vị.");
        }
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
        localStorage.setItem("map-display-name", name);
        setSharing(true);
        setStatus("Đang xin quyền và xác định vị trí…");
        updateLocation();
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session) return;
            try {
                await LocationSharing.start({
                    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
                    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                    userId: session.user.id,
                    displayName: name,
                });
            } catch (_) {}
        });
    };

    useEffect(() => {
        if (!sharing) return undefined;
        const id = window.setInterval(updateLocation, UPDATE_INTERVAL);
        return () => window.clearInterval(id);
    }, [sharing, updateLocation]);
    const stopSharing = async () => {
        try {
            await LocationSharing.stop();
        } catch (_) {}
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) await supabase.from("shared_locations").delete().eq("user_id", user.id);
        setSharing(false);
        setStatus("Đã dừng chia sẻ và xóa vị trí của bạn");
    };
    return {
        name,
        setName,
        people: people.filter((person) => Date.now() - new Date(person.updated_at).getTime() < VISIBLE_FOR),
        sharing,
        status,
        startSharing,
        stopSharing,
    };
}
