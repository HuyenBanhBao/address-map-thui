import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@mui/material";
import { colors } from "../../theme";

const DEFAULT_LOCATION = { latitude: 10.7769, longitude: 106.7009 };
const escapeHtml = (text) =>
    text.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

const LocationMap = forwardRef(function LocationMap({ people }, ref) {
    const elementRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
    useImperativeHandle(ref, () => ({
        focus: (person) => {
            mapRef.current?.setView([person.latitude, person.longitude], 17, { animate: true });
            markersRef.current.get(person.user_id)?.openPopup();
        },
        center: (location) => mapRef.current?.setView([location.latitude, location.longitude], 16),
    }));
    useEffect(() => {
        mapRef.current = L.map(elementRef.current, { zoomControl: false }).setView(
            [DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude],
            13,
        );
        L.control.zoom({ position: "topright" }).addTo(mapRef.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapRef.current);
        return () => mapRef.current?.remove();
    }, []);
    useEffect(() => {
        if (!mapRef.current) return;
        const sprite = `${import.meta.env.BASE_URL}avatars/team-sprite.png`;
        people.forEach((person) => {
            const popup = `<strong>${escapeHtml(person.display_name)}</strong><br><small>Cập nhật ${new Date(person.updated_at).toLocaleTimeString("vi-VN")}</small>`;
            if (markersRef.current.has(person.user_id))
                markersRef.current
                    .get(person.user_id)
                    .setLatLng([person.latitude, person.longitude])
                    .setPopupContent(popup);
            else {
                const side = person.display_name === "Mập xinh" ? "left" : "right";
                const icon = L.divIcon({
                    className: "",
                    html: `<span style="display:block;width:46px;height:46px;border:3px solid ${colors.white};border-radius:50%;box-shadow:0 3px 10px ${colors.markerShadow};background:url('${sprite}') ${side} center/200% 100%"></span>`,
                    iconSize: [50, 50],
                    iconAnchor: [25, 50],
                    popupAnchor: [0, -48],
                });
                markersRef.current.set(
                    person.user_id,
                    L.marker([person.latitude, person.longitude], { icon }).bindPopup(popup).addTo(mapRef.current),
                );
            }
        });
        markersRef.current.forEach((marker, id) => {
            if (!people.some((person) => person.user_id === id)) {
                marker.remove();
                markersRef.current.delete(id);
            }
        });
    }, [people]);
    return <Box ref={elementRef} sx={{ width: "100%", height: "100%", filter: "saturate(.88) contrast(.98)" }} />;
});
export default LocationMap;
