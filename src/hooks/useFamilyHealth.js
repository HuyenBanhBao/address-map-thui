import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useFamilyHealth() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!supabase) { setError("Chưa cấu hình Supabase."); setLoading(false); return; }
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const { data, error: authError } = await supabase.auth.signInAnonymously();
            if (authError) { setError(authError.message); setLoading(false); return; }
            user = data.user;
        }
        const { data, error: queryError } = await supabase.from("family_health_members").select("*").order("created_at");
        if (queryError) setError(queryError.message);
        else setMembers(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const addMember = async (member) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error: insertError } = await supabase.from("family_health_members").insert({ ...member, created_by: user.id }).select().single();
        if (insertError) throw insertError;
        setMembers((current) => [...current, data]);
    };
    const updateMember = async (id, changes) => {
        const { data, error: updateError } = await supabase.from("family_health_members").update(changes).eq("id", id).select().single();
        if (updateError) throw updateError;
        setMembers((current) => current.map((member) => member.id === id ? data : member));
    };
    const removeMember = async (id) => {
        const { error: deleteError } = await supabase.from("family_health_members").delete().eq("id", id);
        if (deleteError) throw deleteError;
        setMembers((current) => current.filter((member) => member.id !== id));
    };

    return { members, loading, error, addMember, updateMember, removeMember };
}
