import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { createId } from "../utils/createId";

const BUCKET = "recipe-images";

function getImageUrl(path) {
    if (!path || !supabase) return "";
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function currentUser() {
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

async function uploadImage(dataUrl, userId) {
    if (!dataUrl) return null;
    const blob = await fetch(dataUrl).then((response) => response.blob());
    const extension = blob.type.split("/")[1] || "jpg";
    const path = `${userId}/${createId()}.${extension}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) throw error;
    return path;
}

export function useRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!supabase) {
            setError("Chưa cấu hình Supabase.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            await currentUser();
        } catch (authError) {
            setError(authError.message || "Không thể khởi tạo phiên đăng nhập.");
            setLoading(false);
            return;
        }
        const { data, error: queryError } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });
        if (queryError) setError(queryError.message);
        else setRecipes((data || []).map((recipe) => ({ ...recipe, image_url: getImageUrl(recipe.image_path) })));
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addRecipe = async ({ name, category, image }) => {
        try {
            setError("");
            const user = await currentUser();
            const imagePath = await uploadImage(image, user.id);
            const { data, error: insertError } = await supabase
                .from("recipes")
                .insert({ name, category, image_path: imagePath, created_by: user.id })
                .select()
                .single();
            if (insertError) throw insertError;
            const recipe = { ...data, image_url: getImageUrl(data.image_path) };
            setRecipes((current) => [recipe, ...current]);
            return recipe;
        } catch (submitError) {
            setError(submitError.message || "Không thể lưu món ăn.");
            throw submitError;
        }
    };

    return { recipes, loading, error, addRecipe };
}
