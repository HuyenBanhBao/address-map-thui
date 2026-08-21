import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useInventoryItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!supabase) {
            setError("Chưa cấu hình Supabase.");
            setLoading(false);
            return;
        }

        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const { data, error: authError } = await supabase.auth.signInAnonymously();
            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }
            user = data.user;
        }

        const { data, error: queryError } = await supabase
            .from("inventory_items")
            .select("*")
            .order("category")
            .order("created_at");
        if (queryError) setError(queryError.message);
        else setItems(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const addItem = async (item) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error: insertError } = await supabase
            .from("inventory_items")
            .insert({ ...item, created_by: user.id })
            .select()
            .single();
        if (insertError) throw insertError;
        setItems((current) => [...current, data]);
    };

    const updateItem = async (itemId, changes) => {
        const { data, error: updateError } = await supabase
            .from("inventory_items")
            .update(changes)
            .eq("id", itemId)
            .select()
            .single();
        if (updateError) throw updateError;
        setItems((current) => current.map((item) => item.id === itemId ? data : item));
    };

    const removeItem = async (itemId) => {
        const { error: deleteError } = await supabase.from("inventory_items").delete().eq("id", itemId);
        if (deleteError) throw deleteError;
        setItems((current) => current.filter((item) => item.id !== itemId));
    };

    return { items, loading, error, addItem, updateItem, removeItem };
}
