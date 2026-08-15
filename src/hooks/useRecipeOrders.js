import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

async function ensureUser() {
    let {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        user = data.user;
    }
    return user;
}

export function useRecipeOrders() {
    const [orderedRecipes, setOrderedRecipes] = useState([]);
    const [savingOrder, setSavingOrder] = useState(false);
    const [orderError, setOrderError] = useState("");

    const refreshOrder = useCallback(async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from("recipe_orders")
            .select("id, created_at, recipe_order_items(recipe_id, recipes(id, name, image_path))")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            setOrderError(error.message);
            return;
        }
        setOrderedRecipes(
            (data?.recipe_order_items || []).map((item) => {
                if (!item.recipes) return null;
                const imageUrl = item.recipes.image_path
                    ? supabase.storage.from("recipe-images").getPublicUrl(item.recipes.image_path).data.publicUrl
                    : "";
                return { ...item.recipes, image_url: imageUrl };
            }).filter(Boolean),
        );
    }, []);

    useEffect(() => {
        refreshOrder();
        const onOrderChanged = () => refreshOrder();
        window.addEventListener("recipe-order-changed", onOrderChanged);
        const timer = window.setInterval(refreshOrder, 10000);
        return () => {
            window.removeEventListener("recipe-order-changed", onOrderChanged);
            window.clearInterval(timer);
        };
    }, [refreshOrder]);

    const createOrder = async (recipeIds) => {
        if (!recipeIds.length) return;
        setSavingOrder(true);
        setOrderError("");
        try {
            const user = await ensureUser();
            const { error: clearError } = await supabase.from("recipe_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            if (clearError) throw clearError;
            const { data: order, error: orderError } = await supabase.from("recipe_orders").insert({ created_by: user.id }).select().single();
            if (orderError) throw orderError;
            const { error: itemsError } = await supabase.from("recipe_order_items").insert(recipeIds.map((recipeId) => ({ order_id: order.id, recipe_id: recipeId })));
            if (itemsError) throw itemsError;
            await refreshOrder();
            window.dispatchEvent(new CustomEvent("recipe-order-changed"));
            return order;
        } catch (error) {
            setOrderError(error.message || "Không thể lưu order.");
            throw error;
        } finally {
            setSavingOrder(false);
        }
    };

    return { orderedRecipes, createOrder, savingOrder, orderError, refreshOrder };
}
